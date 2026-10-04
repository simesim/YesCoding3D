// @ts-nocheck
//КОНТУРЫ
// Фигуры, которые выходили проблемой в обработку первыми 
// Полусфера (m4), форма буквы с дыркой (glyphShapes), проверка "точка внутри фигуры"

function d4() {
    let n = new Hn,
        e = -12.5,
        t = -12.5;
    return n.moveTo(e + 12.5, t + 12.5), n.bezierCurveTo(e + 12.5, t + 12.5, e + 10, t + 20, e + 5,
            t + 20), n.bezierCurveTo(e - 2.5, t + 20, e - 2.5, t + 11.25, e - 2.5, t + 11.25), n
        .bezierCurveTo(e - 2.5, t + 5.5, e + 3.5, t - .9, e + 12.5, t - 5), n.bezierCurveTo(e + 21.5,
            t - .9, e + 27.5, t + 5.5, e + 27.5, t + 11.25), n.bezierCurveTo(e + 27.5, t + 11.25, e +
            27.5, t + 20, e + 20, t + 20), n.bezierCurveTo(e + 15.5, t + 20, e + 12.5, t + 12.5, e + 12.5,
            t + 12.5), n
}

function U1(n, e) {
    let t = new Hn;
    t.absarc(0, 0, n, 0, Math.PI * 2, !1);
    let i = new Ri;
    return i.absarc(0, 0, e, 0, Math.PI * 2, !0), t.holes.push(i), t
}

function p4(n) {
    let i = 20 / n,
        r = 20 / n,
        s = [
            [0, 0],
            [20, 0]
        ];
    for (let a = 1; a <= n; a++) s.push([20 - (a - 1) * i, a * r], [20 - a * i, a * r]);
    return ia(s)
}

function m4(n) {
    let e = new Pi(10, n, Math.max(4, n >> 1), 0, Math.PI * 2, 0, Math.PI / 2),
        t = new Xa(10, n);
    return t.rotateX(Math.PI / 2), _o(Gm([e, t]))
}

function g4() {
    let n = new hr(new Et(11, 11, 8, 48)),
        e = new hr(new Et(9.5, 9.5, 12, 48));
    return e.position.x = 6.5, n.updateMatrixWorld(!0), e.updateMatrixWorld(!0), _o(oc.evaluate(n, e,
        1).geometry)
}
var Oi = {
    bevelEnabled: !1,
    curveSegments: 48
};

function glyphShapes(path) {
    let shapes = path.toShapes(!1);
    if (shapes.length <= 1) return shapes;
    // точки для проверки «контур A внутри B»
    let pts = shapes.map(s => s.getPoints(24));
    let boxes = pts.map(p => {
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;
        for (let v of p) {
            if (v.x < minX) minX = v.x;
            if (v.y < minY) minY = v.y;
            if (v.x > maxX) maxX = v.x;
            if (v.y > maxY) maxY = v.y;
        }
        return {
            minX,
            minY,
            maxX,
            maxY
        };
    });
    let used = new Set();
    let result = [];
    for (let i = 0; i < shapes.length; i++) {
        if (used.has(i)) continue;
        // уже есть holes от toShapes
        if (shapes[i].holes && shapes[i].holes.length) {
            result.push(shapes[i]);
            used.add(i);
            continue;
        }
        let outer = shapes[i].clone();
        outer.holes = [];
        for (let j = 0; j < shapes.length; j++) {
            if (i === j || used.has(j)) continue;
            if (shapes[j].holes && shapes[j].holes.length) continue;
            // j внутри i? (по bounding box + тестовая точка)
            let bi = boxes[i],
                bj = boxes[j];
            if (bj.minX >= bi.minX && bj.maxX <= bi.maxX && bj.minY >= bi.minY && bj.maxY <= bi.maxY) {
                let test = pts[j][0];
                if (pointInPoly(test, pts[i])) {
                    outer.holes.push(shapes[j]);
                    used.add(j);
                }
            }
        }
        used.add(i);
        result.push(outer);
    }
    return result.length ? result : shapes;
}

function pointInPoly(pt, poly) {
    let inside = !1;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        let xi = poly[i].x,
            yi = poly[i].y,
            xj = poly[j].x,
            yj = poly[j].y;
        if (((yi > pt.y) !== (yj > pt.y)) && (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi))
            inside = !inside;
    }
    return inside;
}

function v4(n, e = 22, t = 8) {
    if (!If || !n) return new vt(20, 8, 20);
    let i = [],
        r = 0;
    for (let s of n) {
        let a = If.charToGlyph(s),
            o = a.getPath(r, 0, e),
            l = new wl;
        for (let c of o.commands) c.type === "M" ? l.moveTo(c.x, -c.y) : c.type === "L" ? l.lineTo(c.x, -c.y) : c.type === "Q" ? l.quadraticCurveTo(c.x1, -c.y1, c.x, -c.y) : c.type === "C" && l
            .bezierCurveTo(c.x1, -c.y1, c.x2, -c.y2, c.x, -c.y);
        i.push(...glyphShapes(l)), r += a.advanceWidth / If.unitsPerEm * e
    }
    return i.length ? as(new Sn(i, {
        depth: t,
        bevelEnabled: !1,
        curveSegments: 16,
        steps: 1
    })) : new vt(20, 8, 20)
}


var POLY_DEFAULT = [{
    x: 0,
    y: 16
}, {
    x: 14,
    y: 6
}, {
    x: 10,
    y: -12
}, {
    x: 0,
    y: -6
}, {
    x: -10,
    y: -12
}, {
    x: -14,
    y: 6
}];