/**
 * SignBridge AI - Text-to-Speech Engine & Multilingual Translator
 * Supports English, Hindi (हिंदी), Spanish (Español), French (Français), and German (Deutsch)
 */

class TTSTranslator {
    constructor() {
        this.synth = window.speechSynthesis;
        this.currentLang = 'en';

        // Translation dictionary for core signs & common phrases
        this.translations = {
            'hi': { // Hindi
                'HELLO': 'नमस्ते (Hello)',
                'THANK YOU': 'धन्यवाद (Thank You)',
                'HELP': 'सहायता (Help)',
                'I LOVE YOU': 'मैं आपसे प्यार करता हूँ',
                'YES': 'हाँ (Yes)',
                'NO': 'नहीं (No)',
                'PLEASE': 'कृपया (Please)',
                'WATER': 'पानी (Water)',
                'DOCTOR': 'डॉक्टर (Doctor)',
                'GOOD MORNING': 'शुभ प्रभात (Good Morning)',
                'A': 'ए', 'B': 'बी', 'C': 'सी'
            },
            'es': { // Spanish
                'HELLO': 'Hola',
                'THANK YOU': 'Gracias',
                'HELP': 'Ayuda',
                'I LOVE YOU': 'Te quiero',
                'YES': 'Sí',
                'NO': 'No',
                'PLEASE': 'Por favor',
                'WATER': 'Agua',
                'DOCTOR': 'Médico',
                'GOOD MORNING': 'Buenos días'
            },
            'fr': { // French
                'HELLO': 'Bonjour',
                'THANK YOU': 'Merci',
                'HELP': 'Aide',
                'I LOVE YOU': 'Je t\'aime',
                'YES': 'Oui',
                'NO': 'Non',
                'PLEASE': 'S\'il vous plaît',
                'WATER': 'Eau',
                'DOCTOR': 'Médecin',
                'GOOD MORNING': 'Bonjour'
            },
            'de': { // German
                'HELLO': 'Hallo',
                'THANK YOU': 'Danke',
                'HELP': 'Hilfe',
                'I LOVE YOU': 'Ich liebe dich',
                'YES': 'Ja',
                'NO': 'Nein',
                'PLEASE': 'Bitte',
                'WATER': 'Wasser',
                'DOCTOR': 'Arzt',
                'GOOD MORNING': 'Guten Morgen'
            }
        };
    }

    setLanguage(langCode) {
        this.currentLang = langCode;
    }

    translate(text) {
        if (!text || this.currentLang === 'en') return text;

        const dict = this.translations[this.currentLang];
        if (!dict) return text;

        // Try full match first
        const upper = text.toUpperCase().trim();
        if (dict[upper]) return dict[upper];

        // Word by word translation
        let words = text.split(' ');
        let translatedWords = words.map(w => dict[w.toUpperCase()] || w);
        return translatedWords.join(' ');
    }

    speak(text) {
        if (!this.synth || !text) return;

        this.synth.cancel(); // Interrupt previous speech

        const langText = this.translate(text);
        const utterance = new SpeechSynthesisUtterance(langText);

        const langCodes = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE'
        };

        utterance.lang = langCodes[this.currentLang] || 'en-US';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        this.synth.speak(utterance);
    }
}

window.TTSTranslator = TTSTranslator;
