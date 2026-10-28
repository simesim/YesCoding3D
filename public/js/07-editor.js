// @ts-nocheck
// Открыть сохранения
function applyTransform(mesh, d) {
    mesh.position.set(d.position[0], d.position[1], d.position[2]);
    mesh.rotation.set(d.rotation[0], d.rotation[1], d.rotation[2]);
    mesh.scale.set(d.scale[0], d.scale[1], d.scale[2]);
    mesh.updateMatrix();
}

function applyColorHole(mesh, d) {
    mesh.userData.objectName = typeof d.objectName === "string" ? d.objectName.slice(0, 80) : "";
    mesh.userData.locked = d.locked === true;
    mesh.visible = d.visible !== false;
    mesh.userData._mat.color.setHex(d.color);
    mesh.userData.isHole = !!d.isHole;
    mesh.material = d.isHole ? X1 : mesh.userData._mat;
    if (d.isHole && mesh.material) mesh.material.needsUpdate = !0;
}

function meshFromData(d) {
    if (d.kind === "group") {
        let members = (d.members || []).map(meshFromData);
        if (!members.length) throw new Error("Пустая группа в проекте");
        // CSG как в cc()
        let solids = members.filter(m => !m.userData.isHole);
        let holes = members.filter(m => m.userData.isHole);
        if (!solids.length) throw new Error("В группе нет тела");
        let i;
        try {
            i = cg(solids[0]);
            for (let l = 1; l < solids.length; l++) i = oc.evaluate(i, cg(solids[l]), 0);
            for (let l of holes) i = oc.evaluate(i, cg(l), 1);
        } catch (err) {
            // Не подменяем группу первой деталью: загрузка должна завершиться целиком.
            throw new Error("Не удалось восстановить группу: " + err.message);
        }
        let r = i.geometry;
        r.computeBoundingBox();
        let s = r.boundingBox.getCenter(new E);
        r.translate(-s.x, -s.y, -s.z);
        r.computeBoundingBox();
        let a = W1(d.color != null ? d.color : solids[0].userData._mat.color.getHex());
        let o = new le(r, a);
        o.castShadow = o.receiveShadow = !0;
        // геометрия центрирована; ставим transform из JSON (позиция после возможного сдвига группы)
        o.position.set(d.position[0], d.position[1], d.position[2]);
        o.rotation.set(d.rotation[0], d.rotation[1], d.rotation[2]);
        o.scale.set(d.scale[0], d.scale[1], d.scale[2]);
        o.updateMatrix();
        o.userData = {
            kind: "group",
            isHole: !1,
            _mat: a,
            members: members,
            // Старые JSON не содержат baseMatrix. Исходная группа создавалась
            // без поворота и масштаба, в центре результата CSG.
            baseMatrix: d.baseMatrix
                ? new Bm.Matrix4().fromArray(d.baseMatrix)
                : new Bm.Matrix4().makeTranslation(s.x, s.y, s.z)
        };
        applyColorHole(o, d);
        return o;
    }
    // shape
    let type = d.type || "box";
    let mesh;
    if (type === "baked" || type === "stl") {
        let geo = new ze();
        let pos = d.positions || [];
        geo.setAttribute("position", new Ae(new Float32Array(pos), 3));
        geo.computeVertexNormals();
        geo.computeBoundingBox();
        let mat = W1(d.color != null ? d.color : u4());
        mesh = new le(geo, mat);
        mesh.castShadow = mesh.receiveShadow = !0;
        mesh.userData = {
            kind: "shape",
            def: {
                type: "stl",
                params: {
                    name: d.name || "mesh"
                }
            },
            isHole: !1,
            _mat: mat
        };
    } else {
        let params = d.params || Y1(type);
        let geo = kf(type, params);
        let mat = W1(d.color != null ? d.color : u4());
        mesh = new le(geo, mat);
        mesh.castShadow = mesh.receiveShadow = !0;
        mesh.userData = {
            kind: "shape",
            def: {
                type: type,
                params: Object.assign({}, params)
            },
            isHole: !1,
            _mat: mat
        };
    }
    applyTransform(mesh, d);
    applyColorHole(mesh, d);
    return mesh;
}

function sanitizeFileName(n) {
    var s = String(n || ""),
        out = "",
        i, ch, low;
    var bad = "\\/:*?" + '"' + "<>|";
    for (i = 0; i < s.length; i++) {
        ch = s.charAt(i);
        out += bad.indexOf(ch) >= 0 ? " " : ch;
    }
    while (out.indexOf("  ") >= 0) out = out.split("  ").join(" ");
    out = out.trim();
    low = out.toLowerCase();
    if (low.length >= 5 && low.slice(low.length - 5) === ".json") out = out.slice(0, out.length - 5);
    else if (low.length >= 4 && low.slice(low.length - 4) === ".stl") out = out.slice(0, out.length -
        4);
    return out.slice(0, 60);
}
var lastFileName = "Мой проект";
var projectDirty = !1;

function markProjectDirty() {
    projectDirty = !0;
    if (typeof scheduleDraft === "function") scheduleDraft();
}