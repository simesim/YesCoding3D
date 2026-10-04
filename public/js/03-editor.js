// @ts-nocheck
//каталог и контуры инструментов
function clonePts(list) {
    return list.map(function(p) {
        return {
            x: p.x,
            y: p.y,
            ix: p.ix,
            iy: p.iy,
            ox: p.ox,
            oy: p.oy
        };
    });
}

function polyToBezierPts(pts) {
    var n = pts.length,
        out = [];
    for (var i = 0; i < n; i++) {
        var p0 = pts[(i - 1 + n) % n],
            p1 = pts[i],
            p2 = pts[(i + 1) % n];
        out.push({
            x: p1.x,
            y: p1.y,
            ix: p1.x - (p2.x - p0.x) / 6,
            iy: p1.y - (p2.y - p0.y) / 6,
            ox: p1.x + (p2.x - p0.x) / 6,
            oy: p1.y + (p2.y - p0.y) / 6
        });
    }
    return out;
}

function hasHandles(p) {
    return p && typeof p.ox === "number" && typeof p.ix === "number";
}


function sampleCubicBez(p0, p1, p2, p3, steps) {
    var out = [],
        i, t, u, tt, uu;
    steps = steps || 24;
    for (i = 0; i < steps; i++) {
        t = i / steps;
        u = 1 - t;
        tt = t * t;
        uu = u * u;
        out.push({
            x: uu * u * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + tt * t * p3.x,
            y: uu * u * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + tt * t * p3.y
        });
    }
    return out;
}

function shapeFromRing(pts) {
    var s = new Hn();
    s.moveTo(pts[0].x, pts[0].y);
    for (var i = 1; i < pts.length; i++) {
        if (Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y) < 1e-4) continue;
        s.lineTo(pts[i].x, pts[i].y);
    }
    s.closePath();
    return s;
}

function makePolyGeo(n) {
    var pts = (n && n.pts && n.pts.length >= 3) ? n.pts : POLY_DEFAULT;
    var depth = (n && n.depth) || 8;
    return as(new Sn(shapeFromRing(pts), Object.assign({
        depth: depth,
        curveSegments: 12
    }, Oi)));
}

function makeBezierGeo(n) {
    var raw = (n && n.pts && n.pts.length >= 3) ? n.pts : polyToBezierPts(POLY_DEFAULT);
    var pts = hasHandles(raw[0]) ? raw : polyToBezierPts(raw);
    var depth = (n && n.depth) || 8;
    var flat = [],
        i, a, b;
    for (i = 0; i < pts.length; i++) {
        a = pts[i];
        b = pts[(i + 1) % pts.length];
        flat = flat.concat(sampleCubicBez(a, {
            x: a.ox,
            y: a.oy
        }, {
            x: b.ix,
            y: b.iy
        }, b, 28));
    }
    return as(new Sn(shapeFromRing(flat), Object.assign({
        depth: depth,
        curveSegments: 8
    }, Oi)));
}

