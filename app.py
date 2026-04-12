import hashlib
import html
import json
import os
import ssl
import sqlite3
import threading
import time
from datetime import datetime
from pathlib import Path
from urllib import error, request as urlrequest
from zoneinfo import ZoneInfo

from flask import Flask, Response, abort, jsonify, render_template, request, url_for

try:
    import certifi
except ImportError:
    certifi = None

app = Flask(__name__)
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 31536000

BASE_DIR = Path(app.root_path)
STATS_DB_PATH = Path(os.getenv("STATS_DB_PATH", str(BASE_DIR / "analytics.sqlite3"))).expanduser()
STATS_REPORT_TIME = os.getenv("STATS_REPORT_TIME", "21:00").strip()
STATS_REPORT_TZ = os.getenv("STATS_REPORT_TZ", "Europe/Moscow").strip()
BOT_UA_MARKERS = (
    "bot", "crawler", "spider", "preview", "headless", "python-requests",
    "curl", "wget", "uptime", "monitor", "checker", "lighthouse"
)
stats_worker_lock = threading.Lock()
request_dedupe_lock = threading.Lock()
recent_request_fingerprints = {}

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "").strip()
TELEGRAM_DISABLE_SSL_VERIFY = os.getenv("TELEGRAM_DISABLE_SSL_VERIFY", "0").strip() == "1"
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "0").strip() == "1"
PORT = int(os.getenv("PORT", "8000"))


# Add new project dictionaries here to render more expandable blocks on /catalog.
CATALOG_PROJECTS = [
    {
        "slug": "stone-yard-200",
        "area": "200",
        "unit": "м²",
        "summary_lines": ["Современный двор", "выложенный каменным ковром"],
        "featured_image": "images/stone_home.png",
        "featured_alt": "Современный двор с каменным покрытием",
        "gallery": [
            {"src": "images/stone_project1.png", "alt": "Фрагмент фасада с каменной текстурой"},
            {"src": "images/stone_project2.png", "alt": "Фактура покрытия у двери"},
            {"src": "images/stone_project4.png", "alt": "Светлый фасад с декоративной отделкой"},
            {"src": "images/stone_home.png", "alt": "Покрытие у стеклянного ограждения"},
            {"src": "images/home_project1.png", "alt": "Общий вид проекта"},
        ],
    },
    {
        "slug": "front-area-417",
        "area": "417",
        "unit": "м²",
        "summary_lines": ["Площадка перед домом", "с каменным покрытием"],
        "featured_image": "images/home_project2.png",
        "featured_alt": "Площадка перед домом с каменным покрытием",
        "gallery": [
            {"src": "images/home_project2.png", "alt": "Вечерний экстерьер дома"},
            {"src": "images/stone_home1.png", "alt": "Белый дом с каменным покрытием"},
            {"src": "images/stone_home2.png", "alt": "Дорожки из декоративного каменного ковра"},
            {"src": "images/stone_warm.png", "alt": "Тёплый фасад дома с архитектурной подсветкой"},
        ],
    },

    {
        "slug": "front-area-363",
        "area": "363",
        "unit": "м²",
        "summary_lines": ["Дорожки", "из декоративного каменного ковра"],
        "featured_image": "images/home_project1.png",
        "featured_alt": "Дорожки из декоративного каменного ковра",
        "gallery": [
            {"src": "images/home_project2.png", "alt": "Вечерний экстерьер дома"},
            {"src": "images/stone_home1.png", "alt": "Белый дом с каменным покрытием"},
            {"src": "images/stone_home2.png", "alt": "Дорожки из декоративного каменного ковра"},
            {"src": "images/stone_warm.png", "alt": "Тёплый фасад дома с архитектурной подсветкой"},
        ],
    },
]

