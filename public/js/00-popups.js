// @ts-nocheck
/* Свои попапы вместо prompt/confirm — в Electron системные окна работают плохо */
function ycConfirm(text) {
  return new Promise(function (resolve) {
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
      resolve(val);
    }
    function onKey(e) {
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
      root.classList.add("hidden");
      ok.onclick = null;
      cancel.onclick = null;
      document.removeEventListener("keydown", onKey);
      resolve(val);
    }
    function onKey(e) {
      if (e.key === "Enter") close(input.value);
      if (e.key === "Escape") close(null);
    }
    ok.onclick = function () { close(input.value); };
    cancel.onclick = function () { close(null); };
    document.addEventListener("keydown", onKey);
    setTimeout(function () { input.focus(); input.select(); }, 30);
  });
}
