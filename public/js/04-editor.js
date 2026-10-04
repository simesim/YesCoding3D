// @ts-nocheck
//создать фигуру и отмен
function kf(n, e) {
    let t = _r[n].make(e || {});
    return t.computeBoundingBox(), t
}

function Y1(n) {
    let e = {},
        t = _r[n].params || {};
    for (let i in t) t[i].def !== void 0 && (e[i] = t[i].def);
    return e
}
var sa = () => Vt.children.filter(n => n.userData && n.userData.kind);

function mg(n) {
    let e = n.geometry.boundingBox;
    return new E().subVectors(e.max, e.min)
}

function x4(n) {
    let e = new E(n.x / 2 + 2, n.y / 2, n.z / 2 + 2),
        t = sa().map(r => new ut().setFromObject(r)),
        i = (r, s) => {
            let a = new E(r, n.y / 2, s),
                o = new ut(a.clone().sub(e), a.clone().add(e));
            return !t.some(l => l.intersectsBox(o))
        };
    if (i(0, 0)) return {
        x: 0,
        z: 0
    };
    for (let r = 1; r < 7; r++) {
        let s = r * 26;
        for (let a = 0; a < r * 8; a++) {
            let o = a / (r * 8) * Math.PI * 2,
                l = Math.round(Math.cos(o) * s),
                c = Math.round(Math.sin(o) * s);
            if (i(l, c)) return {
                x: l,
                z: c
            }
        }
    }
    return {
        x: 0,
        z: 0
    }
} /*   Создание mesh фигуры: kf=геометрия, W1=материал (MeshStandardMaterial), le=Mesh из Three.js   */
function q1(n, e) {
    let t = kf(n, e),
        i = W1(u4()),
        r = new le(t, i);
    r.castShadow = r.receiveShadow = !0, r.userData = {
        kind: "shape",
        def: {
            type: n,
            params: {
                ...e
            }
        },
        isHole: !1,
        _mat: i
    };
    let s = mg(r),
        a = x4(s);
    return r.position.set(a.x, s.y / 2, a.z), r
}

function $1(n) {
    let e = n.userData.isHole,
        t = n.userData._mat.clone(),
        i = new le(n.geometry.clone(), e ? X1 : t);
    return i.geometry.computeBoundingBox(), i.castShadow = i.receiveShadow = !0, i.position.copy(n
        .position), i.quaternion.copy(n.quaternion), i.scale.copy(n.scale), i.userData = {
        kind: n.userData.kind,
        isHole: e,
        _mat: t,
        def: n.userData.def ? {
            type: n.userData.def.type,
            params: {
                ...n.userData.def.params
            }
        } : void 0,
        members: n.userData.members ? n.userData.members.map($1) : void 0,
        baseMatrix: n.userData.baseMatrix ? n.userData.baseMatrix.clone() : void 0
    }, i
}
var Vf = [],
    Hf = [];

function lc(n) {
    Vf.push(n), Hf.length = 0, hc()
}

function Hi(n) {
    n.apply(), lc(n), markProjectDirty()
}

function gg() {
    let n = Vf.pop();
    n && (n.revert(), Hf.push(n), hc(), ls(), markProjectDirty())
}

function Uf() {
    let n = Hf.pop();
    n && (n.apply(), Vf.push(n), hc(), ls(), markProjectDirty())
}

function aa(n, e) {
    return {
        apply() {
            n.forEach(t => Vt.remove(t)), e.forEach(t => Vt.add(t)), Zn(e.filter(t => t.userData.kind))
        },
        revert() {
            e.forEach(t => Vt.remove(t)), n.forEach(t => Vt.add(t)), Zn(n.filter(t => t.userData.kind))
        }
    }
}

function vg(n, e, t) {
    let i = r => {
        n.forEach((s, a) => {
            s.matrix.copy(r[a]), s.matrix.decompose(s.position, s.quaternion, s.scale)
        }), Zn(n.filter(s => s.parent === Vt))
    };
    return {
        apply() {
            i(t)
        },
        revert() {
            i(e)
        }
    }
}

function ra(n) {
    return {
        color: n.userData._mat.color.getHex(),
        isHole: n.userData.isHole,
        params: n.userData.def ? JSON.stringify(n.userData.def.params) : null
    }
}