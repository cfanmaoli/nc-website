/*
 * Language file picker for the languages page: fills the select with the languages
 * that have a file in cfanmaoli/nc-language and points the download button at the raw JSON file.
 */
(() => {
    'use strict';

    const RAW_BASE = 'https://raw.githubusercontent.com/cfanmaoli/nc-language/main/languages/';
    const LANGUAGES = [
        { code: 'ach', name: 'Acoli' },
        { code: 'af', name: 'Afrikaans' },
        { code: 'ar', name: 'Arabic' },
        { code: 'az', name: 'Azerbaijani' },
        { code: 'be', name: 'Belarusian' },
        { code: 'bg', name: 'Bulgarian' },
        { code: 'bn', name: 'Bangla' },
        { code: 'bo', name: 'Tibetan' },
        { code: 'br', name: 'Breton' },
        { code: 'bs', name: 'Bosnian' },
        { code: 'ca', name: 'Catalan' },
        { code: 'ca-valencia', name: 'Catalan (Valencian)' },
        { code: 'ckb', name: 'Central Kurdish' },
        { code: 'cs', name: 'Czech' },
        { code: 'cy', name: 'Welsh' },
        { code: 'da', name: 'Danish' },
        { code: 'de', name: 'German' },
        { code: 'el', name: 'Greek' },
        { code: 'eo', name: 'Esperanto' },
        { code: 'es-AR', name: 'Spanish (Argentina)' },
        { code: 'es-CL', name: 'Spanish (Chile)' },
        { code: 'es-ES', name: 'European Spanish' },
        { code: 'es-MX', name: 'Mexican Spanish' },
        { code: 'et', name: 'Estonian' },
        { code: 'eu', name: 'Basque' },
        { code: 'fa', name: 'Persian' },
        { code: 'ff', name: 'Fula' },
        { code: 'fi', name: 'Finnish' },
        { code: 'fr', name: 'French' },
        { code: 'fur', name: 'Friulian' },
        { code: 'fy-NL', name: 'Western Frisian (Netherlands)' },
        { code: 'ga-IE', name: 'Irish (Ireland)' },
        { code: 'gd', name: 'Scottish Gaelic' },
        { code: 'gl', name: 'Galician' },
        { code: 'gn', name: 'Guarani' },
        { code: 'gu-IN', name: 'Gujarati (India)' },
        { code: 'he', name: 'Hebrew' },
        { code: 'hi-IN', name: 'Hindi (India)' },
        { code: 'hr', name: 'Croatian' },
        { code: 'hu', name: 'Hungarian' },
        { code: 'hy-AM', name: 'Armenian (Armenia)' },
        { code: 'id', name: 'Indonesian' },
        { code: 'is', name: 'Icelandic' },
        { code: 'it', name: 'Italian' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ka', name: 'Georgian' },
        { code: 'kk', name: 'Kazakh' },
        { code: 'km', name: 'Khmer' },
        { code: 'kn', name: 'Kannada' },
        { code: 'ko', name: 'Korean' },
        { code: 'lij', name: 'Ligurian' },
        { code: 'lo', name: 'Lao' },
        { code: 'lt', name: 'Lithuanian' },
        { code: 'ltg', name: 'Latgalian' },
        { code: 'lv', name: 'Latvian' },
        { code: 'mk', name: 'Macedonian' },
        { code: 'ml', name: 'Malayalam' },
        { code: 'mr', name: 'Marathi' },
        { code: 'ms', name: 'Malay' },
        { code: 'my', name: 'Burmese' },
        { code: 'nb-NO', name: 'Norwegian Bokmål (Norway)' },
        { code: 'ne-NP', name: 'Nepali (Nepal)' },
        { code: 'nl', name: 'Dutch' },
        { code: 'oc', name: 'Occitan' },
        { code: 'pa-IN', name: 'Punjabi (India)' },
        { code: 'pl', name: 'Polish' },
        { code: 'pt-BR', name: 'Brazilian Portuguese' },
        { code: 'pt-PT', name: 'European Portuguese' },
        { code: 'ro', name: 'Romanian' },
        { code: 'ru', name: 'Russian' },
        { code: 'sat', name: 'Santali' },
        { code: 'scn', name: 'Sicilian' },
        { code: 'si', name: 'Sinhala' },
        { code: 'sk', name: 'Slovak' },
        { code: 'sl', name: 'Slovenian' },
        { code: 'sq', name: 'Albanian' },
        { code: 'sr', name: 'Serbian' },
        { code: 'sv-SE', name: 'Swedish (Sweden)' },
        { code: 'szl', name: 'Silesian' },
        { code: 'ta', name: 'Tamil' },
        { code: 'te', name: 'Telugu' },
        { code: 'tg', name: 'Tajik' },
        { code: 'th', name: 'Thai' },
        { code: 'tl', name: 'Filipino' },
        { code: 'tr', name: 'Turkish' },
        { code: 'uk', name: 'Ukrainian' },
        { code: 'ur', name: 'Urdu' },
        { code: 'uz', name: 'Uzbek' },
        { code: 'vi', name: 'Vietnamese' },
        { code: 'wo', name: 'Wolof' },
        { code: 'xh', name: 'Xhosa' },
        { code: 'zh-TW', name: 'Chinese (Taiwan)' },
    ];

    const select = document.getElementById('language_select');
    const link = document.getElementById('language_download');
    if (!select || !link) return;

    const fragment = document.createDocumentFragment();
    for (const item of LANGUAGES) {
        const option = document.createElement('option');
        option.value = RAW_BASE + item.code + '.json';
        option.textContent = `${item.name} (${item.code})`;
        fragment.appendChild(option);
    }
    select.appendChild(fragment);

    function update() {
        if (select.value) {
            link.href = select.value;
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
            link.removeAttribute('aria-disabled');
        } else {
            link.href = '#';
            link.removeAttribute('target');
            link.removeAttribute('rel');
            link.setAttribute('aria-disabled', 'true');
        }
    }

    link.addEventListener('click', (event) => {
        if (link.getAttribute('aria-disabled') === 'true') {
            event.preventDefault();
        }
    });

    select.addEventListener('change', update);
    update();
})();
