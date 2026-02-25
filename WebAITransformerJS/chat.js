/**
 * chat.js — Text generation with Llama-3.2-1B-Instruct via Transformers.js
 * Uses the text-generation pipeline with WebGPU acceleration
 * Streaming via TextStreamer
 */

import {
    pipeline,
    TextStreamer,
} from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';

// Llama 3.2 1B — petit, rapide, optimisé pour le navigateur
const MODEL_ID = 'onnx-community/Llama-3.2-1B-Instruct';

let generator = null;

// ── DOM refs ──
const statusEl = () => document.getElementById('chat-status');
const progressContainer = () => document.getElementById('chat-progress-container');
const progressBar = () => document.getElementById('chat-progress');
const messagesArea = () => document.getElementById('chat-messages');
const inputEl = () => document.getElementById('chat-input');
const sendBtn = () => document.getElementById('chat-send-btn');
const loadBtn = () => document.getElementById('chat-load-btn');

// ── Conversation history ──
let conversationHistory = [];

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

function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.textContent = text;
    messagesArea().appendChild(div);
    messagesArea().scrollTop = messagesArea().scrollHeight;
    return div;
}

async function loadModel() {
    loadBtn().disabled = true;
    setStatus('Chargement de Llama 3.2 1B...');
    setProgress(10);

    try {
        generator = await pipeline('text-generation', MODEL_ID, {
            device: 'webgpu',
            dtype: 'q4',
            progress_callback: (progress) => {
                if (progress.status === 'progress') {
                    const pct = Math.round(progress.progress || 0);
                    setProgress(10 + pct * 0.9);
                    setStatus(`Chargement: ${progress.name || ''} (${pct}%)`);
                }
            },
        });

        setProgress(100);
        setStatus('✅ Llama 3.2 1B chargé ! Vous pouvez discuter.');
        inputEl().disabled = false;
        sendBtn().disabled = false;
        inputEl().focus();
    } catch (err) {
        const msg = err && (err.message || String(err));
        setStatus(`❌ Erreur: ${msg}`);
        setProgress(0);
        loadBtn().disabled = false;
        console.error('Chat model load error:', err);
    }
}

async function sendMessage() {
    const text = inputEl().value.trim();
    if (!text || !generator) return;

    sendBtn().disabled = true;
    inputEl().value = '';

    addMessage('user', text);
    conversationHistory.push({ role: 'user', content: text });

    const responseDiv = addMessage('assistant', '');
    let fullResponse = '';
    setStatus('⏳ Génération en cours...');

    try {
        const streamer = new TextStreamer(generator.tokenizer, {
            skip_prompt: true,
            skip_special_tokens: true,
            callback_function: (token) => {
                fullResponse += token;
                responseDiv.textContent = fullResponse;
                messagesArea().scrollTop = messagesArea().scrollHeight;
            },
        });

        const messages = [
            { role: 'system', content: 'Tu es un assistant utile et bienveillant. Réponds en français.' },
            ...conversationHistory,
        ];

        await generator(messages, {
            max_new_tokens: 512,
            do_sample: true,
            temperature: 0.7,
            top_p: 0.9,
            streamer,
        });

        conversationHistory.push({ role: 'assistant', content: fullResponse });
        setStatus('✅ Réponse terminée.');
    } catch (err) {
        const msg = err && (err.message || String(err));
        responseDiv.textContent = `Erreur: ${msg}`;
        setStatus('❌ Erreur de génération');
        console.error('Generation error:', err);
    }

    sendBtn().disabled = false;
    inputEl().focus();
}

export function initChat() {
    loadBtn().addEventListener('click', loadModel);
    sendBtn().addEventListener('click', sendMessage);

    inputEl().addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}
