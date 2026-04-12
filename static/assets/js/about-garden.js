const gardenSection = document.querySelector(".about-garden");

if (gardenSection && window.gsap && window.ScrollTrigger && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    const headerItems = gardenSection.querySelectorAll(".reveal-garden");
    const visual = gardenSection.querySelector(".about-garden__visual");
    const image = gardenSection.querySelector(".about-garden__visual img");

    gsap.timeline({
        scrollTrigger: {
            trigger: gardenSection,
            start: "top 78%",
            toggleActions: "play none none reverse"
        }
    })
        .fromTo(headerItems, {
            autoAlpha: 0,
            y: 46
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.14,
            ease: "power3.out"
        })
        .fromTo(visual, {
            autoAlpha: 0,
            y: 58,
            scale: 0.98
        }, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1.05,
            ease: "power3.out"
        }, 0.18);

    if (image) {
        gsap.to(image, {
            yPercent: -8,
            scale: 1.06,
            ease: "none",
            scrollTrigger: {
                trigger: visual,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.2
            }
        });
    }
} else if (gardenSection) {
    const items = gardenSection.querySelectorAll(".reveal-garden");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.14 });

    items.forEach((item, index) => {
        item.style.transitionDelay = `${index * 120}ms`;
        observer.observe(item);
    });
}
