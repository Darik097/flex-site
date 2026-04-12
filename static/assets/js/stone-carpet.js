const stoneSection = document.querySelector(".stone-carpet");

if (stoneSection) {
    const revealItems = stoneSection.querySelectorAll(".reveal");
    const viewport = stoneSection.querySelector("[data-stone-viewport]");
    const gallery = stoneSection.querySelector("[data-stone-gallery]");

    if (viewport && gallery) {
        const originals = Array.from(gallery.querySelectorAll(".stone-swatch"));
        const cloneGroup = (items, suffix) => items.map((item, index) => {
            const clone = item.cloneNode(true);
            clone.dataset.clone = suffix;
            clone.dataset.cloneIndex = String(index);
            return clone;
        });

        const prependClones = cloneGroup(originals, "prepend");
        const appendClones = cloneGroup(originals, "append");

        prependClones.reverse().forEach((clone) => {
            gallery.prepend(clone);
        });

        appendClones.forEach((clone) => {
            gallery.append(clone);
        });

        const items = Array.from(gallery.querySelectorAll(".stone-swatch"));
        const middleStart = originals.length;
        let lockWrap = false;

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.18 });

        revealItems.forEach((item, index) => {
            item.style.transitionDelay = `${index * 120}ms`;
            revealObserver.observe(item);
        });

        const itemOffsetForCenter = (item) => item.offsetLeft - (viewport.clientWidth - item.clientWidth) / 2;

        const jumpToMiddleCopyIfNeeded = () => {
            if (lockWrap) {
                return;
            }

            const currentItems = Array.from(gallery.querySelectorAll(".stone-swatch"));
            const itemWidth = currentItems[0]?.offsetWidth || 0;
            const gap = Number.parseFloat(getComputedStyle(gallery).gap) || 0;
            const loopSpan = (itemWidth + gap) * originals.length;

            if (!loopSpan) {
                return;
            }

            lockWrap = true;

            if (viewport.scrollLeft < loopSpan * 0.5) {
                viewport.scrollLeft += loopSpan;
            } else if (viewport.scrollLeft > loopSpan * 1.5) {
                viewport.scrollLeft -= loopSpan;
            }

            lockWrap = false;
        };

        const setActiveCenter = () => {
            const viewportRect = viewport.getBoundingClientRect();
            const viewportCenter = viewportRect.left + viewportRect.width / 2;
            let nearestItem = items[0];
            let nearestDistance = Infinity;

            items.forEach((item) => {
                const rect = item.getBoundingClientRect();
                const center = rect.left + rect.width / 2;
                const distance = Math.abs(viewportCenter - center);

                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestItem = item;
                }
            });

            items.forEach((item) => {
                item.classList.toggle("is-center", item === nearestItem);
            });
        };

        const centerInitialItem = () => {
            const middleItem = items[middleStart + 2] || items[middleStart] || items[0];

            if (!middleItem) {
                return;
            }

            viewport.scrollLeft = Math.max(0, itemOffsetForCenter(middleItem));
            setActiveCenter();
        };

        let isPointerDown = false;
        let startX = 0;
        let startScrollLeft = 0;

        viewport.addEventListener("pointerdown", (event) => {
            isPointerDown = true;
            startX = event.clientX;
            startScrollLeft = viewport.scrollLeft;
            viewport.setPointerCapture(event.pointerId);
        });

        viewport.addEventListener("pointermove", (event) => {
            if (!isPointerDown) {
                return;
            }

            const delta = event.clientX - startX;
            viewport.scrollLeft = startScrollLeft - delta;
        });

        const stopDragging = () => {
            isPointerDown = false;
        };

        viewport.addEventListener("pointerup", stopDragging);
        viewport.addEventListener("pointercancel", stopDragging);

        viewport.addEventListener("scroll", () => {
            jumpToMiddleCopyIfNeeded();
            setActiveCenter();
        }, { passive: true });

        viewport.addEventListener("wheel", (event) => {
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
                return;
            }

            event.preventDefault();
            viewport.scrollLeft += event.deltaY;
        }, { passive: false });

        window.addEventListener("resize", centerInitialItem);
        window.addEventListener("load", centerInitialItem);
        centerInitialItem();
    }
}
