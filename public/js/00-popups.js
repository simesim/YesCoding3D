// @ts-nocheck
/* Свои попапы вместо prompt/confirm — в Electron системные окна работают плохо */
function ycConfirm(text) {
  return new Promise(function (resolve) {
    var previousFocus = document.activeElement;
    var root = document.getElementById("yc-popup");
    var msg = document.getElementById("yc-popup-text");
    var input = document.getElementById("yc-popup-input");
    var ok = document.getElementById("yc-popup-ok");
    var cancel = document.getElementById("yc-popup-cancel");
    msg.textContent = text;
    input.classList.add("hidden");
    ok.textContent = "Да";
    cancel.classList.remove("hidden");
    root.classList.remove("hidden");
    function close(val) {
      root.classList.add("hidden");
      ok.onclick = null;
      cancel.onclick = null;
      document.removeEventListener("keydown", onKey);
      ycRestoreFocus(previousFocus);
      resolve(val);
    }
    function onKey(e) {
      e.stopPropagation();
      if (e.key === "Enter" || e.key === "Escape") e.preventDefault();
      if (e.key === "Enter") close(true);
      if (e.key === "Escape") close(false);
    }
    ok.onclick = function () { close(true); };
    cancel.onclick = function () { close(false); };
    document.addEventListener("keydown", onKey);
  });
}

function ycPrompt(text, value) {
  return new Promise(function (resolve) {
    var previousFocus = document.activeElement;
    var root = document.getElementById("yc-popup");
    var msg = document.getElementById("yc-popup-text");
    var input = document.getElementById("yc-popup-input");
    var ok = document.getElementById("yc-popup-ok");
    var cancel = document.getElementById("yc-popup-cancel");
    msg.textContent = text;
    input.classList.remove("hidden");
    input.value = value || "";
    ok.textContent = "Сохранить";
    cancel.classList.remove("hidden");
    root.classList.remove("hidden");
    function close(val) {
      clearTimeout(focusTimer);
      root.classList.add("hidden");
      ok.onclick = null;
      cancel.onclick = null;
      document.removeEventListener("keydown", onKey);
      ycRestoreFocus(previousFocus);
      resolve(val);
    }
    function onKey(e) {
      e.stopPropagation();
      if (e.key === "Enter" || e.key === "Escape") e.preventDefault();
      if (e.key === "Enter") close(input.value);
      if (e.key === "Escape") close(null);
    }
    ok.onclick = function () { close(input.value); };
    cancel.onclick = function () { close(null); };
    document.addEventListener("keydown", onKey);
    var focusTimer = setTimeout(function () { input.focus(); input.select(); }, 30);
  });
}

function ycIsModalOpen() {
  return ["yc-popup", "bezier-overlay", "mirror-overlay", "array-overlay", "print-check-overlay"].some(function(id) {
    var el = document.getElementById(id);
    return el && !el.classList.contains("hidden");
  });
}

function ycRestoreFocus(previous) {
  if (previous && previous.isConnected && !previous.disabled) previous.focus();
  else {
    var canvas = document.getElementById("gl");
    if (canvas) canvas.focus();
  }
}
