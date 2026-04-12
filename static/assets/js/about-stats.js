const aboutStats = document.querySelector(".about-stats");

if (aboutStats && window.gsap && window.ScrollTrigger && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    const items = aboutStats.querySelectorAll(".reveal-stats");
    const values = aboutStats.querySelectorAll(".about-stats__value");

    gsap.timeline({
        scrollTrigger: {
            trigger: aboutStats,
            start: "top 78%",
            toggleActions: "play none none reverse"
        }
    })
        .fromTo(items, {
            autoAlpha: 0,
            y: 34
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: "power3.out"
        })
        .fromTo(values, {
            filter: "blur(10px)"
        }, {
            filter: "blur(0px)",
            duration: 0.7,
            stagger: 0.06,
            ease: "power2.out"
        }, 0.05);
} else if (aboutStats) {
    const items = aboutStats.querySelectorAll(".reveal-stats");

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
        item.style.transitionDelay = `${index * 100}ms`;
        observer.observe(item);
    });
}
