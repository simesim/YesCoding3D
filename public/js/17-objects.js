// @ts-nocheck
// Список объектов. Геометрия и журнал команд остаются в существующих модулях.
function isObjectEditable(obj) {
    return !!obj && obj.visible && !obj.userData.locked;
}

function canEditSelection() {
    return ot.length > 0 && ot.every(isObjectEditable);
}

function getObjectName(obj) {
    if (obj.userData.objectName) return obj.userData.objectName;
    if (obj.userData.kind === "group") return "Группа";
    var def = obj.userData.def || {};
    if (def.type === "text") return "Текст «" + ((def.params || {}).text || "") + "»";
    return _r[def.type] ? _r[def.type].name : "STL-модель";
}

function ensureObjectName(obj) {
    if (obj.userData.objectName) return;
    var base = getObjectName(obj);
    var used = new Set(sa().filter(o => o !== obj).map(getObjectName));
    var i = 1;
    while (used.has(base + " " + i)) i++;
    obj.userData.objectName = (base + " " + i).slice(0, 80);
}

function objectState(obj) {
    return {
        objectName: getObjectName(obj),
        visible: obj.visible,
        locked: !!obj.userData.locked
    };
}

function changeObjectState(obj, patch) {
    if (!obj || obj.parent !== Vt) return;
    var before = objectState(obj);
    var after = {
        objectName: patch.objectName === undefined ? before.objectName : String(patch.objectName).trim().slice(0, 80),
        visible: patch.visible === undefined ? before.visible : !!patch.visible,
        locked: patch.locked === undefined ? before.locked : !!patch.locked
    };
    if (!after.objectName || JSON.stringify(before) === JSON.stringify(after)) return;
    var selected = ot.slice();
    function apply(state) {
        obj.userData.objectName = state.objectName;
        obj.userData.locked = state.locked;
        obj.visible = state.visible;
        // Zn отфильтрует скрытое и отключит ручки заблокированного объекта.
        Zn(selected);
        renderObjectList();
    }
    Hi({ apply: () => apply(after), revert: () => apply(before) });
}

function renameObject(obj, name) {
    if (!obj || obj.parent !== Vt) return Promise.resolve();
    if (name !== undefined) {
        changeObjectState(obj, { objectName: name });
        return Promise.resolve();
    }
    return ycPrompt("Название объекта:", getObjectName(obj)).then(function(value) {
        if (value === null) return;
        if (!value.trim()) { ki("Название не должно быть пустым", !0); return; }
        changeObjectState(obj, { objectName: value });
    });
}

function ls() {
    renderInspector();
    if (!ot.some(o => o.userData.locked)) return;
    var body = Mt("insp-body");
    body.querySelectorAll("input, button, select, textarea").forEach(el => el.disabled = true);
    var hint = document.createElement("p");
    hint.className = "object-lock-hint";
    hint.textContent = "Объект заблокирован. Сними замок в списке, чтобы редактировать.";
    body.prepend(hint);
}

var objectIcons = {
    eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    hidden: '<path d="m3 3 18 18M10.6 6.1 12 6c6.5 0 10 6 10 6a19 19 0 0 1-3 3.5M6 6.8A19 19 0 0 0 2 12s3.5 6 10 6a12 12 0 0 0 5-1.1"/>',
    locked: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
    unlocked: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 7.5-2M12 14v3"/>',
    rename: '<path d="m14 5 5 5M4 20l5-1L20 8a2 2 0 0 0-5-5L4 14l-1 7Z"/>'
};

function objectAction(action, icon, title, pressed, onclick) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "object-action";
    button.dataset.action = action;
    button.title = title;
    button.setAttribute("aria-label", title);
    if (pressed !== null) button.setAttribute("aria-pressed", String(pressed));
    button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + objectIcons[icon] + '</svg>';
    button.onclick = onclick;
    return button;
}

function renderObjectList() {
    var list = Mt("objects-list");
    if (!list) return;
    var focus = document.activeElement;
    var focusRow = focus && list.contains(focus) && focus.closest("[data-object-id]");
    var focusId = focusRow && focusRow.dataset.objectId;
    var focusAction = focus && focus.dataset && focus.dataset.action;
    list.replaceChildren();
    var objects = sa();
    Mt("objects-count").textContent = objects.length;
    if (!objects.length) {
        var empty = document.createElement("p");
        empty.className = "objects-empty";
        empty.textContent = "Пока пусто. Добавь фигуру из библиотеки слева.";
        list.appendChild(empty);
        return;
    }
    objects.forEach(function(obj) {
        var row = document.createElement("div");
        row.className = "object-row" + (ot.includes(obj) ? " selected" : "") + (!obj.visible ? " is-hidden" : "") + (obj.userData.locked ? " is-locked" : "");
        row.dataset.objectId = obj.uuid;
        var select = document.createElement("button");
        select.type = "button";
        select.className = "object-select";
        select.dataset.action = "select";
        select.disabled = !obj.visible;
        select.setAttribute("aria-pressed", String(ot.includes(obj)));
        var name = document.createElement("span");
        name.className = "object-name";
        name.textContent = getObjectName(obj);
        var kind = document.createElement("span");
        kind.className = "object-kind";
        kind.textContent = obj.userData.kind === "group" ? "Группа · " + obj.userData.members.length : obj.userData.isHole ? "Отверстие" : "Фигура";
        if (!obj.visible) kind.textContent += " · скрыт";
        if (obj.userData.locked) kind.textContent += " · замок";
        select.title = name.textContent;
        select.append(name, kind);
        select.onclick = function(ev) {
            if (!obj.visible) return;
            if (ev.shiftKey || ev.ctrlKey || ev.metaKey) Zn(ot.includes(obj) ? ot.filter(o => o !== obj) : ot.concat(obj));
            else Zn([obj]);
        };
        select.ondblclick = () => renameObject(obj);
        row.append(select,
            objectAction("rename", "rename", "Переименовать: " + name.textContent, null, () => renameObject(obj)),
            objectAction("visible", obj.visible ? "eye" : "hidden", (obj.visible ? "Скрыть: " : "Показать: ") + name.textContent, !obj.visible, () => changeObjectState(obj, { visible: !obj.visible })),
            objectAction("locked", obj.userData.locked ? "locked" : "unlocked", (obj.userData.locked ? "Разблокировать: " : "Заблокировать: ") + name.textContent, !!obj.userData.locked, () => changeObjectState(obj, { locked: !obj.userData.locked }))
        );
        list.appendChild(row);
    });
    // Кнопки не теряют клавиатурный фокус после перерисовки списка.
    if (focusId && focusAction) {
        var target = list.querySelector('[data-object-id="' + focusId + '"] [data-action="' + focusAction + '"]');
        if (target && !target.disabled) target.focus({ preventScroll: true });
    }
}
