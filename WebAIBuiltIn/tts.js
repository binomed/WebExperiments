/**
 * @file tts.js
 * @description Gère la synthèse vocale (Text-to-Speech) via SpeechSynthesis API.
 * Sépare les voix par langue (FR et EN).
 */

window.tts = (function () {
    const synth = window.speechSynthesis;
    const voiceSelectFr = document.getElementById('voice-select-fr');
    const voiceSelectEn = document.getElementById('voice-select-en');
    const pitch = document.getElementById('pitch');
    const rate = document.getElementById('rate');
    const pitchVal = document.getElementById('pitch-val');
    const rateVal = document.getElementById('rate-val');
    const btnSpeak = document.getElementById('btn-speak');
    const outputDisplay = document.getElementById('output-display');

    let voices = [];

    function populateVoiceLists() {
        const allVoices = synth.getVoices();

        // Filtrer et trier
        const frVoices = allVoices.filter(v => v.lang.startsWith('fr')).sort((a, b) => a.name.localeCompare(b.name));
        const enVoices = allVoices.filter(v => v.lang.startsWith('en')).sort((a, b) => a.name.localeCompare(b.name));

        const updateList = (select, list) => {
            const previousValue = select.value;
            select.innerHTML = '';

            let googleIndex = -1;
            list.forEach((voice, index) => {
                const option = document.createElement('option');
                option.textContent = `${voice.name} (${voice.lang})`;
                option.setAttribute('data-name', voice.name);
                select.appendChild(option);

                if (voice.name.includes('Google')) {
                    googleIndex = index;
                }
            });

            // Si on avait déjà une sélection, on essaie de la garder
            if (previousValue) {
                select.value = previousValue;
            }
            // Sinon, si on a trouvé une voix Google, on la sélectionne par défaut
            else if (googleIndex !== -1) {
                select.selectedIndex = googleIndex;
            }
        };

        updateList(voiceSelectFr, frVoices);
        updateList(voiceSelectEn, enVoices);

        voices = allVoices;
    }

    populateVoiceLists();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceLists;
    }

    pitch.oninput = () => pitchVal.textContent = pitch.value;
    rate.oninput = () => rateVal.textContent = rate.value;

    function speak(text, forceLang = null) {
        if (synth.speaking) {
            synth.cancel();
        }

        if (text && text !== "Attente d'une action...") {
            const utterThis = new SpeechSynthesisUtterance(text);

            // Détection de la voix à utiliser
            let selectedVoiceName;
            if (forceLang === 'fr') {
                selectedVoiceName = voiceSelectFr.selectedOptions[0]?.getAttribute('data-name');
            } else if (forceLang === 'en') {
                selectedVoiceName = voiceSelectEn.selectedOptions[0]?.getAttribute('data-name');
            } else {
                // Heuristique simple si pas de langue forcée : 
                // on regarde si le texte contient beaucoup de mots communs FR
                const isProbablyFr = ["le", "la", "les", "est", "une", "dans"].some(w => text.toLowerCase().includes(" " + w + " "));
                selectedVoiceName = isProbablyFr
                    ? voiceSelectFr.selectedOptions[0]?.getAttribute('data-name')
                    : voiceSelectEn.selectedOptions[0]?.getAttribute('data-name');
            }

            const voice = voices.find(v => v.name === selectedVoiceName);
            if (voice) utterThis.voice = voice;

            utterThis.pitch = pitch.value;
            utterThis.rate = rate.value;

            synth.speak(utterThis);
            if (typeof log === 'function') log(`Lecture TTS [${forceLang || 'auto'}] démarrée...`, 'info');
        }
    }

    btnSpeak.addEventListener('click', () => {
        speak(outputDisplay.textContent);
    });

    return {
        speak: speak
    };
})();
