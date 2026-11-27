/*
 * Copy button using Invoker Commands (command="--copy" + commandfor) with
 * a click-listener fallback where CommandEvent is not yet supported,
 * Async Clipboard API, and accessible live-region feedback.
 */
(() => {
    'use strict';

    const timers = new WeakMap();
    let lastMessage = '';

    function isZh() {
        return document.documentElement.getAttribute('data-nc-lang') === 'zh';
    }

    function report(button, ok) {
        const tip = button.nextElementSibling;
        clearTimeout(timers.get(button));
        button.removeAttribute('data-copied');
        button.removeAttribute('data-failed');

        let message = ok
            ? (isZh() ? '已复制' : 'Copied')
            : (isZh() ? '复制失败' : 'Copy failed');

        if (message === lastMessage) message += '\u00A0';
        lastMessage = message;

        if (tip) tip.textContent = '';
        void button.offsetWidth;
        button.setAttribute(ok ? 'data-copied' : 'data-failed', '');
        requestAnimationFrame(() => {
            if (tip) tip.textContent = message;
        });

        timers.set(
            button,
            window.setTimeout(() => {
                button.removeAttribute('data-copied');
                button.removeAttribute('data-failed');
                if (tip) tip.textContent = '';
            }, 2000),
        );
    }

    async function copy(button, target) {
        const text = target.matches('input, textarea') ? target.value : target.innerText.trim();
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            report(button, true);
        } catch {
            report(button, false);
        }
    }

    if ('CommandEvent' in window) {
        document.addEventListener(
            'command',
            (event) => {
                if (event.command === '--copy' && event.source && event.target) {
                    copy(event.source, event.target);
                }
            },
            true,
        );
    } else {
        document.addEventListener('click', (event) => {
            if (event.defaultPrevented) return;
            const button = event.target?.closest?.('button[command="--copy"]');
            if (!button) return;
            const target = document.getElementById(button.getAttribute('commandfor') ?? '');
            if (target) copy(button, target);
        });
    }
})();
