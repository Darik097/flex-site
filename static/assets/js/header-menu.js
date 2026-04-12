const navToggle = document.querySelector(".nav-toggle");
const pageMenu = document.querySelector(".menu");

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
