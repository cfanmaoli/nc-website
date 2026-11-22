/*
 * Fills every .nc_release_version element with the tag of the latest GitHub release.
 * The HTML keeps a static fallback so the page still works when the API is unavailable,
 * rate-limited or blocked; a failed request simply leaves the fallback in place.
 */
(function () {
    'use strict';

    var API = 'https://api.github.com/repos/cfanmaoli/nimble-commander/releases/latest';

    function apply(version) {
        var nodes = document.querySelectorAll('.nc_release_version');
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].textContent = version;
        }
    }

    function request() {
        if (!document.querySelector('.nc_release_version')) return;
        if (typeof window.fetch !== 'function') return;
        window.fetch(API, {
            headers: { Accept: 'application/vnd.github+json' },
            cache: 'no-store'
        }).then(function (response) {
            if (!response.ok) throw new Error('GitHub API returned ' + response.status);
            return response.json();
        }).then(function (release) {
            var version = String((release && release.tag_name) || '').replace(/^v/i, '');
            // Keep the value safe for textContent; ignore malformed tags.
            if (/^[0-9][0-9A-Za-z.+-]*$/.test(version)) apply(version);
        }).catch(function () {
            /* keep the static fallback */
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', request, false);
    } else {
        request();
    }
})();
