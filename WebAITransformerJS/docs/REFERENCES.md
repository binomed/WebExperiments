# Transformers.js — Documentation de Référence

## Docs principales
- [Transformers.js - Index](https://huggingface.co/docs/transformers.js/index)
- [Installation](https://huggingface.co/docs/transformers.js/installation)
- [Pipeline API](https://huggingface.co/docs/transformers.js/pipelines)
- [Custom Usage (env, local models)](https://huggingface.co/docs/transformers.js/custom_usage)
- [Vanilla JS Tutorial](https://huggingface.co/docs/transformers.js/tutorials/vanilla-js)
- [API Reference (index des capabilities)](https://huggingface.co/docs/transformers.js/api/transformers)

## Modèles utilisés
- **Chat / Multimodal** : [Ministral-3-3B-Instruct-2512-ONNX](https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-ONNX) — 3.4B LM + 0.4B Vision, WebGPU requis
- **STT** : [Xenova/whisper-small](https://huggingface.co/Xenova/whisper-small) — ~150MB, multilingue
- **TTS** : [onnx-community/Kokoro-82M-v1.0-ONNX](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX) — 82M params, q8 ~86MB
- **Translation** : [Xenova/nllb-200-distilled-600M](https://huggingface.co/Xenova/nllb-200-distilled-600M) — ~600MB
- **Object Detection** : [Xenova/detr-resnet-50](https://huggingface.co/Xenova/detr-resnet-50) — détection d'objets

## Guides utiles
- [WebGPU Guide](https://huggingface.co/docs/transformers.js/guides/webgpu)
- [Quantization / dtypes](https://huggingface.co/docs/transformers.js/guides/dtypes)
- [Node Audio Processing](https://huggingface.co/docs/transformers.js/guides/node-audio-processing)

## CDN Import
```js
import { pipeline, TextStreamer } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';
```

## Chargement local des modèles
```js
import { env } from '@huggingface/transformers';
env.localModelPath = '/chemin/vers/modeles/';
env.allowRemoteModels = false;
```

## Pipeline tasks disponibles

| Catégorie | Task | Pipeline name |
|---|---|---|
| NLP | Text Generation | `text-generation` |
| NLP | Translation | `translation` |
| Audio | Speech-to-Text | `automatic-speech-recognition` |
| Audio | Text-to-Speech | `text-to-speech` / `text-to-audio` |
| Vision | Object Detection | `object-detection` |
| Vision | Image Classification | `image-classification` |
| Multimodal | Image-to-Text | `image-to-text` |
| Multimodal | Visual QA | `visual-question-answering` |
