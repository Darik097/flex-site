const projectAccordions = Array.from(document.querySelectorAll("[data-project]"));
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = lightbox?.querySelector("[data-lightbox-image]");
const lightboxCaption = lightbox?.querySelector("[data-lightbox-caption]");
const closeButtons = lightbox ? Array.from(lightbox.querySelectorAll("[data-lightbox-close]")) : [];
const prevButton = lightbox?.querySelector("[data-lightbox-prev]");
const nextButton = lightbox?.querySelector("[data-lightbox-next]");

let currentGallery = [];
let currentIndex = 0;

const hasGsap = Boolean(window.gsap && window.ScrollTrigger);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (hasGsap) {
    window.gsap.registerPlugin(window.ScrollTrigger);
}

const initCatalogPageAnimations = () => {
    if (!hasGsap || prefersReducedMotion) {
        return;
    }

    const gsap = window.gsap;
    const hero = document.querySelector(".about-hero");
    const stats = document.querySelector(".about-stats");
    const catalogProjects = document.querySelector(".catalog-projects");
    const beforeAfterShowcase = document.querySelector(".before-after-showcase");
    const story = document.querySelector(".about-story");

    if (hero) {
        const video = hero.querySelector(".about-hero__video");
        const overlay = hero.querySelector(".about-hero__overlay");
        const mist = hero.querySelector(".about-hero__mist");
        const eyebrow = hero.querySelector(".catalog-hero__eyebrow");
        const title = hero.querySelector(".about-hero__title");
        const underline = hero.querySelector(".about-hero__underline");
        const orbs = hero.querySelectorAll(".about-hero__orb");

        hero.classList.add("is-gsap-ready");

        gsap.timeline({
            defaults: { ease: "power3.out" }
        })
            .fromTo(video, {
                scale: 1.18,
                filter: "brightness(0.54) saturate(0.74)"
            }, {
                scale: 1,
                filter: "brightness(1) saturate(1)",
                duration: 1.8
            })
            .fromTo([mist, ...orbs], {
                autoAlpha: 0,
                scale: 0.84
            }, {
                autoAlpha: 1,
                scale: 1,
                duration: 1.2,
                stagger: 0.12
            }, 0.18)
            .fromTo(eyebrow, {
                autoAlpha: 0,
                y: 18
            }, {
                autoAlpha: 1,
                y: 0,
                duration: 0.6
            }, 0.28)
            .fromTo(title, {
                autoAlpha: 0,
                yPercent: 110,
                rotateX: -22,
                transformOrigin: "50% 100%"
            }, {
                autoAlpha: 1,
                yPercent: 0,
                rotateX: 0,
                duration: 1
            }, 0.36)
            .fromTo(underline, {
                autoAlpha: 0,
                scaleX: 0.2,
                transformOrigin: "left center"
            }, {
                autoAlpha: 1,
                scaleX: 1,
                duration: 0.85
            }, 0.54);

        gsap.timeline({
            scrollTrigger: {
                trigger: hero,
                start: "top top",
                end: "bottom top",
                scrub: 1.1
            }
        })
            .to(video, {
                yPercent: 10,
                scale: 1.12,
                ease: "none"
            }, 0)
            .to(overlay, {
                opacity: 0.86,
                ease: "none"
            }, 0)
            .to(".about-hero__content", {
                yPercent: -14,
                ease: "none"
            }, 0);
    }

    if (stats) {
        const items = stats.querySelectorAll(".about-stats__item");
        const values = stats.querySelectorAll(".about-stats__value");
        stats.classList.add("is-gsap-ready");

        gsap.timeline({
            scrollTrigger: {
                trigger: stats,
                start: "top 78%",
                toggleActions: "play none none reverse"
            }
        }).fromTo(items, {
            autoAlpha: 0,
            y: 36
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out"
        });

        values.forEach((value) => {
            const finalText = value.textContent.trim();
            const numeric = Number.parseInt(finalText.replace(/[^\d]/g, ""), 10);

            if (Number.isNaN(numeric)) {
                return;
            }

            const suffix = finalText.replace(String(numeric), "");
            const counter = { value: 0 };

            gsap.to(counter, {
                value: numeric,
                duration: 1.4,
                ease: "power2.out",
                snap: { value: 1 },
                scrollTrigger: {
                    trigger: value,
                    start: "top 82%",
                    once: true
                },
                onUpdate: () => {
                    value.textContent = `${counter.value}${suffix}`;
                }
            });
        });
    }

    if (catalogProjects) {
        const heading = catalogProjects.querySelector(".catalog-projects__heading");
        const accordions = catalogProjects.querySelectorAll(".project-accordion");
        catalogProjects.classList.add("is-gsap-ready");

        gsap.timeline({
            scrollTrigger: {
                trigger: heading,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        })
            .fromTo(heading, {
                autoAlpha: 0,
                y: 42
            }, {
                autoAlpha: 1,
                y: 0,
                duration: 0.9,
                ease: "power3.out"
            })
            .fromTo(heading.querySelectorAll(".tone-light, .tone-accent"), {
                autoAlpha: 0,
                yPercent: 70
            }, {
                autoAlpha: 1,
                yPercent: 0,
                duration: 0.85,
                stagger: 0.1,
                ease: "power3.out"
            }, 0.08);

        accordions.forEach((accordion, index) => {
            const mediaImage = accordion.querySelector(".project-accordion__media img");
            const metric = accordion.querySelector(".project-accordion__metric");
            const copy = accordion.querySelector(".project-accordion__copy");
            const action = accordion.querySelector(".project-accordion__action");
            const fromX = index % 2 === 0 ? -72 : 72;

            gsap.timeline({
                scrollTrigger: {
                    trigger: accordion,
                    start: "top 82%",
                    toggleActions: "play none none reverse"
                }
            })
                .fromTo(accordion, {
                    autoAlpha: 0,
                    x: fromX
                }, {
                    autoAlpha: 1,
                    x: 0,
                    duration: 0.95,
                    ease: "power3.out"
                })
                .fromTo([metric, copy, action], {
                    autoAlpha: 0,
                    y: 24
                }, {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.7,
                    stagger: 0.08,
                    ease: "power2.out"
                }, 0.14);

            if (mediaImage) {
                gsap.to(mediaImage, {
                    yPercent: -10,
                    scale: 1.06,
                    ease: "none",
                    scrollTrigger: {
                        trigger: accordion,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1.2
                    }
                });
            }
        });
    }

    if (beforeAfterShowcase) {
        const heading = beforeAfterShowcase.querySelector(".before-after-showcase__heading");
        const cards = beforeAfterShowcase.querySelectorAll(".before-after-card");

        gsap.timeline({
            scrollTrigger: {
                trigger: beforeAfterShowcase,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        })
            .fromTo(heading, {
                autoAlpha: 0,
                y: 36
            }, {
                autoAlpha: 1,
                y: 0,
                duration: 0.82,
                ease: "power3.out"
            })
            .fromTo(cards, {
                autoAlpha: 0,
                y: 28
            }, {
                autoAlpha: 1,
                y: 0,
                duration: 0.76,
                stagger: 0.08,
                ease: "power3.out"
            }, 0.12);
    }

    if (story) {
        story.classList.add("is-gsap-ready");
        const top = story.querySelector(".about-story__top");
        const copy = story.querySelector(".about-story__copy");
        const visual = story.querySelector(".about-story__visual");
        const image = story.querySelector(".about-story__visual img");
        const bottom = story.querySelector(".about-story__bottom");

        gsap.timeline({
            scrollTrigger: {
                trigger: story,
                start: "top 76%",
                toggleActions: "play none none reverse"
            }
        })
            .fromTo([top, copy, visual, bottom], {
                autoAlpha: 0,
                y: 34
            }, {
                autoAlpha: 1,
                y: 0,
                duration: 0.82,
                stagger: 0.1,
                ease: "power3.out"
            });

        if (image) {
            gsap.to(image, {
                scale: 1.08,
                yPercent: -8,
                ease: "none",
                scrollTrigger: {
                    trigger: visual,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1.1
                }
            });
        }
    }
};

const setAccordionState = (accordion, isOpen) => {
    const panel = accordion.querySelector(".project-accordion__panel");
    const summary = accordion.querySelector(".project-accordion__summary");
    const galleryItems = panel ? Array.from(panel.querySelectorAll(".project-gallery__item")) : [];

    if (!panel || !summary) {
        return;
    }

    accordion.classList.toggle("is-open", isOpen);
    panel.classList.toggle("is-open", isOpen);
    summary.setAttribute("aria-expanded", String(isOpen));

    if (!hasGsap || prefersReducedMotion) {
        if (isOpen) {
            panel.hidden = false;
            panel.style.height = "auto";
            const targetHeight = panel.scrollHeight;
            panel.style.height = "0px";

            requestAnimationFrame(() => {
                panel.style.height = `${targetHeight}px`;
            });
            return;
        }

        panel.style.height = `${panel.scrollHeight}px`;
        requestAnimationFrame(() => {
            panel.style.height = "0px";
        });
        return;
    }

    const gsap = window.gsap;
    panel.style.transition = "none";
    gsap.killTweensOf(panel);
    gsap.killTweensOf(galleryItems);

    if (isOpen) {
        panel.hidden = false;
        panel.style.height = "auto";
        const targetHeight = panel.offsetHeight;
        panel.style.height = "0px";

        gsap.timeline()
            .to(panel, {
                height: targetHeight,
                duration: 0.7,
                ease: "power3.inOut",
                onComplete: () => {
                    panel.style.height = "auto";
                }
            })
            .fromTo(galleryItems, {
                autoAlpha: 0,
                y: 22
            }, {
                autoAlpha: 1,
                y: 0,
                duration: 0.45,
                stagger: 0.06,
                ease: "power2.out"
            }, 0.16);
        return;
    }

    gsap.timeline({
        onComplete: () => {
            panel.hidden = true;
        }
    })
        .to(galleryItems, {
            autoAlpha: 0,
            y: 14,
            duration: 0.2,
            stagger: 0.02,
            ease: "power1.in"
        })
        .to(panel, {
            height: 0,
            duration: 0.55,
            ease: "power3.inOut"
        }, 0.04);
};

projectAccordions.forEach((accordion) => {
    const summary = accordion.querySelector(".project-accordion__summary");
    const panel = accordion.querySelector(".project-accordion__panel");

    if (!summary || !panel) {
        return;
    }

    if (!hasGsap || prefersReducedMotion) {
        panel.addEventListener("transitionend", (event) => {
            if (event.propertyName !== "height") {
                return;
            }

            if (accordion.classList.contains("is-open")) {
                panel.style.height = "auto";
            } else {
                panel.hidden = true;
            }
        });
    } else {
        panel.style.transition = "none";
    }

    if (panel.classList.contains("is-open")) {
        accordion.classList.add("is-open");
        panel.style.height = "auto";
    } else {
        panel.style.height = "0px";
    }

    summary.addEventListener("click", () => {
        const isOpen = accordion.classList.contains("is-open");
        setAccordionState(accordion, !isOpen);
    });
});

document.querySelectorAll("[data-before-after]").forEach((compare) => {
    const range = compare.querySelector("[data-before-after-range]");
    const overlay = compare.querySelector("[data-before-after-overlay]");
    const divider = compare.querySelector("[data-before-after-divider]");

    if (!range || !overlay || !divider) {
        return;
    }

    const syncCompare = () => {
        const value = `${range.value}%`;
        overlay.style.width = value;
        divider.style.left = value;
    };

    const setCompareFromClientX = (clientX) => {
        const rect = compare.getBoundingClientRect();
        const position = ((clientX - rect.left) / rect.width) * 100;
        range.value = Math.min(100, Math.max(0, position)).toFixed(2);
        syncCompare();
    };

    const setCompareFromPointer = (event) => {
        setCompareFromClientX(event.clientX);
    };

    const setCompareFromTouch = (event) => {
        const touch = event.touches[0] || event.changedTouches[0];

        if (!touch) {
            return;
        }

        event.preventDefault();
        setCompareFromClientX(touch.clientX);
    };

    let isMouseDragging = false;

    range.addEventListener("input", syncCompare);
    compare.addEventListener("pointerdown", (event) => {
        setCompareFromPointer(event);
        if (compare.setPointerCapture) {
            compare.setPointerCapture(event.pointerId);
        }
    });
    compare.addEventListener("pointermove", (event) => {
        if (compare.hasPointerCapture && !compare.hasPointerCapture(event.pointerId)) {
            return;
        }

        setCompareFromPointer(event);
    });
    compare.addEventListener("pointerup", (event) => {
        if (compare.hasPointerCapture && compare.hasPointerCapture(event.pointerId)) {
            compare.releasePointerCapture(event.pointerId);
        }
    });
    compare.addEventListener("pointercancel", (event) => {
        if (compare.hasPointerCapture && compare.hasPointerCapture(event.pointerId)) {
            compare.releasePointerCapture(event.pointerId);
        }
    });
    compare.addEventListener("touchstart", setCompareFromTouch, { passive: false });
    compare.addEventListener("touchmove", setCompareFromTouch, { passive: false });
    compare.addEventListener("click", setCompareFromPointer);
    compare.addEventListener("mousedown", (event) => {
        isMouseDragging = true;
        setCompareFromPointer(event);
    });
    window.addEventListener("mousemove", (event) => {
        if (!isMouseDragging) {
            return;
        }

        setCompareFromPointer(event);
    });
    window.addEventListener("mouseup", () => {
        isMouseDragging = false;
    });
    syncCompare();
});

const renderLightbox = () => {
    if (!lightboxImage || !currentGallery.length) {
        return;
    }

    const image = currentGallery[currentIndex];
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;

    if (lightboxCaption) {
        lightboxCaption.textContent = image.alt || "";
    }
};

const animateLightboxOpen = () => {
    if (!lightbox || !hasGsap || prefersReducedMotion) {
        return;
    }

    const gsap = window.gsap;
    const backdrop = lightbox.querySelector(".project-lightbox__backdrop");
    const dialog = lightbox.querySelector(".project-lightbox__dialog");

    gsap.fromTo(backdrop, {
        autoAlpha: 0
    }, {
        autoAlpha: 1,
        duration: 0.25,
        ease: "power2.out"
    });

    gsap.fromTo(dialog, {
        autoAlpha: 0,
        y: 28,
        scale: 0.98
    }, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.36,
        ease: "power3.out"
    });
};

const openLightbox = (gallery, index) => {
    if (!lightbox) {
        return;
    }

    currentGallery = gallery;
    currentIndex = index;
    renderLightbox();
    lightbox.hidden = false;
    document.body.classList.add("is-lightbox-open");
    animateLightboxOpen();
};

const closeLightbox = () => {
    if (!lightbox) {
        return;
    }

    if (!hasGsap || prefersReducedMotion) {
        lightbox.hidden = true;
        document.body.classList.remove("is-lightbox-open");
        return;
    }

    const gsap = window.gsap;
    const backdrop = lightbox.querySelector(".project-lightbox__backdrop");
    const dialog = lightbox.querySelector(".project-lightbox__dialog");

    gsap.timeline({
        onComplete: () => {
            lightbox.hidden = true;
            document.body.classList.remove("is-lightbox-open");
        }
    })
        .to(dialog, {
            autoAlpha: 0,
            y: 18,
            scale: 0.985,
            duration: 0.22,
            ease: "power2.in"
        })
        .to(backdrop, {
            autoAlpha: 0,
            duration: 0.18,
            ease: "power2.in"
        }, 0);
};

const shiftLightbox = (direction) => {
    if (!currentGallery.length) {
        return;
    }

    currentIndex = (currentIndex + direction + currentGallery.length) % currentGallery.length;
    renderLightbox();
};

document.querySelectorAll("[data-gallery]").forEach((galleryElement) => {
    const items = Array.from(galleryElement.querySelectorAll(".project-gallery__item"));
    const gallery = items.map((item) => ({
        src: item.dataset.imageSrc,
        alt: item.dataset.imageAlt || "",
    }));

    items.forEach((item, index) => {
        item.addEventListener("click", () => {
            openLightbox(gallery, index);
        });
    });
});

closeButtons.forEach((button) => {
    button.addEventListener("click", closeLightbox);
});

prevButton?.addEventListener("click", () => shiftLightbox(-1));
nextButton?.addEventListener("click", () => shiftLightbox(1));

document.addEventListener("keydown", (event) => {
    if (!lightbox || lightbox.hidden) {
        return;
    }

    if (event.key === "Escape") {
        closeLightbox();
    }

    if (event.key === "ArrowLeft") {
        shiftLightbox(-1);
    }

    if (event.key === "ArrowRight") {
        shiftLightbox(1);
    }
});

initCatalogPageAnimations();
