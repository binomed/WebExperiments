/**
 * @file speech.js
 * @description Gère la saisie vocale via la Web Speech API.
 * S'adapte à la langue sélectionnée dans le formulaire.
 */

(function () {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.error("Web Speech API non supportée sur ce navigateur.");
        const btn = document.getElementById('btn-voice');
        if (btn) btn.style.display = 'none';
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const btnVoice = document.getElementById('btn-voice');
    const textInput = document.getElementById('text-input');
    const directionSelect = document.getElementById('translation-direction');

    let isListening = false;

    btnVoice.addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
        } else {
            // Ajuster la langue de reconnaissance selon la direction
            // Si fr-en -> on parle français. Si en-fr -> on parle anglais.
            const direction = directionSelect.value;
            recognition.lang = direction.startsWith('fr') ? 'fr-FR' : 'en-US';

            recognition.start();
        }
    });

    recognition.onstart = () => {
        isListening = true;
        btnVoice.classList.add('listening');
        btnVoice.textContent = '⏹️';
        if (typeof log === 'function') log(`Microphone activé [${recognition.lang}], parlez maintenant...`, 'info');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        textInput.value = transcript;
        if (typeof log === 'function') log(`Reconnaissance vocale : "${transcript}"`, 'success');
    };

    recognition.onspeechend = () => {
        recognition.stop();
    };

    recognition.onend = () => {
        isListening = false;
        btnVoice.classList.remove('listening');
        btnVoice.textContent = '🎙️';
    };

    recognition.onerror = (event) => {
        isListening = false;
        btnVoice.classList.remove('listening');
        btnVoice.textContent = '🎙️';
        if (typeof log === 'function') log(`Erreur reconnaissance vocale : ${event.error}`, 'error');
    };

})();
