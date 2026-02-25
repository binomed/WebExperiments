# Guide des Modèles Locaux (Offline Mode)

Ce guide explique comment télécharger les modèles nécessaires pour faire tourner l'application **WebAITransformerJS** entièrement en local (sans connexion internet).

## Installation des outils

Vous devez installer `huggingface_hub` (Python 3 requis) :
```bash
pip3 install huggingface_hub
```

## Téléchargement des Modèles Optimisés

L'application utilise des versions quantisées (Q4) spécifiquement optimisées pour le navigateur.

### 1. 💬 Chat (Llama-3.2-1B-Instruct)
Version ultra-légère et réactive pour le web.
```bash
huggingface-cli download onnx-community/Llama-3.2-1B-Instruct \
  --include "*.json" "*.jinja" "onnx/model_q4.onnx" "onnx/model_q4.onnx_data" \
  --local-dir models/onnx-community/Llama-3.2-1B-Instruct
```

### 2. 🖼️ Multimodal (Moondream2)
Version spécialisée VQA (Visual Question Answering).
```bash
huggingface-cli download Xenova/moondream2 \
  --include "*.json" "*.jinja" "onnx/embed_tokens_fp16.onnx" "onnx/vision_encoder_fp16.onnx" "onnx/decoder_model_merged_q4.onnx" \
  --local-dir models/Xenova/moondream2
```

> [!NOTE]
> L'implémentation actuelle dans `multimodal.js` répète le token `<image>` 729 fois pour correspondre aux dimensions des features visuelles extraites par le Vision Encoder de Moondream2.

### 3. Autres modules (Pipeline standard)
```bash
# 🎙️ STT - Whisper Small
huggingface-cli download Xenova/whisper-small --local-dir models/Xenova/whisper-small

# 🔊 TTS - Kokoro 82M
huggingface-cli download onnx-community/Kokoro-82M-v1.0-ONNX --local-dir models/onnx-community/Kokoro-82M-v1.0-ONNX

# 🌍 Traduction - NLLB 600M
huggingface-cli download Xenova/nllb-200-distilled-600M --local-dir models/Xenova/nllb-200-distilled-600M

# 👁️ Vision Live - DETR
huggingface-cli download Xenova/detr-resnet-50 --local-dir models/Xenova/detr-resnet-50
```

## Configuration de l'Application

Une fois les modèles téléchargés :
1. Dans `app.js`, vérifiez `env.localModelPath = './models/';`.
2. Décommentez `env.allowRemoteModels = false` pour interdire les téléchargements distants.

## Nettoyage
Le dossier `models/` optimisé devrait peser environ **4.4 Go**.
- Llama 3.2 1B: ~1.7 Go
- Moondream2: ~1.8 Go
- Autres (Whisper, Kokoro, etc.): ~1 Go
