const VISITOR_STORAGE_KEY = "flex_visitor_id";
const VISIT_SENT_KEY_PREFIX = "flex_visit_sent:";
const BOT_PATTERN = /bot|crawler|spider|preview|headless|lighthouse|selenium|webdriver/i;

const getVisitorId = () => {
    let visitorId = window.localStorage.getItem(VISITOR_STORAGE_KEY);

    if (!visitorId) {
        visitorId = (window.crypto?.randomUUID?.() || `flex-${Date.now()}-${Math.random().toString(16).slice(2)}`);
        window.localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
    }

    return visitorId;
};

const hasRealUserSignals = () => {
    const ua = navigator.userAgent || "";

    if (BOT_PATTERN.test(ua)) {
        return false;
    }

    if (navigator.webdriver) {
        return false;
    }

    if (document.visibilityState && document.visibilityState !== "visible" && document.visibilityState !== "prerender") {
        return false;
    }

    return true;
};

const markSent = (pagePath) => {
    const dateKey = new Date().toISOString().slice(0, 10);
    window.sessionStorage.setItem(`${VISIT_SENT_KEY_PREFIX}${dateKey}:${pagePath}`, "1");
};

const wasSent = (pagePath) => {
    const dateKey = new Date().toISOString().slice(0, 10);
    return window.sessionStorage.getItem(`${VISIT_SENT_KEY_PREFIX}${dateKey}:${pagePath}`) === "1";
};

const sendVisit = () => {
    const pagePath = window.location.pathname;

    if (!pagePath || wasSent(pagePath) || !hasRealUserSignals()) {
        return;
    }

    const payload = {
        pagePath,
        visitorId: getVisitorId(),
        referrer: document.referrer || "",
        visibilityState: document.visibilityState || "",
        webdriver: Boolean(navigator.webdriver),
        headless: BOT_PATTERN.test(navigator.userAgent || "")
    };

    const body = JSON.stringify(payload);

    if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon("/track_visit", blob);
        markSent(pagePath);
        return;
    }

    fetch("/track_visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true
    }).finally(() => {
        markSent(pagePath);
    });
};

window.addEventListener("load", () => {
    window.setTimeout(sendVisit, 1800);
});