// @ts-nocheck
/* app-shapes: каталог фигур, добавить / удалить / группа */
/* Каталог фигур */
var _r = {
    box: {
        name: "\u041A\u0443\u0431",
        cat: "std",
        make: () => new vt(20, 20, 20)
    },
    sphere: {
        name: "\u0421\u0444\u0435\u0440\u0430",
        cat: "std",
        params: {
            seg: {
                label: "\u0421\u0435\u0433\u043C\u0435\u043D\u0442\u044B",
                min: 8,
                max: 64,
                step: 4,
                def: 32
            }
        },
        make: n => new Pi(10, n.seg, Math.max(6, n.seg >> 1))
    },
    hemisphere: {
        name: "\u041F\u043E\u043B\u0443\u0441\u0444\u0435\u0440\u0430",
        cat: "std",
        params: {
            seg: {
                label: "\u0421\u0435\u0433\u043C\u0435\u043D\u0442\u044B",
                min: 8,
                max: 64,
                step: 4,
                def: 32
            }
        },
        make: n => m4(n.seg)
    },
    cylinder: {
        name: "\u0426\u0438\u043B\u0438\u043D\u0434\u0440",
        cat: "std",
        params: {
            seg: {
                label: "\u0421\u0435\u0433\u043C\u0435\u043D\u0442\u044B",
                min: 3,
                max: 64,
                step: 1,
                def: 32
            }
        },
        make: n => new Et(10, 10, 20, n.seg)
    },
    cone: {
        name: "\u041A\u043E\u043D\u0443\u0441",
        cat: "std",
        params: {
            seg: {
                label: "\u0421\u0435\u0433\u043C\u0435\u043D\u0442\u044B",
                min: 3,
                max: 64,
                step: 1,
                def: 32
            }
        },
        make: n => new Vr(11, 20, n.seg)
    },
    torus: {
        name: "\u0422\u043E\u0440",
        cat: "std",
        params: {
            seg: {
                label: "\u0421\u0435\u0433\u043C\u0435\u043D\u0442\u044B",
                min: 8,
                max: 96,
                step: 4,
                def: 48
            },
            thick: {
                label: "\u0422\u043E\u043B\u0449\u0438\u043D\u0430",
                min: 1,
                max: 9,
                step: .5,
                def: 3.5
            }
        },
        make: n => {
            let e = new ni(10, n.thick, 18, n.seg);
            return e.rotateX(Math.PI / 2), _o(e)
        }
    },
    pyramid4: {
        name: "\u041F\u0438\u0440\u0430\u043C\u0438\u0434\u0430",
        cat: "std",
        make: () => {
            let n = new Vr(13, 20, 4);
            return n.rotateY(Math.PI / 4), n
        }
    },
    prism: {
        name: "\u041F\u0440\u0438\u0437\u043C\u0430",
        cat: "std",
        params: {
            sides: {
                label: "\u0413\u0440\u0430\u043D\u0438",
                min: 3,
                max: 12,
                step: 1,
                def: 6
            }
        },
        make: n => new Et(11, 11, 20, n.sides)
    },
    tube: {
        name: "\u0422\u0440\u0443\u0431\u0430",
        cat: "forms",
        params: {
            wall: {
                label: "\u0421\u0442\u0435\u043D\u043A\u0430",
                min: 1,
                max: 8,
                step: .5,
                def: 3
            }
        },
        make: n => as(new Sn(U1(10, Math.max(1, 10 - n.wall)), {
            depth: 20,
            ...Oi
        }))
    },
    wedge: {
        name: "\u041A\u043B\u0438\u043D",
        cat: "forms",
        make: () => _o(new Sn(ia([
            [-10, 0],
            [10, 0],
            [-10, 20]
        ]), {
            depth: 20,
            ...Oi
        }))
    },
    roof: {
        name: "\u041A\u0440\u044B\u0448\u0430",
        cat: "forms",
        make: () => _o(new Sn(ia([
            [-11, 0],
            [11, 0],
            [0, 13]
        ]), {
            depth: 20,
            ...Oi
        }))
    },
    stairs: {
        name: "\u0421\u0442\u0443\u043F\u0435\u043D\u044C\u043A\u0438",
        cat: "forms",
        params: {
            steps: {
                label: "\u0421\u0442\u0443\u043F\u0435\u043D\u0438",
                min: 2,
                max: 10,
                step: 1,
                def: 4
            }
        },
        make: n => _o(new Sn(p4(n.steps), {
            depth: 20,
            ...Oi
        }))
    },
    pyramid3: {
        name: "\u041F\u0438\u0440\u0430\u043C\u0438\u0434\u0430 3",
        cat: "std",
        make: () => new Vr(13, 20, 3)
    },
    capsule: {
        name: "\u041A\u0430\u043F\u0441\u0443\u043B\u0430",
        cat: "forms",
        params: {
            seg: {
                label: "\u0421\u0435\u0433\u043C\u0435\u043D\u0442\u044B",
                min: 8,
                max: 48,
                step: 4,
                def: 24
            }
        },
        make: n => new Wa(8, 14, 10, n.seg)
    },
    diamond: {
        name: "\u0420\u043E\u043C\u0431",
        cat: "forms",
        make: () => new ti(13)
    },
    ring: {
        name: "\u041A\u043E\u043B\u044C\u0446\u043E",
        cat: "forms",
        params: {
            wall: {
                label: "\u0421\u0442\u0435\u043D\u043A\u0430",
                min: 1,
                max: 8,
                step: .5,
                def: 4
            }
        },
        make: n => as(new Sn(U1(12, Math.max(1, 12 - n.wall)), {
            depth: 5,
            ...Oi
        }))
    },
    star: {
        name: "\u0417\u0432\u0435\u0437\u0434\u0430",
        cat: "decor",
        params: {
            points: {
                label: "\u041B\u0443\u0447\u0438",
                min: 4,
                max: 12,
                step: 1,
                def: 5
            }
        },
        make: n => as(new Sn(h4(n.points), {
            depth: 8,
            ...Oi
        }))
    },
    heart: {
        name: "\u0421\u0435\u0440\u0434\u0446\u0435",
        cat: "decor",
        make: () => {
            let n = new Sn(d4(), {
                depth: 8,
                ...Oi
            });
            return n.rotateZ(Math.PI), as(n)
        }
    },
    gear: {
        name: "\u0428\u0435\u0441\u0442\u0435\u0440\u0451\u043D\u043A\u0430",
        cat: "decor",
        params: {
            teeth: {
                label: "\u0417\u0443\u0431\u044C\u044F",
                min: 6,
                max: 24,
                step: 1,
                def: 10
            }
        },
        make: n => as(new Sn(f4(n.teeth), {
            depth: 8,
            ...Oi
        }))
    },
    crescent: {
        name: "\u041F\u043E\u043B\u0443\u043C\u0435\u0441\u044F\u0446",
        cat: "decor",
        make: () => g4()
    },
    arrow: {
        name: "\u0421\u0442\u0440\u0435\u043B\u043A\u0430",
        cat: "decor",
        make: () => as(new Sn(ia([
            [-13, -4],
            [2, -4],
            [2, -10],
            [13, 0],
            [2, 10],
            [2, 4],
            [-13, 4]
        ]), {
            depth: 8,
            ...Oi
        }))
    },
    tetra: {
        name: "\u0422\u0435\u0442\u0440\u0430\u044D\u0434\u0440",
        cat: "std",
        make: () => new Hu(12)
    },
    dodeca: {
        name: "\u0414\u043E\u0434\u0435\u043A\u0430\u044D\u0434\u0440",
        cat: "std",
        make: () => new Bu(10)
    },
    icosa: {
        name: "\u0418\u043A\u043E\u0441\u0430\u044D\u0434\u0440",
        cat: "std",
        make: () => new Ou(10)
    },
    arch: {
        name: "\u0410\u0440\u043A\u0430",
        cat: "forms",
        make: () => as(new Sn(ia([
            [-12, 0],
            [-12, 8],
            [-8, 14],
            [0, 16],
            [8, 14],
            [12, 8],
            [12, 0],
            [8, 0],
            [8, 7],
            [4, 12],
            [0, 13],
            [-4, 12],
            [-8, 7],
            [-8, 0]
        ]), {
            depth: 10,
            ...Oi
        }))
    },
    torusknot: {
        name: "\u0423\u0437\u0435\u043B",
        cat: "decor",
        params: {
            p: {
                label: "P",
                min: 1,
                max: 6,
                step: 1,
                def: 2
            },
            q: {
                label: "Q",
                min: 1,
                max: 8,
                step: 1,
                def: 3
            }
        },
        make: n => {
            let e = new Gu(7, 2.2, 96, 12, n.p || 2, n.q || 3);
            return e.rotateX(Math.PI / 2), _o(e)
        }
    },
    barrel: {
        name: "\u0411\u043E\u0447\u043A\u0430",
        cat: "std",
        params: {
            seg: {
                label: "\u0421\u0435\u0433\u043C\u0435\u043D\u0442\u044B",
                min: 8,
                max: 64,
                step: 4,
                def: 32
            }
        },
        make: n => new Et(7, 11, 20, n.seg)
    },
    ellipsoid: {
        name: "\u042D\u043B\u043B\u0438\u043F\u0441\u043E\u0438\u0434",
        cat: "std",
        params: {
            seg: {
                label: "\u0421\u0435\u0433\u043C\u0435\u043D\u0442\u044B",
                min: 8,
                max: 48,
                step: 4,
                def: 24
            }
        },
        make: n => {
            let e = new Pi(10, n.seg, Math.max(6, n.seg >> 1));
            return e.scale(1.4, 1, .75), e
        }
    },
    nut: {
        name: "\u0413\u0430\u0439\u043A\u0430",
        cat: "forms",
        params: {
            seg: {
                label: "\u0413\u0440\u0430\u043D\u0438",
                min: 6,
                max: 12,
                step: 1,
                def: 6
            }
        },
        make: n => {
            let e = new hr(new Et(12, 12, 7, n.seg)),
                t = new hr(new Et(5.5, 5.5, 10, 24));
            return e.updateMatrixWorld(!0), t.updateMatrixWorld(!0), _o(oc.evaluate(e, t, 1).geometry)
        }
    },
    halfpipe: {
        name: "\u041F\u043E\u043B\u0443\u0442\u0440\u0443\u0431\u0430",
        cat: "forms",
        params: {
            wall: {
                label: "\u0421\u0442\u0435\u043D\u043A\u0430",
                min: 1,
                max: 6,
                step: .5,
                def: 2.5
            }
        },
        make: n => {
            let e = new Hn;
            e.absarc(0, 0, 12, Math.PI, 0, !1), e.lineTo(12 - n.wall, 0), e.absarc(0, 0, 12 - n.wall,
                0, Math.PI, !0), e.closePath();
            return as(new Sn(e, {
                depth: 20,
                ...Oi
            }))
        }
    },
    oval: {
        name: "\u041E\u0432\u0430\u043B",
        cat: "decor",
        make: () => {
            let e = new Hn;
            e.ellipse(0, 0, 14, 9, 0, Math.PI * 2, !1, 0);
            return as(new Sn(e, {
                depth: 5,
                ...Oi
            }))
        }
    },
    flower: {
        name: "\u0426\u0432\u0435\u0442\u043E\u043A",
        cat: "decor",
        params: {
            petals: {
                label: "\u041B\u0435\u043F\u0435\u0441\u0442\u043A\u0438",
                min: 4,
                max: 10,
                step: 1,
                def: 6
            }
        },
        make: n => {
            let e = [];
            for (let t = 0; t < n.petals * 2; t++) {
                let i = t / (n.petals * 2) * Math.PI * 2 - Math.PI / 2,
                    r = t % 2 ? 5 : 13;
                e.push([Math.cos(i) * r, Math.sin(i) * r])
            }
            return as(new Sn(ia(e), {
                depth: 6,
                ...Oi
            }))
        }
    },
    bolt: {
        name: "\u0411\u043E\u043B\u0442",
        cat: "decor",
        make: () => {
            let e = new hr(new Et(5, 5, 18, 24));
            e.position.y = 2;
            let t = new hr(new Et(9, 9, 5, 6));
            t.position.y = 11.5;
            e.updateMatrixWorld(!0), t.updateMatrixWorld(!0);
            return _o(oc.evaluate(t, e, 0).geometry)
        }
    },
    poly: {
        name: "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u043B\u044C\u043D\u0430\u044F",
        cat: "tools",
        params: {
            depth: {
                label: "\u0412\u044B\u0441\u043E\u0442\u0430",
                min: 2,
                max: 40,
                step: 1,
                def: 8
            }
        },
        make: function(n) {
            return makePolyGeo(n);
        }
    },
    bezier: {
        name: "\u041A\u0440\u0438\u0432\u0430\u044F \u0411\u0435\u0437\u044C\u0435",
        cat: "tools",
        params: {
            depth: {
                label: "\u0412\u044B\u0441\u043E\u0442\u0430",
                min: 2,
                max: 40,
                step: 1,
                def: 8
            }
        },
        make: function(n) {
            return makeBezierGeo(n);
        }
    },
    ruler: {
        name: "\u041B\u0438\u043D\u0435\u0439\u043A\u0430",
        cat: "tools",
        make: function() {
            return new vt(22, 2, 2);
        }
    },
    text: {
        name: "\u0422\u0435\u043A\u0441\u0442",
        cat: "chars",
        params: {},
        make: n => v4(n.text || "\u0410")
    }
};