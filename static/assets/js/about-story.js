const aboutStory = document.querySelector(".about-story");
const aboutFooter = document.querySelector(".site-footer");
const hasMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const observeRevealItems = (items, visibleClass = "is-visible") => {
    if (!items.length) {
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add(visibleClass);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.14 });

    items.forEach((item, index) => {
        item.style.transitionDelay = `${index * 120}ms`;
        observer.observe(item);
    });
};

if (aboutStory && window.gsap && window.ScrollTrigger && hasMotion) {
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    const top = aboutStory.querySelector(".about-story__top");
    const copy = aboutStory.querySelector(".about-story__copy");
    const visual = aboutStory.querySelector(".about-story__visual");
    const image = aboutStory.querySelector(".about-story__visual img");
    const bottom = aboutStory.querySelector(".about-story__bottom");

    aboutStory.classList.add("is-gsap-ready");

    gsap.timeline({
        scrollTrigger: {
            trigger: aboutStory,
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
} else if (aboutStory) {
    observeRevealItems(Array.from(aboutStory.querySelectorAll(".reveal-story")));
}

if (aboutFooter && window.gsap && window.ScrollTrigger && hasMotion) {
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    const footerBrand = aboutFooter.querySelector(".site-footer__brand");
    const footerCols = aboutFooter.querySelectorAll(".site-footer__col");
    const footerBottom = aboutFooter.querySelector(".site-footer__bottom");

    gsap.timeline({
        scrollTrigger: {
            trigger: aboutFooter,
            start: "top 78%",
            toggleActions: "play none none reverse"
        }
    })
        .fromTo(footerBrand, {
            autoAlpha: 0,
            y: 28
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            ease: "power3.out"
        })
        .fromTo(footerCols, {
            autoAlpha: 0,
            y: 24
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: "power3.out"
        }, 0.12)
        .fromTo(footerBottom, {
            autoAlpha: 0,
            y: 16
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out"
        }, 0.32);
}