LEGAL_PAGES = {
    "privacy-policy": {
        "title": "Политика обработки персональных данных | FLEX",
        "heading": "Политика обработки персональных данных",
        "lead": "Документ описывает порядок обработки, хранения и защиты персональных данных, которые пользователи оставляют на сайте FLEX.",
        "sections": [
            {
                "title": "1. Общие положения",
                "body": [
                    "Настоящая политика применяется ко всей информации, которую компания FLEX может получить о пользователе при заполнении форм на сайте.",
                    "Оператор обрабатывает персональные данные в соответствии с требованиями законодательства Российской Федерации."
                ],
            },
            {
                "title": "2. Какие данные собираются",
                "body": [
                    "Имя, номер телефона, а также иные сведения, которые пользователь добровольно указывает в форме заявки.",
                    "Технические данные, необходимые для корректной работы сайта и обработки запроса."
                ],
            },
            {
                "title": "3. Цели обработки",
                "body": [
                    "Связь с пользователем, консультация по проекту, подготовка коммерческого предложения и исполнение обязательств по договору.",
                    "Улучшение качества сервиса, аналитика обращений и обеспечение безопасности сайта."
                ],
            },
            {
                "title": "4. Защита данных",
                "body": [
                    "FLEX принимает организационные и технические меры для защиты персональных данных от неправомерного доступа, изменения, раскрытия или уничтожения.",
                    "Доступ к персональным данным предоставляется только уполномоченным лицам в объеме, необходимом для выполнения рабочих задач."
                ],
            },
        ],
    },
    "consent": {
        "title": "Согласие на обработку персональных данных | FLEX",
        "heading": "Согласие на обработку персональных данных",
        "lead": "Оставляя заявку на сайте FLEX, пользователь подтверждает свое согласие на обработку персональных данных в рамках обращения.",
        "sections": [
            {
                "title": "1. Состав согласия",
                "body": [
                    "Пользователь соглашается на сбор, запись, систематизацию, хранение, уточнение и использование предоставленных персональных данных.",
                    "Согласие распространяется на имя, номер телефона и иные сведения, переданные через формы сайта."
                ],
            },
            {
                "title": "2. Цель согласия",
                "body": [
                    "Использование данных ограничивается связью с пользователем, консультацией по услугам, расчетом стоимости и подготовкой предложения.",
                    "Данные не используются в целях, не связанных с обработкой обращения пользователя."
                ],
            },
            {
                "title": "3. Отзыв согласия",
                "body": [
                    "Пользователь вправе отозвать согласие, направив запрос на электронную почту FLEX.",
                    "После получения запроса обработка данных прекращается за исключением случаев, предусмотренных законодательством."
                ],
            },
        ],
    },
    "terms": {
        "title": "Пользовательское соглашение | FLEX",
        "heading": "Пользовательское соглашение",
        "lead": "Документ регулирует условия использования сайта FLEX и взаимодействия пользователя с размещенной на нем информацией и формами заявки.",
        "sections": [
            {
                "title": "1. Предмет соглашения",
                "body": [
                    "Сайт предоставляет информацию об услугах FLEX, реализованных проектах, технологии устройства каменного ковра и способах связи с компанией.",
                    "Использование материалов сайта допускается только в законных целях и без нарушения прав компании и третьих лиц."
                ],
            },
            {
                "title": "2. Ограничение ответственности",
                "body": [
                    "Информация на сайте носит информационный характер и не является публичной офертой, если иное прямо не указано.",
                    "Стоимость, сроки и технические решения уточняются индивидуально по результатам консультации и осмотра объекта."
                ],
            },
            {
                "title": "3. Интеллектуальная собственность",
                "body": [
                    "Тексты, фотографии, элементы дизайна и иные материалы сайта принадлежат FLEX либо используются на законных основаниях.",
                    "Копирование и распространение материалов допускается только с письменного согласия правообладателя."
                ],
            },
        ],
    },
    "company-details": {
        "title": "Сведения о компании и реквизитах | FLEX",
        "heading": "Сведения о компании и реквизитах",
        "lead": "Актуальные юридические сведения о компании FLEX для клиентов, партнеров и контрагентов.",
        "sections": [
            {
                "title": "Юридические сведения",
                "body": [
                    "Наименование: ООО «FLEX».",
                    "ИНН: 0276969473. ОГРН: 1220200019214."
                ],
            },
            {
                "title": "Контакты",
                "body": [
                    "Телефон: +7 (903) 353-34-49.",
                    "Email: flex.2022@bk.ru."
                ],
            },
            {
                "title": "Адрес и режим работы",
                "body": [
                    "Адрес: Республика Башкортостан, Уфимский район, с. Дмитриевка, переулок Рабочий, д. 29.",
                    "Режим работы: пн-пт, 09:00-18:00."
                ],
            },
        ],
    },
}


