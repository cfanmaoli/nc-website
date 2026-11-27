/*
 * Nimble Commander-Fork -- English / Simplified Chinese language switch.
 *
 * Every translatable element carries its Chinese counterpart in a
 * data-zh (plain text), data-zh-html (text with inline markup),
 * data-zh-alt (image alt), or data-zh-aria-label (ARIA label) attribute.
 * The English version stays in the HTML and is restored when switching back.
 */
(() => {
    'use strict';

    const STORAGE_KEY = 'nc_lang';
    const PENDING_CLASS = 'nc_i18n_pending';
    const root = document.documentElement;
    let lang = 'en';
    let nodes = [];
    let alts = [];
    let ariaNodes = [];
    let toggle = null;

    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved === 'zh' || saved === 'en') lang = saved;
    } catch {
        /* localStorage can be unavailable (private mode, file://, blocked) */
    }

    function setDocumentLang(value) {
        root.setAttribute('lang', value === 'zh' ? 'zh-Hans' : 'en');
        root.setAttribute('data-nc-lang', value);
    }

    function revealPage() {
        root.classList.remove(PENDING_CLASS);
    }

    function store(value) {
        try {
            window.localStorage.setItem(STORAGE_KEY, value);
        } catch {
            /* ignore storage errors */
        }
    }

    setDocumentLang(lang);
    if (lang === 'zh') {
        /* Keep the page invisible between parsing and translation so English
           never flashes before Chinese is applied. */
        root.classList.add(PENDING_CLASS);
        window.setTimeout(revealPage, 4000);
    }

    function captureEnglish(el) {
        if (el.tagName === 'TITLE') {
            el.__ncEn = el.textContent;
        } else if (el.tagName === 'META') {
            el.__ncEn = el.getAttribute('content') ?? '';
        } else {
            el.__ncEn = el.innerHTML;
        }
    }

    function translate(el, zh) {
        const hasHtml = el.hasAttribute('data-zh-html');
        const value = hasHtml ? el.getAttribute('data-zh-html') : el.getAttribute('data-zh');

        if (el.tagName === 'TITLE') {
            el.textContent = zh ? value : el.__ncEn;
        } else if (el.tagName === 'META') {
            el.setAttribute('content', zh ? value : el.__ncEn);
        } else if (hasHtml) {
            el.innerHTML = zh ? value : el.__ncEn;
        } else if (zh) {
            el.textContent = value;
        } else {
            el.innerHTML = el.__ncEn;
        }
    }

    function updateToggle() {
        if (!toggle) return;
        if (lang === 'zh') {
            toggle.textContent = 'English';
            toggle.setAttribute('lang', 'en');
            toggle.setAttribute('aria-label', 'Switch to English');
        } else {
            toggle.textContent = '中文';
            toggle.setAttribute('lang', 'zh-Hans');
            toggle.setAttribute('aria-label', '切换到简体中文');
        }
    }

    function applyLanguage() {
        const zh = lang === 'zh';
        for (const el of nodes) translate(el, zh);
        for (const img of alts) {
            img.setAttribute('alt', zh ? img.getAttribute('data-zh-alt') : img.__ncEnAlt);
        }
        for (const el of ariaNodes) {
            el.setAttribute('aria-label', zh ? el.getAttribute('data-zh-aria-label') : el.__ncEnAriaLabel);
        }
        updateToggle();
        document.dispatchEvent(new CustomEvent('nc-lang-change', { detail: { lang } }));
    }

    function setLanguage(value) {
        lang = value === 'zh' ? 'zh' : 'en';
        store(lang);
        setDocumentLang(lang);
        applyLanguage();
    }

    function init() {
        nodes = [...document.querySelectorAll('[data-zh], [data-zh-html]')];
        for (const el of nodes) captureEnglish(el);

        alts = [...document.querySelectorAll('img[data-zh-alt]')];
        for (const img of alts) img.__ncEnAlt = img.getAttribute('alt') ?? '';

        ariaNodes = [...document.querySelectorAll('[data-zh-aria-label]')];
        for (const el of ariaNodes) el.__ncEnAriaLabel = el.getAttribute('aria-label') ?? '';

        toggle = document.getElementById('nc_lang_toggle');
        toggle?.addEventListener('click', () => {
            setLanguage(lang === 'zh' ? 'en' : 'zh');
        });

        applyLanguage();
        revealPage();
    }

    function boot() {
        try {
            init();
        } catch (err) {
            revealPage();
            console.error(err);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();
