/**
 * SignBridge AI - Interactive Sign Language Practice & Learning Studio
 * Flashcard practice mode with live camera accuracy evaluation
 */

class LearningStudio {
    constructor(classifier, handTracker) {
        this.classifier = classifier;
        this.handTracker = handTracker;

        this.practiceList = [
            { sign: 'HELLO', hint: 'Open palm facing camera with fingers extended upward', icon: '🖐️' },
            { sign: 'A', hint: 'Make a fist with your thumb resting against the side', icon: '✊' },
            { sign: 'B', hint: 'Open palm with four fingers straight and thumb tucked across palm', icon: '✋' },
            { sign: 'THANK YOU', hint: 'Touch fingers to chin and move hand forward toward camera', icon: '🙏' },
            { sign: 'I LOVE YOU', hint: 'Extend thumb, index, and pinky finger while curling middle & ring fingers', icon: '🤟' },
            { sign: 'HELP', hint: 'Place thumb up on flat palm base', icon: '👍' },
            { sign: 'WATER', hint: 'Form a "W" shape with index, middle, and ring fingers', icon: '🥛' }
        ];

        this.currentIndex = 0;
        this.score = 0;
    }

    getCurrentLesson() {
        return this.practiceList[this.currentIndex];
    }

    evaluatePractice(currentLandmarks) {
        const lesson = this.getCurrentLesson();
        if (!currentLandmarks || currentLandmarks.length < 21) {
            return { matched: false, confidence: 0, message: 'Position your hand inside the camera frame' };
        }

        const pred = this.classifier.classify(currentLandmarks);
        const matched = pred.label === lesson.sign && pred.confidence >= 80.0;

        return {
            matched,
            confidence: pred.confidence,
            detectedLabel: pred.label,
            targetSign: lesson.sign,
            message: matched ? '🎉 Excellent! Gesture Matched Perfectly!' : `Keep trying... Currently detecting: "${pred.label}" (${pred.confidence}%)`
        };
    }

    nextLesson() {
        this.currentIndex = (this.currentIndex + 1) % this.practiceList.length;
        return this.getCurrentLesson();
    }
}

window.LearningStudio = LearningStudio;
