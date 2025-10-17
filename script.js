class ImageEditor {
    constructor() {
        this.originalImage = null;
        this.processedImage = null;
        this.aspectRatio = 1;
        this.currentFile = null;
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        // टूल बटन
        this.toolButtons = document.querySelectorAll('.tool-btn');
        this.toolSections = document.querySelectorAll('.tool-section');
        
        // अपलोड एरिया
        this.uploadArea = document.getElementById('uploadArea');
        this.uploadBox = document.getElementById('uploadBox');
        this.fileInput = document.getElementById('fileInput');
        
        // कंट्रोल्स
        this.widthInput = document.getElementById('widthInput');
        this.heightInput = document.getElementById('heightInput');
        this.aspectRatioCheckbox = document.getElementById('aspectRatio');
        this.formatSelect = document.getElementById('formatSelect');
        
        // एक्शन बटन
        this.resizeBtn = document.getElementById('resizeBtn');
        this.convertBtn = document.getElementById('convertBtn');
        this.removeBgBtn = document.getElementById('removeBgBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.resetBtn = document.getElementById('resetBtn'); // नया रीसेट बटन
        
        // कैनवास
        this.originalCanvas = document.getElementById('originalCanvas');
        this.processedCanvas = document.getElementById('processedCanvas');
        this.originalCtx = this.originalCanvas.getContext('2d');
        this.processedCtx = this.processedCanvas.getContext('2d');
        
        // रिजल्ट एरिया
        this.resultArea = document.getElementById('resultArea');
    }

    bindEvents() {
        // टूल स्विचिंग
        this.toolButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchTool(btn.dataset.tool));
        });

        // फाइल अपलोड
        this.uploadBox.addEventListener('click', () => this.fileInput.click());
        this.uploadBox.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadBox.addEventListener('drop', (e) => this.handleDrop(e));
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // रीसाइज़ कंट्रोल्स
        this.widthInput.addEventListener('input', () => this.handleResizeInput('width'));
        this.heightInput.addEventListener('input', () => this.handleResizeInput('height'));

        // एक्शन बटन
        this.resizeBtn.addEventListener('click', () => this.resizeImage());
        this.convertBtn.addEventListener('click', () => this.convertFormat());
        this.removeBgBtn.addEventListener('click', () => this.removeBackground());
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.resetBtn.addEventListener('click', () => this.resetApp()); // नया इवेंट
    }

    switchTool(tool) {
        // एक्टिव बटन अपडेट करें
        this.toolButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tool="${tool}"]`).classList.add('active');

        // एक्टिव सेक्शन अपडेट करें
        this.toolSections.forEach(section => section.classList.remove('active'));
        document.getElementById(`${tool}Section`).classList.add('active');
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadBox.style.background = '#d4edda';
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadBox.style.background = '#f8f9fa';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.loadImage(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.currentFile = file;
            this.loadImage(file);
        }
    }

    loadImage(file) {
        if (!file.type.match('image.*')) {
            this.showMessage('कृपया सिर्फ इमेज फाइलें अपलोड करें!', 'error');
            return;
        }

        // लोडिंग स्टेट
        this.setLoadingState(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            this.originalImage = new Image();
            this.originalImage.onload = () => {
                this.displayOriginalImage();
                this.uploadBox.style.display = 'none';
                this.resultArea.style.display = 'block';
                this.setLoadingState(false);
                this.showMessage('इमेज सफलतापूर्वक अपलोड हो गई!', 'success');
            };
            this.originalImage.onerror = () => {
                this.setLoadingState(false);
                this.showMessage('इमेज लोड करने में समस्या आई!', 'error');
            };
            this.originalImage.src = e.target.result;
        };
        reader.onerror = () => {
            this.setLoadingState(false);
            this.showMessage('फाइल पढ़ने में समस्या आई!', 'error');
        };
        reader.readAsDataURL(file);
    }

    displayOriginalImage() {
        const maxWidth = window.innerWidth < 768 ? 300 : 400;
        
        // ओरिजिनल इमेज दिखाएं
        this.originalCanvas.width = Math.min(this.originalImage.width, maxWidth);
        this.originalCanvas.height = (this.originalImage.height / this.originalImage.width) * this.originalCanvas.width;
        
        this.originalCtx.clearRect(0, 0, this.originalCanvas.width, this.originalCanvas.height);
        this.originalCtx.drawImage(this.originalImage, 0, 0, this.originalCanvas.width, this.originalCanvas.height);

        // डिफॉल्ट वैल्यू सेट करें
        this.widthInput.value = this.originalImage.width;
        this.heightInput.value = this.originalImage.height;
        this.aspectRatio = this.originalImage.width / this.originalImage.height;

        // प्रोसेस्ड इमेज भी दिखाएं
        this.displayProcessedImage();
    }

    displayProcessedImage() {
        this.processedCanvas.width = this.originalCanvas.width;
        this.processedCanvas.height = this.originalCanvas.height;
        
        this.processedCtx.clearRect(0, 0, this.processedCanvas.width, this.processedCanvas.height);
        this.processedCtx.drawImage(this.originalImage, 0, 0, this.processedCanvas.width, this.processedCanvas.height);
    }

    handleResizeInput(type) {
        if (!this.aspectRatioCheckbox.checked || !this.originalImage) return;

        if (type === 'width') {
            const newWidth = parseInt(this.widthInput.value);
            const newHeight = Math.round(newWidth / this.aspectRatio);
            this.heightInput.value = newHeight;
        } else {
            const newHeight = parseInt(this.heightInput.value);
            const newWidth = Math.round(newHeight * this.aspectRatio);
            this.widthInput.value = newWidth;
        }
    }

    resizeImage() {
        if (!this.originalImage) {
            this.showMessage('कृपया पहले एक इमेज अपलोड करें!', 'error');
            return;
        }

        this.setLoadingState(true);

        const newWidth = parseInt(this.widthInput.value);
        const newHeight = parseInt(this.heightInput.value);

        // नया कैनवास बनाएं
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = newWidth;
        tempCanvas.height = newHeight;

        // इमेज रीसाइज़ करें
        tempCtx.drawImage(this.originalImage, 0, 0, newWidth, newHeight);

        // रिजल्ट दिखाएं
        this.processedImage = new Image();
        this.processedImage.onload = () => {
            const maxWidth = window.innerWidth < 768 ? 300 : 400;
            this.processedCanvas.width = Math.min(newWidth, maxWidth);
            this.processedCanvas.height = (newHeight / newWidth) * this.processedCanvas.width;
            
            this.processedCtx.clearRect(0, 0, this.processedCanvas.width, this.processedCanvas.height);
            this.processedCtx.drawImage(this.processedImage, 0, 0, this.processedCanvas.width, this.processedCanvas.height);
            
            this.setLoadingState(false);
            this.showMessage('इमेज सफलतापूर्वक रीसाइज़ हो गई!', 'success');
        };
        this.processedImage.src = tempCanvas.toDataURL();
    }

    convertFormat() {
        if (!this.originalImage) {
            this.showMessage('कृपया पहले एक इमेज अपलोड करें!', 'error');
            return;
        }

        this.setLoadingState(true);

        const format = this.formatSelect.value;
        const mimeType = `image/${format}`;

        // कन्वर्ट करें
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = this.originalImage.width;
        tempCanvas.height = this.originalImage.height;
        tempCtx.drawImage(this.originalImage, 0, 0);

        // रिजल्ट दिखाएं
        this.processedImage = new Image();
        this.processedImage.onload = () => {
            this.processedCanvas.width = this.originalCanvas.width;
            this.processedCanvas.height = this.originalCanvas.height;
            
            this.processedCtx.clearRect(0, 0, this.processedCanvas.width, this.processedCanvas.height);
            this.processedCtx.drawImage(this.processedImage, 0, 0, this.processedCanvas.width, this.processedCanvas.height);
            
            this.setLoadingState(false);
            this.showMessage(`इमेज ${format.toUpperCase()} फॉर्मेट में कन्वर्ट हो गई!`, 'success');
        };
        this.processedImage.src = tempCanvas.toDataURL(mimeType);
    }

    removeBackground() {
        if (!this.originalImage) {
            this.showMessage('कृपया पहले एक इमेज अपलोड करें!', 'error');
            return;
        }

        this.setLoadingState(true);

        // यह एक बेसिक बैकग्राउंड रिमूवल है
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = this.originalImage.width;
        tempCanvas.height = this.originalImage.height;

        // इमेज ड्रा करें
        tempCtx.drawImage(this.originalImage, 0, 0);

        // सिंपल कलर-बेस्ड बैकग्राउंड रिमूवल
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;

        // सैंपल: कॉर्नर पिक्सेल को बैकग्राउंड मानें
        const backgroundR = data[0];
        const backgroundG = data[1];
        const backgroundB = data[2];

        // सिमिलर कलर वाले पिक्सेल को ट्रांसपेरेंट करें
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // कलर डिफरेंस कैलकुलेट करें
            const diff = Math.abs(r - backgroundR) + Math.abs(g - backgroundG) + Math.abs(b - backgroundB);
            
            if (diff < 100) { // थ्रेशोल्ड
                data[i + 3] = 0; // अल्फा चैनल सेट करें (ट्रांसपेरेंट)
            }
        }

        tempCtx.putImageData(imageData, 0, 0);

        // रिजल्ट दिखाएं
        this.processedImage = new Image();
        this.processedImage.onload = () => {
            this.processedCanvas.width = this.originalCanvas.width;
            this.processedCanvas.height = this.originalCanvas.height;
            
            this.processedCtx.clearRect(0, 0, this.processedCanvas.width, this.processedCanvas.height);
            this.processedCtx.drawImage(this.processedImage, 0, 0, this.processedCanvas.width, this.processedCanvas.height);
            
            this.setLoadingState(false);
            this.showMessage('बैकग्राउंड सफलतापूर्वक रिमूव हो गया!', 'success');
        };
        this.processedImage.src = tempCanvas.toDataURL('image/png');
    }

    downloadImage() {
        if (!this.processedImage) {
            this.showMessage('कोई प्रोसेस्ड इमेज नहीं है!', 'error');
            return;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const link = document.createElement('a');
        link.download = `edited-image-${timestamp}.png`;
        link.href = this.processedImage.src;
        link.click();
        
        this.showMessage('इमेज डाउनलोड हो गई!', 'success');
    }

    // नया मेथड: ऐप को रीसेट करें
    resetApp() {
        // सभी वेरिएबल्स रीसेट करें
        this.originalImage = null;
        this.processedImage = null;
        this.currentFile = null;
        
        // कैनवास क्लियर करें
        this.originalCtx.clearRect(0, 0, this.originalCanvas.width, this.originalCanvas.height);
        this.processedCtx.clearRect(0, 0, this.processedCanvas.width, this.processedCanvas.height);
        
        // UI रीसेट करें
        this.uploadBox.style.display = 'block';
        this.resultArea.style.display = 'none';
        this.fileInput.value = '';
        
        // डिफॉल्ट वैल्यू रीसेट करें
        this.widthInput.value = '800';
        this.heightInput.value = '600';
        this.formatSelect.value = 'png';
        
        this.showMessage('ऐप रीसेट हो गया! नई इमेज अपलोड करें।', 'success');
    }

    // हेल्पर मेथड: लोडिंग स्टेट सेट करें
    setLoadingState(isLoading) {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.disabled = isLoading;
        });
        
        if (isLoading) {
            document.body.classList.add('loading');
        } else {
            document.body.classList.remove('loading');
        }
    }

    // हेल्पर मेथड: मैसेज दिखाएं
    showMessage(message, type) {
        // पहले का मैसेज हटाएं
        const existingMessage = document.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // नया मैसेज बनाएं
        const messageDiv = document.createElement('div');
        messageDiv.className = `success-message ${type}`;
        messageDiv.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
        messageDiv.style.color = type === 'success' ? '#155724' : '#721c24';
        messageDiv.style.border = type === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb';
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';

        // कंटेनर में एड करें
        document.querySelector('.container').insertBefore(messageDiv, document.querySelector('.tool-selection'));

        // 3 सेकंड बाद हटाएं
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// ऐप इनिशियलाइज़ करें
document.addEventListener('DOMContentLoaded', () => {
    new ImageEditor();
});

// मोबाइल डिवाइस डिटेक्शन
if ('ontouchstart' in window || navigator.maxTouchPoints) {
    document.body.classList.add('touch-device');
}

// विंडो रीसाइज हेंडलर
window.addEventListener('resize', () => {
    // मोबाइल डिवाइस पर ऑटो-एडजस्ट
    if (window.innerWidth < 768) {
        document.body.classList.add('mobile-view');
    } else {
        document.body.classList.remove('mobile-view');
    }
});

class TextToSpeechConverter {
    constructor() {
        this.speech = new SpeechSynthesisUtterance();
        this.synth = window.speechSynthesis;
        this.isSpeaking = false;
        this.isPaused = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadVoices();
        
        // Event listener for voices loaded
        speechSynthesis.addEventListener('voiceschanged', () => {
            this.loadVoices();
        });
    }

    initializeElements() {
        // Input elements
        this.textInput = document.getElementById('textInput');
        this.voiceSelect = document.getElementById('voiceSelect');
        this.rateSelect = document.getElementById('rateSelect');
        this.pitchSelect = document.getElementById('pitchSelect');
        this.volumeSelect = document.getElementById('volumeSelect');
        
        // Buttons
        this.speakBtn = document.getElementById('speakBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.stopBtn = document.getElementById('stopBtn');
        
        // Stats
        this.charCount = document.getElementById('charCount');
        this.wordCount = document.getElementById('wordCount');
        
        // Progress
        this.progressSection = document.getElementById('progressSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        
        // Language buttons
        this.langButtons = document.querySelectorAll('.lang-btn');
        
        // Sample buttons
        this.sampleButtons = document.querySelectorAll('.sample-btn');
    }

    bindEvents() {
        // Text input events
        this.textInput.addEventListener('input', () => {
            this.updateStats();
        });

        // Control buttons
        this.speakBtn.addEventListener('click', () => this.speak());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resumeBtn.addEventListener('click', () => this.resume());
        this.stopBtn.addEventListener('click', () => this.stop());

        // Settings changes
        this.voiceSelect.addEventListener('change', () => this.updateVoice());
        this.rateSelect.addEventListener('change', () => this.updateSettings());
        this.pitchSelect.addEventListener('change', () => this.updateSettings());
        this.volumeSelect.addEventListener('change', () => this.updateSettings());

        // Language buttons
        this.langButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.changeLanguage(e.target));
        });

        // Sample text buttons
        this.sampleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.textInput.value = e.target.dataset.text;
                this.updateStats();
            });
        });

        // Speech events
        this.speech.onstart = () => this.onSpeechStart();
        this.speech.onend = () => this.onSpeechEnd();
        this.speech.onerror = (event) => this.onSpeechError(event);
        this.speech.onboundary = (event) => this.onSpeechBoundary(event);
    }

    loadVoices() {
        // Clear existing options
        this.voiceSelect.innerHTML = '<option value="">डिफॉल्ट आवाज़</option>';
        
        const voices = this.synth.getVoices();
        
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            this.voiceSelect.appendChild(option);
        });
    }

    updateVoice() {
        const voices = this.synth.getVoices();
        const selectedVoice = this.voiceSelect.value;
        
        if (selectedVoice) {
            const voice = voices.find(v => v.name === selectedVoice);
            if (voice) {
                this.speech.voice = voice;
            }
        }
    }

    updateSettings() {
        this.speech.rate = parseFloat(this.rateSelect.value);
        this.speech.pitch = parseFloat(this.pitchSelect.value);
        this.speech.volume = parseFloat(this.volumeSelect.value);
    }

    updateStats() {
        const text = this.textInput.value;
        const charCount = text.length;
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
        
        this.charCount.textContent = charCount;
        this.wordCount.textContent = wordCount;
    }

    changeLanguage(button) {
        // Update active button
        this.langButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const lang = button.dataset.lang;
        
        // Update speech language if available
        const voices = this.synth.getVoices();
        const voice = voices.find(v => v.lang.startsWith(lang));
        
        if (voice) {
            this.speech.voice = voice;
            this.voiceSelect.value = voice.name;
        }
        
        this.showMessage(`भाषा बदली गई: ${button.textContent}`, 'success');
    }

    speak() {
        const text = this.textInput.value.trim();
        
        if (!text) {
            this.showMessage('कृपया बोलने के लिए कुछ टेक्स्ट डालें!', 'error');
            return;
        }

        if (this.isSpeaking) {
            this.stop();
        }

        this.speech.text = text;
        this.updateSettings();
        this.updateVoice();
        
        this.synth.speak(this.speech);
    }

    pause() {
        if (this.isSpeaking && !this.isPaused) {
            this.synth.pause();
            this.isPaused = true;
            this.updateButtonStates();
            this.progressText.textContent = 'रुका हुआ...';
        }
    }

    resume() {
        if (this.isSpeaking && this.isPaused) {
            this.synth.resume();
            this.isPaused = false;
            this.updateButtonStates();
            this.progressText.textContent = 'बोला जा रहा है...';
        }
    }

    stop() {
        this.synth.cancel();
        this.isSpeaking = false;
        this.isPaused = false;
        this.updateButtonStates();
        this.hideProgress();
    }

    onSpeechStart() {
        this.isSpeaking = true;
        this.isPaused = false;
        this.updateButtonStates();
        this.showProgress();
        this.speakBtn.classList.add('speaking');
    }

    onSpeechEnd() {
        this.isSpeaking = false;
        this.isPaused = false;
        this.updateButtonStates();
        this.hideProgress();
        this.speakBtn.classList.remove('speaking');
        this.showMessage('टेक्स्ट बोलना पूरा हुआ!', 'success');
    }

    onSpeechError(event) {
        console.error('Speech error:', event);
        this.isSpeaking = false;
        this.isPaused = false;
        this.updateButtonStates();
        this.hideProgress();
        this.speakBtn.classList.remove('speaking');
        this.showMessage('आवाज़ बजाने में समस्या आई!', 'error');
    }

    onSpeechBoundary(event) {
        // Update progress based on speech position
        if (event.name === 'word') {
            const text = this.textInput.value;
            const progress = (event.charIndex / text.length) * 100;
            this.progressFill.style.width = `${progress}%`;
        }
    }

    updateButtonStates() {
        this.speakBtn.disabled = this.isSpeaking && !this.isPaused;
        this.pauseBtn.disabled = !this.isSpeaking || this.isPaused;
        this.resumeBtn.disabled = !this.isSpeaking || !this.isPaused;
        this.stopBtn.disabled = !this.isSpeaking;
    }

    showProgress() {
        this.progressSection.style.display = 'block';
        this.progressFill.style.width = '0%';
        this.progressText.textContent = 'बोला जा रहा है...';
    }

    hideProgress() {
        this.progressSection.style.display = 'none';
        this.progressFill.style.width = '0%';
    }

    showMessage(message, type) {
        // Remove existing message
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        // Remove after 3 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// Initialize the converter when page loads
document.addEventListener('DOMContentLoaded', () => {
    new TextToSpeechConverter();
});

// Add CSS for message animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
