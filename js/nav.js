/*
 * Responsive site navigation: switches between a compact popover menu and an
 * inline navigation row based on actual measured fit (no hard-coded breakpoint).
 */
(() => {
    'use strict';

    const header = document.querySelector('.site-header');
    const inner = header?.querySelector('.header-inner');
    const menu = document.getElementById('site-menu');
    const button = header?.querySelector('.menu-button');
    if (!header || !inner || !menu || !button) return;

    const nativePopover = Object.hasOwn(HTMLElement.prototype, 'popover');
    let lastHeaderWidth = 0;

    function isMenuOpen() {
        if (nativePopover) return menu.matches(':popover-open');
        return menu.classList.contains(':popover-open');
    }

    function openMenu() {
        if (nativePopover) {
            menu.showPopover();
        } else {
            menu.classList.add(':popover-open');
            button.setAttribute('aria-expanded', 'true');
        }
    }

    function closeMenu() {
        if (nativePopover) {
            if (menu.matches(':popover-open')) menu.hidePopover();
        } else {
            menu.classList.remove(':popover-open');
            button.setAttribute('aria-expanded', 'false');
        }
    }

    function syncLayout(forceMeasure = false) {
        const currentWidth = header.clientWidth;
        const currentlyWide = header.classList.contains('is-wide');

        if (!currentlyWide && !forceMeasure && currentWidth <= lastHeaderWidth) {
            lastHeaderWidth = currentWidth;
            return;
        }
        lastHeaderWidth = currentWidth;

        const wasOpen = !currentlyWide && isMenuOpen();
        header.classList.add('is-measuring');
        header.classList.add('is-wide');
        menu.removeAttribute('popover');
        menu.classList.remove(':popover-open');

        const fits = inner.scrollWidth <= inner.clientWidth + 1;

        if (fits) {
            button.removeAttribute('aria-expanded');
        } else {
            header.classList.remove('is-wide');
            menu.setAttribute('popover', 'auto');
            if (!nativePopover) button.setAttribute('aria-expanded', 'false');
            if (wasOpen) openMenu();
        }

        requestAnimationFrame(() => {
            header.classList.remove('is-measuring');
        });
    }

    if (!nativePopover) {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            if (isMenuOpen()) closeMenu();
            else openMenu();
        });

        document.addEventListener('click', (event) => {
            if (!header.classList.contains('is-wide') && isMenuOpen() && !menu.contains(event.target) && event.target !== button) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !header.classList.contains('is-wide') && isMenuOpen()) {
                closeMenu();
                button.focus();
            }
        });
    }

    let measureRaf = 0;

    function scheduleSync(forceMeasure = false) {
        if (measureRaf) cancelAnimationFrame(measureRaf);
        measureRaf = requestAnimationFrame(() => {
            measureRaf = 0;
            syncLayout(forceMeasure);
        });
    }

    if (typeof ResizeObserver === 'function') {
        const observer = new ResizeObserver(() => scheduleSync(false));
        observer.observe(header);
    } else {
        window.addEventListener('resize', () => scheduleSync(true));
    }

    document.fonts?.ready?.then(() => syncLayout(true));
    document.addEventListener('nc-lang-change', () => syncLayout(true));
    syncLayout(true);
})();
