/**
 * AccessiNav Web Speech API Voice Guidance & Speech Recognition Engine
 */

class VoiceSystem {
    constructor() {
        this.synth = window.speechSynthesis;
        this.isEnabled = true;
        this.speechRecognition = null;
        this.isListening = false;

        this.initRecognition();
    }

    toggleVoice(enabled) {
        this.isEnabled = enabled;
        if (!enabled && this.synth) {
            this.synth.cancel();
        }
    }

    speak(text) {
        if (!this.isEnabled || !this.synth) return;

        // Cancel previous speech to speak immediately
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        this.synth.speak(utterance);
    }

    initRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('Speech Recognition API not supported in this browser.');
            return;
        }

        this.speechRecognition = new SpeechRecognition();
        this.speechRecognition.continuous = false;
        this.speechRecognition.interimResults = false;
        this.speechRecognition.lang = 'en-US';
    }

    startListening(onResultCallback, onErrorCallback) {
        if (!this.speechRecognition) {
            alert('Voice search is not supported in this browser. Please use Chrome/Edge.');
            return;
        }

        if (this.isListening) {
            this.speechRecognition.stop();
            this.isListening = false;
            return;
        }

        this.isListening = true;
        this.speak("Listening for destination...");

        this.speechRecognition.onresult = (event) => {
            this.isListening = false;
            const transcript = event.results[0][0].transcript;
            if (onResultCallback) onResultCallback(transcript);
        };

        this.speechRecognition.onerror = (event) => {
            this.isListening = false;
            console.error('Speech recognition error:', event.error);
            if (onErrorCallback) onErrorCallback(event.error);
        };

        this.speechRecognition.onend = () => {
            this.isListening = false;
        };

        this.speechRecognition.start();
    }
}

window.VoiceSystem = VoiceSystem;
