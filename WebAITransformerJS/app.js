/**
 * app.js — Tab orchestration & lazy module init
 * Each module exports an init() function called once when its tab is first activated.
 */

import { env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';
import { initChat } from './chat.js';
import { initSTT } from './stt.js';
import { initTTS } from './tts.js';
import { initTranslation } from './translation.js';
import { initVision } from './vision.js';
import { initMultimodal } from './multimodal.js';

// ── Transformers.js Configuration ──
// Chemin vers vos modèles locaux (téléchargés dans le dossier models/)
// Par défaut, il cherchera d'abord en local s'ils existent, sinon sur le Hub.
env.localModelPath = './models/';

// Autoriser les modèles locaux, interdire les téléchargements distants
env.allowLocalModels = true;
env.allowRemoteModels = false;

// ── Tab management ──
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

const moduleInits = {
    chat: initChat,
    stt: initSTT,
    tts: initTTS,
    translation: initTranslation,
    vision: initVision,
    multimodal: initMultimodal,
};

const initializedModules = new Set();

function switchTab(tabName) {
    tabs.forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tabName);
        t.setAttribute('aria-selected', t.dataset.tab === tabName);
    });

    panels.forEach(p => {
        p.classList.toggle('active', p.id === `panel-${tabName}`);
    });

    // Lazy init: only init the module when its tab is first opened
    if (!initializedModules.has(tabName) && moduleInits[tabName]) {
        initializedModules.add(tabName);
        moduleInits[tabName]();
    }
}

tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

// Init the default active tab
switchTab('chat');
