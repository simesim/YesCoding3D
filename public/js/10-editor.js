// @ts-nocheck
// правая панель
function ls() {
    if (Si = null, !ot.length) {
        Pt.innerHTML =
            `<div class="insp-empty">\u041A\u043B\u0438\u043A\u043D\u0438 \u0444\u0438\u0433\u0443\u0440\u0443 \u0432 \u043F\u0430\u043D\u0435\u043B\u0438 \u0441\u043B\u0435\u0432\u0430, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u0435\u0451 \u043D\u0430 \u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0443.<br><br>
      \u041A\u043B\u0438\u043A\u043E\u043C \u0432\u044B\u0431\u0438\u0440\u0430\u0439 \u0444\u0438\u0433\u0443\u0440\u044B, <b>Shift+\u043A\u043B\u0438\u043A</b> \u2014 \u0432\u044B\u0431\u0440\u0430\u0442\u044C \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E.<br><br>
      \u041E\u0442\u043C\u0435\u0442\u044C \u0444\u0438\u0433\u0443\u0440\u0443 \u043A\u0430\u043A <b>\u043E\u0442\u0432\u0435\u0440\u0441\u0442\u0438\u0435</b> \u0438 \u0441\u0433\u0440\u0443\u043F\u043F\u0438\u0440\u0443\u0439 \u0441 \u0434\u0440\u0443\u0433\u043E\u0439 \u2014 \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u0441\u044F \u0432\u044B\u0440\u0435\u0437.</div>`;
        return
    }
    if (ot.length > 1) {
        Pt.innerHTML = "";
        let d = document.createElement("div");
        d.innerHTML =
            `<div class="multi-count">${ot.length}</div><div class="insp-sub">\u043E\u0431\u044A\u0435\u043A\u0442\u043E\u0432 \u0432\u044B\u0431\u0440\u0430\u043D\u043E</div>`,
            Pt.appendChild(d), Pt.appendChild(V1(ot));
        let m = document.createElement("button");
        m.className = "btn-wide", m.textContent =
            "\u2B21 \u0421\u0433\u0440\u0443\u043F\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C (Ctrl+G)",
            m.onclick = cc, Pt.appendChild(m);
        return
    }
    let n = ot[0],
        e = n.userData.kind === "group",
        t = n.userData.def;
    Pt.innerHTML = "";
    let i = document.createElement("div");
    i.innerHTML =
        `<div class="insp-title">${e ? "\u0413\u0440\u0443\u043F\u043F\u0430" : t.type === "text" ? `\u0422\u0435\u043A\u0441\u0442 \xAB${(t.params.text + "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]))}\xBB` : _r[t.type].name}</div>
    <div class="insp-sub">${n.userData.isHole ? "\u043E\u0442\u0432\u0435\u0440\u0441\u0442\u0438\u0435" : "\u0444\u0438\u0433\u0443\u0440\u0430"}</div>`,
    Pt.appendChild(i);
  let r = mg(n),
    s = {
      o: n,
      pos: {},
      rot: {},
      dim: {}
    };
  if (Pt.appendChild(bo("\u0420\u0430\u0437\u043C\u0435\u0440\u044B, \u043C\u043C")), Pt
    .appendChild(ug(["\u0428\u0438\u0440\u0438\u043D\u0430", "\u0412\u044B\u0441\u043E\u0442\u0430",
      "\u0413\u043B\u0443\u0431\u0438\u043D\u0430"
    ], ["x", "y", "z"].map(d => {
      let m = hg(Of(r[d] * n.scale[d]), .5);
      return s.dim[d] = m, fg(m, n, () => {
        n.scale[d] = Math.max(.02, m.valueAsNumber / r[d] || n.scale[d])
      }), m
    }))), Pt.appendChild(bo(
    "\u041F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435, \u043C\u043C")), Pt.appendChild(ug([
      "X", "\u0412\u0432\u0435\u0440\u0445", "Z"
    ], ["x", "y", "z"].map(d => {
      let m = hg(Of(n.position[d]), 1);
      return s.pos[d] = m, fg(m, n, () => {
        n.position[d] = m.valueAsNumber || 0
      }), m
    }))), Pt.appendChild(bo("\u041F\u043E\u0432\u043E\u0440\u043E\u0442, \xB0")), Pt.appendChild(ug(
      ["X", "Y", "Z"], ["x", "y", "z"].map(d => {
        let m = hg(Math.round(cr.radToDeg(n.rotation[d])), 15);
        return s.rot[d] = m, fg(m, n, () => {
          n.rotation[d] = cr.degToRad(m.valueAsNumber || 0)
        }), m
      }))), !e && t.type === "text") {
    Pt.appendChild(bo("\u041D\u0430\u0434\u043F\u0438\u0441\u044C"));
    let d = document.createElement("div");
    d.className = "f-text";
    let m = document.createElement("input");
    m.value = t.params.text, m.maxLength = 16, m.addEventListener("keydown", x => x
    .stopPropagation()), m.addEventListener("change", () => {
      if (!m.value.trim()) return;
      let x = [ra(n)],
        g = [{
          ...x[0],
          params: JSON.stringify({
            ...t.params,
            text: m.value.trim()
          })
        }];
      Hi(Ff([n], x, g))
    }), d.appendChild(m), Pt.appendChild(d)
  }
  let a = e ? {} : _r[t.type].params || {},
    o = Object.keys(a);
  if (o.length) {
    Pt.appendChild(bo(
      "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0444\u043E\u0440\u043C\u044B"));
    for (let d of o) {
      let m = a[d],
        x = document.createElement("div");
      x.className = "f-range";
      let g = document.createElement("label");
      g.textContent = m.label;
      let p = document.createElement("input");
      p.type = "range", p.min = m.min, p.max = m.max, p.step = m.step, p.value = t.params[d];
      let y = document.createElement("output");
      y.value = t.params[d];
      let v = null;
      p.addEventListener("input", () => {
        v || (v = [ra(n)]), y.value = p.value, t.params[d] = parseFloat(p.value), n.geometry
          .dispose(), n.geometry = kf(t.type, t.params)
      }), p.addEventListener("change", () => {
        v && (lc(Ff([n], v, [ra(n)])), v = null)
      }), x.append(g, p, y), Pt.appendChild(x)
    }
  }
  Pt.appendChild(bo("\u0426\u0432\u0435\u0442"));
  let l = document.createElement("div");
  l.className = "swatches";
  let c = n.userData._mat.color.getHex();
  for (let d of z1) {
    let m = document.createElement("button");
    m.className = "sw" + (d === c ? " on" : ""), m.style.background = "#" + d.toString(16).padStart(
      6, "0"), m.onclick = () => k1([n], d), l.appendChild(m)
  }
  Pt.appendChild(l);
  let u = document.createElement("div");
  u.className = "sw-custom";
  let f = document.createElement("input");
  f.type = "color", f.value = "#" + c.toString(16).padStart(6, "0"), f.addEventListener("change",
  () => k1([n], parseInt(f.value.slice(1), 16))), u.append(f, document.createTextNode(
    "\u0441\u0432\u043E\u0439 \u0446\u0432\u0435\u0442")), Pt.appendChild(u), Pt.appendChild(V1([
    n]));
  let h = document.createElement("button");
  if (h.className = "btn-wide", h.textContent =
    "\u2B07 \u041E\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u043D\u0430 \u043F\u043B\u043E\u0441\u043A\u043E\u0441\u0442\u044C (D)",
    h.onclick = J1, Pt.appendChild(h), e) {
    let d = document.createElement("button");
    d.className = "btn-wide", d.textContent =
      "\u2B21\u0338 \u0420\u0430\u0437\u0433\u0440\u0443\u043F\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C (Ctrl+Shift+G)",
      d.onclick = () => uc(), Pt.appendChild(d)
  }
  Si = s
}

function k1(n, e) {
  let t = n.map(ra),
    i = n.map(r => ({
      ...ra(r),
      color: e
    }));
  Hi(Ff(n, t, i))
}

function V1(n) {
  let e = document.createElement("label");
  e.className = "hole-row";
  let t = document.createElement("input");
  t.type = "checkbox", t.checked = n.every(r => r.userData.isHole), t.addEventListener("change",
  () => Q1(n, t.checked));
  let i = document.createElement("span");
  return i.innerHTML =
    "\u041E\u0442\u0432\u0435\u0440\u0441\u0442\u0438\u0435<small>\u0441\u0433\u0440\u0443\u043F\u043F\u0438\u0440\u0443\u0439 \u0441 \u0444\u0438\u0433\u0443\u0440\u043E\u0439 \u2014 \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u0441\u044F \u0432\u044B\u0440\u0435\u0437</small>",
    e.append(t, i), e
}