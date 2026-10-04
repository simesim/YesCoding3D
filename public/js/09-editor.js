// @ts-nocheck
// бибилиотека слева и stl
function _g() {
    let n = sa().filter(a => !a.userData.isHole);
    if (!n.length) return ki(
        "\u041D\u0430 \u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0435 \u043D\u0435\u0442 \u0444\u0438\u0433\u0443\u0440 \u0434\u043B\u044F \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0430", !0), 0;
    let stlName = askFileName(".stl");
    if (!stlName) return 0;
    let e = n.map(a => {
            let o = a.geometry.clone();
            o.index && (o = o.toNonIndexed());
            for (let l of Object.keys(o.attributes)) l !== "position" && l !== "normal" && o
                .deleteAttribute(l);
            return a.updateMatrixWorld(!0), o.applyMatrix4(a.matrixWorld), o
        }),
        t = Gm(e, !1);
    t.rotateX(Math.PI / 2);
    let i = new Ch().parse(new le(t), {
            binary: !0
        }),
        r = new Blob([i], {
            type: "model/stl"
        }),
        s = document.createElement("a");
    s.href = URL.createObjectURL(r);
    s.download = stlName;
    s.click();
    setTimeout(() => URL.revokeObjectURL(s.href), 4e3);
    markProjectClean();
    ki("STL сохранён — можно печатать!");
    return i.byteLength;
}
var S4 = [
        ["std", "\u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442"],
        ["forms", "\u0424\u043E\u0440\u043C\u044B"],
        ["decor", "\u0414\u0435\u043A\u043E\u0440"],
        ["chars", "\u0411\u0443\u043A\u0432\u044B"],
        ["tools", "\u0415\u0449\u0451"]
    ],
    pg = Mt("lib-tabs"),
    Nf = Mt("lib-body"),
    j1 = {}; // @ts-nocheck
/* app-tools: библиотека UI, инспектор, рамка, линейка, Безье, массив */
/*   Превью-иконки фигур в библиотеке (offscreen WebGLRenderer)   */
function M4() {
    let n = new Ds({
        antialias: !0,
        alpha: !0,
        preserveDrawingBuffer: !0
    });
    n.setSize(132, 132);
    let e = new Us;
    e.add(new Ws(16777215, 13623536, 1.2));
    let t = new zr(16777215, 1.9);
    t.position.set(3, 5, 4), e.add(t);
    let i = new Bt(30, 1, .1, 100),
        r = {
            std: 4886754,
            forms: 1752220,
            decor: 16098851,
            tools: 16098851
        };
    for (let s in _r) {
        if (s === "text" || _r[s].cat === "tools") continue;
        let a = kf(s, Y1(s)),
            o = new le(a, W1(r[_r[s].cat] ? r[_r[s].cat] : 4886754));
        e.add(o);
        let l = a.boundingBox.getBoundingSphere(new Nt).radius;
        i.position.set(l * 2.1, l * 1.7, l * 2.1), i.lookAt(0, 0, 0), n.render(e, i), j1[s] = n
            .domElement.toDataURL(), e.remove(o), a.dispose()
    }
    n.dispose()
} /*   Вкладки библиотеки: Стандарт / Формы / Декор / Буквы   */
function T4() {
    pg.innerHTML = "";
    for (let [n, e] of S4) {
        let t = document.createElement("button");
        t.className = "lib-tab", t.textContent = e, t.dataset.cat = n, t.onclick = () => O1(n), pg
            .appendChild(t)
    }
    O1("std")
}

function O1(n) {
    if ([...pg.children].forEach(t => t.classList.toggle("on", t.dataset.cat === n)), Nf.innerHTML =
        "", n === "chars") return E4();
    if (n === "tools") return renderTools();
    let e = document.createElement("div");
    e.className = "shape-grid";
    for (let t in _r) {
        if (_r[t].cat !== n) continue;
        let i = document.createElement("button");
        i.className = "shape-btn", i.innerHTML =
            `<img src="${j1[t]}" alt=""><span>${_r[t].name}</span>`, i.onclick = () => K1(t), e
            .appendChild(i)
    }
    Nf.appendChild(e)
}

function renderTools() {
    var wrap = document.createElement("div");
    wrap.className = "tools-list";
    [
        ["poly", "Произвольная",
            "Контур из прямых отрезков. Кликаешь точки — получается многоугольник."
        ],
        ["bezier", "Кривая Безье",
            "Гладкий контур. Синие точки — якоря, оранжевые квадраты — ручки изгиба."
        ],
        ["mirror", "Зеркало копии", "Копия выделенного, отражённая относительно оси сцены."],
        ["array", "Массив", "Несколько копий в ряд или по кругу."],
        ["ruler", "Линейка", "Две точки на сцене — расстояние в миллиметрах."]
    ].forEach(function(row) {
        var b = document.createElement("button");
        b.className = "tool-row";
        b.innerHTML = "<div class=\"tool-row-title\">" + row[1] +
            "</div><div class=\"tool-row-desc\">" + row[2] + "</div>";
        b.onclick = function() {
            if (row[0] === "ruler") startRuler();
            else if (row[0] === "mirror") openMirrorPanel();
            else if (row[0] === "array") openArrayPanel();
            else openCurveEditor(row[0]);
        };
        wrap.appendChild(b);
    });
    Nf.appendChild(wrap);
}

function E4() {
    let n = document.createElement("div");
    n.className = "lib-sub", n.textContent =
        "\u0421\u0432\u043E\u044F \u043D\u0430\u0434\u043F\u0438\u0441\u044C";
    let e = document.createElement("div");
    e.className = "text-row";
    let t = document.createElement("input");
    t.placeholder =
        "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u041F\u0420\u0418\u0412\u0415\u0422", t
        .maxLength = 16;
    let i = document.createElement("button");
    i.textContent = "+", i.title = "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C", i.className =
        "text-add";
    let r = () => {
        t.value.trim() && (dg(t.value.trim()), t.value = "")
    };
    i.onclick = r, t.addEventListener("keydown", a => {
        a.key === "Enter" && r(), a.stopPropagation()
    }), e.append(t, i), Nf.append(n, e);
    let s = [
        ["\u0420\u0443\u0441\u0441\u043A\u0438\u0435 \u0431\u0443\u043A\u0432\u044B",
            "\u0410\u0411\u0412\u0413\u0414\u0415\u0401\u0416\u0417\u0418\u0419\u041A\u041B\u041C\u041D\u041E\u041F\u0420\u0421\u0422\u0423\u0424\u0425\u0426\u0427\u0428\u0429\u042A\u042B\u042C\u042D\u042E\u042F"
        ],
        ["\u0410\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u0438\u0435 \u0431\u0443\u043A\u0432\u044B",
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        ],
        ["\u0426\u0438\u0444\u0440\u044B", "0123456789"]
    ];
    for (let [a, o] of s) {
        let l = document.createElement("div");
        l.className = "lib-sub", l.textContent = a;
        let c = document.createElement("div");
        c.className = "char-grid";
        for (let u of o) {
            let f = document.createElement("button");
            f.className = "char-btn", f.textContent = u, f.onclick = () => dg(u), c.appendChild(f)
        }
        Nf.append(l, c)
    }
}
var Pt = Mt("insp-body"),
    Si = null;
/*   Обновление панели инспектора   */