// @ts-nocheck
function xg() {
  ot.length && (Hi(aa([...ot], [])), ki("\u0423\u0434\u0430\u043B\u0435\u043D\u043E"))
} /*   Дублировать выделенные   */
function yg() {
  if (!ot.length) return;
  let n = ot.map($1);
  n.forEach(e => {
    e.position.x += 8, e.position.z += 8
  }), Hi(aa([], n)), ki("\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u043E")
}

function J1() {
  if (!ot.length) return;
  let n = ot.map(t => (t.updateMatrix(), t.matrix.clone()));
  ot.forEach(t => {
    let i = new ut().setFromObject(t);
    t.position.y -= i.min.y
  });
  let e = ot.map(t => (t.updateMatrix(), t.matrix.clone()));
  e.some((t, i) => !t.equals(n[i])) && lc(vg([...ot], n, e)), Zn(ot)
}
var Bf = null;
/*   Группировка (boolean union + вычитание отверстий)   */
/*   Группировка: boolean union тел + вычитание отверстий (CSG из бандла)   */
function cc() {
  let n = [...ot];
  if (n.length < 2) {
    ki("\u0412\u044B\u0434\u0435\u043B\u0438 \u0445\u043E\u0442\u044F \u0431\u044B \u0434\u0432\u0430 \u043E\u0431\u044A\u0435\u043A\u0442\u0430",
      !0);
    return
  }
  let e = n.filter(l => !l.userData.isHole),
    t = n.filter(l => l.userData.isHole);
  if (!e.length) {
    ki("\u041D\u0443\u0436\u043D\u0430 \u0445\u043E\u0442\u044F \u0431\u044B \u043E\u0434\u043D\u0430 \u0444\u0438\u0433\u0443\u0440\u0430-\u0442\u0435\u043B\u043E (\u043D\u0435 \u043E\u0442\u0432\u0435\u0440\u0441\u0442\u0438\u0435)",
      !0);
    return
  }
  let i;
  try {
    i = cg(e[0]);
    for (let l = 1; l < e.length; l++) i = oc.evaluate(i, cg(e[l]), 0);
    for (let l of t) i = oc.evaluate(i, cg(l), 1)
  } catch (l) {
    console.error(l), ki(
      "\u041D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C \u043E\u0431\u044A\u0435\u0434\u0438\u043D\u0438\u0442\u044C \u0444\u0438\u0433\u0443\u0440\u044B",
      !0);
    return
  }
  let r = i.geometry;
  r.computeBoundingBox();
  let s = r.boundingBox.getCenter(new E);
  r.translate(-s.x, -s.y, -s.z), r.computeBoundingBox();
  let a = e[0].userData._mat.clone(),
    o = new le(r, a);
  o.castShadow = o.receiveShadow = !0, o.position.copy(s), o.updateMatrix(), o.userData = {
    kind: "group",
    isHole: !1,
    _mat: a,
    members: n,
    baseMatrix: o.matrix.clone()
  }, Hi(aa(n, [o])), bg(), ki(t.length ?
    "\u0421\u0433\u0440\u0443\u043F\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u043E \u2014 \u043E\u0442\u0432\u0435\u0440\u0441\u0442\u0438\u044F \u0432\u044B\u0440\u0435\u0437\u0430\u043D\u044B" :
    "\u0421\u0433\u0440\u0443\u043F\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u043E")
} /*   Разгруппировать: вернуть members на сцену   */
function uc(n) {
  if (ot.length !== 1 || ot[0].userData.kind !== "group") return n || ki(
    "\u0412\u044B\u0434\u0435\u043B\u0438 \u043E\u0434\u043D\u0443 \u0433\u0440\u0443\u043F\u043F\u0443",
    !0), null;
  let e = ot[0];
  e.updateMatrix();
  let t = e.matrix.clone().multiply(e.userData.baseMatrix.clone().invert()),
    i = e.userData.members;
  return i.forEach(r => {
    r.updateMatrix(), r.matrix.premultiply(t), r.matrix.decompose(r.position, r.quaternion, r
      .scale)
  }), e.userData.baseMatrix = e.matrix.clone(), Hi(aa([e], i)), i
}

function y4(n) {
  Zn([n]);
  let e = uc(!0);
  e && (Bf = e, Mt("edit-hint").classList.remove("hidden"), ki(
    "\u041C\u0435\u043D\u044F\u0439 \u0434\u0435\u0442\u0430\u043B\u0438 \u0433\u0440\u0443\u043F\u043F\u044B, Esc \u2014 \u0441\u043E\u0431\u0440\u0430\u0442\u044C \u043E\u0431\u0440\u0430\u0442\u043D\u043E"
    ))
}

function bg() {
  Bf = null, Mt("edit-hint").classList.add("hidden")
}

function b4() {
  if (!Bf) return !1;
  let n = Bf.filter(e => e.parent === Vt);
  return n.length >= 2 ? (Zn(n), cc()) : bg(), !0
}

function Q1(n, e) {
  let t = Array.isArray(n) ? n : [n],
    i = t.map(ra),
    r = t.map(s => ({
      ...ra(s),
      isHole: e
    }));
  Hi(Ff(t, i, r))
}

function _4() {
  let n = sa();
  n.length && !confirm(
    "\u041D\u0430\u0447\u0430\u0442\u044C \u043D\u043E\u0432\u044B\u0439 \u043F\u0440\u043E\u0435\u043A\u0442? \u0422\u0435\u043A\u0443\u0449\u0430\u044F \u0441\u0446\u0435\u043D\u0430 \u0431\u0443\u0434\u0435\u0442 \u043E\u0447\u0438\u0449\u0435\u043D\u0430."
    ) || (n.length && Hi(aa(n, [])), bg(), markProjectClean())
}

/*   === Проект JSON: сохранить / открыть (фигуры по отдельности) ===
     Позже тот же JSON можно слать на сервер / Drive.
*/
// @ts-nocheck
/* app-project: JSON, STL, имя файла, несохранённое */
function serializeObj(n) {
  let base = {
    position: [n.position.x, n.position.y, n.position.z],
    rotation: [n.rotation.x, n.rotation.y, n.rotation.z],
    scale: [n.scale.x, n.scale.y, n.scale.z],
    color: n.userData._mat.color.getHex(),
    isHole: !!n.userData.isHole
  };
  if (n.userData.kind === "group") {
    return Object.assign({
      kind: "group"
    }, base, {
      members: (n.userData.members || []).map(serializeObj)
    });
  }
  let def = n.userData.def || {};
  let type = def.type || "baked";
  // параметрические фигуры из каталога
  if (type !== "stl" && type !== "baked" && _r[type]) {
    return Object.assign({
      kind: "shape",
      type: type,
      params: Object.assign({}, def.params || {})
    }, base);
  }
  // STL / неизвестное — сохраняем вершины
  let arr = n.geometry && n.geometry.attributes && n.geometry.attributes.position ?
    Array.from(n.geometry.attributes.position.array) : [];
  return Object.assign({
    kind: "shape",
    type: "baked",
    positions: arr,
    name: (def.params && def.params.name) || ""
  }, base);
}
