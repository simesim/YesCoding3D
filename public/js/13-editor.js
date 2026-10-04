// @ts-nocheck
// линейка и зеркало 
function rulerClearGfx() {
    if (ruler.line) {
        Vt.remove(ruler.line);
        ruler.line.geometry.dispose();
        ruler.line = null;
    }
    ruler.dots.forEach(function(d) {
        Vt.remove(d);
        d.geometry.dispose();
    });
    ruler.dots = [];
    var lab = Mt("ruler-label");
    if (lab) {
        lab.classList.add("hidden");
        lab.textContent = "";
    }
}

function rulerDot(p) {
    var m = new le(new Pi(1.2, 10, 8), new sr({
        color: 16098851,
        roughness: .4
    }));
    m.position.copy(p);
    m.position.y += 1.2;
    m.userData.skipPick = !0;
    Vt.add(m);
    ruler.dots.push(m);
    return m;
}

function rulerDraw(a, b, live) {
    if (ruler.line) {
        Vt.remove(ruler.line);
        ruler.line.geometry.dispose();
    }
    var geo = new ze();
    geo.setFromPoints([a, b]);
    ruler.line = new on(geo, new Yt({
        color: 16098851,
        depthTest: !1
    }));
    ruler.line.renderOrder = 9;
    Vt.add(ruler.line);
    var mm = a.distanceTo(b);
    var lab = Mt("ruler-label");
    if (lab) {
        var mid = a.clone().add(b).multiplyScalar(.5);
        mid.project(Vi);
        var rec = D1.getBoundingClientRect();
        lab.style.left = ((mid.x * .5 + .5) * rec.width) + "px";
        lab.style.top = ((-mid.y * .5 + .5) * rec.height - 18) + "px";
        lab.textContent = (Math.round(mm * 10) / 10) + " мм";
        lab.classList.remove("hidden");
    }
    if (!live) ki((Math.round(mm * 10) / 10) + " мм");
}

function startRuler() {
    ruler.on = !0;
    ruler.a = null;
    rulerClearGfx();
    var hint = Mt("ruler-hint");
    if (hint) hint.classList.remove("hidden");
    ki("Линейка: кликни две точки на фигуре или на полу");
}

function cancelRuler() {
    if (!ruler.on && !ruler.line) return !1;
    ruler.on = !1;
    ruler.a = null;
    rulerClearGfx();
    var hint = Mt("ruler-hint");
    if (hint) hint.classList.add("hidden");
    return !0;
}

function onRulerEvent(ev, isMove) {
    if (!ruler.on) return !1;
    var p = rulerHit(ev);
    if (!p) return !0;
    if (isMove) {
        if (ruler.a) rulerDraw(ruler.a, p, !0);
        return !0;
    }
    if (!ruler.a) {
        ruler.a = p;
        rulerDot(p);
        ki("Теперь вторую точку");
    } else {
        rulerDot(p);
        rulerDraw(ruler.a, p, !1);
        ruler.a = null;
        ruler.on = !0;
    }
    return !0;
}



function cloneSel() {
    return ot.map($1);
}

function openMirrorPanel() {
    if (!ot.length) {
        ki("Сначала выдели фигуру", !0);
        return;
    }
    var ov = Mt("mirror-overlay");
    if (ov) ov.classList.remove("hidden");
}

function closeMirrorPanel() {
    var ov = Mt("mirror-overlay");
    if (!ov || ov.classList.contains("hidden")) return !1;
    ov.classList.add("hidden");
    return !0;
}

function applyMirror(axis) {
    if (!ot.length) {
        ki("Нет выделения", !0);
        return;
    }
    var copies = cloneSel();
    copies.forEach(function(o) {
        if (axis === "z") {
            o.position.z = -o.position.z;
            o.rotation.x = -o.rotation.x;
            o.rotation.y = -o.rotation.y;
            o.scale.z *= -1;
        } else {
            o.position.x = -o.position.x;
            o.rotation.y = -o.rotation.y;
            o.rotation.z = -o.rotation.z;
            o.scale.x *= -1;
        }
    });
    Hi(aa([], copies));
    Zn(copies);
    closeMirrorPanel();
    ki("Зеркальная копия: ось " + axis.toUpperCase());
}