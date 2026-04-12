# FLEX Site

Flask-сайт компании FLEX с лендингом, страницами проектов, технологии, контактов и внутренней статистикой посещений.

## Production

1. Создайте виртуальное окружение и установите зависимости:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Задайте переменные окружения:

```bash
export TELEGRAM_BOT_TOKEN="..."
export TELEGRAM_CHAT_ID="..."
export STATS_REPORT_TIME="21:00"
export STATS_REPORT_TZ="Europe/Moscow"
export PORT="8000"
```

3. Локальный запуск без debug:

```bash
python3 app.py
```

4. Production-запуск:

```bash
gunicorn app:app --bind 0.0.0.0:8000
```

## Docker

1. Создайте `.env` рядом с `docker-compose.yml`:

```bash
cp .env.example .env
```

2. Заполните минимум:

```bash
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
STATS_DB_PATH=/app/data/analytics.sqlite3
STATS_REPORT_TIME=21:00
STATS_REPORT_TZ=Europe/Moscow
PORT=8000
```

3. На сервере выполните:

```bash
docker compose up -d --build
```

4. Проверка:

```bash
curl http://127.0.0.1:8000/healthz
```

5. Обновление после новых коммитов:

```bash
git pull
docker compose up -d --build
```

## Notes

- `/healthz` возвращает простой healthcheck.
- Ежедневная статистика отправляется один раз в день после времени `STATS_REPORT_TIME` в часовом поясе `STATS_REPORT_TZ`.
- Файл `analytics.sqlite3` не должен коммититься в репозиторий.
- Для docker-режима можно хранить служебные данные в каталоге `./data`, если позже решишь вынести SQLite из корня проекта.
