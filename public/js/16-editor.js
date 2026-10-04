// @ts-nocheck
// Инструменты кривой и СТРАРТ 
function setCurveEditorCaption() {
    var title = Mt("bz-title");
    var hint = Mt("bz-hint");
    if (bz.mode === "poly") {
        if (title) title.textContent = "Произвольная фигура";
        if (hint) hint.textContent =
            "Прямые рёбра. Клик — точка, перетащить — подвинуть, двойной клик — удалить.";
    } else {
        if (title) title.textContent = "Кривая Безье";
        if (hint) hint.textContent =
            "Синие точки — якоря. Оранжевые квадраты — ручки кривой. Alt+ручка — ломать гладкость.";
    }
}

function openCurveEditor(mode) {
    bzReset(mode === "poly" ? "poly" : "bezier");
    var overlay = Mt("bezier-overlay");
    if (overlay) overlay.classList.remove("hidden");
    var d = Mt("bz-depth");
    var o = Mt("bz-depth-out");
    if (d) {
        d.min = 2;
        d.max = 40;
        d.step = 1;
        d.value = 8;
    }
    if (o) o.textContent = d ? d.value : "8";
    var lab = d && d.parentNode && d.parentNode.childNodes[0];
    var rowLab = document.querySelector("#bezier-overlay .bz-row label");
    if (rowLab && rowLab.firstChild && rowLab.firstChild.nodeType === 3) {
        rowLab.firstChild.textContent = "Высота, мм ";
    }
    setCurveEditorCaption();
    drawCurveEditor();
}

function openBezierEditor() {
    openCurveEditor("bezier");
}

function openPolyEditor() {
    openCurveEditor("poly");
}

function closeBezierEditor() {
    var overlay = Mt("bezier-overlay");
    if (!overlay || overlay.classList.contains("hidden")) return !1;
    overlay.classList.add("hidden");
    return !0;
}

function extrudeCurve() {
    if (bz.pts.length < 3) {
        ki("Нужно минимум 3 точки", !0);
        return;
    }
    var depth = parseFloat((Mt("bz-depth") || {}).value) || 8;
    var type = bz.mode === "poly" ? "poly" : "bezier";
    var mesh = q1(type, {
        pts: clonePts(bz.pts),
        depth: depth
    });
    Hi(aa([], [mesh]));
    Zn([mesh]);
    closeBezierEditor();
    ki(type === "poly" ? "Фигура выдавлена" : "Кривая выдавлена");
}

function addCurvePoint(p) {
    if (bz.mode === "poly") {
        bz.pts.push({
            x: p.x,
            y: p.y
        });
        bz.sel = bz.pts.length - 1;
        return;
    }
    var last = bz.pts[bz.pts.length - 1];
    var dx = p.x - last.x,
        dy = p.y - last.y;
    bz.pts.push({
        x: p.x,
        y: p.y,
        ix: p.x - dx / 3,
        iy: p.y - dy / 3,
        ox: p.x + dx / 3,
        oy: p.y + dy / 3
    });
    last.ox = last.x + dx / 3;
    last.oy = last.y + dy / 3;
    bz.sel = bz.pts.length - 1;
}

function bindBezierCanvas() {
    var cv = Mt("bz-canvas");
    if (!cv || cv._bzBound) return;
    cv._bzBound = !0;
    cv.addEventListener("pointerdown", function(ev) {
        ev.preventDefault();
        var hit = bzHit(cv, ev.clientX, ev.clientY);
        if (hit) {
            bz.drag = hit;
            if (hit.kind === "p") bz.sel = hit.i;
        } else {
            addCurvePoint(bzMap(cv, ev.clientX, ev.clientY));
            bz.drag = {
                kind: "p",
                i: bz.sel
            };
        }
        drawCurveEditor();
    });
    cv.addEventListener("pointermove", function(ev) {
        var p = bzMap(cv, ev.clientX, ev.clientY);
        if (!bz.drag) {
            bz.over = bzHit(cv, ev.clientX, ev.clientY);
            drawCurveEditor();
            return;
        }
        var i = bz.drag.i,
            pt = bz.pts[i];
        if (bz.drag.kind === "p") {
            var dx = p.x - pt.x,
                dy = p.y - pt.y;
            pt.x = p.x;
            pt.y = p.y;
            if (hasHandles(pt)) {
                pt.ix += dx;
                pt.iy += dy;
                pt.ox += dx;
                pt.oy += dy;
            }
        } else if (bz.drag.kind === "out") {
            pt.ox = p.x;
            pt.oy = p.y;
            if (!ev.altKey) {
                pt.ix = pt.x - (pt.ox - pt.x);
                pt.iy = pt.y - (pt.oy - pt.y);
            }
        } else if (bz.drag.kind === "in") {
            pt.ix = p.x;
            pt.iy = p.y;
            if (!ev.altKey) {
                pt.ox = pt.x - (pt.ix - pt.x);
                pt.oy = pt.y - (pt.iy - pt.y);
            }
        }
        drawCurveEditor();
    });
    cv.addEventListener("pointerup", function() {
        bz.drag = null;
        drawCurveEditor();
    });
    cv.addEventListener("pointerleave", function() {
        bz.drag = null;
        bz.over = null;
        drawCurveEditor();
    });
    cv.addEventListener("dblclick", function(ev) {
        var hit = bzHit(cv, ev.clientX, ev.clientY);
        if (hit && hit.kind === "p" && bz.pts.length > 3) {
            bz.pts.splice(hit.i, 1);
            if (bz.sel >= bz.pts.length) bz.sel = bz.pts.length - 1;
            drawCurveEditor();
        }
    });
    var bzc = Mt("btn-bz-cancel");
    if (bzc) bzc.onclick = closeBezierEditor;
    var bze = Mt("btn-bz-extrude");
    if (bze) bze.onclick = extrudeCurve;
    var bzu = Mt("btn-bz-undo");
    if (bzu) bzu.onclick = function() {
        if (bz.pts.length) {
            bz.pts.pop();
            drawCurveEditor();
        }
    };
    var bzr = Mt("btn-bz-reset");
    if (bzr) bzr.onclick = function() {
        bzReset(bz.mode);
        setCurveEditorCaption();
        drawCurveEditor();
    };
    var dz = Mt("bz-depth");
    if (dz) dz.addEventListener("input", function() {
        var o = Mt("bz-depth-out");
        if (o) o.textContent = dz.value;
    });
}

bindBezierCanvas();
wireMirrorArray();
wireBoxSelect();
M4();
T4();
ls();
hc();
tS();
requestAnimationFrame(function() {
    Mt("loading").classList.add("hidden");
    maybeRestoreDraft();
});
/*   Публичный API (window.app)   */
window.app = {
    addShape: K1,
    addText: dg,
    loadSTL: loadSTLFile,
    saveProject: saveProjectJSON,
    loadProject: loadProjectJSON,
    buildProjectJSON: buildProjectJSON,
    select: Zn,
    selectAll: () => Zn(sa()),
    group: cc,
    ungroup: () => uc(),
    setHole: (n, e) => Q1(n, e),
    del: xg,
    dup: yg,
    undo: gg,
    redo: Uf,
    exportSTLBytes: _g,
    objects: sa,
    THREE: Bm
};