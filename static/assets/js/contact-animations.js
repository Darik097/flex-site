const contactPageSection = document.querySelector(".contact-map");
const contactFooter = document.querySelector(".site-footer");
const contactMotionAllowed = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (contactPageSection && window.gsap && window.ScrollTrigger && contactMotionAllowed) {
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    const cards = contactPageSection.querySelectorAll(".contact-map__card");
    const divider = contactPageSection.querySelector(".contact-map__divider");
    const mapShell = contactPageSection.querySelector(".contact-map__map-shell");
    const mapOverlay = contactPageSection.querySelector(".contact-map__overlay");

    gsap.timeline({
        scrollTrigger: {
            trigger: contactPageSection,
            start: "top 78%",
            toggleActions: "play none none reverse"
        }
    })
        .fromTo(cards, {
            autoAlpha: 0,
            y: 28
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            stagger: 0.08,
            ease: "power3.out"
        })
        .fromTo(divider, {
            scaleX: 0.18,
            autoAlpha: 0,
            transformOrigin: "left center"
        }, {
            scaleX: 1,
            autoAlpha: 1,
            duration: 0.6,
            ease: "power2.out"
        }, 0.18)
        .fromTo(mapShell, {
            autoAlpha: 0,
            y: 36,
            scale: 0.98
        }, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: "power3.out"
        }, 0.24)
        .fromTo(mapOverlay, {
            autoAlpha: 0.1
        }, {
            autoAlpha: 1,
            duration: 0.7,
            ease: "power2.out"
        }, 0.3);

    if (mapShell) {
        gsap.to(mapShell, {
            yPercent: -4,
            ease: "none",
            scrollTrigger: {
                trigger: mapShell,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.1
            }
        });
    }
}

if (contactFooter && window.gsap && window.ScrollTrigger && contactMotionAllowed) {
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    const brand = contactFooter.querySelector(".site-footer__brand");
    const cols = contactFooter.querySelectorAll(".site-footer__col");
    const bottom = contactFooter.querySelector(".site-footer__bottom");

    gsap.timeline({
        scrollTrigger: {
            trigger: contactFooter,
            start: "top 82%",
            toggleActions: "play none none reverse"
        }
    })
        .fromTo(brand, {
            autoAlpha: 0,
            y: 24
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            ease: "power3.out"
        })
        .fromTo(cols, {
            autoAlpha: 0,
            y: 22
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.66,
            stagger: 0.08,
            ease: "power3.out"
        }, 0.14)
        .fromTo(bottom, {
            autoAlpha: 0,
            y: 14
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.52,
            ease: "power2.out"
        }, 0.28);
}
