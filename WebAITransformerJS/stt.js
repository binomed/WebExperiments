/**
 * stt.js — Speech-to-Text with Whisper via Transformers.js
 * Uses pipeline('automatic-speech-recognition') + MediaRecorder API
 */

import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';

const MODEL_ID = 'Xenova/whisper-small';

let transcriber = null;
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;

// ── DOM refs ──
const statusEl = () => document.getElementById('stt-status');
const progressContainer = () => document.getElementById('stt-progress-container');
const progressBar = () => document.getElementById('stt-progress');
const outputEl = () => document.getElementById('stt-output');
const loadBtn = () => document.getElementById('stt-load-btn');
const recordBtn = () => document.getElementById('stt-record-btn');

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
    setStatus('Chargement de Whisper...');
    setProgress(10);

    try {
        transcriber = await pipeline('automatic-speech-recognition', MODEL_ID, {
            dtype: 'q8',
            progress_callback: (progress) => {
                if (progress.status === 'progress') {
                    setProgress(10 + (progress.progress || 0) * 0.9);
                    setStatus(`Chargement: ${progress.file || ''} (${Math.round(progress.progress || 0)}%)`);
                }
            },
        });

        setProgress(100);
        setStatus('✅ Whisper chargé ! Cliquez "Enregistrer" pour commencer.');
        recordBtn().disabled = false;
    } catch (err) {
        setStatus(`❌ Erreur: ${err.message}`);
        setProgress(0);
        loadBtn().disabled = false;
        console.error('STT model load error:', err);
    }
}

async function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
            stream.getTracks().forEach(track => track.stop());
            await transcribeAudio();
        };

        mediaRecorder.start();
        isRecording = true;
        recordBtn().textContent = '⏹️ Stop';
        recordBtn().classList.add('btn-danger', 'recording');
        recordBtn().classList.remove('btn-primary');
        setStatus('🎙️ Enregistrement en cours... Cliquez Stop quand vous avez fini.');
    } catch (err) {
        setStatus(`❌ Erreur micro: ${err.message}`);
        console.error('Mic error:', err);
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
    isRecording = false;
    recordBtn().textContent = '🎙️ Enregistrer';
    recordBtn().classList.remove('btn-danger', 'recording');
    recordBtn().classList.add('btn-primary');
}

async function transcribeAudio() {
    setStatus('⏳ Transcription en cours...');
    recordBtn().disabled = true;

    try {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const arrayBuffer = await audioBlob.arrayBuffer();

        // Decode to raw audio data
        const audioContext = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: 16000,
        });
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const audioData = audioBuffer.getChannelData(0); // mono

        const result = await transcriber(audioData, {
            language: 'french',
            task: 'transcribe',
        });

        outputEl().innerHTML = '';
        const p = document.createElement('p');
        p.textContent = result.text;
        outputEl().appendChild(p);

        setStatus('✅ Transcription terminée.');
    } catch (err) {
        setStatus(`❌ Erreur transcription: ${err.message}`);
        console.error('Transcription error:', err);
    }

    recordBtn().disabled = false;
}

export function initSTT() {
    loadBtn().addEventListener('click', loadModel);
    recordBtn().addEventListener('click', toggleRecording);
}