def init_stats_db():
    with sqlite3.connect(STATS_DB_PATH) as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS visits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_date TEXT NOT NULL,
                page_path TEXT NOT NULL,
                visitor_id TEXT NOT NULL,
                visited_at TEXT NOT NULL,
                user_agent TEXT NOT NULL,
                referrer TEXT,
                ip_hash TEXT,
                UNIQUE(event_date, page_path, visitor_id)
            )
        """)
        connection.execute("""
            CREATE TABLE IF NOT EXISTS stats_meta (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        """)
        connection.commit()


def ip_signature():
    forwarded = request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
    remote_addr = forwarded or request.remote_addr or ""
    return str(abs(hash(remote_addr))) if remote_addr else ""


def is_probable_bot(user_agent):
    ua = (user_agent or "").lower()
    return any(marker in ua for marker in BOT_UA_MARKERS)


def track_visit_record(page_path, visitor_id, user_agent, referrer):
    event_date = datetime.now(ZoneInfo(STATS_REPORT_TZ)).date().isoformat()
    visited_at = datetime.now(ZoneInfo(STATS_REPORT_TZ)).isoformat(timespec="seconds")

    with sqlite3.connect(STATS_DB_PATH) as connection:
        connection.execute("""
            INSERT OR IGNORE INTO visits (
                event_date, page_path, visitor_id, visited_at, user_agent, referrer, ip_hash
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            event_date,
            page_path,
            visitor_id,
            visited_at,
            user_agent,
            referrer,
            ip_signature(),
        ))
        connection.commit()


def get_daily_stats(target_date):
    with sqlite3.connect(STATS_DB_PATH) as connection:
        connection.row_factory = sqlite3.Row
        total_unique = connection.execute("""
            SELECT COUNT(DISTINCT visitor_id) AS total_unique
            FROM visits
            WHERE event_date = ?
        """, (target_date,)).fetchone()["total_unique"]

        rows = connection.execute("""
            SELECT page_path, COUNT(*) AS visits_count, COUNT(DISTINCT visitor_id) AS unique_visitors
            FROM visits
            WHERE event_date = ?
            GROUP BY page_path
            ORDER BY visits_count DESC, page_path ASC
        """, (target_date,)).fetchall()

    return total_unique, rows


def build_daily_stats_message(target_date):
    total_unique, rows = get_daily_stats(target_date)
    report_time_label = STATS_REPORT_TIME if ":" in STATS_REPORT_TIME else "21:00"
    lines = [
        f"Ежедневная статистика FLEX",
        f"Дата: {target_date}",
        f"Время отчета: {report_time_label} ({STATS_REPORT_TZ})",
        f"Уникальные реальные посетители: {total_unique}",
    ]

    if not rows:
        lines.append("")
        lines.append("За выбранный день реальные посещения не зафиксированы.")
        return "\n".join(lines)

    lines.append("")
    lines.append("Страницы:")

    for index, row in enumerate(rows, start=1):
        lines.append(
            f"{index}. {row['page_path']}"
        )
        lines.append(
            f"   Посещений: {row['visits_count']} | Уникальных: {row['unique_visitors']}"
        )

    return "\n".join(lines)


def should_send_report(now_local):
    try:
        report_hour, report_minute = [int(part) for part in STATS_REPORT_TIME.split(":", 1)]
    except ValueError:
        report_hour, report_minute = 21, 0

    scheduled_time = now_local.replace(
        hour=report_hour,
        minute=report_minute,
        second=0,
        microsecond=0,
    )
    return now_local >= scheduled_time


def get_meta_value(key):
    with sqlite3.connect(STATS_DB_PATH) as connection:
        row = connection.execute(
            "SELECT value FROM stats_meta WHERE key = ?",
            (key,),
        ).fetchone()
        return row[0] if row else None


def set_meta_value(key, value):
    with sqlite3.connect(STATS_DB_PATH) as connection:
        connection.execute("""
            INSERT INTO stats_meta(key, value)
            VALUES(?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
        """, (key, value))
        connection.commit()


