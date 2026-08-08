/**
 * SignBridge AI - Camera Pipeline & Canvas Landmark Overlay Renderer
 * Handles HTML5 WebCam stream & renders 21-keypoint 3D hand skeleton overlay
 */

class CameraPipeline {
    constructor(videoElementId, canvasElementId, handTracker) {
        this.video = document.getElementById(videoElementId);
        this.canvas = document.getElementById(canvasElementId);
        this.ctx = this.canvas.getContext('2d');
        this.handTracker = handTracker;

        this.isStreaming = false;
        this.currentLandmarks = null;
        this.onFrameCallback = null;
    }

    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
            });
            this.video.srcObject = stream;
            await this.video.play();

            this.canvas.width = this.video.videoWidth || 640;
            this.canvas.height = this.video.videoHeight || 480;
            this.isStreaming = true;

            this.processLoop();
            return true;
        } catch (err) {
            console.warn('Webcam permission denied or camera not available. Switching to Interactive Gesture Simulator Mode:', err);
            this.isStreaming = false;
            return false;
        }
    }

    stopCamera() {
        if (this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(track => track.stop());
            this.video.srcObject = null;
        }
        this.isStreaming = false;
    }

    processLoop() {
        if (!this.isStreaming) return;

        // Render current camera frame to canvas
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

        // Render landmark overlays if available
        if (this.currentLandmarks) {
            this.renderLandmarks(this.currentLandmarks);
        }

        if (this.onFrameCallback) {
            this.onFrameCallback(this.currentLandmarks);
        }

        requestAnimationFrame(() => this.processLoop());
    }

    renderLandmarks(landmarks) {
        if (!landmarks || landmarks.length < 21) return;

        const w = this.canvas.width;
        const h = this.canvas.height;

        // 1. Draw Skeleton Connections (Bones)
        this.ctx.strokeStyle = '#00f2fe';
        this.ctx.lineWidth = 3.5;
        this.ctx.shadowColor = '#00f2fe';
        this.ctx.shadowBlur = 10;

        this.handTracker.connections.forEach(([i, j]) => {
            const p1 = landmarks[i];
            const p2 = landmarks[j];
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x * w, p1.y * h);
            this.ctx.lineTo(p2.x * w, p2.y * h);
            this.ctx.stroke();
        });

        // 2. Draw Keypoint Nodes (Joints)
        landmarks.forEach((pt, idx) => {
            const cx = pt.x * w;
            const cy = pt.y * h;

            let color = '#3b82f6'; // Joint blue
            let radius = 5;

            if ([4, 8, 12, 16, 20].includes(idx)) {
                color = '#ff5252'; // Fingertips red
                radius = 7;
            } else if (idx === 0) {
                color = '#f59e0b'; // Wrist amber
                radius = 8;
            }

            this.ctx.beginPath();
            this.ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
            this.ctx.fillStyle = color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();
        });

        this.ctx.shadowBlur = 0; // Reset shadow
    }

    // Render synthetic simulation frame on canvas
    renderSyntheticFrame(landmarks) {
        this.currentLandmarks = landmarks;

        // Draw dark gradient background for simulator canvas
        const grad = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        grad.addColorStop(0, '#0c101d');
        grad.addColorStop(1, '#182238');

        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid overlay lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.canvas.width; x += 40) {
            this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, this.canvas.height); this.ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += 40) {
            this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(this.canvas.width, y); this.ctx.stroke();
        }

        // Draw landmarks
        this.renderLandmarks(landmarks);
    }
}

window.CameraPipeline = CameraPipeline;
