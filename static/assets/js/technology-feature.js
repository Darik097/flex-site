const technologyFeature = document.querySelector(".technology-feature");

if (technologyFeature && window.gsap && window.ScrollTrigger && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    const copy = technologyFeature.querySelector(".technology-feature__copy");
    const visual = technologyFeature.querySelector(".technology-feature__visual");
    const ring = technologyFeature.querySelector(".technology-feature__ring");
    const photos = technologyFeature.querySelectorAll(".technology-feature__photo");
    const images = technologyFeature.querySelectorAll(".technology-feature__photo img");

    gsap.timeline({
        scrollTrigger: {
            trigger: technologyFeature,
            start: "top 78%",
            toggleActions: "play none none reverse"
        }
    })
        .fromTo(copy, {
            autoAlpha: 0,
            x: -28
        }, {
            autoAlpha: 1,
            x: 0,
            duration: 0.82,
            ease: "power3.out"
        })
        .fromTo(ring, {
            autoAlpha: 0,
            scale: 0.82,
            rotate: -10
        }, {
            autoAlpha: 1,
            scale: 1,
            rotate: 0,
            duration: 0.8,
            ease: "power3.out"
        }, 0.12)
        .fromTo(photos, {
            autoAlpha: 0,
            y: 36,
            scale: 0.96
        }, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.86,
            stagger: 0.1,
            ease: "power3.out"
        }, 0.18)
        .fromTo(visual, {
            autoAlpha: 0
        }, {
            autoAlpha: 1,
            duration: 0.3
        }, 0);

    images.forEach((image, index) => {
        gsap.to(image, {
            yPercent: index === 0 ? -8 : -10,
            scale: 1.06,
            ease: "none",
            scrollTrigger: {
                trigger: technologyFeature,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.1
            }
        });
    });
} else if (technologyFeature) {
    const technologyReveals = technologyFeature.querySelectorAll(".reveal-technology");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.16 });

    technologyReveals.forEach((element, index) => {
        element.style.transitionDelay = `${index * 120}ms`;
        observer.observe(element);
    });
}
