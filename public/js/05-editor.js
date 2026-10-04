// @ts-nocheck
// клик и выделение
function F1(n, e) {
    n.userData._mat.color.setHex(e.color), n.userData.def && e.params !== null && JSON.stringify(n
            .userData.def.params) !== e.params && (n.userData.def.params = JSON.parse(e.params), n
            .geometry.dispose(), n.geometry = kf(n.userData.def.type, n.userData.def.params)), n.userData
        .isHole = e.isHole, n.material = e.isHole ? X1 : n.userData._mat
}

function Ff(n, e, t) {
    return {
        apply() {
            n.forEach((i, r) => F1(i, t[r])), ls()
        },
        revert() {
            n.forEach((i, r) => F1(i, e[r])), ls()
        }
    }
}
var ot = [],
    Df = new Map,
    yr = new st;
Vt.add(yr);
var Lt = new wh(Vi, Sr);
Lt.setTranslationSnap(1);
Lt.setRotationSnap(cr.degToRad(15));
Lt.setScaleSnap(.05);
Lt.setSize(.95);
Vt.add(Lt);
Lt.addEventListener("dragging-changed", n => {
    Mr.enabled = !n.value;
    if (!n.value) markProjectDirty();
});

function Zn(n) {
    ot = n.filter(e => e.parent === Vt);
    for (let [, e] of Df) Vt.remove(e);
    Df.clear();
    for (let e of ot) {
        let t = new Al(e, 4886754);
        t.material.transparent = !0, t.material.opacity = .9, Vt.add(t), Df.set(e, t)
    }
    if (Lt.detach(), ot.length === 1) Lt.attach(ot[0]);
    else if (ot.length > 1) {
        let e = new E;
        ot.forEach(t => e.add(t.position)), e.divideScalar(ot.length), yr.position.copy(e), yr
            .quaternion.identity(), yr.scale.set(1, 1, 1), yr.updateMatrix(), Lt.attach(yr)
    }
    ls(), hc()
}
var br = null;
Lt.addEventListener("mouseDown", () => {
    let n = Lt.object;
    n && (n.updateMatrix(), br = {
        pivotM: n.matrix.clone(),
        objs: [...ot],
        mats: ot.map(e => (e.updateMatrix(), e.matrix.clone()))
    })
});
Lt.addEventListener("objectChange", () => {
    if (br) {
        if (Lt.object === yr) {
            yr.updateMatrix();
            let n = yr.matrix.clone().multiply(br.pivotM.clone().invert());
            br.objs.forEach((e, t) => {
                e.matrix.copy(n.clone().multiply(br.mats[t])), e.matrix.decompose(e.position, e
                    .quaternion, e.scale)
            })
        }
        A4()
    }
});
Lt.addEventListener("mouseUp", () => {
    if (!br) return;
    let n = br.objs,
        e = br.mats,
        t = n.map(r => (r.updateMatrix(), r.matrix.clone()));
    t.some((r, s) => !r.equals(e[s])) && lc(vg(n, e, t)), br = null, ls()
});
addEventListener("keydown", n => {
    n.key === "Shift" && (Lt.setTranslationSnap(null), Lt.setRotationSnap(null), Lt.setScaleSnap(
        null))
});
addEventListener("keyup", n => {
    n.key === "Shift" && (Lt.setTranslationSnap(1), Lt.setRotationSnap(cr.degToRad(15)), Lt
        .setScaleSnap(.05))
});
var B1 = new lr,
    N1 = new Q,
    So = null;
Sr.addEventListener("pointerdown", n => {
    let e = Sr.getBoundingClientRect();
    if (n.clientX > e.right - 128 && n.clientY > e.bottom - 128 && ac.handleClick(n)) {
        So = null;
        return
    }
    So = {
        x: n.clientX,
        y: n.clientY
    }
});
Sr.addEventListener("pointermove", n => {
    if (ruler.on && ruler.a) onRulerEvent(n, !0);
});
Sr.addEventListener("pointerup", n => {
    if (ruler.on) {
        let drag = So && Math.hypot(n.clientX - So.x, n.clientY - So.y) > 6;
        if (So = null, !drag && !Lt.dragging && !Lt.axis) onRulerEvent(n, !1);
        return;
    }
    if (!So) return;
    let e = Math.hypot(n.clientX - So.x, n.clientY - So.y) > 5;
    if (So = null, e || Lt.dragging || Lt.axis) return;
    let t = Z1(n);
    if (t)
        if (n.shiftKey) {
            let i = ot.indexOf(t);
            Zn(i >= 0 ? ot.filter(r => r !== t) : [...ot, t])
        } else Zn([t]);
    else n.shiftKey || Zn([])
});
Sr.addEventListener("dblclick", n => {
    let e = Z1(n);
    e && e.userData.kind === "group" && y4(e)
});

function Z1(n) {
    let e = Sr.getBoundingClientRect();
    N1.set((n.clientX - e.left) / e.width * 2 - 1, -((n.clientY - e.top) / e.height) * 2 + 1), B1
        .setFromCamera(N1, Vi);
    let t = B1.intersectObjects(sa(), !1);
    return t.length ? t[0].object : null
}
/*   Добавление фигуры на сцену   */
/*   Добавить фигуру на сцену + запись в undo (aa/Hi)   */
function K1(n, e) {
    let t = q1(n, e ? e : Y1(n));
    return Hi(aa([], [t])), t
} /*   Добавить 3D-текст (opentype.js ExtrudeGeometry)   */
function dg(n) {
    let e = q1("text", {
        text: n
    });
    return Hi(aa([], [e])), e
} /*   Удалить выделенные объекты   */