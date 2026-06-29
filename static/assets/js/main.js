const dots = document.querySelectorAll(".dot");
const scrollSections = document.querySelectorAll("[data-scroll-section]");
const hero = document.querySelector(".hero");

const startBackgroundVideos = () => {
    document.querySelectorAll(".hero-video, .about-hero__video").forEach((video) => {
        video.muted = true;
        video.playsInline = true;

        const playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === "function") {
            playAttempt.catch(() => {});
        }
    });
};

const updateScrollScenes = () => {
    const viewportHeight = window.innerHeight || 1;
    const documentHeight = Math.max(document.body.scrollHeight - viewportHeight, 1);
    const globalProgress = window.scrollY / documentHeight;

    document.body.style.setProperty("--global-scroll-progress", globalProgress.toFixed(4));

    scrollSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const visible = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
        const visibility = Math.max(0, Math.min(1, visible / Math.min(rect.height || 1, viewportHeight)));
        const progress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / (viewportHeight + rect.height)));

        section.style.setProperty("--section-progress", progress.toFixed(4));
        section.style.setProperty("--section-visibility", visibility.toFixed(4));
        section.classList.toggle("is-active", visibility > 0.24);
    });
};

const bindDotHover = () => {
    dots.forEach((dot) => {
        dot.addEventListener("mouseenter", () => {
            dot.style.transform = "scale(1.6)";
        });

        dot.addEventListener("mouseleave", () => {
            dot.style.transform = "scale(1)";
        });
    });
};

const bindAnchorScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
};

