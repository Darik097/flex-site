const techLightbox = document.querySelector("[data-tech-lightbox]");
const techLightboxImage = techLightbox?.querySelector("[data-tech-lightbox-image]");
const technologySteps = document.querySelector(".technology-steps");
const techMotionAllowed = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (technologySteps && window.gsap && window.ScrollTrigger && techMotionAllowed) {
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    const cards = technologySteps.querySelectorAll("[data-step-card]");
    const images = technologySteps.querySelectorAll(".technology-step-card__button img");

    gsap.timeline({
        scrollTrigger: {
            trigger: technologySteps,
            start: "top 82%",
            toggleActions: "play none none reverse"
        }
    })
        .fromTo(cards, {
            autoAlpha: 0,
            y: 34
        }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.78,
            stagger: 0.08,
            ease: "power3.out"
        });

    images.forEach((image, index) => {
        gsap.fromTo(image, {
            scale: 1.12
        }, {
            scale: 1.02 + (index * 0.01),
            ease: "none",
            scrollTrigger: {
                trigger: image,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.1
            }
        });
    });
}

document.querySelectorAll("[data-step-card] .technology-step-card__button").forEach((button) => {
    button.addEventListener("click", () => {
        if (!techLightbox || !techLightboxImage) {
            return;
        }

        const image = button.querySelector("img");

        if (!image) {
            return;
        }

        techLightboxImage.src = image.src;
        techLightboxImage.alt = image.alt;
        techLightbox.hidden = false;
        document.body.classList.add("is-tech-lightbox-open");
    });
});

techLightbox?.querySelectorAll("[data-tech-lightbox-close]").forEach((button) => {
    button.addEventListener("click", () => {
        techLightbox.hidden = true;
        document.body.classList.remove("is-tech-lightbox-open");
    });
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && techLightbox && !techLightbox.hidden) {
        techLightbox.hidden = true;
        document.body.classList.remove("is-tech-lightbox-open");
    }
});
