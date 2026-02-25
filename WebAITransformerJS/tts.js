/**
 * tts.js — Text-to-Speech with Kokoro-82M via Transformers.js
 * Uses pipeline('text-to-speech') with Kokoro model
 */

import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';

const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';

let synthesizer = null;

// ── DOM refs ──
const statusEl = () => document.getElementById('tts-status');
const progressContainer = () => document.getElementById('tts-progress-container');
const progressBar = () => document.getElementById('tts-progress');
const inputEl = () => document.getElementById('tts-input');
const voiceSelect = () => document.getElementById('tts-voice');
const loadBtn = () => document.getElementById('tts-load-btn');
const speakBtn = () => document.getElementById('tts-speak-btn');
const audioEl = () => document.getElementById('tts-audio');

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
    setStatus('Chargement de Kokoro TTS...');
    setProgress(10);

    try {
        synthesizer = await pipeline('text-to-speech', MODEL_ID, {
            dtype: 'q8',
            progress_callback: (progress) => {
                if (progress.status === 'progress') {
                    setProgress(10 + (progress.progress || 0) * 0.9);
                    setStatus(`Chargement: ${progress.file || ''} (${Math.round(progress.progress || 0)}%)`);
                }
            },
        });

        setProgress(100);
        setStatus('✅ Kokoro TTS chargé ! Entrez du texte et cliquez "Lire".');
        speakBtn().disabled = false;
        voiceSelect().disabled = false;
    } catch (err) {
        setStatus(`❌ Erreur: ${err.message}`);
        setProgress(0);
        loadBtn().disabled = false;
        console.error('TTS model load error:', err);
    }
}

async function speak() {
    const text = inputEl().value.trim();
    if (!text || !synthesizer) return;

    speakBtn().disabled = true;
    setStatus('⏳ Synthèse vocale en cours...');

    try {
        const voice = voiceSelect().value;
        const result = await synthesizer(text, { voice });

        // result contains { audio, sampling_rate }
        const audio = audioEl();
        const blob = new Blob([encodeWav(result.audio, result.sampling_rate)], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);

        audio.src = url;
        audio.classList.remove('hidden');
        audio.play();

        setStatus('✅ Audio généré !');
    } catch (err) {
        setStatus(`❌ Erreur TTS: ${err.message}`);
        console.error('TTS error:', err);
    }

    speakBtn().disabled = false;
}

/**
 * Encode Float32Array audio data to WAV format
 */
function encodeWav(audioData, sampleRate) {
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = audioData.length * (bitsPerSample / 8);

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');

    // fmt chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // data chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write audio samples
    let offset = 44;
    for (let i = 0; i < audioData.length; i++) {
        const sample = Math.max(-1, Math.min(1, audioData[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
    }

    return buffer;
}

function writeString(view, offset, str) {
    for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
    }
}

export function initTTS() {
    loadBtn().addEventListener('click', loadModel);
    speakBtn().addEventListener('click', speak);
}
