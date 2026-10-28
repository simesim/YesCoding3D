// @ts-nocheck
// Проверки используют ту же мировую геометрию, которая отправляется в STL.
var PRINT_TOLERANCE = 0.01; // мм: погрешность контакта и границ площадки
var printExportBusy = false;
var printCheckClose = null;

function printExportObjects() {
    return sa().filter(obj => obj.visible && !obj.userData.isHole);
}

function printUnionFind(count) {
    var parent = Array.from({ length: count }, (_, i) => i);
    function find(i) { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; }
    return { find: find, join: (a, b) => { a = find(a); b = find(b); if (a !== b) parent[b] = a; } };
}

function printWorldTriangles(obj, budget) {
    var geometry = obj.geometry, pos = geometry.getAttribute("position"), index = geometry.index;
    var count = index ? index.count : pos.count;
    if (count % 3) throw new Error("Неполные треугольники");
    var triangles = [];
    var point = i => new Bm.Vector3().fromBufferAttribute(pos, index ? index.getX(i) : i).applyMatrix4(obj.matrixWorld);
    for (var i = 0; i < count; i += 3) {
        budget.tick();
        if (++budget.triangles > budget.maxTriangles) throw new Error("Слишком сложная сетка");
        var a = point(i), b = point(i + 1), c = point(i + 2);
        if (![a, b, c].every(p => Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z))) throw new Error("Некорректные координаты");
        var tri = new Bm.Triangle(a, b, c);
        if (tri.getArea() < 1e-10) continue;
        triangles.push({ tri: tri, box: new Bm.Box3().setFromPoints([a, b, c]) });
    }
    return triangles;
}

function printMeshComponents(triangles, object) {
    var uf = printUnionFind(triangles.length), vertices = new Map();
    // Швы между гранями параметрических фигур имеют дублирующиеся вершины.
    // Мелкое округление объединяет эти вершины, но не закрывает реальные зазоры.
    function key(p) { return [p.x, p.y, p.z].map(v => Math.round(v * 1e5)).join(","); }
    triangles.forEach(function(t, i) {
        [t.tri.a, t.tri.b, t.tri.c].forEach(function(p) {
            var k = key(p);
            if (vertices.has(k)) uf.join(i, vertices.get(k));
            else vertices.set(k, i);
        });
    });
    var parts = new Map();
    triangles.forEach(function(t, i) {
        var root = uf.find(i);
        if (!parts.has(root)) parts.set(root, { object: object, triangles: [], box: new Bm.Box3(), closed: true });
        var part = parts.get(root);part.triangles.push(t);part.box.union(t.box);
    });
    parts.forEach(function(part) {
        var edges = new Map();
        part.triangles.forEach(function(t) {
            var keys = [key(t.tri.a), key(t.tri.b), key(t.tri.c)];
            for (var i = 0; i < 3; i++) {
                var pair = [keys[i], keys[(i + 1) % 3]].sort().join("|");
                edges.set(pair, (edges.get(pair) || 0) + 1);
            }
        });
        part.closed = Array.from(edges.values()).every(n => n === 2);
    });
    return Array.from(parts.values());
}

function printTriangleTree(triangles) {
    var box = new Bm.Box3();triangles.forEach(t => box.union(t.box));
    if (triangles.length <= 12) return { box: box, triangles: triangles };
    var size = box.getSize(new Bm.Vector3());
    var axis = size.x >= size.y && size.x >= size.z ? "x" : size.y >= size.z ? "y" : "z";
    var sorted = triangles.slice().sort((a, b) => a.box.min[axis] + a.box.max[axis] - b.box.min[axis] - b.box.max[axis]);
    var middle = sorted.length >> 1;
    return { box: box, left: printTriangleTree(sorted.slice(0, middle)), right: printTriangleTree(sorted.slice(middle)) };
}

function printBoxesNear(a, b, tolerance) {
    return a.min.x <= b.max.x + tolerance && a.max.x + tolerance >= b.min.x &&
        a.min.y <= b.max.y + tolerance && a.max.y + tolerance >= b.min.y &&
        a.min.z <= b.max.z + tolerance && a.max.z + tolerance >= b.min.z;
}

