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

## Notes

- `/healthz` возвращает простой healthcheck.
- Ежедневная статистика отправляется один раз в день после времени `STATS_REPORT_TIME` в часовом поясе `STATS_REPORT_TZ`.
- Файл `analytics.sqlite3` не должен коммититься в репозиторий.