def was_daily_report_sent(report_date):
    with sqlite3.connect(STATS_DB_PATH) as connection:
        row = connection.execute(
            "SELECT value FROM stats_meta WHERE key = ?",
            ("last_daily_report_date",),
        ).fetchone()
        return bool(row and row[0] == report_date)


def mark_daily_report_sent(report_date):
    with sqlite3.connect(STATS_DB_PATH) as connection:
        connection.execute("""
            INSERT INTO stats_meta(key, value)
            VALUES(?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
        """, ("last_daily_report_date", report_date))
        connection.commit()


def clear_daily_report_sent(report_date):
    with sqlite3.connect(STATS_DB_PATH) as connection:
        connection.execute(
            "DELETE FROM stats_meta WHERE key = ? AND value = ?",
            ("last_daily_report_date", report_date),
        )
        connection.commit()


def stats_report_worker():
    while True:
        try:
            now_local = datetime.now(ZoneInfo(STATS_REPORT_TZ))

            if should_send_report(now_local):
                today = now_local.date().isoformat()
                if not was_daily_report_sent(today):
                    target_date = now_local.date().isoformat()
                    send_telegram_message(build_daily_stats_message(target_date))
                    mark_daily_report_sent(today)
        except Exception:
            app.logger.exception("Failed to send daily stats report")

        time.sleep(60)


init_stats_db()