function printTrianglesTouch(a, b, tolerance) {
    var pointsA = [a.a, a.b, a.c], pointsB = [b.a, b.b, b.c];
    var closest = new Bm.Vector3(), limit = tolerance * tolerance;
    // Vertex/face distance also handles coplanar overlaps and full edge contact.
    for (var i = 0; i < 3; i++) {
        if (b.closestPointToPoint(pointsA[i], closest).distanceToSquared(pointsA[i]) <= limit ||
            a.closestPointToPoint(pointsB[i], closest).distanceToSquared(pointsB[i]) <= limit) return true;
    }
    function edgeHits(p, q, triangle) {
        var delta = q.clone().sub(p), length = delta.length();
        if (!length) return false;
        var hit = new Bm.Ray(p, delta.multiplyScalar(1 / length)).intersectTriangle(triangle.a, triangle.b, triangle.c, false, closest);
        return hit && hit.distanceToSquared(p) <= (length + tolerance) ** 2;
    }
    for (var i = 0; i < 3; i++) {
        if (edgeHits(pointsA[i], pointsA[(i + 1) % 3], b) || edgeHits(pointsB[i], pointsB[(i + 1) % 3], a)) return true;
        for (var j = 0; j < 3; j++) {
            var p = new Bm.Vector3(), q = new Bm.Vector3();
            // Ray.distanceSqToSegment finds the nearest points on the ray and segment.
            // Clamp the first edge explicitly: its endpoints were checked above.
            var edge = pointsA[(i + 1) % 3].clone().sub(pointsA[i]), length = edge.length();
            if (!length) continue;
            var distance = new Bm.Ray(pointsA[i], edge.multiplyScalar(1 / length)).distanceSqToSegment(pointsB[j], pointsB[(j + 1) % 3], p, q);
            if (distance <= limit && p.distanceToSquared(pointsA[i]) <= (length + tolerance) ** 2) return true;
        }
    }
    return false;
}

function printTreesTouch(a, b, budget) {
    budget.tick();
    if (!printBoxesNear(a.box, b.box, PRINT_TOLERANCE)) return false;
    if (a.triangles && b.triangles) {
        for (var x of a.triangles) for (var y of b.triangles) {
            budget.tick();
            if (printBoxesNear(x.box, y.box, PRINT_TOLERANCE) && printTrianglesTouch(x.tri, y.tri, PRINT_TOLERANCE)) return true;
        }
        return false;
    }
    if (!a.triangles) return printTreesTouch(a.left, b, budget) || printTreesTouch(a.right, b, budget);
    return printTreesTouch(a, b.left, budget) || printTreesTouch(a, b.right, budget);
}

function printPointInside(point, part, budget, wholeObject) {
    if (!part.closed || !part.box.containsPoint(point)) return false;
    var directions = [new Bm.Vector3(1, .371, .127), new Bm.Vector3(.173, 1, .419), new Bm.Vector3(.293, .137, 1)];
    var votes = 0, hit = new Bm.Vector3();
    for (var direction of directions) {
        var ray = new Bm.Ray(point, direction.normalize()), distances = [];
        for (var t of (wholeObject ? part.objectTriangles : part.triangles)) {
            budget.tick();
            if (ray.intersectTriangle(t.tri.a, t.tri.b, t.tri.c, false, hit)) distances.push(point.distanceTo(hit));
        }
        distances.sort((a, b) => a - b);
        var unique = distances.filter((d, i) => !i || d - distances[i - 1] > 1e-5);
        if (unique.length % 2) votes++;
    }
    return votes >= 2;
}

function checkPrintModel(objects, options) {
    objects = (objects || printExportObjects()).filter(o => o.visible && !o.userData.isHole);
    options = options || {};
    var started = Date.now(), steps = 0;
    var budget = { triangles: 0, maxTriangles: options.maxTriangles === undefined ? 100000 : options.maxTriangles,
        tick: function() {
            if (++steps > (options.maxSteps === undefined ? 300000 : options.maxSteps) ||
                (steps % 1024 === 0 && Date.now() - started > (options.maxMillis === undefined ? 1500 : options.maxMillis))) throw new Error("Лимит проверки связности");
        }
    };
    var report = { objects: objects, outside: [], below: [], components: [], incomplete: false, triangleCount: 0 };
    var half = (typeof na === "number" ? na : 200) / 2;
    // Размеры проверяются для всех объектов, даже когда связность слишком сложна.
    objects.forEach(function(obj) {
        obj.updateMatrixWorld(true);
        var box = new Bm.Box3().setFromObject(obj);
        if (box.isEmpty() || ![box.min.x, box.min.y, box.min.z, box.max.x, box.max.y, box.max.z].every(Number.isFinite)) { report.incomplete = true; return; }
        var overflow = Math.max(0, -half - box.min.x, box.max.x - half, -half - box.min.z, box.max.z - half);
        if (overflow > PRINT_TOLERANCE) report.outside.push({ object: obj, amount: overflow });
        if (box.min.y < -PRINT_TOLERANCE) report.below.push({ object: obj, amount: -box.min.y });
    });
    try {
        var parts = [];
        objects.forEach(function(obj) {
            var triangles = printWorldTriangles(obj, budget);
            if (!triangles.length) report.incomplete = true;
            var objectParts = printMeshComponents(triangles, obj);
            objectParts.forEach(part => part.objectTriangles = triangles);
            if (objectParts.some(part => !part.closed)) report.incomplete = true;
            parts.push(...objectParts);
            if (parts.length > 256) throw new Error("Слишком много отдельных частей");
        });
        var uf = printUnionFind(parts.length);
        for (var i = 0; i < parts.length; i++) for (var j = i + 1; j < parts.length; j++) {
            budget.tick();
            if (uf.find(i) === uf.find(j) || !printBoxesNear(parts[i].box, parts[j].box, PRINT_TOLERANCE)) continue;
            var a = parts[i], b = parts[j];
            a.tree = a.tree || printTriangleTree(a.triangles);b.tree = b.tree || printTriangleTree(b.triangles);
            if (printTreesTouch(a.tree, b.tree, budget) || printPointInside(a.triangles[0].tri.a, b, budget, a.object !== b.object) || printPointInside(b.triangles[0].tri.a, a, budget, a.object !== b.object)) uf.join(i, j);
        }
        var clusters = new Map();
        parts.forEach(function(part, i) {
            var root = uf.find(i);
            if (!clusters.has(root)) clusters.set(root, new Set());
            clusters.get(root).add(part.object);
        });
        report.components = Array.from(clusters.values()).map(set => Array.from(set));
    } catch (err) { report.incomplete = true; }
    report.triangleCount = budget.triangles;
    report.hasWarnings = !!(report.outside.length || report.below.length || report.components.length > 1 || report.incomplete);
    return report;
}

