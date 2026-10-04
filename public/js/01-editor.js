// @ts-nocheck
/* Имена движка приходят из lib/engine.js */
Object.assign(window, window.YC3D || {});
/*
	   Логика редактора
	   (сцена, фигуры, группировка, экспорт STL, UI)
	*/
var If = null;
try {
    If = I1.parse(sc.buffer.slice(sc.byteOffset, sc.byteOffset + sc.byteLength))
} catch (n) {
    console.error("font parse failed", n)
}
/*   Инициализация рендерера, камеры, сцены и света   */
var Mt = n => document.getElementById(n),
    Sr = Mt("gl"),
    D1 = Mt("viewport"),
    os = new Ds({
        canvas: Sr,
        antialias: !0,
        alpha: !0
    });
os.setPixelRatio(Math.min(devicePixelRatio, 2));
os.shadowMap.enabled = !0;
os.shadowMap.type = ph;
os.autoClear = !1;
var Vt = new Us,
    Vi = new Bt(45, 1, 1, 4e3);
Vi.position.set(170, 150, 170);
var Mr = new Sh(Vi, Sr);
Mr.target.set(0, 12, 0);
Mr.enableDamping = !0;
Mr.dampingFactor = .12;
Mr.minDistance = 25;
Mr.maxDistance = 1400;
Mr.maxPolarAngle = Math.PI * .495;
Vt.add(new Ws(16777215, 14674677, 1.05));
var Mi = new zr(16777215, 1.7);
Mi.position.set(130, 230, 150);
Mi.castShadow = !0;
Mi.shadow.mapSize.set(2048, 2048);
Mi.shadow.camera.left = -170;
Mi.shadow.camera.right = 170;
Mi.shadow.camera.top = 170;
Mi.shadow.camera.bottom = -170;
Mi.shadow.camera.far = 700;
Mi.shadow.bias = -2e-4;
Mi.shadow.normalBias = .03;
Vt.add(Mi);
var G1 = new zr(14215423, .45);
G1.position.set(-120, 90, -140);
Vt.add(G1);
var na = 200; {
    let n = new le(new Ci(900, 900), new Ya({
        opacity: .16
    }));
    n.rotation.x = -Math.PI / 2, n.receiveShadow = !0, Vt.add(n);
    let e = new le(new Ci(na, na), new sr({
        color: 16186109,
        roughness: .95
    }));
    e.rotation.x = -Math.PI / 2, e.position.y = -.05, Vt.add(e);
    let t = new Za(na, na, 14872055, 14872055);
    t.position.y = .02, t.material.transparent = !0, t.material.opacity = .55, Vt.add(t);
    let i = new Za(na, na / 10, 10207200, 12901360);
    i.position.y = .04, Vt.add(i);
    let r = na / 2,
        s = new Ha(new ze().setFromPoints([new E(-r, .06, -r), new E(r, .06, -r), new E(r, .06, r),
            new E(-r, .06, r)
        ]), new Yt({
            color: 4886754
        }));
    Vt.add(s)
}
var ac = new Rh(Vi, Sr);
ac.center = Mr.target;
var z1 = [4886754, 1752220, 16098851, 16312092, 15158332, 10181046, 3066993, 16748465, 3426654,
        9268835, 10197915, 16777215
    ],
    c4 = 0,
    u4 = () => z1[c4++ % 8],
    W1 = n => new sr({
        color: n,
        roughness: .55,
        metalness: .05
    }),
    X1 = (() => {
        let n = document.createElement("canvas");
        n.width = n.height = 64;
        let e = n.getContext("2d");
        e.fillStyle = "#eceff1", e.fillRect(0, 0, 64, 64), e.strokeStyle = "#90a4ae", e.lineWidth = 7;
        for (let i = -64; i < 128; i += 16) e.beginPath(), e.moveTo(i, 64), e.lineTo(i + 64, 0), e
            .stroke();
        let t = new Ns(n);
        return t.wrapS = t.wrapT = Rs, new sr({
            map: t,
            color: 16777215,
            transparent: !0,
            opacity: .55,
            roughness: .8,
            side: nn,
            depthWrite: !1
        })
    })(),
    oc = new mf;
oc.attributes = ["position", "normal"];
oc.useGroups = !1;

function cg(n) {
    let e = new hr(n.geometry.clone());
    return n.updateMatrixWorld(!0), n.matrixWorld.decompose(e.position, e.quaternion, e.scale), e
        .updateMatrixWorld(!0), e
}

function as(n) {
    return n.rotateX(-Math.PI / 2), n.center(), n
}

function _o(n) {
    return n.center(), n
}

function ia(n) {
    let e = new Hn;
    e.moveTo(n[0][0], n[0][1]);
    for (let t = 1; t < n.length; t++) e.lineTo(n[t][0], n[t][1]);
    return e.closePath(), e
}

function h4(n) {
    let e = [];
    for (let r = 0; r < n * 2; r++) {
        let s = r / (n * 2) * Math.PI * 2 - Math.PI / 2,
            a = r % 2 ? 5.2 : 12;
        e.push([Math.cos(s) * a, Math.sin(s) * a])
    }
    return ia(e)
}

function f4(n) {
    let i = Math.PI * 2 / n,
        r = [];
    for (let o = 0; o < n; o++) {
        let l = o * i;
        r.push([Math.cos(l) * 9.6, Math.sin(l) * 9.6], [Math.cos(l + i * .3) * 9.6, Math.sin(l + i *
            .3) * 9.6], [Math.cos(l + i * .4) * 12, Math.sin(l + i * .4) * 12], [Math.cos(l + i * .7) * 12, Math
            .sin(l + i * .7) * 12
        ], [Math.cos(l + i * .8) * 9.6, Math.sin(l + i * .8) * 9.6])
    }
    let s = ia(r),
        a = new Ri;
    return a.absarc(0, 0, 3.4, 0, Math.PI * 2, !0), s.holes.push(a), s
}