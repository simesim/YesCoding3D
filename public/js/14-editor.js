// @ts-nocheck
// Массив дублекатов 

function openArrayPanel() {
    if (!canEditSelection()) return;
    if (!ot.length) {
        ki("Сначала выдели фигуру", !0);
        return;
    }
    var ov = Mt("array-overlay");
    if (ov) ov.classList.remove("hidden");
}

function closeArrayPanel() {
    var ov = Mt("array-overlay");
    if (!ov || ov.classList.contains("hidden")) return !1;
    ov.classList.add("hidden");
    return !0;
}

function applyArray() {
    if (!canEditSelection()) return;
    if (!ot.length) {
        ki("Нет выделения", !0);
        return;
    }
    var modeEl = Mt("array-mode");
    var countEl = Mt("array-count");
    var stepEl = Mt("array-step");
    var mode = modeEl ? modeEl.value : "row";
    var count = Math.max(2, Math.min(24, parseInt(countEl && countEl.value, 10) || 4));
    var step = parseFloat(stepEl && stepEl.value);
    if (!(step > 0)) step = 20;
    var extras = [];
    var src = ot.slice();
    var cx = 0,
        cz = 0;
    src.forEach(function(o) {
        cx += o.position.x;
        cz += o.position.z;
    });
    cx /= src.length;
    cz /= src.length;
    var before = src.map(function(o) { o.updateMatrix(); return o.matrix.clone(); });
    for (var i = 1; i < count; i++) {
        var ang = i / count * Math.PI * 2;
        src.forEach(function(o) {
            var c = $1(o);
            if (mode === "circle") {
                var dx = o.position.x - cx + step;
                var dz = o.position.z - cz;
                c.position.x = cx + dx * Math.cos(ang) + dz * Math.sin(ang);
                c.position.z = cz - dx * Math.sin(ang) + dz * Math.cos(ang);
                c.rotateOnWorldAxis(new E(0, 1, 0), ang);
            } else {
                c.position.x = o.position.x + step * i;
            }
            extras.push(c);
        });
    }
    var after = before.map(function(m) {
        var next = m.clone();
        if (mode === "circle") next.elements[12] += step;
        return next;
    });
    var move = vg(src, before, after);
    var add = aa([], extras);
    // Перемещение исходника и копии — одно отменяемое действие.
    Hi({
        apply: function() {
            move.apply();
            add.apply();
            Zn(src.concat(extras));
        },
        revert: function() {
            add.revert();
            move.revert();
        }
    });
    closeArrayPanel();
    ki("Массив: " + (extras.length + src.length) + " шт.");
}

function wireMirrorArray() {
    var mx = Mt("btn-mirror-x");
    if (mx) mx.onclick = function() {
        applyMirror("x");
    };
    var mz = Mt("btn-mirror-z");
    if (mz) mz.onclick = function() {
        applyMirror("z");
    };
    var mc = Mt("btn-mirror-cancel");
    if (mc) mc.onclick = closeMirrorPanel;
    var ao = Mt("btn-array-ok");
    if (ao) ao.onclick = applyArray;
    var ac = Mt("btn-array-cancel");
    if (ac) ac.onclick = closeArrayPanel;
    [
        ["array-count", "array-count-out"],
        ["array-step", "array-step-out"]
    ].forEach(function(pair) {
        var el = Mt(pair[0]),
            out = Mt(pair[1]);
        if (el && out && !el._arrBound) {
            el._arrBound = !0;
            el.addEventListener("input", function() {
                out.textContent = el.value;
            });
        }
    });
}

function wireBoxSelect() {
    var bb = Mt("btn-box");
    if (bb) bb.onclick = function() {
        setBoxSelect(!boxSelectMode);
    };
    addEventListener("pointermove", function(ev) {
        if (!mqDrag) return;
        showMarquee(mqRect(mqDrag, {
            x: ev.clientX,
            y: ev.clientY
        }));
    });
    addEventListener("pointerup", function(ev) {
        if (mqDrag) finishMarquee(ev);
    });
}
Sr.addEventListener("pointerdown", function(n) {
    if (n.button !== 0) return;
    var e = Sr.getBoundingClientRect();
    if (n.clientX > e.right - 128 && n.clientY > e.bottom - 128) return;
    if (Lt.axis || Lt.dragging) return;
    var hit = Z1(n);
    var wantBox = boxSelectMode || ((n.ctrlKey || n.metaKey || n.altKey) && !hit);
    if (!wantBox) return;
    n.stopPropagation();
    n.preventDefault();
    mqDrag = {
        x: n.clientX,
        y: n.clientY,
        add: n.shiftKey || n.ctrlKey || n.metaKey
    };
    Mr.enabled = !1;
    showMarquee(mqRect(mqDrag, mqDrag));
    So = null;
}, !0);



var bz = {
    mode: "bezier",
    pts: [],
    depth: 8,
    drag: null,
    over: null,
    sel: 0
};

function bzReset(mode) {
    bz.mode = mode;
    bz.pts = mode === "bezier" ? polyToBezierPts(POLY_DEFAULT) : clonePts(POLY_DEFAULT);
    bz.depth = 8;
    bz.drag = null;
    bz.over = null;
    bz.sel = 0;
}