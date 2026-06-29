const aboutHero = document.querySelector(".about-hero");
const aboutHeroHeadline = document.querySelector(".about-hero__headline");
const aboutHeroVideo = aboutHero ? aboutHero.querySelector(".about-hero__video") : null;

if (aboutHeroVideo) {
    aboutHeroVideo.muted = true;
    aboutHeroVideo.defaultMuted = true;
    aboutHeroVideo.playsInline = true;

    const markAboutHeroVideoPlaying = () => {
        if (!aboutHeroVideo.paused && !aboutHeroVideo.ended) {
            aboutHeroVideo.classList.add("is-playing");
        }
    };

    const markAboutHeroVideoStopped = () => {
        aboutHeroVideo.classList.remove("is-playing");
    };

    aboutHeroVideo.addEventListener("playing", markAboutHeroVideoPlaying);
    aboutHeroVideo.addEventListener("timeupdate", markAboutHeroVideoPlaying, { once: true });
    aboutHeroVideo.addEventListener("pause", markAboutHeroVideoStopped);
    aboutHeroVideo.addEventListener("error", markAboutHeroVideoStopped);

    const playAttempt = aboutHeroVideo.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.then(markAboutHeroVideoPlaying).catch(markAboutHeroVideoStopped);
    }
}

if (aboutHero && aboutHeroHeadline && window.gsap && window.ScrollTrigger && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    const video = aboutHeroVideo;
    const overlay = aboutHero.querySelector(".about-hero__overlay");
    const mist = aboutHero.querySelector(".about-hero__mist");
    const title = aboutHero.querySelector(".about-hero__title");
    const underline = aboutHero.querySelector(".about-hero__underline");
    const orbs = aboutHero.querySelectorAll(".about-hero__orb");

    gsap.registerPlugin(ScrollTrigger);
    aboutHero.classList.add("is-gsap-ready");

    gsap.timeline({
        defaults: { ease: "power3.out" }
    })
        .set(aboutHeroHeadline, {
            autoAlpha: 1,
            y: 0
        })
        .fromTo(video, {
            scale: 1.16,
            filter: "saturate(0.62) brightness(0.4) contrast(0.9)"
        }, {
            scale: 1.04,
            filter: "saturate(0.72) brightness(0.58) contrast(0.96)",
            duration: 1.7
        })
        .fromTo([mist, ...orbs], {
            autoAlpha: 0,
            scale: 0.82
        }, {
            autoAlpha: 1,
            scale: 1,
            duration: 1,
            stagger: 0.12
        }, 0.14)
        .fromTo(title, {
            autoAlpha: 0,
            yPercent: 90,
            rotateX: -18,
            transformOrigin: "50% 100%"
        }, {
            autoAlpha: 1,
            yPercent: 0,
            rotateX: 0,
            duration: 0.95
        }, 0.28)
        .fromTo(underline, {
            autoAlpha: 0,
            scaleX: 0.3,
            transformOrigin: "left center"
        }, {
            autoAlpha: 1,
            scaleX: 1,
            duration: 0.7
        }, 0.54);

    gsap.timeline({
        scrollTrigger: {
            trigger: aboutHero,
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
            yPercent: -12,
            ease: "none"
        }, 0);
} else if (aboutHeroHeadline) {
    requestAnimationFrame(() => {
        aboutHeroHeadline.classList.add("is-visible");
    });
}