LANDING_PAGES = {
    "kamennyj-kover-ufa": {
        "title": "Каменный Ковер в Уфе | Укладка Под Ключ | FLEX",
        "meta_description": "Каменный ковер в Уфе под ключ: проектирование, подбор материалов и укладка для дворов, дорожек, террас, крылец и входных групп.",
        "heading": "КАМЕННЫЙ КОВЕР В УФЕ",
        "eyebrow": "Локальная посадочная",
        "lead": "FLEX выполняет устройство каменного ковра для частных и коммерческих объектов в Уфе и по Республике Башкортостан. Подбираем систему под архитектуру, нагрузку и условия эксплуатации объекта.",
        "hero_image": "images/stone_home.png",
        "offer_name": "Каменный ковер в Уфе",
        "benefits": [
            {"title": "Под ключ", "body": "От консультации и подбора смеси до подготовки основания и укладки покрытия на объекте."},
            {"title": "Под задачи участка", "body": "Решения для дворов, дорожек, входных групп, террас, лестниц и декоративных фасадных зон."},
            {"title": "Под климат региона", "body": "Учитываем влагу, сезонность, перепады температур и реальную нагрузку на покрытие."},
        ],
        "use_cases": [
            "Дворы частных домов и коттеджей",
            "Садовые дорожки и отмостки",
            "Террасы, крыльца и входные группы",
            "Коммерческие входные зоны и фасадные участки",
        ],
        "faq": [
            {"q": "Вы работаете только по Уфе?", "a": "Нет. Базовая география работ включает Уфу, пригород и объекты по Республике Башкортостан."},
            {"q": "Можно ли подобрать покрытие под стиль дома?", "a": "Да. FLEX подбирает цветовую смесь, фракцию и визуальное решение под фасад, архитектуру и задачу объекта."},
            {"q": "Для каких зон подходит каменный ковер?", "a": "Чаще всего покрытие применяют на дворах, дорожках, террасах, крыльцах, ступенях и входных группах."},
        ],
    },
    "kamennyj-kover-cena": {
        "title": "Каменный Ковер Цена | От Чего Зависит Стоимость | FLEX",
        "meta_description": "Цена каменного ковра зависит от площади, состояния основания, выбранной смеси, толщины слоя и сложности объекта. FLEX консультирует и рассчитывает стоимость под задачу.",
        "heading": "КАМЕННЫЙ КОВЕР: ЦЕНА И РАСЧЕТ",
        "eyebrow": "Коммерческий запрос",
        "lead": "Стоимость каменного ковра формируется не по одной цифре за квадратный метр, а по совокупности факторов: тип основания, подготовка поверхности, площадь, конфигурация, фракция камня и состав системы.",
        "hero_image": "images/home_project2.png",
        "offer_name": "Расчет цены каменного ковра",
        "benefits": [
            {"title": "Прозрачный расчет", "body": "Разделяем стоимость материалов, подготовительных работ и укладки, чтобы заказчик понимал структуру сметы."},
            {"title": "Без шаблонной цены", "body": "Корректный расчет возможен только после понимания площади, основания, геометрии и условий эксплуатации."},
            {"title": "Оптимизация бюджета", "body": "Подбираем систему и визуальное решение без лишних затрат и с учетом задачи объекта."},
        ],
        "use_cases": [
            "Расчет стоимости для дворов и дорожек",
            "Смета для террас, крылец и ступеней",
            "Коммерческие объекты и входные группы",
            "Подбор покрытия под частный дом или фасадную зону",
        ],
        "faq": [
            {"q": "От чего зависит цена каменного ковра?", "a": "От площади, состояния основания, сложности геометрии, типа смеси, толщины слоя и объема подготовительных работ."},
            {"q": "Можно ли назвать точную цену без осмотра?", "a": "Ориентир возможен, но точный расчет дается после анализа основания и параметров объекта."},
            {"q": "Что чаще всего сильнее всего влияет на бюджет?", "a": "Подготовка основания, примыкания, лестничные элементы, нестандартная геометрия и выбранная система материалов."},
        ],
    },
    "kamennyj-kover-dlya-ulicy": {
        "title": "Каменный Ковер Для Улицы | Уличное Покрытие Под Ключ | FLEX",
        "meta_description": "Каменный ковер для улицы: покрытия для дворов, дорожек, террас, входных групп и открытых зон. FLEX выполняет работы в Уфе и по Башкортостану.",
        "heading": "КАМЕННЫЙ КОВЕР ДЛЯ УЛИЦЫ",
        "eyebrow": "Уличные покрытия",
        "lead": "Уличный каменный ковер применяют там, где важны прочность, эстетика и аккуратная архитектурная фактура. Покрытие подходит для открытых площадок, дорожек, входных зон и зон вокруг дома.",
        "hero_image": "images/stone_project1.png",
        "offer_name": "Каменный ковер для улицы",
        "benefits": [
            {"title": "Под открытые зоны", "body": "Покрытие проектируется под эксплуатацию на улице с учетом влаги, осадков и температурных колебаний."},
            {"title": "Эстетика участка", "body": "Каменный ковер дает чистую, современную и архитектурно цельную поверхность без визуального шума."},
            {"title": "Гибкость применения", "body": "Подходит для прямых и сложных по форме площадок вокруг дома и на коммерческих объектах."},
        ],
        "use_cases": [
            "Дворы и площадки перед домом",
            "Садовые и пешеходные дорожки",
            "Крыльца и входные группы",
            "Террасы и открытые зоны отдыха",
        ],
        "faq": [
            {"q": "Подходит ли покрытие для уличной эксплуатации?", "a": "Да, если основание подготовлено правильно и система материалов подобрана под реальные условия объекта."},
            {"q": "Где чаще всего применяют уличный каменный ковер?", "a": "На дворах, дорожках, входных группах, террасах и площадках вокруг частных и коммерческих объектов."},
            {"q": "Чем уличный объект отличается в расчете?", "a": "В расчет сильнее влияют тип основания, водоотведение, конфигурация участка и режим эксплуатации."},
        ],
    },
    "kamennyj-kover-dlya-krylca": {
        "title": "Каменный Ковер Для Крыльца | Покрытие Ступеней и Входной Группы | FLEX",
        "meta_description": "Каменный ковер для крыльца и входной группы: подготовка основания, подбор смеси и аккуратная укладка под архитектуру объекта.",
        "heading": "КАМЕННЫЙ КОВЕР ДЛЯ КРЫЛЬЦА",
        "eyebrow": "Входные группы",
        "lead": "Крыльцо и входная группа требуют точной геометрии, аккуратной проработки примыканий и правильного выбора системы. FLEX подбирает покрытие под интенсивность использования и внешний вид фасада.",
        "hero_image": "images/stone_project2.png",
        "offer_name": "Каменный ковер для крыльца",
        "benefits": [
            {"title": "Точная геометрия", "body": "Прорабатываем углы, примыкания, ступени и края покрытия так, чтобы входная группа выглядела цельно и аккуратно."},
            {"title": "Под стиль фасада", "body": "Подбор цвета и фактуры идет в связке с фасадом, отделкой цоколя и общим образом дома."},
            {"title": "Практичное решение", "body": "Покрытие подходит для зон с регулярной нагрузкой и постоянным визуальным акцентом."},
        ],
        "use_cases": [
            "Крыльцо частного дома",
            "Ступени у входной группы",
            "Площадка перед дверью",
            "Входные зоны коммерческих объектов",
        ],
        "faq": [
            {"q": "Можно ли делать каменный ковер на крыльце?", "a": "Да, это один из самых популярных сценариев применения, если основание и узлы примыкания сделаны правильно."},
            {"q": "Подходит ли покрытие для входной группы дома?", "a": "Да. Оно помогает визуально собрать входную зону и поддержать архитектуру фасада."},
            {"q": "Что важно на таком объекте?", "a": "Правильная подготовка основания, точная геометрия ступеней и аккуратная работа по кромкам и примыканиям."},
        ],
    },
    "kamennyj-kover-dlya-terrasy": {
        "title": "Каменный Ковер Для Террасы | Покрытие Террас Под Ключ | FLEX",
        "meta_description": "Каменный ковер для террасы: современное бесшовное покрытие для открытых зон отдыха, частных домов и архитектурных площадок.",
        "heading": "КАМЕННЫЙ КОВЕР ДЛЯ ТЕРРАСЫ",
        "eyebrow": "Зоны отдыха",
        "lead": "Терраса требует не только красивого покрытия, но и спокойной визуальной поверхности, комфортной для повседневного использования. FLEX подбирает решения под частные и коммерческие открытые зоны.",
        "hero_image": "images/stone_home1.png",
        "offer_name": "Каменный ковер для террасы",
        "benefits": [
            {"title": "Архитектурный вид", "body": "Покрытие помогает собрать террасу в единое пространство с домом, фасадом и ландшафтом."},
            {"title": "Под открытые зоны", "body": "Система подбирается под улицу, режим использования и особенности основания."},
            {"title": "Аккуратная фактура", "body": "Каменный ковер дает визуально дорогую, чистую и современную поверхность."},
        ],
        "use_cases": [
            "Террасы частных домов",
            "Площадки отдыха у фасада",
            "Зоны вокруг панорамных окон",
            "Открытые коммерческие террасы",
        ],
        "faq": [
            {"q": "Подходит ли каменный ковер для террасы?", "a": "Да, при правильной системе материалов и подготовке основания это один из удобных вариантов для открытых зон."},
            {"q": "Можно ли связать террасу с дорожками и крыльцом одним решением?", "a": "Да, FLEX часто проектирует единый визуальный сценарий для террасы, входной группы и прилегающих дорожек."},
            {"q": "Что влияет на выбор смеси для террасы?", "a": "Архитектура дома, нагрузка, размеры площадки, освещенность и общий стиль участка."},
        ],
    },
    "kamennyj-kover-dlya-stupenej": {
        "title": "Каменный Ковер Для Ступеней | Отделка Лестниц и Ступеней | FLEX",
        "meta_description": "Каменный ковер для ступеней и лестничных элементов: точная геометрия, аккуратная отделка и подбор покрытия под крыльцо и входную группу.",
        "heading": "КАМЕННЫЙ КОВЕР ДЛЯ СТУПЕНЕЙ",
        "eyebrow": "Лестничные элементы",
        "lead": "Ступени и лестничные марши относятся к самым требовательным участкам по геометрии и исполнению. FLEX проектирует покрытие с учетом примыканий, кромок, ритма фасада и сценария использования.",
        "hero_image": "images/stone_home2.png",
        "offer_name": "Каменный ковер для ступеней",
        "benefits": [
            {"title": "Аккуратная проработка кромок", "body": "В ступенях важны точные линии, ровный визуальный ритм и качественное исполнение узлов."},
            {"title": "Связка с крыльцом", "body": "Лестница рассматривается как часть входной группы, а не как отдельный фрагмент."},
            {"title": "Индивидуальный расчет", "body": "Ступени часто требуют более точной сметы из-за геометрии, количества элементов и объема ручной работы."},
        ],
        "use_cases": [
            "Ступени частного дома",
            "Лестница входной группы",
            "Переходы между уровнями на террасе",
            "Ступени на коммерческих объектах",
        ],
        "faq": [
            {"q": "Можно ли сделать каменный ковер на ступенях?", "a": "Да, но качество результата напрямую зависит от подготовки основания, точности геометрии и технологии исполнения."},
            {"q": "Почему ступени считаются более сложным участком?", "a": "Потому что здесь важны кромки, углы, ритм элементов, примыкания и визуальная точность каждой плоскости."},
            {"q": "Можно ли выполнить ступени и площадку в одном стиле?", "a": "Да, обычно так и делают, чтобы входная группа выглядела цельной и архитектурно собранной."},
        ],
    },
}

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/catalog")
def catalog():
    return render_template("catalog.html", projects=CATALOG_PROJECTS)

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/contact")
def contact():
    return render_template("contact.html")

