/**
 * SignBridge AI - Temporal Sentence Builder & NLP Buffer
 * Assembles continuous sign gestures into coherent sentences with duplicate suppression
 */

class SentenceBuilder {
    constructor() {
        this.wordBuffer = [];
        this.lastWord = '';
        this.lastTimestamp = 0;
        this.debounceMs = 1200; // Require 1.2s holding sign to add to sentence
    }

    addWord(word, confidence) {
        if (!word || word === 'NO HAND DETECTED' || word === 'UNKNOWN' || confidence < 80.0) {
            return false;
        }

        const now = Date.now();
        if (word === this.lastWord && (now - this.lastTimestamp) < this.debounceMs) {
            return false; // Suppress rapid duplicates
        }

        this.wordBuffer.push(word);
        this.lastWord = word;
        this.lastTimestamp = now;
        return true;
    }

    getSentence() {
        if (this.wordBuffer.length === 0) return '';
        
        // Simple NLP formatting rules: capitalize first word, join with spaces
        let raw = this.wordBuffer.join(' ');

        // Smart phrase replacements (e.g. HELLO DOCTOR NEED HELP -> "Hello Doctor, I need help.")
        raw = raw.replace(/\bHELLO DOCTOR HELP\b/g, 'Hello Doctor, I need help.')
                 .replace(/\bWATER PLEASE\b/g, 'Can I please have water?')
                 .replace(/\bTHANK YOU GOOD MORNING\b/g, 'Thank you, good morning!')
                 .replace(/\bHELP EMERGENCY\b/g, 'Emergency! Please send help.');

        // Capitalize first character
        return raw.charAt(0).toUpperCase() + raw.slice(1);
    }

    clear() {
        this.wordBuffer = [];
        this.lastWord = '';
    }

    backspace() {
        this.wordBuffer.pop();
        this.lastWord = this.wordBuffer[this.wordBuffer.length - 1] || '';
    }
}

window.SentenceBuilder = SentenceBuilder;
