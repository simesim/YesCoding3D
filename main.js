const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "YesCoding3D",
    icon: path.join(__dirname, "build", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.loadFile(path.join(__dirname, "public", "index.html"));

  // Не даём Chrome показать «Закрыть сайт?»
  win.webContents.on("will-prevent-unload", function (e) {
    e.preventDefault();
  });

  win.on("close", function (e) {
    if (win.__allowClose) return;
    e.preventDefault();
    if (win.webContents.isLoading()) {
      win.__allowClose = true;
      win.close();
      return;
    }
    win.webContents.send("app-close-request");
  });
}

ipcMain.on("app-close-answer", function (_e, yes) {
  if (!win || win.isDestroyed()) return;
  if (!yes) return;
  win.__allowClose = true;
  win.close();
});

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
