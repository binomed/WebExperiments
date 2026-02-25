/**
 * multimodal.js — Multimodal Vision+Text with Moondream2 via Transformers.js
 * Uses AutoProcessor + AutoModelForImageTextToText with WebGPU
 * Moondream2 is a lightweight alternative for VQA tasks.
 */

import {
    AutoProcessor,
    AutoTokenizer,
    AutoModelForImageTextToText,
    load_image,
    TextStreamer,
} from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';

const MODEL_ID = 'Xenova/moondream2';

let processor = null;
let tokenizer = null;
let model = null;
let currentImageUrl = null;

// ── DOM refs ──
const statusEl = () => document.getElementById('multimodal-status');
const progressContainer = () => document.getElementById('multimodal-progress-container');
const progressBar = () => document.getElementById('multimodal-progress');
const fileInput = () => document.getElementById('multimodal-file');
const previewEl = () => document.getElementById('multimodal-preview');
const questionEl = () => document.getElementById('multimodal-question');
const loadBtn = () => document.getElementById('multimodal-load-btn');
const askBtn = () => document.getElementById('multimodal-ask-btn');
const outputEl = () => document.getElementById('multimodal-output');

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

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    currentImageUrl = url;

    previewEl().innerHTML = '';
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Image uploadée';
    previewEl().appendChild(img);

    setStatus('📷 Image chargée. Posez une question sur l\'image.');
}

async function loadModel() {
    loadBtn().disabled = true;
    setStatus('Chargement du processeur Moondream2...');
    setProgress(10);

    try {
        processor = await AutoProcessor.from_pretrained(MODEL_ID, {
            progress_callback: (progress) => {
                if (progress.status === 'progress') {
                    setProgress(Math.min(20, 10 + (progress.progress || 0) * 0.1));
                }
            },
        });
        setStatus('Chargement du tokenizer Moondream2...');
        setProgress(20);

        tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID, {
            progress_callback: (progress) => {
                if (progress.status === 'progress') {
                    setProgress(Math.min(30, 20 + (progress.progress || 0) * 0.1));
                }
            },
        });

        setStatus('Chargement du modèle Moondream2 (WebGPU)...');
        setProgress(30);

        model = await AutoModelForImageTextToText.from_pretrained(MODEL_ID, {
            device: 'webgpu',
            dtype: {
                embed_tokens: 'fp16',
                vision_encoder: 'fp16',
                decoder_model_merged: 'q4',
            }, progress_callback: (progress) => {
                if (progress.status === 'progress') {
                    const pct = Math.round(progress.progress || 0);
                    setProgress(30 + pct * 0.7);
                    setStatus(`Chargement: ${progress.name || ''} (${pct}%)`);
                }
            },
        });

        setProgress(100);
        setStatus('✅ Moondream2 chargé ! Uploadez une image et posez une question.');
        askBtn().disabled = false;
    } catch (err) {
        setStatus(`❌ Erreur: ${err.message || String(err)}`);
        setProgress(0);
        loadBtn().disabled = false;
        console.error('Multimodal model load error:', err);
    }
}

async function analyzeImage() {
    if (!model || !processor || !tokenizer || !currentImageUrl) {
        setStatus('⚠️ Veuillez charger le modèle et sélectionner une image.');
        return;
    }

    const question = questionEl().value.trim();
    if (!question) {
        setStatus('⚠️ Veuillez poser une question.');
        return;
    }

    askBtn().disabled = true;
    setStatus('⏳ Analyse en cours...');
    outputEl().innerHTML = '';

    try {
        // Moondream2 in Transformers.js v3 seems to require one <image> token per patch (729 features)
        const prompt = '<image>'.repeat(729) + `\nQuestion: ${question}\nAnswer:`;
        const image = await load_image(currentImageUrl);

        const vision_inputs = await processor(image);
        const text_inputs = tokenizer(prompt, {
            return_tensors: 'pt',
            add_special_tokens: true
        });

        const inputs = { ...vision_inputs, ...text_inputs };

        let fullResponse = '';

        const streamer = new TextStreamer(tokenizer, {
            skip_prompt: true,
            callback_function: (token) => {
                fullResponse += token;
                outputEl().textContent = fullResponse;
            },
        });

        await model.generate({
            ...inputs,
            max_new_tokens: 512,
            do_sample: false,
            streamer,
        });

        setStatus('✅ Analyse terminée.');
    } catch (err) {
        setStatus(`❌ Erreur: ${err.message || String(err)}`);
        outputEl().textContent = `Erreur: ${err.message || String(err)}`;
        console.error('Multimodal error:', err);
    }

    askBtn().disabled = false;
}

export function initMultimodal() {
    fileInput().addEventListener('change', handleFileSelect);
    loadBtn().addEventListener('click', loadModel);
    askBtn().addEventListener('click', analyzeImage);
}
