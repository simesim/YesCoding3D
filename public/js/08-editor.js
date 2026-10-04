// @ts-nocheck
// Черновик и файлы джсон
var DRAFT_KEY = "yescoding3d-draft";
var draftTimer = 0;

function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
}

function writeDraft() {
    try {
        var data = buildProjectJSON();
        if (!data.figures.length) {
            clearDraft();
            return;
        }
        data.draft = true;
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn("draft save failed", e);
    }
}

function scheduleDraft() {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(writeDraft, 500);
}

function maybeRestoreDraft() {
    var raw;
    try { raw = localStorage.getItem(DRAFT_KEY); } catch (e) { return; }
    if (!raw) return;
    var data;
    try { data = JSON.parse(raw); } catch (e) { clearDraft(); return; }
    var list = data.figures || data.objects || [];
    if (!list.length) { clearDraft(); return; }
    var title = data.name || "проект";
    if (!confirm("Нашёлся черновик («" + title + "»). Восстановить?")) {
        clearDraft();
        return;
    }
    try {
        var created = list.map(meshFromData);
        Hi(aa(sa(), created));
        bg();
        Zn([]);
        if (data.name) lastFileName = sanitizeFileName(data.name) || lastFileName;
        projectDirty = !0;
        ki("Черновик восстановлен");
    } catch (err) {
        console.error(err);
        ki("Не удалось восстановить черновик", !0);
    }
}

function markProjectClean() {
    projectDirty = !1;
    clearDraft();
}
window.addEventListener("beforeunload", function(e) {
    if (projectDirty) writeDraft();
    if (!projectDirty) return;
    e.preventDefault();
    e.returnValue = "";
});

function askFileName(ext) {
    var raw = prompt("Имя файла:", lastFileName);
    if (raw === null) return null;
    var name = sanitizeFileName(raw) || lastFileName || "проект";
    lastFileName = name;
    return name + ext;
}

function buildProjectJSON() {
    return {
        version: 1,
        name: lastFileName || "YesCoding3D project",
        savedAt: new Date().toISOString(),
        figures: sa().map(serializeObj)
    };
}

/*   Скачать проект как .json файл   */
function saveProjectJSON() {
    let data = buildProjectJSON();
    if (!data.figures.length) {
        ki("На площадке нет фигур для сохранения", !0);
        return;
    }
    let fname = askFileName(".json");
    if (!fname) return;
    data.name = lastFileName;
    let blob = new Blob([JSON.stringify(data)], {
        type: "application/json"
    });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fname;
    a.click();
    URL.revokeObjectURL(a.href);
    markProjectClean();
    ki("Сохранено: " + fname);
}

/*   Загрузить проект из .json файла   */
function loadProjectJSON(file) {
    if (!file) return;
    let reader = new FileReader();
    reader.onload = () => {
        try {
            let data = JSON.parse(reader.result);
            let list = data.figures || data.objects || (Array.isArray(data) ? data : null);
            if (!list || !list.length) throw new Error("empty project");
            let created = list.map(meshFromData);
            let old = sa();
            Hi(aa(old, created));
            bg();
            Zn([]);
            if (data.name) lastFileName = sanitizeFileName(data.name) || lastFileName;
            markProjectClean();
            ki("Проект открыт: " + created.length + " объект(ов)");
        } catch (err) {
            console.error(err);
            ki("Не удалось открыть JSON", !0);
        }
    };
    reader.onerror = () => ki("Ошибка чтения файла", !0);
    reader.readAsText(file);
}


/*   Экспорт сцены в STL   */

/*   Парсер STL (binary + ascii) → BufferGeometry (класс ze из Three.js)
     Binary: 80 байт заголовок + uint32 кол-во треугольников + по 50 байт на треугольник
     ASCII: строки facet normal / vertex
*/
function parseSTL(buf) {
    let u8 = new Uint8Array(buf);
    let isASCII = false;
    // эвристика: если в начале есть "solid" и нет бинарной структуры
    if (u8.length > 5) {
        let head = String.fromCharCode(u8[0], u8[1], u8[2], u8[3], u8[4]);
        if (head === "solid") {
            // может быть ascii, но иногда binary тоже начинается с solid — проверим размер
            let triCount = new DataView(buf).getUint32(80, true);
            let expected = 84 + triCount * 50;
            if (expected !== u8.length) isASCII = true;
        }
    }
    let positions = [];
    if (isASCII) {
        let text = new TextDecoder("utf-8").decode(u8);
        let re = /vertex\s+([-+eE0-9.]+)\s+([-+eE0-9.]+)\s+([-+eE0-9.]+)/g;
        let m;
        while ((m = re.exec(text))) {
            positions.push(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));
        }
    } else {
        let dv = new DataView(buf);
        let triCount = dv.getUint32(80, true);
        let offset = 84;
        for (let i = 0; i < triCount; i++) {
            // пропускаем normal (3 float), читаем 3 вершины
            offset += 12;
            for (let v = 0; v < 3; v++) {
                positions.push(dv.getFloat32(offset, true), dv.getFloat32(offset + 4, true), dv.getFloat32(
                    offset + 8, true));
                offset += 12;
            }
            offset += 2; // attribute byte count
        }
    }
    if (!positions.length) throw new Error("empty STL");
    // ze = BufferGeometry, Ae = Float32BufferAttribute (из бандла Three.js)
    let geo = new ze();
    geo.setAttribute("position", new Ae(new Float32Array(positions), 3));
    geo.computeVertexNormals();
    geo.computeBoundingBox();
    return geo;
}

/*   Загрузка STL-файла с диска → mesh на сцене (как обычная фигура)   */
function loadSTLFile(file) {
    if (!file) return;
    let reader = new FileReader();
    reader.onload = () => {
        try {
            let geo = parseSTL(reader.result);
            // экспорт крутит +90° по X (Y-up → Z-up для печати), при загрузке — обратно
            geo.rotateX(-Math.PI / 2);
            geo.computeBoundingBox();
            let mat = W1(u4());
            let mesh = new le(geo, mat);
            mesh.castShadow = mesh.receiveShadow = !0;
            mesh.userData = {
                kind: "shape",
                def: {
                    type: "stl",
                    params: {
                        name: file.name
                    }
                },
                isHole: !1,
                _mat: mat
            };
            let size = mg(mesh),
                pos = x4(size);
            mesh.position.set(pos.x, size.y / 2, pos.z);
            Hi(aa([], [mesh]));
            Zn([mesh]);
            ki("STL загружен: " + file.name);
        } catch (err) {
            console.error(err);
            ki("Не удалось загрузить STL", !0);
        }
    };
    reader.onerror = () => ki("Ошибка чтения файла", !0);
    reader.readAsArrayBuffer(file);
}

/*   Экспорт сцены в STL (STLExporter = Ch из бандла Three.js)   */