/**
 * @file main-polyfill.js
 * @description Version utilisant le Prompt API Polyfill avec Transformers.js.
 * Utilise les modèles locaux définis dans WebAITransformerJS.
 */

// --- Configuration du Polyfill Transformers.js ---
window.TRANSFORMERS_CONFIG = {
    apiKey: 'dummy', // Obligatoire pour le constructeur du polyfill
    modelName: 'onnx-community/Llama-3.2-1B-Instruct', // Modèle texte léger par défaut
    device: 'webgpu', // 'webgpu' ou 'cpu'
    dtype: 'q4f16', // Format optimisé
    env: {
        // On pointe vers les modèles téléchargés dans le projet voisin
        localModelPath: '../WebAITransformerJS/models/',
        allowLocalModels: true,
        allowRemoteModels: true, // Désormais true pour permettre le téléchargement du nouveau modèle
    },
};

// --- Forcer l'utilisation du polyfill ---
// On supprime les API natives si elles existent pour tester le polyfill
delete window.ai;
delete window.LanguageModel;

// Import dynamique du polyfill (cela définit window.ai et window.LanguageModel)
// Utilise le nom mappé dans l'importmap de index-polyfill.html
await import('prompt-api-polyfill');

// --- Utilitaires de log et UI ---
const log = (msg, type = 'info') => {
    const logDisplay = document.getElementById('log-display');
    if (!logDisplay) return;
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] [${type.toUpperCase()}] ${msg}`;
    logDisplay.prepend(entry);
    console.log(`[${type.toUpperCase()}] ${msg}`);
};

// --- État de la session ---
let detectedLanguage = null;

const display = (text, lang = null) => {
    log(text, 'info');
    document.getElementById('output-display').textContent = text;

    // Hook pour le TTS
    const autoRead = document.getElementById('auto-read');
    if (autoRead && autoRead.checked && window.tts) {
        window.tts.speak(text, lang || detectedLanguage);
    }
};

// --- Détection des API ---
const getAPI = (name) => {
    // Avec le polyfill, window.LanguageModel est défini. 
    // Les autres API (Writer, Summarizer, etc.) pourraient ne pas être polyfillées 
    // par cette version spécifique du polyfill si elle ne gère que Prompt API.
    const apis = {
        LanguageDetector: window.LanguageDetector || (window.ai && window.ai.languageDetector),
        Translator: window.Translator || (window.ai && window.ai.translator),
        Summarizer: window.Summarizer || (window.ai && window.ai.summarizer),
        LanguageModel: window.LanguageModel || (window.ai && window.ai.languageModel),
        Writer: window.Writer || (window.ai && window.ai.writer),
        Rewriter: window.Rewriter || (window.ai && window.ai.rewriter),
        Proofreader: window.Proofreader || (window.ai && window.ai.proofreader)
    };
    return apis[name];
};

const updateUIStatus = async () => {
    log('Vérification de la disponibilité des API (via Polyfill)...');
    const list = document.getElementById('api-status-list');
    list.innerHTML = '';

    const toCheck = [
        { label: 'Language Detector', key: 'LanguageDetector' },
        { label: 'Translator (FR->EN)', key: 'Translator', params: { sourceLanguage: 'fr', targetLanguage: 'en' } },
        { label: 'Translator (EN->FR)', key: 'Translator', params: { sourceLanguage: 'en', targetLanguage: 'fr' } },
        { label: 'Summarizer', key: 'Summarizer' },
        { label: 'Language Model (Polyfill)', key: 'LanguageModel', params: { languages: ['en', 'fr'] } },
        { label: 'Writer', key: 'Writer' },
        { label: 'Rewriter', key: 'Rewriter' },
        { label: 'Proofreader', key: 'Proofreader' }
    ];

    for (const api of toCheck) {
        const obj = getAPI(api.key);
        let status = 'unavailable';

        if (obj) {
            try {
                // Le polyfill implémente souvent 'capabilities' au lieu de 'availability' pour coller à la spec la plus récente
                if (typeof obj.capabilities === 'function') {
                    const caps = await obj.capabilities();
                    status = caps.available || 'available';
                } else if (typeof obj.availability === 'function') {
                    status = await obj.availability(api.params || {});
                } else {
                    status = 'available';
                }
            } catch (e) {
                log(`Erreur dispo ${api.label}: ${e.message}`, 'error');
            }
        }

        const div = document.createElement('div');
        div.className = 'api-status';
        div.innerHTML = `<span>${api.label}</span><span class="status-badge status-${status}">${status}</span>`;
        list.appendChild(div);
    }
};

// --- Handlers Directs ---

async function onDetectLanguage() {
    const text = document.getElementById('text-input').value;
    if (!text) return log('Texte manquant', 'error');

    log('Appel LanguageDetector...');
    try {
        const api = getAPI('LanguageDetector');
        if (!api) throw new Error('API non trouvée');

        const detector = await api.create();
        const results = await detector.detect(text);
        detectedLanguage = results[0].detectedLanguage;
        display(`Langue: ${detectedLanguage} (${Math.round(results[0].confidence * 100)}%)`, detectedLanguage);
    } catch (e) {
        log(`Erreur: ${e.message}`, 'error');
    }
}

async function onTranslate() {
    const text = document.getElementById('text-input').value;
    const direction = document.getElementById('translation-direction').value;
    if (!text) return log('Texte manquant', 'error');

    const [src, tgt] = direction.split('-');
    log(`Appel Translator (${src.toUpperCase()} -> ${tgt.toUpperCase()})...`);

    try {
        const api = getAPI('Translator');
        if (!api) throw new Error('API non trouvée');

        const translator = await api.create({ sourceLanguage: src, targetLanguage: tgt });
        const result = await translator.translate(text);
        display(result, tgt);
    } catch (e) {
        log(`Erreur: ${e.message}`, 'error');
    }
}

async function onSummarize() {
    const text = document.getElementById('text-input').value;
    if (!text) return log('Texte manquant', 'error');

    log(`Appel Summarizer...`);
    try {
        const api = getAPI('Summarizer');
        if (!api) throw new Error('API non trouvée');

        const options = {
            type: 'key-points',
            format: 'markdown',
            length: 'medium'
        };

        const summarizer = await api.create(options);
        const result = await summarizer.summarize(text);
        display(result, detectedLanguage);
    } catch (e) {
        log(`Erreur: ${e.message}`, 'error');
    }
}

async function onPrompt() {
    const text = document.getElementById('text-input').value;
    const file = document.getElementById('image-input').files[0];
    if (!text && !file) return log('Entrée manquante', 'error');

    log('Appel LanguageModel (via Polyfill Transformers.js)...');
    try {
        const api = getAPI('LanguageModel');
        if (!api) throw new Error('API LanguageModel non installée (le polyfill a-t-il échoué ?)');

        const session = await api.create({
            expectedInputs: [{ type: "text" }/*, { type: "image" },*/],
            initialPrompts: [
                {
                    role: 'system',
                    content: 'Réponds en français. Sois concis. pas de markdown'
                },
            ],
        });

        log('Génération en cours...');
        let stream = undefined;
        if (file) {
            log('Traitement multimodal (image)...');
            //const buffer = await file.arrayBuffer();
            stream = session.promptStreaming([{
                role: "user",
                content: [
                    { type: 'text', value: text },
                    { type: 'image', value: document.querySelector('img') }
                ]
            }]);
        } else {
            stream = session.promptStreaming(text);

        }

        let result = '';
        const outputDisplay = document.getElementById('output-display');
        outputDisplay.textContent = ''; // Clear previous

        for await (const chunk of stream) {
            result += chunk;
            outputDisplay.textContent = result;
        }

        display(result);
        log('Réponse reçue via Polyfill', 'success');
    } catch (e) {
        log(`Erreur Prompt Polyfill: ${e.message}`, 'error');
        console.error(e);
    }
}

// Les autres méthodes Write/Rewrite/Proofread dépendent de la disponibilité de ces API
// Si le polyfill ne les fournit pas, elles échoueront proprement via getAPI check.

async function onWrite() {
    const text = document.getElementById('text-input').value;
    if (!text) return log('Sujet manquant', 'error');
    try {
        const api = getAPI('Writer');
        if (!api) throw new Error('API Writer non disponible');
        const writer = await api.create();
        const result = await writer.write(text);
        display(result);
    } catch (e) { log(`Erreur: ${e.message}`, 'error'); }
}

async function onRewrite() {
    const text = document.getElementById('text-input').value;
    if (!text) return log('Texte manquant', 'error');
    try {
        const api = getAPI('Rewriter');
        if (!api) throw new Error('API Rewriter non disponible');
        const rewriter = await api.create();
        const result = await rewriter.rewrite(text);
        display(result);
    } catch (e) { log(`Erreur: ${e.message}`, 'error'); }
}

async function onProofread() {
    const text = document.getElementById('text-input').value;
    if (!text) return log('Texte manquant', 'error');
    try {
        const api = getAPI('Proofreader');
        if (!api) throw new Error('API Proofreader non disponible');
        const proofreader = await api.create();
        const result = await proofreader.proofread(text);
        display(result);
    } catch (e) { log(`Erreur: ${e.message}`, 'error'); }
}

// --- Initialisation ---
const init = () => {
    log('Page Polyfill prête.');

    document.getElementById('check-status-btn').addEventListener('click', updateUIStatus);
    document.getElementById('btn-detect-lang').addEventListener('click', onDetectLanguage);
    document.getElementById('btn-translate').addEventListener('click', onTranslate);
    document.getElementById('btn-summarize').addEventListener('click', onSummarize);
    document.getElementById('btn-prompt').addEventListener('click', onPrompt);
    document.getElementById('btn-write').addEventListener('click', onWrite);
    document.getElementById('btn-rewrite').addEventListener('click', onRewrite);
    document.getElementById('btn-proofread').addEventListener('click', onProofread);

    // Image preview simple
    document.getElementById('image-input').addEventListener('change', (e) => {
        const f = e.target.files[0];
        if (f) {
            const r = new FileReader();
            r.onload = (ev) => {
                const preview = document.getElementById('image-preview');
                if (preview) preview.innerHTML = `<img id="preview-image" src="${ev.target.result}" style="max-width: 100%; height: auto;">`;
            }
            r.readAsDataURL(f);
        }
    });

    // Reset de la langue détectée si le texte change
    document.getElementById('text-input').addEventListener('input', () => {
        if (detectedLanguage) {
            detectedLanguage = null;
            log('Texte modifié : langue mémorisée réinitialisée.', 'info');
        }
    });

    setTimeout(updateUIStatus, 500);
};

// Dans un module, le script est déjà 'déferré'. 
// Si on a des top-level awaits, DOMContentLoaded a peut-être déjà eu lieu.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
