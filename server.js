const path = require("path");
const express = require("express");
const compression = require("compression");

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

app.disable("x-powered-by");
app.use(compression());

// TODO: если появится бэкенд, монтировать API-роуты здесь, до статики,
// например: app.use("/api", require("./routes/api"));

app.use(
  express.static(PUBLIC_DIR, {
    index: "index.html",
    extensions: false,
    setHeaders(res, filePath) {
      const name = path.basename(filePath);
      if (name === "index.html") {
        // Точка входа: всегда проверять актуальность на сервере
        res.setHeader("Cache-Control", "no-cache");
      } else if (/\.(js|css)$/.test(name)) {
        // Крупные бандлы без хэша в имени — короткий кэш с ревалидацией
        res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
      } else {
        // Иконки, favicon и прочие статичные ассеты
        res.setHeader("Cache-Control", "public, max-age=86400");
      }
    },
  })
);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`YesCoding3D listening on port ${PORT}`);
});