function closePrintCheck() {
    if (!printCheckClose) return false;
    printCheckClose(false);
    return true;
}

function showPrintCheck(report) {
    return new Promise(function(resolve) {
        var overlay = Mt("print-check-overlay"), content = Mt("print-check-content"), previous = document.activeElement;
        var cancel = Mt("print-check-cancel"), proceed = Mt("print-check-proceed"), select = Mt("print-check-select");
        var affected = new Set();
        content.replaceChildren();
        function section(title, text) {
            var block = document.createElement("section"), heading = document.createElement("h3"), description = document.createElement("p");
            heading.textContent = title;description.textContent = text;block.append(heading, description);content.appendChild(block);return block;
        }
        function names(block, entries) {
            var list = document.createElement("ul");
            entries.forEach(function(entry) {
                var item = document.createElement("li");
                item.textContent = getObjectName(entry.object) + " — " + (Math.round(entry.amount * 100) / 100).toLocaleString("ru-RU") + " мм";
                affected.add(entry.object);list.appendChild(item);
            });block.appendChild(list);
        }
        if (report.outside.length) names(section("Выход за площадку", "Часть геометрии выходит за границы поля " + (typeof na === "number" ? na : 200) + " × " + (typeof na === "number" ? na : 200) + " мм. Указан наибольший выход за край."), report.outside);
        if (report.below.length) names(section("Геометрия ниже плоскости", "Эти объекты заходят ниже нулевой плоскости. Можно выделить их и использовать «На плоскость» (D)."), report.below);
        if (report.components.length > 1) {
            var block = section("Несоединённые части: " + report.components.length, "Модель состоит из отдельных частей; даже одна группа может содержать несколько частей. Если это детали для сборки, можно продолжить. Иначе проверь их соединение.");
            var list = document.createElement("ul");
            report.components.forEach(function(objects, i) {
                var item = document.createElement("li");item.textContent = "Часть " + (i + 1) + ": " + objects.map(getObjectName).join(", ");list.appendChild(item);objects.forEach(o => affected.add(o));
            });block.appendChild(list);
        }
        if (report.incomplete) section("Связность проверена не полностью", "Сетка слишком сложная, незамкнутая или содержит некорректную геометрию. Нельзя подтвердить, что все части соединены. Проверь STL в слайсере.");
        select.disabled = !affected.size;
        function close(approved) {
            overlay.classList.add("hidden");document.removeEventListener("keydown", onKey, true);
            cancel.onclick = proceed.onclick = select.onclick = null;printCheckClose = null;
            ycRestoreFocus(previous);resolve(approved);
        }
        function onKey(e) {
            e.stopPropagation();
            if (e.key === "Escape") { e.preventDefault(); close(false); }
            if (e.key === "Tab") {
                e.preventDefault();var buttons = [select, cancel, proceed].filter(b => !b.disabled), index = buttons.indexOf(document.activeElement);
                buttons[(index + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus();
            }
        }
        cancel.onclick = () => close(false);proceed.onclick = () => close(true);
        select.onclick = function() { close(false);Zn(Array.from(affected)); };
        printCheckClose = close;overlay.classList.remove("hidden");document.addEventListener("keydown", onKey, true);cancel.focus();
    });
}
