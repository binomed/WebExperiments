/**
 * translation.js — Translation with NLLB-200 via Transformers.js
 * Uses pipeline('translation')
 */

import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';

const MODEL_ID = 'Xenova/nllb-200-distilled-600M';

let translator = null;

// ── DOM refs ──
const statusEl = () => document.getElementById('translation-status');
const progressContainer = () => document.getElementById('translation-progress-container');
const progressBar = () => document.getElementById('translation-progress');
const inputEl = () => document.getElementById('translation-input');
const outputEl = () => document.getElementById('translation-output');
const srcLangEl = () => document.getElementById('translation-src-lang');
const tgtLangEl = () => document.getElementById('translation-tgt-lang');
const loadBtn = () => document.getElementById('translation-load-btn');
const translateBtn = () => document.getElementById('translation-translate-btn');

function setStatus(text) {
    statusEl().textContent = text;
}

function setProgress(pct) {
    const container = progressContainer();
    const bar = progressBar();
    if (pct <= 0 || pct >= 100) {
        container.classList.add('hidden');
    } else {
        container.classList.remove('hidden');
        bar.style.width = `${pct}%`;
    }
}

async function loadModel() {
    loadBtn().disabled = true;
    setStatus('Chargement de NLLB-200...');
    setProgress(10);

    try {
        translator = await pipeline('translation', MODEL_ID, {
            dtype: 'q8',
            progress_callback: (progress) => {
                if (progress.status === 'progress') {
                    setProgress(10 + (progress.progress || 0) * 0.9);
                    setStatus(`Chargement: ${progress.file || ''} (${Math.round(progress.progress || 0)}%)`);
                }
            },
        });

        setProgress(100);
        setStatus('✅ NLLB-200 chargé ! Entrez du texte et cliquez "Traduire".');
        translateBtn().disabled = false;
    } catch (err) {
        setStatus(`❌ Erreur: ${err.message}`);
        setProgress(0);
        loadBtn().disabled = false;
        console.error('Translation model load error:', err);
    }
}

async function translate() {
    const text = inputEl().value.trim();
    if (!text || !translator) return;

    const srcLang = srcLangEl().value;
    const tgtLang = tgtLangEl().value;

    if (srcLang === tgtLang) {
        setStatus('⚠️ La langue source et cible sont identiques.');
        return;
    }

    translateBtn().disabled = true;
    setStatus('⏳ Traduction en cours...');

    try {
        const result = await translator(text, {
            src_lang: srcLang,
            tgt_lang: tgtLang,
            max_new_tokens: 512,
        });

        outputEl().innerHTML = '';
        const p = document.createElement('p');
        p.textContent = result[0].translation_text;
        outputEl().appendChild(p);

        setStatus('✅ Traduction terminée.');
    } catch (err) {
        setStatus(`❌ Erreur traduction: ${err.message}`);
        console.error('Translation error:', err);
    }

    translateBtn().disabled = false;
}

export function initTranslation() {
    loadBtn().addEventListener('click', loadModel);
    translateBtn().addEventListener('click', translate);
}