@app.route("/technology")
def technology():
    return render_template("technology.html")


@app.route("/<landing_slug>")
def seo_landing(landing_slug):
    page = LANDING_PAGES.get(landing_slug)

    if page:
        siblings = [
            {"slug": slug, "heading": item["heading"]}
            for slug, item in LANDING_PAGES.items()
            if slug != landing_slug
        ]
        return render_template("landing.html", page=page, page_slug=landing_slug, siblings=siblings)

    page = LEGAL_PAGES.get(landing_slug)

    if page:
        return render_template("document.html", page=page)

    abort(404)


def send_telegram_message(text, *, parse_mode=None):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        raise RuntimeError("Telegram bot token or chat id is not configured")

    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": text,
        "disable_web_page_preview": True,
    }

    if parse_mode:
        payload["parse_mode"] = parse_mode

    payload = json.dumps(payload).encode("utf-8")

    req = urlrequest.Request(
        f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    ssl_context = None

    if TELEGRAM_DISABLE_SSL_VERIFY:
        ssl_context = ssl._create_unverified_context()
    elif certifi is not None:
        ssl_context = ssl.create_default_context(cafile=certifi.where())

    try:
        with urlrequest.urlopen(req, timeout=10, context=ssl_context) as response:
            response_body = json.loads(response.read().decode("utf-8"))
    except error.HTTPError as exc:
        response_text = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Telegram HTTP {exc.code}: {response_text}") from exc
    except error.URLError as exc:
        raise RuntimeError(f"Telegram connection error: {exc.reason}") from exc

    if not response_body.get("ok"):
        raise RuntimeError(response_body.get("description", "Telegram API returned an error"))


def build_request_message(data):
    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()
    product_title = data.get("productTitle", "").strip()
    source_page = data.get("sourcePage", "").strip()
    form_type = data.get("formType", "").strip()
    timestamp = data.get("timestamp") or datetime.now().strftime("%d.%m.%Y %H:%M")

    lines = [
        "<b>Новая заявка FLEX</b>",
        "",
        f"<b>Имя:</b> {html.escape(name)}",
        f"<b>Телефон:</b> {html.escape(phone)}",
        f"<b>Время:</b> {html.escape(timestamp)}",
    ]

    if form_type:
        lines.append(f"<b>Форма:</b> {html.escape(form_type)}")

    if source_page:
        lines.append(f"<b>Страница:</b> {html.escape(source_page)}")

    if product_title:
        lines.append(f"<b>Контекст:</b> {html.escape(product_title)}")

    return "\n".join(lines)


def build_request_fingerprint(data):
    normalized = [
        (data.get("name") or "").strip().casefold(),
        (data.get("phone") or "").strip(),
        (data.get("productTitle") or "").strip().casefold(),
        (data.get("sourcePage") or "").strip().casefold(),
        (data.get("formType") or "").strip().casefold(),
    ]
    payload = "|".join(normalized).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def is_recent_duplicate_request(data, ttl_seconds=90):
    fingerprint = build_request_fingerprint(data)
    now = time.monotonic()

    with request_dedupe_lock:
        expired = [
            key for key, seen_at in recent_request_fingerprints.items()
            if now - seen_at > ttl_seconds
        ]
        for key in expired:
            recent_request_fingerprints.pop(key, None)

        last_seen_at = recent_request_fingerprints.get(fingerprint)
        if last_seen_at is not None and now - last_seen_at <= ttl_seconds:
            return True

        recent_request_fingerprints[fingerprint] = now

    return False


def clear_recent_duplicate_request(data):
    fingerprint = build_request_fingerprint(data)
    with request_dedupe_lock:
        recent_request_fingerprints.pop(fingerprint, None)


@app.route("/track_visit", methods=["POST"])
def track_visit():
    data = request.get_json(silent=True) or {}
    page_path = (data.get("pagePath") or "").strip()
    visitor_id = (data.get("visitorId") or "").strip()
    referrer = (data.get("referrer") or "").strip()
    visibility = (data.get("visibilityState") or "").strip()
    user_agent = request.headers.get("User-Agent", "").strip()

    if (
        not page_path.startswith("/")
        or not visitor_id
        or len(visitor_id) > 120
        or is_probable_bot(user_agent)
        or data.get("webdriver")
        or data.get("headless")
        or visibility not in {"visible", "prerender", ""}
    ):
        return jsonify({"tracked": False}), 202

    track_visit_record(page_path=page_path, visitor_id=visitor_id, user_agent=user_agent, referrer=referrer)
    return jsonify({"tracked": True})


def page_lastmod(template_name):
    template_path = Path(app.root_path) / "templates" / template_name

    if not template_path.exists():
        return datetime.utcnow().strftime("%Y-%m-%d")

    return datetime.utcfromtimestamp(template_path.stat().st_mtime).strftime("%Y-%m-%d")


@app.route("/submit_request", methods=["POST"])
def submit_request():
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()

    if not name or not phone:
        return jsonify({"result": False, "message": "Заполните имя и телефон"}), 400

    if is_recent_duplicate_request(data):
        return jsonify({"result": True, "duplicate": True})

    try:
        send_telegram_message(build_request_message(data), parse_mode="HTML")
        return jsonify({"result": True})
    except RuntimeError as exc:
        clear_recent_duplicate_request(data)
        return jsonify({
            "result": False,
            "message": str(exc),
        }), 500


@app.route("/robots.txt")
def robots():
    base = request.url_root.rstrip("/")
    body = "\n".join([
        "User-agent: *",
        "Allow: /",
        f"Sitemap: {base}/sitemap.xml",
    ])
    response = Response(body, mimetype="text/plain")
    response.headers["Cache-Control"] = "public, max-age=3600"
    return response


@app.route("/healthz")
def healthz():
    return jsonify({"ok": True})


@app.route("/sitemap.xml")
def sitemap():
    pages = [
        (url_for("index", _external=True), page_lastmod("index.html")),
        (url_for("catalog", _external=True), page_lastmod("catalog.html")),
        (url_for("about", _external=True), page_lastmod("about.html")),
        (url_for("contact", _external=True), page_lastmod("contact.html")),
        (url_for("technology", _external=True), page_lastmod("technology.html")),
    ]

    pages.extend(
        (url_for("seo_landing", landing_slug=slug, _external=True), page_lastmod("landing.html"))
        for slug in LANDING_PAGES
    )

    pages.extend(
        (url_for("seo_landing", landing_slug=slug, _external=True), page_lastmod("document.html"))
        for slug in LEGAL_PAGES
    )

    xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

    for page, lastmod in pages:
        xml.append("  <url>")
        xml.append(f"    <loc>{page}</loc>")
        xml.append(f"    <lastmod>{lastmod}</lastmod>")
        xml.append("  </url>")

    xml.append("</urlset>")
    response = Response("\n".join(xml), mimetype="application/xml")
    response.headers["Cache-Control"] = "public, max-age=3600"
    return response


@app.after_request
def apply_cache_headers(response):
    if request.path.startswith("/static/") and response.status_code == 200:
        response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    elif response.mimetype == "text/html" and response.status_code == 200:
        response.headers["Cache-Control"] = "public, max-age=300"

    return response


def ensure_stats_worker_started():
    with stats_worker_lock:
        if getattr(app, "_stats_worker_started", False):
            return
        stats_thread = threading.Thread(target=stats_report_worker, daemon=True)
        stats_thread.start()
        app._stats_worker_started = True


@app.before_request
def boot_background_workers():
    ensure_stats_worker_started()


ensure_stats_worker_started()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=FLASK_DEBUG)
