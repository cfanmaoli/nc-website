/*
 * Fills every .nc_release_version element with the tag of the latest GitHub release.
 * The HTML keeps a static fallback so the page still works when the API is unavailable,
 * rate-limited or blocked; a failed request simply leaves the fallback in place.
 */
(() => {
    'use strict';

    const API = 'https://api.github.com/repos/cfanmaoli/nimble-commander/releases/latest';

    function apply(version) {
        for (const node of document.querySelectorAll('.nc_release_version')) {
            node.textContent = version;
        }
    }

    async function request() {
        if (!document.querySelector('.nc_release_version')) return;
        if (typeof window.fetch !== 'function') return;

        const options = {
            headers: { Accept: 'application/vnd.github+json' },
            cache: 'no-store',
        };
        if (typeof AbortSignal?.timeout === 'function') {
            options.signal = AbortSignal.timeout(8000);
        }

        try {
            const response = await window.fetch(API, options);
            if (!response.ok) return;
            const release = await response.json();
            const version = String(release?.tag_name ?? '').replace(/^v/i, '');
            if (/^[0-9][0-9A-Za-z.+-]*$/.test(version)) apply(version);
        } catch {
            /* keep the static fallback */
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', request, { once: true });
    } else {
        request();
    }
})();