const initHeroAnimations = () => {
    if (!hero || !window.gsap || !window.ScrollTrigger) {
        return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
        return;
    }

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    gsap.registerPlugin(ScrollTrigger);
    hero.classList.add("is-gsap-ready");

    const heroVideo = hero.querySelector(".hero-video");
    const overlay = hero.querySelector(".overlay");
    const heroContent = hero.querySelector(".hero-content");
    const heroLeft = hero.querySelector(".hero-left");
    const heroNote = hero.querySelector(".hero-note");
    const heroKicker = hero.querySelector(".hero-kicker");
    const heroCopy = hero.querySelector(".hero-copy");
    const heroCta = hero.querySelector(".hero-cta");
    const heroTitleLines = hero.querySelectorAll(".hero-title-line");
    const backdropGlow = hero.querySelector(".hero-backdrop-glow");
    const backdropGrid = hero.querySelector(".hero-backdrop-grid");
    const backdropRing = hero.querySelector(".hero-backdrop-ring");
    const backdropLine = hero.querySelector(".hero-backdrop-line");

    const introTimeline = gsap.timeline({
        defaults: {
            ease: "power3.out"
        }
    });

    introTimeline
        .fromTo(heroVideo, {
            scale: 1.24,
            filter: "brightness(0.72) saturate(0.82)"
        }, {
            scale: 1.08,
            filter: "brightness(1) saturate(1)",
            duration: 1.8
        })
        .fromTo(backdropGlow, {
            autoAlpha: 0,
            scale: 0.72
        }, {
            autoAlpha: 0.72,
            scale: 1,
            duration: 1.3
        }, 0.15)
        .fromTo(backdropGrid, {
            autoAlpha: 0,
            x: 60,
            y: 40
        }, {
            autoAlpha: 0.36,
            x: 0,
            y: 0,
            duration: 1.2
        }, 0.35)
        .fromTo(backdropRing, {
            autoAlpha: 0,
            scale: 0.86,
            rotate: -8
        }, {
            autoAlpha: 0.42,
            scale: 1,
            rotate: 0,
            duration: 1.2
        }, 0.42)
        .fromTo(backdropLine, {
            autoAlpha: 0,
            scaleX: 0.2,
            transformOrigin: "left center"
        }, {
            autoAlpha: 0.44,
            scaleX: 1,
            duration: 1
        }, 0.48)
        .fromTo(heroKicker, {
            autoAlpha: 0,
            y: 28
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.7
        }, 0.32)
        .fromTo(heroTitleLines, {
            autoAlpha: 0,
            yPercent: 110,
            rotateX: -24,
            transformOrigin: "50% 100%"
        }, {
            autoAlpha: 1,
            yPercent: 0,
            rotateX: 0,
            duration: 0.9,
            stagger: 0.12
        }, 0.45)
        .fromTo(heroCopy, {
            autoAlpha: 0,
            y: 24
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.7
        }, 0.98)
        .fromTo(heroCta, {
            autoAlpha: 0,
            y: 20,
            scale: 0.96
        }, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.65
        }, 1.06)
        .fromTo(heroNote, {
            autoAlpha: 0,
            x: 36
        }, {
            autoAlpha: 1,
            x: 0,
            duration: 0.85
        }, 0.84)
        .fromTo(dots, {
            autoAlpha: 0,
            scale: 0,
            y: 18
        }, {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.06,
            ease: "back.out(2.2)"
        }, 1.12);

    gsap.timeline({
        scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: 1.1
        }
    })
        .to(heroVideo, {
            yPercent: 10,
            scale: 1.2,
            ease: "none"
        }, 0)
        .to(overlay, {
            opacity: 0.92,
            ease: "none"
        }, 0)
        .to(heroContent, {
            yPercent: -12,
            ease: "none"
        }, 0)
        .to(heroLeft, {
            yPercent: -8,
            ease: "none"
        }, 0)
        .to(heroNote, {
            yPercent: -18,
            xPercent: 6,
            autoAlpha: 0.18,
            ease: "none"
        }, 0)
        .to(backdropGlow, {
            yPercent: -18,
            scale: 1.18,
            autoAlpha: 0.2,
            ease: "none"
        }, 0)
        .to(backdropGrid, {
            yPercent: -12,
            rotate: 4,
            autoAlpha: 0.62,
            ease: "none"
        }, 0)
        .to(backdropRing, {
            yPercent: -20,
            rotate: 18,
            ease: "none"
        }, 0)
        .to(backdropLine, {
            xPercent: 12,
            autoAlpha: 0.08,
            ease: "none"
        }, 0)
        .to(dots, {
            yPercent: (_, target) => Number.parseFloat(target.dataset.depth || "0") || -24,
            stagger: 0.02,
            ease: "none"
        }, 0);

    const moveBackdrop = gsap.quickTo(backdropGlow, "x", { duration: 0.8, ease: "power3.out" });
    const moveBackdropY = gsap.quickTo(backdropGlow, "y", { duration: 0.8, ease: "power3.out" });
    const moveGrid = gsap.quickTo(backdropGrid, "x", { duration: 0.9, ease: "power3.out" });
    const moveRing = gsap.quickTo(backdropRing, "y", { duration: 1.1, ease: "power3.out" });
    const moveContentX = gsap.quickTo(heroContent, "x", { duration: 0.8, ease: "power3.out" });
    const moveContentY = gsap.quickTo(heroContent, "y", { duration: 0.8, ease: "power3.out" });

    hero.addEventListener("mousemove", (event) => {
        const bounds = hero.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;

        moveBackdrop(x * 48);
        moveBackdropY(y * 36);
        moveGrid(x * -34);
        moveRing(y * -28);
        moveContentX(x * -18);
        moveContentY(y * -14);
    });

    hero.addEventListener("mouseleave", () => {
        moveBackdrop(0);
        moveBackdropY(0);
        moveGrid(0);
        moveRing(0);
        moveContentX(0);
        moveContentY(0);
    });
};

const initStoneCarpetAnimations = () => {
    if (!window.gsap || !window.ScrollTrigger) {
        return;
    }

    const stoneSection = document.querySelector(".stone-carpet");

    if (!stoneSection) {
        return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
        return;
    }

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    const intro = stoneSection.querySelector(".stone-carpet__intro");
    const viewport = stoneSection.querySelector(".stone-carpet__viewport");

    stoneSection.classList.add("is-gsap-ready");

    gsap.timeline({
        scrollTrigger: {
            trigger: stoneSection,
            start: "top 76%",
            toggleActions: "play none none reverse"
        }
    })
        .fromTo(intro, {
            autoAlpha: 0,
            y: 50
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out"
        })
        .fromTo(viewport, {
            autoAlpha: 0,
            y: 72
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: "power3.out"
        }, 0.16);
};

