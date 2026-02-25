/**
 * vision.js — Live object detection with DETR via Transformers.js
 * Uses pipeline('object-detection') + webcam via getUserMedia
 */

import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';

const MODEL_ID = 'Xenova/detr-resnet-50';

let detector = null;
let videoStream = null;
let autoDetectInterval = null;
let isDetecting = false;

// ── DOM refs ──
const statusEl = () => document.getElementById('vision-status');
const progressContainer = () => document.getElementById('vision-progress-container');
const progressBar = () => document.getElementById('vision-progress');
const loadBtn = () => document.getElementById('vision-load-btn');
const startBtn = () => document.getElementById('vision-start-btn');
const detectBtn = () => document.getElementById('vision-detect-btn');
const autoCheckbox = () => document.getElementById('vision-auto-detect');
const videoEl = () => document.getElementById('vision-video');
const canvasEl = () => document.getElementById('vision-canvas');
const containerEl = () => document.getElementById('vision-container');
const detectionsEl = () => document.getElementById('vision-detections');

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
    setStatus('Chargement de DETR...');
    setProgress(10);

    try {
        detector = await pipeline('object-detection', MODEL_ID, {
            dtype: 'q8',
            progress_callback: (progress) => {
                if (progress.status === 'progress') {
                    setProgress(10 + (progress.progress || 0) * 0.9);
                    setStatus(`Chargement: ${progress.file || ''} (${Math.round(progress.progress || 0)}%)`);
                }
            },
        });

        setProgress(100);
        setStatus('✅ DETR chargé ! Démarrez la webcam.');
        startBtn().disabled = false;
    } catch (err) {
        setStatus(`❌ Erreur: ${err.message}`);
        setProgress(0);
        loadBtn().disabled = false;
        console.error('Vision model load error:', err);
    }
}

async function toggleWebcam() {
    if (videoStream) {
        stopWebcam();
    } else {
        await startWebcam();
    }
}

async function startWebcam() {
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: 640, height: 480 },
        });
        const video = videoEl();
        video.srcObject = videoStream;
        containerEl().classList.remove('hidden');
        startBtn().textContent = '⏹️ Arrêter Webcam';
        startBtn().classList.remove('btn-primary');
        startBtn().classList.add('btn-danger');
        detectBtn().disabled = false;
        setStatus('📷 Webcam active. Cliquez "Détecter" ou activez auto-détection.');
    } catch (err) {
        setStatus(`❌ Erreur webcam: ${err.message}`);
        console.error('Webcam error:', err);
    }
}

function stopWebcam() {
    if (videoStream) {
        videoStream.getTracks().forEach(t => t.stop());
        videoStream = null;
    }
    videoEl().srcObject = null;
    containerEl().classList.add('hidden');
    startBtn().textContent = '📷 Démarrer Webcam';
    startBtn().classList.add('btn-primary');
    startBtn().classList.remove('btn-danger');
    detectBtn().disabled = true;
    stopAutoDetect();
}

async function detect() {
    if (!detector || isDetecting) return;
    isDetecting = true;
    detectBtn().disabled = true;

    const video = videoEl();
    const canvas = canvasEl();
    const ctx = canvas.getContext('2d');

    // Match canvas to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Capture frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');

    setStatus('🔍 Détection en cours...');

    try {
        const results = await detector(imageData, { threshold: 0.5 });

        // Draw bounding boxes
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        results.forEach((det, i) => {
            const { xmin, ymin, xmax, ymax } = det.box;
            const colors = ['#6c63ff', '#00d4aa', '#ffb347', '#ff5c5c', '#47b8ff', '#ff47b8'];
            const color = colors[i % colors.length];

            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.strokeRect(xmin, ymin, xmax - xmin, ymax - ymin);

            // Label background
            const label = `${det.label} (${Math.round(det.score * 100)}%)`;
            ctx.font = 'bold 14px Inter, sans-serif';
            const textWidth = ctx.measureText(label).width;
            ctx.fillStyle = color;
            ctx.fillRect(xmin, ymin - 22, textWidth + 10, 22);

            // Label text
            ctx.fillStyle = '#fff';
            ctx.fillText(label, xmin + 5, ymin - 6);
        });

        // Display detections list
        detectionsEl().innerHTML = '';
        if (results.length === 0) {
            detectionsEl().innerHTML = '<p class="placeholder">Aucun objet détecté.</p>';
        } else {
            const list = results.map(d =>
                `🏷️ <strong>${d.label}</strong> — ${Math.round(d.score * 100)}% confiance`
            ).join('<br>');
            detectionsEl().innerHTML = list;
        }

        setStatus(`✅ ${results.length} objet(s) détecté(s).`);
    } catch (err) {
        setStatus(`❌ Erreur détection: ${err.message}`);
        console.error('Detection error:', err);
    }

    isDetecting = false;
    detectBtn().disabled = false;
}

function toggleAutoDetect() {
    if (autoCheckbox().checked) {
        autoDetectInterval = setInterval(detect, 3000);
        setStatus('🔄 Auto-détection activée (toutes les 3s).');
    } else {
        stopAutoDetect();
        setStatus('📷 Auto-détection désactivée.');
    }
}

function stopAutoDetect() {
    if (autoDetectInterval) {
        clearInterval(autoDetectInterval);
        autoDetectInterval = null;
        autoCheckbox().checked = false;
    }
}

export function initVision() {
    loadBtn().addEventListener('click', loadModel);
    startBtn().addEventListener('click', toggleWebcam);
    detectBtn().addEventListener('click', detect);
    autoCheckbox().addEventListener('change', toggleAutoDetect);
}
