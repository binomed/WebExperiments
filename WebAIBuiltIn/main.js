/**
 * @file main.js
 * @description Version simplifiée pour tester les API d'IA intégrées de Chrome.
 * Approche KISS : pas d'abstraction complexe, appels directs.
 * Utilise les namespaces PascalCase (ex: window.LanguageModel).
 */

// --- Utilitaires de log et UI ---
const log = (msg, type = 'info') => {
    const logDisplay = document.getElementById('log-display');
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
        // Si lang est null, on utilise l'auto-détection du TTS ou la langue mémorisée
        window.tts.speak(text, lang || detectedLanguage);
    }
};

// --- Détection des API ---
const getAPI = (name) => {
    const apis = {
        LanguageDetector: window.LanguageDetector,
        Translator: window.Translator,
        Summarizer: window.Summarizer,
        LanguageModel: window.LanguageModel,
        Writer: window.Writer,
        Rewriter: window.Rewriter,
        Proofreader: window.Proofreader
    };
    return apis[name];
};

const updateUIStatus = async () => {
    log('Vérification de la disponibilité des API...');
    const list = document.getElementById('api-status-list');
    list.innerHTML = '';

    const toCheck = [
        { label: 'Language Detector', key: 'LanguageDetector' },
        { label: 'Translator (FR->EN)', key: 'Translator', params: { sourceLanguage: 'fr', targetLanguage: 'en' } },
        { label: 'Translator (EN->FR)', key: 'Translator', params: { sourceLanguage: 'en', targetLanguage: 'fr' } },
        { label: 'Summarizer', key: 'Summarizer' },
        { label: 'Language Model (FR/EN)', key: 'LanguageModel', params: { languages: ['en', 'fr'] } },
        { label: 'Writer', key: 'Writer' },
        { label: 'Rewriter', key: 'Rewriter' },
        { label: 'Proofreader', key: 'Proofreader' }
    ];

    for (const api of toCheck) {
        const obj = getAPI(api.key);
        let status = 'unavailable';

        if (obj) {
            try {
                status = typeof obj.availability === 'function'
                    ? await obj.availability(api.params || {})
                    : 'available';
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

        // On mémorise la langue détectée pour la session
        detectedLanguage = results[0].detectedLanguage;

        display(`Langue: ${detectedLanguage} (${Math.round(results[0].confidence * 100)}%)`, detectedLanguage);
        log(`Détection réussie : ${detectedLanguage}`, 'success');
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
        display(result, tgt); // On passe la langue cible au TTS
        log('Traduction réussie', 'success');
    } catch (e) {
        log(`Erreur: ${e.message}`, 'error');
    }
}

async function onSummarize() {
    const text = document.getElementById('text-input').value;
    if (!text) return log('Texte manquant', 'error');

    log(`Appel Summarizer (Contexte: ${detectedLanguage || 'auto'})...`);
    try {
        const api = getAPI('Summarizer');
        if (!api) throw new Error('API non trouvée');

        // Configuration raffinée du Summarizer selon la langue détectée
        const options = {
            type: 'key-points', // Format par défaut
            format: 'markdown',
            length: 'medium'
        };

        if (detectedLanguage) {
            options.expectedInputLanguages = [detectedLanguage];
            options.outputLanguage = detectedLanguage;
            options.expectedContextLanguages = [detectedLanguage];
            options.sharedContext = `Processing a document in ${detectedLanguage}. Please provide the summary in the same language.`;
        }

        const summarizer = await api.create(options);
        const result = await summarizer.summarize(text);
        display(result, detectedLanguage);
        log('Résumé réussi', 'success');
    } catch (e) {
        log(`Erreur: ${e.message}`, 'error');
    }
}

async function onPrompt() {
    const text = document.getElementById('text-input').value;
    const file = document.getElementById('image-input').files[0];
    if (!text && !file) return log('Entrée manquante', 'error');

    log('Appel LanguageModel (Gemini Nano)...');
    try {
        const api = getAPI('LanguageModel');
        if (!api) throw new Error('API non trouvée');

        const session = await api.create({
            //expectedInputs: [{ type: "text", languages: ['en'] }, { type: "image" },],
            expectedInputs: [{ type: "text" }, { type: "image" },],
            //expectedOutputs: [{ type: "text", languages: ['en'] }],
            initialPrompts: [
                {
                    role: 'system',
                    content:
                        //'Your task is to describe images. Only use plain text. Do not use Markdown. Be short and precise.',
                        'Réponds en français. Sois concis. pas de markdown'
                },
            ],
        });

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

        // log(`content send : ${JSON.stringify(content)}`);

        let result = '';
        for await (const chunk of stream) {
            //output.append(chunk);
            result += chunk;
        }
        display(result);
        log('Réponse reçue', 'success');
    } catch (e) {
        log(`Erreur: ${e.message}`, 'error');
    }
}

async function onWrite() {
    const text = document.getElementById('text-input').value;
    if (!text) return log('Sujet manquant', 'error');

    log('Appel Writer API...');
    try {
        const api = getAPI('Writer');
        if (!api) throw new Error('API non trouvée');

        const writer = await api.create();
        const result = await writer.write(text);
        display(result);
        log('Écriture réussie', 'success');
    } catch (e) {
        log(`Erreur: ${e.message}`, 'error');
    }
}

async function onRewrite() {
    const text = document.getElementById('text-input').value;
    if (!text) return log('Texte manquant', 'error');

    log('Appel Rewriter API...');
    try {
        const api = getAPI('Rewriter');
        if (!api) throw new Error('API non trouvée');

        const rewriter = await api.create();
        const result = await rewriter.rewrite(text);
        display(result);
        log('Réécriture réussie', 'success');
    } catch (e) {
        log(`Erreur: ${e.message}`, 'error');
    }
}

async function onProofread() {
    const text = document.getElementById('text-input').value;
    if (!text) return log('Texte manquant', 'error');

    log('Appel Proofreader API...');
    try {
        const api = getAPI('Proofreader');
        if (!api) throw new Error('API non trouvée');

        const proofreader = await api.create();
        const result = await proofreader.proofread(text);
        display(result);
        log('Correction réussie', 'success');
    } catch (e) {
        log(`Erreur: ${e.message}`, 'error');
    }
}

// --- Initialisation ---
document.addEventListener('DOMContentLoaded', () => {
    log('Prêt.');

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
            r.onload = (ev) => document.getElementById('image-preview').innerHTML = `<img id="preview-image" src="${ev.target.result}">`;
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
});
