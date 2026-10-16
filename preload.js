const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ycDesktop", {
  onCloseRequest: (fn) => ipcRenderer.on("app-close-request", () => fn()),
  answerClose: (yes) => ipcRenderer.send("app-close-answer", !!yes)
});
