// @ts-nocheck
// Массив дублекатов 

function openArrayPanel() {
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
    for (var i = 1; i < count; i++) {
        src.forEach(function(o) {
            var c = $1(o);
            if (mode === "circle") {
                var ang = i / count * Math.PI * 2;
                var dx = o.position.x - cx,
                    dz = o.position.z - cz;
                var rad = Math.hypot(dx, dz);
                if (rad < 0.01) rad = step;
                var a0 = Math.atan2(dz, dx);
                c.position.x = cx + Math.cos(a0 + ang) * rad;
                c.position.z = cz + Math.sin(a0 + ang) * rad;
                c.rotation.y = o.rotation.y - ang;
            } else {
                c.position.x = o.position.x + step * i;
            }
            extras.push(c);
        });
    }
    Hi(aa([], extras));
    Zn(src.concat(extras));
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