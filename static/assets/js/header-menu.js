const navToggle = document.querySelector(".nav-toggle");
const pageMenu = document.querySelector(".menu");
const siteHeader = document.querySelector(".header");

if (navToggle && pageMenu) {
    const closeMenu = () => {
        document.body.classList.remove("menu-open");
        navToggle.setAttribute("aria-expanded", "false");
    };

    const openMenu = () => {
        document.body.classList.add("menu-open");
        navToggle.setAttribute("aria-expanded", "true");
    };

    navToggle.addEventListener("click", () => {
        if (document.body.classList.contains("menu-open")) {
            closeMenu();
            return;
        }

        openMenu();
    });

    pageMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            closeMenu();
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 980) {
            closeMenu();
        }
    });
}

if (siteHeader) {
    const contrastSections = document.querySelectorAll(".seo-faq, [data-header-contrast='dark']");

    if (contrastSections.length) {
        const updateContrastState = () => {
            const headerRect = siteHeader.getBoundingClientRect();
            const probeY = headerRect.bottom - Math.max(18, Math.min(headerRect.height * 0.35, 32));
            let isOnLightSection = false;

            contrastSections.forEach((section) => {
                const rect = section.getBoundingClientRect();
                if (probeY >= rect.top && probeY <= rect.bottom) {
                    isOnLightSection = true;
                }
            });

            siteHeader.classList.toggle("is-contrast-dark", isOnLightSection);
        };

        updateContrastState();
        window.addEventListener("scroll", updateContrastState, { passive: true });
        window.addEventListener("resize", updateContrastState);
        window.addEventListener("load", updateContrastState);
    }
}
