const contactMapShell = document.querySelector("[data-contact-map]");

if (contactMapShell) {
    const markReady = () => {
        const hasMapFrame =
            contactMapShell.querySelector("iframe") ||
            contactMapShell.querySelector("[class*='ymaps']");

        if (!hasMapFrame) {
            return;
        }

        contactMapShell.classList.add("is-ready");
        observer.disconnect();
    };

    const observer = new MutationObserver(markReady);
    observer.observe(contactMapShell, { childList: true, subtree: true });
    markReady();
}
