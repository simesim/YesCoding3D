// @ts-nocheck
// кадр и рамка
function eS() {
    let n = D1.clientWidth,
        e = D1.clientHeight;
    os.setSize(n, e, !1), Vi.aspect = n / e, Vi.updateProjectionMatrix()
}
addEventListener("resize", eS);
eS();
/*   Главный цикл рендера   */
function tS() {
    requestAnimationFrame(tS);
    let n = C4.getDelta();
    if (xr) {
        xr.t = Math.min(1, xr.t + n / .45);
        let e = 1 - Math.pow(1 - xr.t, 3);
        Vi.position.lerpVectors(xr.from, xr.to, e), xr.t >= 1 && (xr = null)
    }
    Mr.update(), ac.animating && ac.update(n);
    for (let [e, t] of Df) e.parent === Vt && t.update();
    os.clear(), os.render(Vt, Vi), ac.render(os)
}

/* === extras: выделение рамкой === */
var boxSelectMode = !1;
var mqDrag = null;

function mqRect(a, b) {
    return {
        left: Math.min(a.x, b.x),
        top: Math.min(a.y, b.y),
        right: Math.max(a.x, b.x),
        bottom: Math.max(a.y, b.y)
    };
}

function showMarquee(r) {
    var el = Mt("marquee");
    if (!el) return;
    var vp = D1.getBoundingClientRect();
    el.classList.remove("hidden");
    el.style.left = (r.left - vp.left) + "px";
    el.style.top = (r.top - vp.top) + "px";
    el.style.width = (r.right - r.left) + "px";
    el.style.height = (r.bottom - r.top) + "px";
}

function hideMarquee() {
    var el = Mt("marquee");
    if (el) el.classList.add("hidden");
}

function objectsInMarquee(r) {
    var canvas = Sr.getBoundingClientRect();
    var out = [];
    var v = new E();
    sa().forEach(function(obj) {
        if (!obj.visible) return;
        obj.updateWorldMatrix(!0, !0);
        if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
        var bb = obj.geometry.boundingBox;
        var xs = [bb.min.x, bb.max.x],
            ys = [bb.min.y, bb.max.y],
            zs = [bb.min.z, bb.max.z];
        var minx = 1e9,
            miny = 1e9,
            maxx = -1e9,
            maxy = -1e9,
            behind = 0;
        for (var i = 0; i < 2; i++)
            for (var j = 0; j < 2; j++)
                for (var k = 0; k < 2; k++) {
                    v.set(xs[i], ys[j], zs[k]).applyMatrix4(obj.matrixWorld).project(Vi);
                    if (v.z > 1) {
                        behind++;
                        continue;
                    }
                    var sx = (v.x * .5 + .5) * canvas.width + canvas.left;
                    var sy = (-v.y * .5 + .5) * canvas.height + canvas.top;
                    if (sx < minx) minx = sx;
                    if (sy < miny) miny = sy;
                    if (sx > maxx) maxx = sx;
                    if (sy > maxy) maxy = sy;
                }
        if (behind === 8) return;
        if (maxx < r.left || minx > r.right || maxy < r.top || miny > r.bottom) return;
        out.push(obj);
    });
    return out;
}

function setBoxSelect(on) {
    boxSelectMode = !!on;
    var btn = Mt("btn-box");
    if (btn) btn.classList.toggle("on", boxSelectMode);
    if (boxSelectMode) ki("Рамка: зажми и протяни по сцене");
}

function finishMarquee(ev) {
    if (!mqDrag) return;
    var r = mqRect(mqDrag, {
        x: ev.clientX,
        y: ev.clientY
    });
    var big = Math.hypot(ev.clientX - mqDrag.x, ev.clientY - mqDrag.y) > 6;
    hideMarquee();
    Mr.enabled = !0;
    if (big) {
        var picked = objectsInMarquee(r);
        if (mqDrag.add) {
            var set = new Set(ot);
            picked.forEach(function(o) {
                set.add(o);
            });
            Zn([...set]);
        } else Zn(picked);
        ki(picked.length ? ("Выделено: " + picked.length) : "В рамке никого");
    }
    mqDrag = null;
    setBoxSelect(!1);
    So = null;
}

var ruler = {
    on: !1,
    a: null,
    line: null,
    dots: []
};

function rulerHit(ev) {
    var e = Sr.getBoundingClientRect();
    N1.set((ev.clientX - e.left) / e.width * 2 - 1, -((ev.clientY - e.top) / e.height) * 2 + 1);
    B1.setFromCamera(N1, Vi);
    var hits = B1.intersectObjects(sa(), !1);
    if (hits.length) return hits[0].point.clone();
    var ray = B1.ray;
    if (Math.abs(ray.direction.y) < 1e-5) return null;
    var t = -ray.origin.y / ray.direction.y;
    if (t < 0) return null;
    return ray.origin.clone().addScaledVector(ray.direction, t);
}