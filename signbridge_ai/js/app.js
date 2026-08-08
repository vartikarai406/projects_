/**
 * SignBridge AI - Main Application Controller & UI Binder
 */

class SignBridgeApp {
    constructor() {
        // Initialize Core Engines
        this.handTracker = new window.HandTracker();
        this.cameraPipeline = new window.CameraPipeline('webcamVideo', 'canvasOverlay', this.handTracker);
        this.classifier = new window.GestureClassifier(this.handTracker);
        this.sentenceBuilder = new window.SentenceBuilder();
        this.ttsTranslator = new window.TTSTranslator();
        this.learningStudio = new window.LearningStudio(this.classifier, this.handTracker);
        this.datasetTrainer = new window.DatasetTrainer(this.classifier, this.handTracker);

        this.currentLandmarks = null;
        this.initUI();
    }

    initUI() {
        // Start in interactive simulation mode by default (or camera if requested)
        this.simulateGesture('HELLO');

        // Hook camera frame loop
        this.cameraPipeline.onFrameCallback = (landmarks) => this.onFrameProcess(landmarks);
    }

    onFrameProcess(landmarks) {
        if (!landmarks) return;
        this.currentLandmarks = landmarks;

        // Classify Gesture
        const pred = this.classifier.classify(landmarks);

        // Update HUD
        document.getElementById('hudSignLabel').innerText = pred.label;
        document.getElementById('hudConfidence').innerText = `${pred.confidence}%`;

        // Add to sentence buffer
        const added = this.sentenceBuilder.addWord(pred.label, pred.confidence);
        if (added) {
            this.updateSentenceDisplay();
            // Automatically speak out newly recognized phrase/word
            this.ttsTranslator.speak(pred.label);
        }

        // Render Probability Bars Breakdown
        this.renderProbBars(pred.topScores);

        // Evaluate Learning Practice mode
        this.evaluateLearning(landmarks);
    }

    simulateGesture(signLabel) {
        const landmarks = this.handTracker.generateSyntheticSign(signLabel);
        this.cameraPipeline.renderSyntheticFrame(landmarks);
        this.onFrameProcess(landmarks);
    }

    async toggleCamera() {
        const btn = document.getElementById('btnCameraToggle');
        if (this.cameraPipeline.isStreaming) {
            this.cameraPipeline.stopCamera();
            btn.innerHTML = '<i class="fa-solid fa-video"></i> Start WebCam';
            this.simulateGesture('HELLO');
        } else {
            const success = await this.cameraPipeline.startCamera();
            if (success) {
                btn.innerHTML = '<i class="fa-solid fa-video-slash"></i> Stop WebCam';
            } else {
                alert('WebCam access denied or camera not found. Continuing in Gesture Simulator Mode!');
            }
        }
    }

    updateSentenceDisplay() {
        const sentence = this.sentenceBuilder.getSentence();
        const display = document.getElementById('sentenceDisplay');
        const translationBox = document.getElementById('sentenceTranslation');

        if (sentence) {
            display.innerText = sentence;
            const translated = this.ttsTranslator.translate(sentence);
            translationBox.innerText = this.ttsTranslator.currentLang !== 'en' ? `Translation: "${translated}"` : '';
        } else {
            display.innerText = 'Waiting for hand gestures...';
            translationBox.innerText = '';
        }
    }

    speakSentence() {
        const sentence = this.sentenceBuilder.getSentence();
        if (sentence) {
            this.ttsTranslator.speak(sentence);
        }
    }

    clearSentence() {
        this.sentenceBuilder.clear();
        this.updateSentenceDisplay();
    }

    changeLanguage() {
        const lang = document.getElementById('selectLang').value;
        this.ttsTranslator.setLanguage(lang);
        this.updateSentenceDisplay();
    }

    renderProbBars(topScores) {
        let html = '';
        topScores.forEach(s => {
            html += `
                <div class="prob-item">
                    <div class="prob-header">
                        <span>${s.label}</span>
                        <span>${s.prob}%</span>
                    </div>
                    <div class="prob-bar-track">
                        <div class="prob-bar-fill" style="width: ${s.prob}%;"></div>
                    </div>
                </div>
            `;
        });
        document.getElementById('probBarsList').innerHTML = html;
    }

    // Tab Switcher
    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        event.currentTarget.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    }

    // Practice Studio
    evaluateLearning(landmarks) {
        const result = this.learningStudio.evaluatePractice(landmarks);
        const badge = document.getElementById('practiceStatus');

        if (result.matched) {
            badge.className = 'match-status-badge success';
            badge.innerText = '🎉 MATCHED PERFECTLY!';
        } else {
            badge.className = 'match-status-badge';
            badge.innerText = result.message;
        }
    }

    nextPracticeLesson() {
        const lesson = this.learningStudio.nextLesson();
        document.getElementById('practiceIcon').innerText = lesson.icon;
        document.getElementById('practiceTitle').innerText = `PRACTICE: ${lesson.sign}`;
        document.getElementById('practiceHint').innerText = lesson.hint;

        // Auto simulate gesture for lesson demo
        this.simulateGesture(lesson.sign);
    }

    // Admin Dataset Recorder
    recordCustomSign() {
        const input = document.getElementById('inputCustomLabel');
        const label = input.value.trim();
        if (!label) {
            alert('Please enter a label for the custom gesture (e.g. PEACE).');
            return;
        }

        const landmarks = this.currentLandmarks || this.handTracker.generateSyntheticSign(label);
        const res = this.datasetTrainer.recordSample(label, landmarks);

        if (res.success) {
            alert(res.message);
            input.value = '';
            
            // Log sample
            const log = document.getElementById('adminSamplesLog');
            log.innerHTML += `<div>✅ [${new Date().toLocaleTimeString()}] ${label.toUpperCase()} (21 keypoints)</div>`;
        } else {
            alert(res.message);
        }
    }
}

// Initialize application on DOM load
window.addEventListener('DOMContentLoaded', () => {
    window.appInstance = new SignBridgeApp();
});
