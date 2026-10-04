// @ts-nocheck
// кнопки и обработчки 
function bo(n) {
    let e = document.createElement("div");
    return e.className = "f-sec", e.textContent = n, e
}

function ug(n, e) {
    let t = document.createElement("div");
    return t.className = "f-row3", n.forEach((i, r) => {
        let s = document.createElement("div");
        s.className = "f-cell";
        let a = document.createElement("label");
        a.textContent = i, s.append(a, e[r]), t.appendChild(s)
    }), t
}

function hg(n, e) {
    let t = document.createElement("input");
    return t.type = "number", t.value = n, t.step = e, t.addEventListener("keydown", i => i
        .stopPropagation()), t
}

function fg(n, e, t) {
    n.addEventListener("change", () => {
        e.updateMatrix();
        let i = [e.matrix.clone()];
        t(), e.updateMatrix();
        let r = [e.matrix.clone()];
        r[0].equals(i[0]) || lc(vg([e], i, r)), ls()
    })
}

function Of(n) {
    return Math.round(n * 100) / 100
}

function A4() {
    if (!Si || ot.length !== 1 || Si.o !== ot[0]) return;
    let n = Si.o,
        e = mg(n);
    for (let t of["x", "y", "z"]) document.activeElement !== Si.pos[t] && (Si.pos[t].value = Of(n
        .position[t])), document.activeElement !== Si.rot[t] && (Si.rot[t].value = Math.round(cr
        .radToDeg(n.rotation[t]))), document.activeElement !== Si.dim[t] && (Si.dim[t].value = Of(e[
        t] * n.scale[t]))
}

function hc() {
    Mt("btn-undo").disabled = !Vf.length, Mt("btn-redo").disabled = !Hf.length, Mt("btn-dup")
        .disabled = Mt("btn-del").disabled = !ot.length, Mt("btn-group").disabled = ot.length < 2, Mt(
            "btn-ungroup").disabled = !(ot.length === 1 && ot[0].userData.kind === "group")
}
/*   Режим трансформации: translate | rotate | scale (TransformControls — только один за раз)
	     Одна кнопка mode-cycle + Tab переключают по кругу; G/R/S — сразу.
	*/
var modeOrder = ["translate", "rotate", "scale"];
var modeMeta = {
    translate: {
        label: "\u0414\u0432\u0438\u0433\u0430\u0442\u044C",
        icon: "./icons/move.png"
    },
    rotate: {
        label: "\u0412\u0440\u0430\u0449\u0430\u0442\u044C",
        icon: "./icons/rotate.png"
    },
    scale: {
        label: "\u0420\u0430\u0437\u043C\u0435\u0440",
        icon: "./icons/size.png"
    }
};

function Mo(n) {
    Lt.setMode(n);
    let m = modeMeta[n] || modeMeta.translate;
    let lab = Mt("mode-label"),
        ic = Mt("mode-icon"),
        btn = Mt("mode-cycle");
    if (lab) lab.textContent = m.label;
    if (ic) ic.src = m.icon;
    if (btn) btn.classList.add("on");
}

function cycleMode() {
    let cur = Lt.mode || "translate";
    let i = modeOrder.indexOf(cur);
    Mo(modeOrder[(i + 1) % modeOrder.length]);
}
Mt("btn-new").onclick = _4;
Mt("btn-export").onclick = _g;
Mt("btn-save-json").onclick = saveProjectJSON;
Mt("btn-load-json").onclick = () => Mt("json-input").click();
Mt("json-input").addEventListener("change", n => {
    let e = n.target.files && n.target.files[0];
    e && loadProjectJSON(e);
    n.target.value = "";
});
/*   Загрузка STL убрана из UI — проект хранится в JSON   */
Mt("btn-undo").onclick = gg;
Mt("btn-redo").onclick = Uf;
Mt("btn-dup").onclick = yg;
Mt("btn-del").onclick = xg;
Mt("btn-group").onclick = cc;
Mt("btn-ungroup").onclick = () => uc();
Mt("mode-cycle").onclick = cycleMode;
Mo("translate");
var xr = null,
    w4 = {
        iso: [170, 150, 170],
        top: [.01, 320, .01],
        front: [0, 60, 300],
        side: [300, 60, 0]
    };
document.querySelectorAll(".chip").forEach(n => n.onclick = () => {
    let e = w4[n.dataset.view];
    xr = {
        from: Vi.position.clone(),
        to: new E(...e),
        t: 0
    }
});
addEventListener("keydown", n => {
    let e = n.target.tagName;
    if (e === "INPUT" || e === "TEXTAREA") return;
    let t = n.ctrlKey || n.metaKey;
    t && n.code === "KeyZ" ? (n.preventDefault(), n.shiftKey ? Uf() : gg()) : t && n.code ===
        "KeyY" ? (n.preventDefault(), Uf()) : t && n.code === "KeyD" ? (n.preventDefault(), yg()) :
        t && n.code === "KeyG" ? (n.preventDefault(), n.shiftKey ? uc() : cc()) : t && n.code ===
        "KeyE" ? (n.preventDefault(), _g()) : t && n.code === "KeyS" ? (n.preventDefault(),
            saveProjectJSON()) : t && n.code === "KeyA" ? (n.preventDefault(), Zn(sa())) : n.code ===
        "Tab" ? (n.preventDefault(), cycleMode()) : n.code === "KeyG" ? Mo("translate") : n.code ===
        "KeyR" ? Mo("rotate") : n.code === "KeyS" ? Mo("scale") : n.code === "KeyD" ? J1() : n
        .code === "KeyB" ? (n.preventDefault(), setBoxSelect(!boxSelectMode)) : n.code === "KeyL" ?
        (n.preventDefault(), ruler.on ? cancelRuler() : startRuler()) : n.code === "Delete" || n
        .code === "Backspace" ? xg() : n.code === "Escape" && (b4() || closeBezierEditor() ||
            closeMirrorPanel() || closeArrayPanel() || cancelRuler() || Zn([]) || setBoxSelect(!1))
});
var H1 = null;

function ki(n, e) {
    let t = Mt("toast");
    t.textContent = n, t.className = e ? "warn" : "", clearTimeout(H1), H1 = setTimeout(() => t
        .classList.add("hidden"), 2300)
}
var C4 = new qa;