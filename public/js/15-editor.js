// @ts-nocheck
// Холст кривой 
function bzMap(cv, mx, my) {
    var r = cv.getBoundingClientRect();
    var x = (mx - r.left) / r.width;
    var y = (my - r.top) / r.height;
    return {
        x: (x - .5) * 80,
        y: (.5 - y) * 56
    };
}

function bzHit(cv, mx, my) {
    var p = bzMap(cv, mx, my);
    var best = null,
        bd = 3.4;

    function consider(kind, i, x, y, lim) {
        var d = Math.hypot(x - p.x, y - p.y);
        if (d < lim && d < bd) {
            bd = d;
            best = {
                kind: kind,
                i: i
            };
        }
    }
    if (bz.mode === "bezier") {
        bz.pts.forEach(function(pt, i) {
            consider("in", i, pt.ix, pt.iy, 2.6);
            consider("out", i, pt.ox, pt.oy, 2.6);
        });
    }
    bz.pts.forEach(function(pt, i) {
        consider("p", i, pt.x, pt.y, 3.4);
    });
    return best;
}

function drawCurveEditor() {
    var cv = Mt("bz-canvas");
    if (!cv) return;
    var ctx = cv.getContext("2d");
    var w = cv.width,
        h = cv.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#f7fbff";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#dde8f2";
    ctx.lineWidth = 1;
    for (var gx = 0; gx <= 8; gx++) {
        ctx.beginPath();
        ctx.moveTo(gx / 8 * w, 0);
        ctx.lineTo(gx / 8 * w, h);
        ctx.stroke();
    }
    for (var gy = 0; gy <= 6; gy++) {
        ctx.beginPath();
        ctx.moveTo(0, gy / 6 * h);
        ctx.lineTo(w, gy / 6 * h);
        ctx.stroke();
    }
    ctx.strokeStyle = "#c4dcf5";
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    function toS(x, y) {
        return {
            x: (x / 80 + .5) * w,
            y: (.5 - y / 56) * h
        };
    }
    var pts = bz.pts,
        n = pts.length;
    if (n >= 2) {
        ctx.strokeStyle = "#4A90E2";
        ctx.lineWidth = 3;
        ctx.beginPath();
        var s0 = toS(pts[0].x, pts[0].y);
        ctx.moveTo(s0.x, s0.y);
        if (bz.mode === "poly") {
            for (var i = 1; i < n; i++) {
                var q = toS(pts[i].x, pts[i].y);
                ctx.lineTo(q.x, q.y);
            }
            ctx.closePath();
        } else {
            for (var i = 0; i < n; i++) {
                var a = pts[i],
                    b = pts[(i + 1) % n];
                var c1 = toS(a.ox, a.oy),
                    c2 = toS(b.ix, b.iy),
                    e2 = toS(b.x, b.y);
                ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, e2.x, e2.y);
            }
        }
        ctx.fillStyle = "rgba(74,144,226,.16)";
        ctx.fill("evenodd");
        ctx.stroke();
    }
    if (bz.mode === "bezier") {
        pts.forEach(function(pt, i) {
            var a = toS(pt.x, pt.y),
                hin = toS(pt.ix, pt.iy),
                hout = toS(pt.ox, pt.oy);
            ctx.strokeStyle = "#8aa4bd";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(hin.x, hin.y);
            ctx.lineTo(a.x, a.y);
            ctx.lineTo(hout.x, hout.y);
            ctx.stroke();
            ctx.fillStyle = "#fff";
            ctx.strokeStyle = "#F5A623";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.rect(hin.x - 4, hin.y - 4, 8, 8);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.rect(hout.x - 4, hout.y - 4, 8, 8);
            ctx.fill();
            ctx.stroke();
        });
    }
    pts.forEach(function(pt, i) {
        var s = toS(pt.x, pt.y);
        var hot = (bz.over && bz.over.kind === "p" && bz.over.i === i) || (bz.drag && bz.drag
            .kind === "p" && bz.drag.i === i) || bz.sel === i;
        ctx.beginPath();
        ctx.arc(s.x, s.y, hot ? 7 : 5.5, 0, Math.PI * 2);
        ctx.fillStyle = hot ? "#F5A623" : "#4A90E2";
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}