const technologyContact = document.querySelector(".technology-contact");
const technologyFooter = document.querySelector(".site-footer");
const technologyMotionAllowed = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (technologyContact && window.gsap && window.ScrollTrigger && technologyMotionAllowed) {
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    const cards = technologyContact.querySelectorAll(".technology-contact__card");
    const divider = technologyContact.querySelector(".technology-contact__divider");

    gsap.timeline({
        scrollTrigger: {
            trigger: technologyContact,
            start: "top 82%",
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
            autoAlpha: 0,
            scaleX: 0.22,
            transformOrigin: "left center"
        }, {
            autoAlpha: 1,
            scaleX: 1,
            duration: 0.58,
            ease: "power2.out"
        }, 0.2);
}

if (technologyFooter && window.gsap && window.ScrollTrigger && technologyMotionAllowed) {
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    const brand = technologyFooter.querySelector(".site-footer__brand");
    const cols = technologyFooter.querySelectorAll(".site-footer__col");
    const bottom = technologyFooter.querySelector(".site-footer__bottom");

    gsap.timeline({
        scrollTrigger: {
            trigger: technologyFooter,
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
