# YesCoding3D

Браузерный 3D-редактор: собирайте модели из готовых фигур и текста, импортируйте и экспортируйте STL — всё прямо в браузере (Three.js), без бэкенда для самого редактирования.

## Структура проекта

```
public/           статические файлы, которые отдаются наружу
  index.html      разметка + WebGL feature-detect и глобальный error handler
  app.js          Three.js + opentype.js + логика редактора (единый бандл)
  styles.css      стили интерфейса
  fonts.css       шрифты (base64 woff2)
  icons/          иконки тулбара
  favicon.svg
  robots.txt
server.js         Node/Express-сервер: раздаёт public/, gzip/brotli, cache-control
Dockerfile        образ для деплоя
deploy/           конфиги инфраструктуры (nginx и т.п.)
THIRD-PARTY-NOTICES.md   лицензии сторонних библиотек (Three.js, opentype.js)
```

`server.js` отдаёт только содержимое `public/` — сам сервер, `package.json`, `Dockerfile` и т.д. снаружи не доступны. Здесь же, при появлении бэкенда, стоит монтировать API-роуты (см. `// TODO` в `server.js`).

## Требования

- Node.js 20+ и npm — для локального запуска и сборки
- Docker — для запуска в контейнере (опционально, но так же деплоится на проде)

## Запуск локально

```bash
npm install
npm start        # либо: node server.js
```

Откроется на `http://localhost:3000` (порт можно переопределить переменной `PORT`).

Для быстрой правки фронтенда без node вообще можно открыть `public/index.html` через любой статический сервер (например `npx serve public`) — но проверка заголовков/сжатия тогда не сработает, для этого нужен именно `server.js`.

## Запуск через Docker

```bash
docker build -t yescoding3d .
docker run -d --name yescoding3d --restart unless-stopped -p 3000:3000 yescoding3d
```

## Тестирование

Автоматических тестов в проекте нет — это статический фронтенд без сложной бизнес-логики на сервере. Проверка делится на два уровня.

### 1. Фронтенд (руками в браузере)

Откройте `http://localhost:3000` и проверьте основной путь:

- страница грузится, экран загрузки исчезает, в канвасе рендерится 3D-сцена;
- в левой панели работают вкладки (Стандарт/Формы/Декор/Буквы), фигура добавляется на сцену по клику;
- при выборе объекта справа появляются поля позиции/поворота/размера, значения обновляются при перетаскивании гизмо;
- `Ctrl+Z`/`Ctrl+Shift+Z` (отмена/повтор), `Ctrl+D` (дубликат), `Delete` (удаление), `Ctrl+G`/`Ctrl+Shift+G` (группировка) работают;
- «Загрузить» принимает `.stl`-файл и добавляет модель на сцену;
- «Экспорт STL» скачивает файл;
- вкладка «Буквы» → «Свой текст»: добавьте текст, в том числе с символами `<`, `>`, `&` — в инспекторе это должно отображаться как обычный текст, а не интерпретироваться как HTML;
- откройте DevTools → Console — на всех шагах выше не должно быть ошибок.

Если в браузере нет WebGL (или он не смог инициализироваться), должен показаться экран с сообщением об ошибке вместо белого экрана/зависшей загрузки — это тоже стоит проверить (можно отключить WebGL через флаги браузера).

### 2. Сервер раздачи (curl)

```bash
# сервис поднят локально (npm start) или в контейнере на порту 3000
curl -I http://localhost:3000/                       # 200, Cache-Control: no-cache
curl -I -H "Accept-Encoding: gzip" http://localhost:3000/app.js
                                                       # 200, Content-Encoding: gzip,
                                                       # Cache-Control: public, max-age=3600, must-revalidate
curl -I http://localhost:3000/favicon.svg             # 200, Cache-Control: public, max-age=86400
curl -I http://localhost:3000/server.js               # 404 — исходники сервера наружу не отдаются
curl -I http://localhost:3000/package.json            # 404 — то же самое
```

Если всё это возвращает ожидаемые коды — раздача настроена верно.

## Деплой

1. `docker build` + `docker run --restart unless-stopped -p 3000:3000` на целевом сервере — приложение слушает `127.0.0.1:3000`.
2. Порты 80/443 предполагаются свободными под реверс-прокси (nginx/Caddy/Traefik) — пример конфига для nginx лежит в [`deploy/nginx-yescoding3d.conf`](deploy/nginx-yescoding3d.conf): проксирует `/` на `127.0.0.1:3000`.
3. HTTPS (например через certbot) вешается на реверс-прокси, отдельно от самого приложения — самому Node-серверу TLS настраивать не нужно.

### Первичная настройка сервера (один раз)

```bash
ssh 3d   # или root@<ip>
git clone https://github.com/simesim/YesCoding3D.git /opt/yescoding3d
cd /opt/yescoding3d
docker build -t yescoding3d:latest .
docker run -d --name yescoding3d --restart unless-stopped -p 3000:3000 yescoding3d:latest
```

### Обновление на проде (после того как в GitHub появились новые коммиты)

```bash
ssh 3d
cd /opt/yescoding3d
./deploy/deploy.sh
```

Скрипт делает `git pull --ff-only`, пересобирает образ и перезапускает контейнер с проверкой, что сервис поднялся. Если нужно всё то же самое руками:

```bash
cd /opt/yescoding3d
git pull --ff-only origin main
docker build -t yescoding3d:latest .
docker stop yescoding3d && docker rm yescoding3d
docker run -d --name yescoding3d --restart unless-stopped -p 3000:3000 yescoding3d:latest
```

nginx трогать не нужно — он всегда проксирует на `127.0.0.1:3000`, независимо от того, какой образ там крутится.

## Лицензии

Сторонние библиотеки, забандленные в `public/app.js` (Three.js, opentype.js), перечислены в [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md).