const initStepsAnimations = () => {
    if (!window.gsap || !window.ScrollTrigger) {
        return;
    }

    const section = document.querySelector(".steps-showcase");

    if (!section) {
        return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
        return;
    }

    const gsap = window.gsap;
    const title = section.querySelector(".steps-showcase__title");
    const cards = section.querySelectorAll(".step-card");
    const lines = section.querySelectorAll(".steps-showcase__line");

    section.classList.add("is-gsap-ready");

    gsap.set(lines[0], { transformOrigin: "center top", scaleY: 0 });
    gsap.set(lines[1], { transformOrigin: "center top", scaleY: 0 });
    gsap.set(lines[2], { transformOrigin: "left center", scaleX: 0 });

    gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top 72%",
            toggleActions: "play none none reverse"
        }
    })
        .fromTo(title, {
            autoAlpha: 0,
            x: -48
        }, {
            autoAlpha: 1,
            x: 0,
            duration: 0.9,
            ease: "power3.out"
        })
        .to(lines[0], {
            scaleY: 1,
            duration: 0.6,
            ease: "power2.out"
        }, 0.22)
        .to(lines[1], {
            scaleY: 1,
            duration: 0.6,
            ease: "power2.out"
        }, 0.3)
        .to(lines[2], {
            scaleX: 1,
            duration: 0.7,
            ease: "power2.out"
        }, 0.42)
        .fromTo(cards, {
            autoAlpha: 0,
            y: 54
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.14,
            ease: "power3.out"
        }, 0.36);

    cards.forEach((card, index) => {
        gsap.to(card, {
            yPercent: index % 2 === 0 ? -8 : -14,
            ease: "none",
            scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.4
            }
        });
    });
};

const initCraftTeamAnimations = () => {
    if (!window.gsap || !window.ScrollTrigger) {
        return;
    }

    const section = document.querySelector(".craft-team");

    if (!section) {
        return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
        return;
    }

    const gsap = window.gsap;
    const copy = section.querySelector(".craft-team__copy");
    const ring = section.querySelector(".craft-team__ring");
    const photoLeft = section.querySelector(".craft-team__photo--left");
    const photoRight = section.querySelector(".craft-team__photo--right");

    section.classList.add("is-gsap-ready");

    gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top 74%",
            toggleActions: "play none none reverse"
        }
    })
        .fromTo(copy, {
            autoAlpha: 0,
            x: -42
        }, {
            autoAlpha: 1,
            x: 0,
            duration: 0.9,
            ease: "power3.out"
        })
        .fromTo(photoLeft, {
            autoAlpha: 0,
            x: -46,
            y: 52,
            rotate: -4
        }, {
            autoAlpha: 1,
            x: 0,
            y: 0,
            rotate: 0,
            duration: 1,
            ease: "power3.out"
        }, 0.14)
        .fromTo(photoRight, {
            autoAlpha: 0,
            x: 48,
            y: -44,
            rotate: 5
        }, {
            autoAlpha: 1,
            x: 0,
            y: 0,
            rotate: 0,
            duration: 1,
            ease: "power3.out"
        }, 0.24)
        .fromTo(ring, {
            autoAlpha: 0,
            scale: 0.7,
            rotate: -18
        }, {
            autoAlpha: 1,
            scale: 1,
            rotate: 0,
            duration: 1.1,
            ease: "power3.out"
        }, 0.22);

    gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.3
        }
    })
        .to(copy, {
            yPercent: -10,
            ease: "none"
        }, 0)
        .to(photoLeft, {
            yPercent: -14,
            xPercent: -4,
            ease: "none"
        }, 0)
        .to(photoRight, {
            yPercent: -22,
            xPercent: 5,
            ease: "none"
        }, 0)
        .to(ring, {
            rotate: 22,
            yPercent: -18,
            ease: "none"
        }, 0);
};

