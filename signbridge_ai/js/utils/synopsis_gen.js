/**
 * SignBridge AI - Academic B.Tech CSE (Data Science) Project Synopsis Exporter
 */

class SynopsisExporter {
    static generateMarkdownReport() {
        return `
# B.TECH MINI PROJECT SYNOPSIS & TECHNICAL SPECIFICATION

**PROJECT TITLE:** SignBridge AI - Real-Time Sign Language Recognition & Translation System  
**DOMAIN:** Artificial Intelligence, Computer Vision, Data Science, Feature Engineering & Assistive Tech  
**ACADEMIC LEVEL & BRANCH:** B.Tech 2nd Year CSE (Data Science)  

---

## 1. ABSTRACT & OBJECTIVE
Communication barriers between deaf/hard-of-hearing individuals and non-sign language users impede access to education, healthcare, and public services. **SignBridge AI** provides a real-time, vision-based sign language recognition and translation application that processes live camera feeds to recognize hand gestures, alphabets (A-Z), numbers (0-9), and phrases, converting them into natural spoken text and multilingual translations.

---

## 2. SYSTEM ARCHITECTURE & MATHEMATICAL FORMULATION
1. **Camera Video & 21-Keypoint 3D Landmark Pipeline**:
   MediaPipe 3D Hand Skeleton extraction generating 21 joint nodes:
   $$P_i = (x_i, y_i, z_i) \\quad \\text{for } i \\in \\{0, 1, \\dots, 20\\}$$
2. **Normalized Feature Vector ($63\\text{ Dimensions}$)**:
   Relative joint coordinates subtracted from wrist origin $P_0$:
   $$V_{\\text{feature}} = \\left[ x_i - x_0, y_i - y_0, z_i - z_0 \\right]_{i=0}^{20}$$
3. **K-Nearest Neighbors & Cosine Similarity Classifier**:
   $$\\text{Distance}(Q, T) = \\sqrt{\\sum_{j=1}^{63} (Q_j - T_j)^2} + \\lambda \\sum_{k=1}^{5} |E_k^Q - E_k^T|$$
4. **Softmax Probability & Confidence Score**:
   $$\\text{Confidence}(S) = \\min\\left(99.5\\%, \\max\\left(75.0\\%, 99.5 - 12.0 \\times \\text{Distance}\\right)\\right)$$

---

## 3. ALGORITHM PERFORMANCE & COMPLEXITY TABLE

| Component / Task | Time Complexity | Space Complexity | Description |
| :--- | :--- | :--- | :--- |
| **Landmark Extraction** | $O(21) \\equiv O(1)$ | $O(63)$ | Normalizes 21 3D joint coordinates |
| **KNN Gesture Match** | $O(K \\cdot N)$ | $O(N \\cdot 63)$ | Matches feature vector against dataset |
| **Temporal Sentence Buffer** | $O(1)$ | $O(W)$ | Assembles word tokens with debounce window |
| **TTS & Multilingual Map** | $O(W)$ | $O(D)$ | Translates words across 5 target languages |

---

## 4. MULTILINGUAL & ASSISTIVE CAPABILITIES
* **Supported Languages**: English, Hindi (हिंदी), Spanish (Español), French (Français), German (Deutsch).
* **Text-To-Speech (TTS)**: Web Speech API synthesis with customizable voice rate & pitch.
* **Practice Studio**: Flashcard evaluation mode with accuracy feedback.
* **Dataset Management**: Custom landmark capture and in-browser classifier retraining.

---

*Generated automatically by SignBridge AI Academic Tool | B.Tech CSE (Data Science) Mini Project 2026*
`;
    }

    static openReportModal() {
        const mdText = this.generateMarkdownReport();
        
        let modal = document.getElementById('synopsisReportModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'synopsisReportModal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal-card modal-large glass-panel">
                <div class="modal-header">
                    <h3>🎓 B.Tech CSE (Data Science) Project Synopsis & Technical Specification</h3>
                    <button class="btn-close" onclick="document.getElementById('synopsisReportModal').style.display='none'">✕</button>
                </div>
                <div class="modal-body report-body">
                    <pre class="synopsis-code">${SynopsisExporter.escapeHtml(mdText)}</pre>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="navigator.clipboard.writeText(\`${SynopsisExporter.escapeHtml(mdText)}\`); alert('Synopsis Markdown copied to clipboard!');">📋 Copy Markdown</button>
                    <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save PDF</button>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
    }

    static escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
}

window.SynopsisExporter = SynopsisExporter;
