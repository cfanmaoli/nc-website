/*
 * Nimble Commander-Fork -- English / Simplified Chinese language switch.
 *
 * Every translatable element carries its Chinese counterpart in a
 * data-zh (plain text) or data-zh-html (text with inline markup) attribute;
 * images may carry data-zh-alt. The English version is left untouched in the
 * HTML and is restored from the DOM when switching back.
 *
 * The choice is stored in localStorage("nc_lang") and applied on every page.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'nc_lang';
    var PENDING_CLASS = 'nc_i18n_pending';
    var root = document.documentElement;
    var lang = 'en';
    var nodes = null;
    var toggle = null;

    try {
        var saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved === 'zh' || saved === 'en') lang = saved;
    } catch (e) {
        /* localStorage can be unavailable (private mode, file://, blocked) */
    }

    function setDocumentLang(value) {
        root.setAttribute('lang', value === 'zh' ? 'zh-Hans' : 'en');
        root.setAttribute('data-nc-lang', value);
    }

    function revealPage() {
        var classes = root.className ? root.className.split(/\s+/) : [];
        var kept = [];
        for (var i = 0; i < classes.length; i++) {
            if (classes[i] && classes[i] !== PENDING_CLASS) kept.push(classes[i]);
        }
        root.className = kept.join(' ');
    }

    function store(value) {
        try {
            window.localStorage.setItem(STORAGE_KEY, value);
        } catch (e) { /* ignore */ }
    }

    setDocumentLang(lang);
    if (lang === 'zh') {
        /* Keep the page invisible between parsing and translation, so the
           English text never flashes before the Chinese one is applied. */
        root.className = (root.className ? root.className + ' ' : '') + PENDING_CLASS;
        window.setTimeout(revealPage, 4000); /* safety net, e.g. if this file 404s */
    }

    function captureEnglish(el) {
        if (el.tagName === 'TITLE' || el.tagName === 'META') {
            el.__ncEn = el.tagName === 'META' ? el.getAttribute('content') : el.textContent;
        } else {
            el.__ncEn = el.innerHTML;
        }
    }

    function translate(el, zh) {
        var value = el.getAttribute('data-zh-html');
        if (value === null) value = el.getAttribute('data-zh');

        if (el.tagName === 'TITLE') {
            el.textContent = zh ? value : el.__ncEn;
        } else if (el.tagName === 'META') {
            el.setAttribute('content', zh ? value : el.__ncEn);
        } else if (el.hasAttribute('data-zh-html')) {
            el.innerHTML = zh ? value : el.__ncEn;
        } else if (zh) {
            el.textContent = value;
        } else {
            el.innerHTML = el.__ncEn;
        }
    }

    function captureAlts() {
        var images = document.querySelectorAll('img[data-zh-alt]');
        for (var i = 0; i < images.length; i++) {
            images[i].__ncEn = images[i].getAttribute('alt');
        }
        return images;
    }

    function updateToggle() {
        if (!toggle) return;
        if (lang === 'zh') {
            toggle.textContent = 'English';
            toggle.setAttribute('lang', 'en');
            toggle.setAttribute('title', '切换到英文');
            toggle.setAttribute('aria-label', '切换到英文');
        } else {
            toggle.textContent = '中文';
            toggle.setAttribute('lang', 'zh-Hans');
            toggle.setAttribute('title', 'Switch to Simplified Chinese');
            toggle.setAttribute('aria-label', 'Switch to Simplified Chinese');
        }
    }

    function applyLanguage() {
        var zh = (lang === 'zh');
        var i;
        for (i = 0; i < nodes.length; i++) translate(nodes[i], zh);

        var images = document.querySelectorAll('img[data-zh-alt]');
        for (i = 0; i < images.length; i++) {
            images[i].setAttribute('alt', zh ? images[i].getAttribute('data-zh-alt') : images[i].__ncEn);
        }
        updateToggle();
    }

    function setLanguage(value) {
        lang = (value === 'zh') ? 'zh' : 'en';
        store(lang);
        setDocumentLang(lang);
        applyLanguage();
    }

    function onToggle(event) {
        if (event) event.preventDefault();
        setLanguage(lang === 'zh' ? 'en' : 'zh');
        return false;
    }

    function init() {
        nodes = document.querySelectorAll('[data-zh], [data-zh-html]');
        for (var i = 0; i < nodes.length; i++) captureEnglish(nodes[i]);
        captureAlts();

        toggle = document.getElementById('nc_lang_toggle');
        if (toggle) toggle.addEventListener('click', onToggle, false);

        applyLanguage();
        revealPage();
    }

    // The header is fixed and can wrap onto a second line when the navigation is wide; keep the
    // spacer in sync so that the page content never hides underneath it.
    function syncHeaderSpace() {
        var header = document.querySelector('header');
        var spacer = document.getElementById('header_fix_space');
        if (header && spacer) spacer.style.height = header.offsetHeight + 'px';
    }

    function boot() {
        try {
            init();
        } catch (e) {
            revealPage();
            if (window.console && window.console.error) window.console.error(e);
        }
        syncHeaderSpace();
        window.addEventListener('resize', syncHeaderSpace);
        window.addEventListener('load', syncHeaderSpace);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, false);
    } else {
        boot();
    }
})();