const initContactAnimations = () => {
    if (!window.gsap || !window.ScrollTrigger) {
        return;
    }

    const section = document.querySelector(".contact-atelier");

    if (!section) {
        return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
        return;
    }

    const gsap = window.gsap;
    const texture = section.querySelector(".contact-atelier__texture");
    const shade = section.querySelector(".contact-atelier__shade");
    const panel = section.querySelector(".contact-atelier__panel");
    const accent = section.querySelector(".contact-atelier__accent");
    const fields = section.querySelectorAll(".contact-atelier__field, .contact-atelier__check");
    const divider = section.querySelector(".contact-atelier__divider");
    const button = section.querySelector(".contact-atelier__btn");

    section.classList.add("is-gsap-ready");

    gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top 76%",
            toggleActions: "play none none reverse"
        }
    })
        .fromTo(texture, {
            scale: 1.12,
            autoAlpha: 0.32
        }, {
            scale: 1,
            autoAlpha: 0.9,
            duration: 1.2,
            ease: "power2.out"
        })
        .fromTo(shade, {
            autoAlpha: 0.2
        }, {
            autoAlpha: 1,
            duration: 0.8,
            ease: "power2.out"
        }, 0.1)
        .fromTo(panel, {
            autoAlpha: 0,
            x: 56
        }, {
            autoAlpha: 1,
            x: 0,
            duration: 0.9,
            ease: "power3.out"
        }, 0.18)
        .fromTo(divider, {
            autoAlpha: 0,
            y: 18
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out"
        }, 0.42)
        .fromTo(fields, {
            autoAlpha: 0,
            y: 24
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.58,
            stagger: 0.1,
            ease: "power2.out"
        }, 0.34)
        .fromTo(button, {
            autoAlpha: 0,
            y: 18,
            scale: 0.96
        }, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            ease: "power2.out"
        }, 0.62)
        .fromTo(accent, {
            autoAlpha: 0,
            scale: 0.68,
            rotate: -18
        }, {
            autoAlpha: 0.54,
            scale: 1,
            rotate: 0,
            duration: 0.8,
            ease: "power3.out"
        }, 0.3);

    gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2
        }
    })
        .to(texture, {
            yPercent: -10,
            ease: "none"
        }, 0)
        .to(panel, {
            yPercent: -8,
            ease: "none"
        }, 0)
        .to(accent, {
            rotate: 22,
            yPercent: -20,
            ease: "none"
        }, 0);
};

const initSeoSectionAnimations = () => {
    if (!window.gsap || !window.ScrollTrigger) {
        return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
        return;
    }

    const gsap = window.gsap;
    const sections = [
        {
            root: document.querySelector(".seo-highlights"),
            intro: ".seo-highlights__intro",
            items: ".seo-highlights__card",
            yShift: -8
        },
        {
            root: document.querySelector(".seo-zones"),
            intro: ".seo-zones__copy",
            items: ".seo-zones__item",
            yShift: -10
        },
        {
            root: document.querySelector(".seo-faq"),
            intro: ".seo-faq__intro",
            items: ".seo-faq__item",
            yShift: -6
        },
        {
            root: document.querySelector(".seo-cluster"),
            intro: ".seo-cluster__inner",
            items: ".seo-cluster__link",
            yShift: -5
        }
    ];

    sections.forEach((section) => {
        if (!section.root) {
            return;
        }

        const intro = section.root.querySelector(section.intro);
        const items = section.root.querySelectorAll(section.items);
        section.root.classList.add("is-gsap-ready");

        gsap.timeline({
            scrollTrigger: {
                trigger: section.root,
                start: "top 78%",
                toggleActions: "play none none reverse"
            }
        })
            .fromTo(intro, {
                autoAlpha: 0,
                y: 54,
                clipPath: "inset(0 0 100% 0)"
            }, {
                autoAlpha: 1,
                y: 0,
                clipPath: "inset(0 0 0% 0)",
                duration: 0.95,
                ease: "power3.out"
            })
            .fromTo(items, {
                autoAlpha: 0,
                y: 56,
                x: 24,
                scale: 0.96
            }, {
                autoAlpha: 1,
                y: 0,
                x: 0,
                scale: 1,
                duration: 0.82,
                stagger: 0.1,
                ease: "power3.out"
            }, 0.16);

        gsap.timeline({
            scrollTrigger: {
                trigger: section.root,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.15
            }
        })
            .to(intro, {
                yPercent: section.yShift * 1.4,
                ease: "none"
            }, 0)
            .to(items, {
                yPercent: (_, index) => (index % 2 === 0 ? section.yShift * 1.1 : section.yShift * 1.5),
                xPercent: (_, index) => (index % 2 === 0 ? -1.2 : 1.2),
                ease: "none",
                stagger: 0.02
            }, 0);
    });
};

startBackgroundVideos();
bindDotHover();
bindAnchorScroll();
updateScrollScenes();
initHeroAnimations();
initStoneCarpetAnimations();
initStepsAnimations();
initCraftTeamAnimations();
initContactAnimations();
initSeoSectionAnimations();

window.addEventListener("scroll", updateScrollScenes, { passive: true });
window.addEventListener("resize", updateScrollScenes);
