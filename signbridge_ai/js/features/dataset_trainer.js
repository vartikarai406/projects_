/**
 * SignBridge AI - Dataset Recorder & Model Retraining Studio
 * Allows capturing new sign gesture keypoints, labeling custom signs, and exporting dataset JSON
 */

class DatasetTrainer {
    constructor(classifier, handTracker) {
        this.classifier = classifier;
        this.handTracker = handTracker;
        this.recordedSamples = [];
    }

    recordSample(label, landmarks) {
        if (!landmarks || landmarks.length !== 21) {
            return { success: false, message: 'No valid 21-keypoint hand landmark detected.' };
        }

        const success = this.classifier.addCustomGesture(label, landmarks);
        if (success) {
            this.recordedSamples.push({
                label: label.toUpperCase(),
                timestamp: new Date().toLocaleTimeString(),
                landmarkCount: landmarks.length
            });

            return {
                success: true,
                message: `Recorded custom sign "${label.toUpperCase()}". Model retrained!`,
                totalSamples: this.recordedSamples.length
            };
        }

        return { success: false, message: 'Failed to record landmark feature vector.' };
    }

    exportModelJSON() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.classifier.gestureDataset, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "signbridge_custom_model.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }
}

window.DatasetTrainer = DatasetTrainer;
