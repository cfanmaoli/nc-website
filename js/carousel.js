/*
 * Scroll-snap screenshot carousel with continuous CSS-order looping,
 * marker buttons, rAF-throttled active marker sync, and polite live status updates.
 */
(() => {
    'use strict';

    const carousel = document.querySelector('.carousel');
    const track = carousel?.querySelector('.carousel-track');
    const markersNav = carousel?.querySelector('.carousel-markers');
    const statusEl = carousel?.querySelector('[role="status"]');
    const prevBtn = carousel?.querySelector('button[data-direction="previous"]');
    const nextBtn = carousel?.querySelector('button[data-direction="next"]');

    if (!carousel || !track || !markersNav || !prevBtn || !nextBtn) return;

    const slides = [...track.children];
    const total = slides.length;
    if (total === 0) return;

    const canLoop = total >= 3;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (canLoop && !CSS.supports('order: sibling-count()')) {
        track.style.setProperty('--children-count', String(total));
    }

    // Build marker buttons
    const markers = slides.map((slide, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.dataset.index = String(idx);
        btn.setAttribute('aria-label', slide.dataset.markerName || `Go to slide ${idx + 1}`);
        btn.addEventListener('click', () => goToMarker(idx));
        return btn;
    });
    markersNav.replaceChildren(...markers);

    let activeIndex = 0;
    let settledIndex = 0;
    let pendingTarget = null;
    let scrollRequestedFrom = null;
    let queuedDirection = 0;
    let rafId = 0;
    let settleTimer = 0;
    let parkingUnlockedRaf = 0;

    function isZh() {
        return document.documentElement.getAttribute('data-nc-lang') === 'zh';
    }

    function updateMarkerLabels() {
        const zh = isZh();
        markers.forEach((btn, idx) => {
            const slide = slides[idx];
            const enName = slide.dataset.markerName || `Go to slide ${idx + 1}`;
            const zhName = slide.dataset.zhMarkerName || `切换到第 ${idx + 1} 张截图`;
            btn.setAttribute('aria-label', zh ? zhName : enName);
        });
    }

    function getScrollBehavior() {
        return reducedMotion.matches ? 'instant' : 'smooth';
    }

    function getVisualOrderSlides() {
        return slides
            .map((el, index) => ({
                el,
                index,
                center: el.offsetLeft + el.offsetWidth / 2,
            }))
            .sort((a, b) => a.center - b.center);
    }

    function findNearestSlideIndex() {
        const trackCenter = track.scrollLeft + track.clientWidth / 2;
        let bestIndex = 0;
        let bestDist = Infinity;
        for (let i = 0; i < slides.length; i++) {
            const slideCenter = slides[i].offsetLeft + slides[i].offsetWidth / 2;
            const dist = Math.abs(slideCenter - trackCenter);
            if (dist < bestDist) {
                bestDist = dist;
                bestIndex = i;
            }
        }
        return bestIndex;
    }

    function setActiveMarker(index) {
        if (index === activeIndex && markers[index]?.getAttribute('aria-current') === 'true') return;
        activeIndex = index;
        markers.forEach((btn, i) => {
            if (i === index) btn.setAttribute('aria-current', 'true');
            else btn.removeAttribute('aria-current');
        });
    }

    function scrollToSlide(targetIndex) {
        const slide = slides[targetIndex];
        if (!slide) return;
        const targetCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const trackCenter = track.scrollLeft + track.clientWidth / 2;
        const delta = targetCenter - trackCenter;
        if (Math.abs(delta) < 1) {
            onScrollSettled(true);
            return;
        }
        scrollRequestedFrom = Math.round(track.scrollLeft);
        pendingTarget = targetIndex;
        setActiveMarker(targetIndex);
        track.scrollBy({ left: delta, behavior: getScrollBehavior() });
    }

    function setParking(indexOrNull, lockOverflow) {
        if (!canLoop) return;
        const currentSlide = slides[settledIndex];
        if (!currentSlide) return;

        const beforeLeft = currentSlide.offsetLeft;
        const prevSnap = track.style.scrollSnapType;
        track.style.scrollSnapType = 'none';

        if (lockOverflow) {
            cancelAnimationFrame(parkingUnlockedRaf);
            track.style.overflowX = 'hidden';
        }

        if (indexOrNull === null) {
            track.style.setProperty('--current', 'initial');
        } else {
            track.style.setProperty('--current', String(indexOrNull));
        }

        const afterLeft = currentSlide.offsetLeft;
        const diff = afterLeft - beforeLeft;
        if (diff !== 0) {
            track.scrollBy({ left: diff, behavior: 'instant' });
        }

        track.style.scrollSnapType = prevSnap;

        if (lockOverflow) {
            parkingUnlockedRaf = requestAnimationFrame(() => {
                parkingUnlockedRaf = requestAnimationFrame(() => {
                    track.style.overflowX = '';
                });
            });
        }
    }

    function step(direction) {
        const baseIndex = pendingTarget !== null ? pendingTarget : findNearestSlideIndex();
        const visual = getVisualOrderSlides();
        const pos = visual.findIndex((item) => item.index === baseIndex);
        const nextPos = pos + direction;

        if (nextPos >= 0 && nextPos < visual.length) {
            scrollToSlide(visual[nextPos].index);
        } else if (canLoop) {
            // Slides are currently in DOM order during a marker trip; replay after settle
            queuedDirection = direction;
        }
    }

    function goToMarker(targetIndex) {
        if (targetIndex === activeIndex && pendingTarget === null) return;
        if (canLoop) {
            // Return slides to DOM order so markers travel in sequence order
            settledIndex = findNearestSlideIndex();
            setParking(null, false);
        }
        scrollToSlide(targetIndex);
    }

    function announceSlide(index) {
        if (!statusEl) return;
        const slide = slides[index];
        const caption = slide?.querySelector('figcaption')?.textContent?.trim() ?? '';
        const text = isZh()
            ? `第 ${index + 1} 张，共 ${total} 张${caption ? `：${caption}` : ''}`
            : `Slide ${index + 1} of ${total}${caption ? `: ${caption}` : ''}`;
        statusEl.textContent = text;
    }

    function onScrollSettled(userInitiated) {
        // Ignore a stale settle at the exact position from which a new scroll was just requested
        if (
            pendingTarget !== null &&
            scrollRequestedFrom !== null &&
            Math.abs(Math.round(track.scrollLeft) - scrollRequestedFrom) <= 1 &&
            findNearestSlideIndex() !== pendingTarget
        ) {
            return;
        }

        const nearest = findNearestSlideIndex();
        const changed = nearest !== settledIndex;
        settledIndex = nearest;
        pendingTarget = null;
        scrollRequestedFrom = null;

        setActiveMarker(nearest);

        const hasQueued = queuedDirection !== 0;
        setParking(nearest, !hasQueued);

        if (userInitiated && changed) {
            announceSlide(nearest);
        }

        if (hasQueued) {
            const dir = queuedDirection;
            queuedDirection = 0;
            step(dir);
        }
    }

    prevBtn.addEventListener('click', () => step(-1));
    nextBtn.addEventListener('click', () => step(1));

    // Active marker sync on direct scroll (skipped while a click-initiated smooth scroll is in flight)
    track.addEventListener(
        'scroll',
        () => {
            if (pendingTarget === null && !rafId) {
                rafId = requestAnimationFrame(() => {
                    rafId = 0;
                    setActiveMarker(findNearestSlideIndex());
                });
            }

            if (!('onscrollend' in window)) {
                clearTimeout(settleTimer);
                settleTimer = window.setTimeout(() => onScrollSettled(true), 120);
            }
        },
        { passive: true },
    );

    if ('onscrollend' in window) {
        track.addEventListener('scrollend', () => onScrollSettled(true));
    }

    document.addEventListener('nc-lang-change', updateMarkerLabels);

    // Initial silent sync
    updateMarkerLabels();
    setActiveMarker(0);
    if (canLoop) {
        setParking(0, false);
    }
})();
