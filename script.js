
/* =============================================================
   WELCOME SCREEN
   ============================================================= */
const welcomeOverlay = document.getElementById('welcome-overlay');
const alreadyVisited = sessionStorage.getItem('fw-visited');

if (alreadyVisited) {
    welcomeOverlay.classList.add('hidden');
    welcomeOverlay.addEventListener('transitionend', () => {
        welcomeOverlay.style.display = 'none';
    }, { once: true });
} else {
    // Auto-dismiss welcome screen after 3 seconds
    setTimeout(() => {
        sessionStorage.setItem('fw-visited', '1');
        welcomeOverlay.classList.add('hidden');
        setTimeout(() => { welcomeOverlay.style.display = 'none'; }, 900);
    }, 3000);
}


/* =============================================================
   CLOCK
   ============================================================= */
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const elHours = document.getElementById('clock-hours');
const elMinutes = document.getElementById('clock-minutes');
const elDate = document.getElementById('clock-date');
const elAmPm = document.getElementById('clock-ampm');

let use24h = false; // default to 12-hour

function updateClock() {
    const now = new Date();
    let h = now.getHours();

    if (!use24h) {
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        elAmPm.textContent = ampm;
    }

    elHours.textContent = String(h).padStart(2, '0');
    elMinutes.textContent = String(now.getMinutes()).padStart(2, '0');
    elDate.textContent = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
}

updateClock();
setInterval(updateClock, 1000);

/* =============================================================
   12/24 HOUR FORMAT TOGGLE
   ============================================================= */
const format12 = document.getElementById('format-12');
const format24 = document.getElementById('format-24');
const formatSlider = document.getElementById('format-slider');

function setClockFormat(is24) {
    use24h = is24;

    // Update active label
    format12.classList.toggle('active', !is24);
    format24.classList.toggle('active', is24);

    // Slide the indicator
    formatSlider.classList.toggle('right', is24);

    // Show/hide AM-PM
    elAmPm.classList.toggle('hidden-ampm', is24);

    // Smooth transition on the clock digits
    const clockContainer = document.getElementById('clock-container');
    clockContainer.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    clockContainer.style.opacity = '0.6';
    clockContainer.style.transform = 'scale(0.97)';
    setTimeout(() => {
        updateClock();
        clockContainer.style.opacity = '1';
        clockContainer.style.transform = 'scale(1)';
    }, 150);
}

format12.addEventListener('click', () => setClockFormat(false));
format24.addEventListener('click', () => setClockFormat(true));

/* =============================================================
   THEME TOGGLE (sunset → night → sunset)
   ============================================================= */
const THEMES = ['sunset', 'night'];
let themeIndex = 0;

document.getElementById('btn-theme').addEventListener('click', () => {
    themeIndex = (themeIndex + 1) % THEMES.length;
    document.body.setAttribute('data-theme', THEMES[themeIndex]);
});

/* =============================================================
   CLOCK POSITION TOGGLE
   ============================================================= */
const POSITIONS = ['center', 'top', 'bottom-left'];
let posIndex = 0;
const dashboard = document.getElementById('dashboard');

document.getElementById('btn-clock-pos').addEventListener('click', () => {
    posIndex = (posIndex + 1) % POSITIONS.length;
    dashboard.setAttribute('data-clock-pos', POSITIONS[posIndex]);

    // Reset any manual drag when switching presets
    const clockEl = document.getElementById('clock-container');
    clockEl.classList.remove('clock-dragging');
    clockEl.style.left = '';
    clockEl.style.top = '';
});

/* =============================================================
   CLOCK DRAG — freely reposition the clock anywhere
   ============================================================= */
(function () {
    const clockEl = document.getElementById('clock-container');
    let isDragging = false;
    let startX, startY, origLeft, origTop;
    const DEAD_ZONE = 5; // px — prevents accidental drag on simple click
    let dragStarted = false;

    function pointerDown(e) {
        // Ignore if clicking inside a button / interactive child
        if (e.target.closest('button, input, a')) return;

        const evt = e.touches ? e.touches[0] : e;
        isDragging = true;
        dragStarted = false;

        // If already dragging-state, use current position; otherwise compute from bounding rect
        const rect = clockEl.getBoundingClientRect();
        origLeft = rect.left;
        origTop = rect.top;
        startX = evt.clientX;
        startY = evt.clientY;

        e.preventDefault();
    }

    function pointerMove(e) {
        if (!isDragging) return;
        const evt = e.touches ? e.touches[0] : e;
        const dx = evt.clientX - startX;
        const dy = evt.clientY - startY;

        // Only start actual drag after exceeding dead-zone
        if (!dragStarted) {
            if (Math.abs(dx) < DEAD_ZONE && Math.abs(dy) < DEAD_ZONE) return;
            dragStarted = true;
            clockEl.classList.add('clock-dragging');
        }

        clockEl.style.left = `${origLeft + dx}px`;
        clockEl.style.top = `${origTop + dy}px`;
    }

    function pointerUp() {
        isDragging = false;
        dragStarted = false;
    }

    // Mouse events
    clockEl.addEventListener('mousedown', pointerDown);
    window.addEventListener('mousemove', pointerMove);
    window.addEventListener('mouseup', pointerUp);

    // Touch events
    clockEl.addEventListener('touchstart', pointerDown, { passive: false });
    window.addEventListener('touchmove', pointerMove, { passive: false });
    window.addEventListener('touchend', pointerUp);
})();

/* =============================================================
   PANEL TOGGLE LOGIC
   ============================================================= */
const panels = {
    pomodoro: document.getElementById('pomodoro-panel'),
    stopwatch: document.getElementById('stopwatch-panel'),
    music: document.getElementById('music-panel'),
};

function closeAllPanels() {
    Object.values(panels).forEach(p => p.classList.remove('visible'));
    document.querySelectorAll('.toolbar-btn').forEach(b => b.classList.remove('active'));
    document.body.classList.remove('panel-open');
}

function togglePanel(name) {
    const panel = panels[name];
    const btn = document.getElementById(`btn-${name === 'music' ? 'music' : name}`);
    const isVisible = panel.classList.contains('visible');

    // Close all panels
    closeAllPanels();

    if (!isVisible) {
        panel.classList.add('visible');
        btn.classList.add('active');
        document.body.classList.add('panel-open');
    }
}

document.getElementById('btn-pomodoro').addEventListener('click', () => togglePanel('pomodoro'));
document.getElementById('btn-stopwatch').addEventListener('click', () => togglePanel('stopwatch'));
document.getElementById('btn-music').addEventListener('click', () => togglePanel('music'));

/* --- Close panels on tap outside (mobile fix) --- */
document.addEventListener('click', (e) => {
    // Don't close if the click was inside a panel or on a toolbar button
    if (e.target.closest('.panel') || e.target.closest('.toolbar-btn') || e.target.closest('.toolbar')) return;
    closeAllPanels();
});

/* =============================================================
   POMODORO TIMER
   ============================================================= */
let POMO_FOCUS = 25 * 60;
let POMO_BREAK = 5 * 60;
let POMO_LONG_BREAK = 15 * 60;
let pomoTime = POMO_FOCUS;
let pomoRunning = false;
let pomoInterval = null;
let pomoIsFocus = true;
let pomoSessions = 0;
let pomoSoundOn = true;
const pomoDisplay = document.getElementById('pomo-display');
const pomoLabel = document.getElementById('pomo-label');
const pomoRing = document.getElementById('pomo-ring-fill');
const pomoCircumference = 2 * Math.PI * 42;

pomoRing.style.strokeDasharray = pomoCircumference;

/* --- Web Audio chime (no external file needed) --- */
function playPomoChime() {
    if (!pomoSoundOn) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 — major chord
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.18);
            gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.18 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.18);
            osc.stop(ctx.currentTime + i * 0.18 + 0.8);
        });
        // Cleanup after sound finishes
        setTimeout(() => ctx.close(), 2000);
    } catch (e) {
        console.warn('Audio chime error:', e);
    }
}

/* --- Sound toggle --- */
const pomoSoundBtn = document.getElementById('pomo-sound-toggle');
const SOUND_ON_SVG = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />';
const SOUND_OFF_SVG = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />';

pomoSoundBtn.addEventListener('click', () => {
    pomoSoundOn = !pomoSoundOn;
    pomoSoundBtn.querySelector('svg').innerHTML = pomoSoundOn ? SOUND_ON_SVG : SOUND_OFF_SVG;
    pomoSoundBtn.title = pomoSoundOn ? 'Sound On' : 'Sound Off';
    pomoSoundBtn.classList.toggle('muted', !pomoSoundOn);
});

/* --- Settings panel toggle --- */
const pomoSettingsToggle = document.getElementById('pomo-settings-toggle');
const pomoCustomSettings = document.getElementById('pomo-custom-settings');
let pomoSettingsOpen = false;

pomoSettingsToggle.addEventListener('click', () => {
    pomoSettingsOpen = !pomoSettingsOpen;
    pomoCustomSettings.classList.toggle('open', pomoSettingsOpen);
    pomoSettingsToggle.classList.toggle('active', pomoSettingsOpen);
});

/* --- Stepper buttons (+/-) --- */
document.querySelectorAll('.pomo-stepper').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.target);
        const dir = parseInt(btn.dataset.dir);
        let val = parseInt(input.value) + dir;
        val = Math.max(parseInt(input.min), Math.min(parseInt(input.max), val));
        input.value = val;
    });
});

/* --- Presets --- */
function applyPomoTimes(focusMin, shortMin, longMin) {
    if (pomoRunning) return; // don't change while running
    POMO_FOCUS = focusMin * 60;
    POMO_BREAK = shortMin * 60;
    POMO_LONG_BREAK = longMin * 60;
    pomoIsFocus = true;
    pomoTime = POMO_FOCUS;
    pomoSessions = 0;
    pomoLabel.textContent = 'Focus Session';
    document.getElementById('pomo-start').textContent = 'Start';
    updatePomoDisplay();
    updatePomoDots();
    // Update custom inputs to reflect preset values
    document.getElementById('pomo-custom-focus').value = focusMin;
    document.getElementById('pomo-custom-short').value = shortMin;
    document.getElementById('pomo-custom-long').value = longMin;
}

document.querySelectorAll('.pomo-preset').forEach(btn => {
    btn.addEventListener('click', () => {
        if (pomoRunning) return;
        document.querySelectorAll('.pomo-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyPomoTimes(
            parseInt(btn.dataset.focus),
            parseInt(btn.dataset.short),
            parseInt(btn.dataset.long)
        );
    });
});

/* --- Apply custom --- */
document.getElementById('pomo-apply-custom').addEventListener('click', () => {
    if (pomoRunning) return;
    const focusMin = parseInt(document.getElementById('pomo-custom-focus').value) || 25;
    const shortMin = parseInt(document.getElementById('pomo-custom-short').value) || 5;
    const longMin = parseInt(document.getElementById('pomo-custom-long').value) || 15;
    // Deselect presets
    document.querySelectorAll('.pomo-preset').forEach(b => b.classList.remove('active'));
    applyPomoTimes(focusMin, shortMin, longMin);
    // Close settings
    pomoSettingsOpen = false;
    pomoCustomSettings.classList.remove('open');
    pomoSettingsToggle.classList.remove('active');
});

/* --- Display update --- */
function updatePomoDisplay() {
    const m = Math.floor(pomoTime / 60);
    const s = pomoTime % 60;
    pomoDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    const total = pomoIsFocus ? POMO_FOCUS : (pomoSessions % 4 === 0 && pomoSessions > 0 ? POMO_LONG_BREAK : POMO_BREAK);
    const progress = 1 - (pomoTime / total);
    pomoRing.style.strokeDashoffset = pomoCircumference * (1 - progress);
}

updatePomoDisplay();

/* --- Start / Pause --- */
document.getElementById('pomo-start').addEventListener('click', function () {
    if (pomoRunning) {
        clearInterval(pomoInterval);
        pomoRunning = false;
        this.textContent = 'Resume';
    } else {
        pomoRunning = true;
        this.textContent = 'Pause';
        pomoInterval = setInterval(() => {
            pomoTime--;
            if (pomoTime < 0) {
                clearInterval(pomoInterval);
                pomoRunning = false;
                playPomoChime();

                // Flash the ring for visual feedback
                pomoRing.style.stroke = '#fff';
                setTimeout(() => { pomoRing.style.stroke = ''; }, 600);

                if (pomoIsFocus) {
                    pomoSessions++;
                    updatePomoDots();
                    pomoIsFocus = false;
                    pomoTime = (pomoSessions % 4 === 0) ? POMO_LONG_BREAK : POMO_BREAK;
                    pomoLabel.textContent = (pomoSessions % 4 === 0) ? 'Long Break' : 'Short Break';
                } else {
                    pomoIsFocus = true;
                    pomoTime = POMO_FOCUS;
                    pomoLabel.textContent = 'Focus Session';
                }
                document.getElementById('pomo-start').textContent = 'Start';
            }
            updatePomoDisplay();
        }, 1000);
    }
});

/* --- Reset --- */
document.getElementById('pomo-reset').addEventListener('click', () => {
    clearInterval(pomoInterval);
    pomoRunning = false;
    pomoIsFocus = true;
    pomoTime = POMO_FOCUS;
    pomoSessions = 0;
    pomoLabel.textContent = 'Focus Session';
    document.getElementById('pomo-start').textContent = 'Start';
    updatePomoDisplay();
    updatePomoDots();
});

function updatePomoDots() {
    const dots = document.querySelectorAll('.pomo-dot');
    dots.forEach((d, i) => {
        d.classList.toggle('filled', i < (pomoSessions % 5));
    });
}


/* =============================================================
   STOPWATCH
   ============================================================= */
let swTime = 0;
let swRunning = false;
let swInterval = null;
let swLaps = [];
const swDisplay = document.getElementById('sw-display');
const swLapsList = document.getElementById('sw-laps');

function formatSW(ms) {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const cs = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}<span style="font-size:1.4rem;opacity:0.5">.${String(cs).padStart(2, '0')}</span>`;
}

function updateSWDisplay() {
    swDisplay.innerHTML = formatSW(swTime);
}

document.getElementById('sw-start').addEventListener('click', function () {
    if (swRunning) {
        clearInterval(swInterval);
        swRunning = false;
        this.textContent = 'Resume';
    } else {
        swRunning = true;
        this.textContent = 'Pause';
        const startAt = Date.now() - swTime;
        swInterval = setInterval(() => {
            swTime = Date.now() - startAt;
            updateSWDisplay();
        }, 30);
    }
});

document.getElementById('sw-lap').addEventListener('click', () => {
    if (swTime > 0) {
        swLaps.push(swTime);
        const lapEl = document.createElement('div');
        lapEl.style.padding = '0.15rem 0';
        lapEl.style.borderBottom = '1px solid var(--widget-border)';
        lapEl.textContent = `Lap ${swLaps.length}: ${String(Math.floor(swTime / 60000)).padStart(2, '0')}:${String(Math.floor((swTime % 60000) / 1000)).padStart(2, '0')}.${String(Math.floor((swTime % 1000) / 10)).padStart(2, '0')}`;
        swLapsList.prepend(lapEl);
    }
});

document.getElementById('sw-reset').addEventListener('click', () => {
    clearInterval(swInterval);
    swRunning = false;
    swTime = 0;
    swLaps = [];
    swLapsList.innerHTML = '';
    document.getElementById('sw-start').textContent = 'Start';
    updateSWDisplay();
});

/* =============================================================
   LOFI RADIO (Direct HTML5 Audio Stream)
   ============================================================= */
const LOFI_STATIONS = [
    { title: "Lofi Live", file: "https://stream.zeno.fm/0r0xa792kwzuv" },
    { title: "FluxFM Chillhop", file: "https://channels.fluxfm.de/chillhop/externalembedflxhp/stream.mp3" },
    { title: "SomaFM Groove Salad", file: "https://ice1.somafm.com/groovesalad-128-mp3" },
    { title: "SomaFM Space Station", file: "https://ice1.somafm.com/spacestation-128-mp3" },
    { title: "SomaFM Secret Agent", file: "https://ice1.somafm.com/secretagent-128-aac" }
];

let lofiCurrentIndex = 0;
const lofiAudio = new Audio(LOFI_STATIONS[lofiCurrentIndex].file);
lofiAudio.crossOrigin = "anonymous";
let lofiIsPlaying = false;

// DOM Element Refs
const ostPlayBtn = document.getElementById('ost-play');
const ostPlayIcon = document.getElementById('ost-play-icon');
const lofiWidget = document.getElementById('lofi-widget');
const lofiStatusText = document.getElementById('lofi-status');
const lofiTrackName = document.getElementById('lofi-track-name');
const lofiTrackNameDup = document.getElementById('lofi-track-name-dup'); // The duplicate span for looping
const ostVisualizer = document.getElementById('ost-visualizer');
const volumeSlider = document.getElementById('volume-slider');
const ostMusicBars = ostVisualizer.querySelectorAll('.music-bar');
const ostTracklistToggle = document.getElementById('ost-tracklist-toggle');
const lofiTracklist = document.getElementById('lofi-tracklist');

const PLAY_SVG = '<polygon points="6,3 20,12 6,21" />';
const PAUSE_SVG = '<rect x="5" y="3" width="5" height="18" rx="1" /><rect x="14" y="3" width="5" height="18" rx="1" />';

// Helper to update both spans for the seamless marquee
function updateTrackNameDisplay(text) {
    if (lofiTrackName) lofiTrackName.textContent = text;
    if (lofiTrackNameDup) lofiTrackNameDup.textContent = text;
    const panelName = document.getElementById('ost-track-name');
    if (panelName) panelName.textContent = text;
}
updateTrackNameDisplay(LOFI_STATIONS[lofiCurrentIndex].title);

// --- Build Lofi track list UI ---
LOFI_STATIONS.forEach((station, idx) => {
    const item = document.createElement('div');
    item.className = 'ost-tracklist-item'; 
    item.dataset.index = idx;
    item.innerHTML = `<span class="ost-tl-num">${String(idx + 1).padStart(2, '0')}</span><span class="ost-tl-title">${station.title}</span>`;
    item.addEventListener('click', () => {
        loadLofiStation(idx);
        playLofi();
    });
    lofiTracklist.appendChild(item);
});

function highlightLofiItem() {
    lofiTracklist.querySelectorAll('.ost-tracklist-item').forEach((el, i) => {
        el.classList.toggle('active', i === lofiCurrentIndex);
    });
}
highlightLofiItem();

let tracklistOpen = false;
ostTracklistToggle.addEventListener('click', () => {
    tracklistOpen = !tracklistOpen;
    lofiTracklist.classList.toggle('open', tracklistOpen);
    ostTracklistToggle.classList.toggle('open', tracklistOpen);
});

function loadLofiStation(index) {
    lofiCurrentIndex = index;
    const station = LOFI_STATIONS[index];
    lofiAudio.src = station.file;
    highlightLofiItem();

    lofiStatusText.textContent = lofiIsPlaying ? "Live Now" : "Radio Ready";
    updateTrackNameDisplay(station.title);
}

function playLofi() {
    lofiStatusText.textContent = "Connecting...";
    lofiAudio.play().then(() => {
        lofiIsPlaying = true;
        lofiStatusText.textContent = "Live Now";
        lofiWidget.classList.add('playing');
        ostPlayIcon.innerHTML = PAUSE_SVG;
        ostMusicBars.forEach(b => b.classList.add('playing'));
    }).catch(e => {
        console.warn("Lofi Stream Error: ", e);
        lofiStatusText.textContent = "Stream Offline";
        updateTrackNameDisplay("Connection failed. Please try again later.");
    });
}

function pauseLofi() {
    lofiAudio.pause();
    lofiIsPlaying = false;
    lofiStatusText.textContent = "Paused";
    lofiWidget.classList.remove('playing');
    ostPlayIcon.innerHTML = PLAY_SVG;
    ostMusicBars.forEach(b => b.classList.remove('playing'));
}

ostPlayBtn.addEventListener('click', () => {
    if (lofiIsPlaying) {
        pauseLofi();
    } else {
        playLofi();
    }
});

// Volume
lofiAudio.volume = parseInt(volumeSlider.value) / 100;
volumeSlider.addEventListener('input', () => {
    lofiAudio.volume = parseInt(volumeSlider.value) / 100;
});

/* =============================================================
   FIREFLY PARTICLE SYSTEM
   ============================================================= */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Firefly {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 1;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = 0;
        this.targetOpacity = Math.random() * 0.6 + 0.2;
        this.fadeSpeed = Math.random() * 0.008 + 0.003;
        this.fadingIn = true;
        this.life = Math.random() * 400 + 200;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.fadingIn) {
            this.opacity += this.fadeSpeed;
            if (this.opacity >= this.targetOpacity) this.fadingIn = false;
        } else {
            this.life--;
            if (this.life <= 0) {
                this.opacity -= this.fadeSpeed * 2;
                if (this.opacity <= 0) this.reset();
            }
        }
    }

    draw() {
        const cs = getComputedStyle(document.documentElement);
        const color = cs.getPropertyValue('--particle-color').trim() || 'rgba(255,180,100,0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = color.replace(/[\d.]+\)$/, `${this.opacity})`);
        ctx.shadowBlur = this.size * 6;
        ctx.shadowColor = color.replace(/[\d.]+\)$/, `${this.opacity * 0.8})`);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

for (let i = 0; i < 35; i++) {
    particles.push(new Firefly());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}
animateParticles();

/* =============================================================
   KEYBOARD SHORTCUTS (bonus feature)
   ============================================================= */
document.addEventListener('keydown', (e) => {
    if (e.key === 't' || e.key === 'T') document.getElementById('btn-theme').click();
    if (e.key === 'm' || e.key === 'M') document.getElementById('btn-clock-pos').click();
    if (e.key === 'p' || e.key === 'P') togglePanel('pomodoro');
    if (e.key === 's' || e.key === 'S') togglePanel('stopwatch');
    if (e.key === 'o' || e.key === 'O') togglePanel('music');
    if (e.key === 'f' || e.key === 'F') document.getElementById('btn-fullscreen').click();
    // Spacebar toggles play/pause (only if no input is focused)
    if (e.key === ' ' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        ostPlayBtn.click();
    }
});

/* =============================================================
   FULLSCREEN TOGGLE
   ============================================================= */
const fullscreenBtn = document.getElementById('btn-fullscreen');
const fullscreenIcon = document.getElementById('fullscreen-icon');

const FS_EXPAND_SVG = '<polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />';
const FS_CONTRACT_SVG = '<polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />';

function updateFullscreenIcon() {
    const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    fullscreenIcon.innerHTML = isFS ? FS_CONTRACT_SVG : FS_EXPAND_SVG;
    fullscreenBtn.title = isFS ? 'Exit Fullscreen' : 'Fullscreen';
}

fullscreenBtn.addEventListener('click', () => {
    const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    if (!isFS) {
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
    }
});

document.addEventListener('fullscreenchange', updateFullscreenIcon);
document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);
document.addEventListener('mozfullscreenchange', updateFullscreenIcon);
document.addEventListener('MSFullscreenChange', updateFullscreenIcon);

/* =============================================================
   HABIT TRACKER
   ============================================================= */
const HABIT_PRESETS = [
    { id: 'exercise', name: 'Exercise', icon: '🏃‍♂️' },
    { id: 'read', name: 'Read', icon: '📚' },
    { id: 'meditate', name: 'Meditate', icon: '🧘‍♀️' },
    { id: 'water', name: 'Drink Water', icon: '💧' },
    { id: 'sleep', name: 'Sleep Early', icon: '😴' },
    { id: 'journal', name: 'Journal', icon: '✍️' },
    { id: 'code', name: 'Code', icon: '💻' },
    { id: 'learn', name: 'Learn', icon: '🎓' },
    { id: 'walk', name: 'Walk', icon: '🚶‍♂️' },
    { id: 'eat', name: 'Eat Healthy', icon: '🥗' },
    { id: 'stretch', name: 'Stretch', icon: '🤸‍♀️' },
    { id: 'music', name: 'Practice Music', icon: '🎵' },
    { id: 'art', name: 'Create Art', icon: '🎨' },
    { id: 'clean', name: 'Clean', icon: '🧹' },
    { id: 'focus', name: 'Deep Focus', icon: '🎯' },
    { id: 'other', name: 'Other', icon: '⭐' }
];

// Data state
let habitsData = JSON.parse(localStorage.getItem('fw-habits')) || [];
// habitsData item structure: { id, name, icon, history: { 'YYYY-MM-DD': true } }

// DOM Elements
const btnHabits = document.getElementById('btn-habits');
const habitOverlay = document.getElementById('habit-overlay');
const habitCloseBtn = document.getElementById('habit-close-btn');
const habitViewMain = document.getElementById('habit-view-main');
const habitViewChoose = document.getElementById('habit-view-choose');

const habitDateDisplay = document.getElementById('habit-date-display');
const habitStreakDisplay = document.getElementById('habit-streak-display');
const habitTodayDisplay = document.getElementById('habit-today-display');
const habitCompleteDisplay = document.getElementById('habit-complete-display');
const habitBestDisplay = document.getElementById('habit-best-display');
const habitActivityGraph = document.getElementById('habit-activity-graph');
const habitListContainer = document.getElementById('habit-list');
const habitEmptyState = document.getElementById('habit-empty-state');

const habitAddBtn = document.getElementById('habit-add-btn');
const habitBtnCancel = document.getElementById('habit-btn-cancel');
const habitBtnSave = document.getElementById('habit-btn-save');
const habitGrid = document.getElementById('habit-grid');

let selectedNewHabitId = null;

// Helpers
function getTodayString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getPastDateString(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function saveHabits() {
    localStorage.setItem('fw-habits', JSON.stringify(habitsData));
    renderHabitDashboard();
}

// Toggle logic
btnHabits.addEventListener('click', () => {
    closeAllPanels(); // close pomodoro, etc.
    habitOverlay.classList.add('visible');
    renderHabitDashboard();
});

habitCloseBtn.addEventListener('click', () => {
    habitOverlay.classList.remove('visible');
});

// If clicking on toolbar buttons, hide habit overlay
document.querySelectorAll('.toolbar-btn').forEach(b => {
    if(b.id !== 'btn-habits') {
        b.addEventListener('click', () => {
            habitOverlay.classList.remove('visible');
        });
    }
});

// Set date in header
const H_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const H_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const hNow = new Date();
habitDateDisplay.textContent = `${H_DAYS[hNow.getDay()]}, ${H_MONTHS[hNow.getMonth()]} ${hNow.getDate()}`;

// Logic to calculate stats
function calculateStats() {
    if (habitsData.length === 0) {
        return {
            streak: 0,
            todayCompleted: 0,
            todayTotal: 0,
            todayPct: 0,
            best: 0,
            activity: []
        };
    }

    const today = getTodayString();
    let todayCompleted = 0;
    let todayTotal = habitsData.length;

    // Daily activity array (past 84 days: 12 cols x 7 rows)
    const NUM_DAYS = 12 * 7;
    let activityLog = []; // [{date, completedPct}]
    
    // Reverse pass to find global streak
    let globalStreak = 0;
    let currentStreak = 0;
    let bestStreak = 0;
    let isActiveStreak = true;

    for (let i = 0; i < NUM_DAYS; i++) {
        const dStr = getPastDateString(i);
        let completedOnDay = 0;
        
        habitsData.forEach(h => {
            if (h.history && h.history[dStr]) completedOnDay++;
        });

        const pct = todayTotal > 0 ? Math.round((completedOnDay / todayTotal) * 100) : 0;
        
        activityLog.push({
            date: dStr,
            pct: pct
        });

        if (i === 0) {
            todayCompleted = completedOnDay;
            if (pct < 100 && pct > 0) {
                // If today is partially done, we keep streak but don't count today for it yet,
                // or if today is 0, we check yesterday.
            }
        }

        // Streak calculation (needs 100% completion to extend streak)
        if (pct === 100) {
            currentStreak++;
            if (isActiveStreak) globalStreak++;
        } else if (pct < 100) {
            if (i === 0) {
                // today is not 100%, streak depends on yesterday
            } else {
                isActiveStreak = false; // streak broken in the past
                if (currentStreak > bestStreak) bestStreak = currentStreak;
                currentStreak = 0;
            }
        }
    }
    
    if (currentStreak > bestStreak) bestStreak = currentStreak;
    if (globalStreak > bestStreak) bestStreak = globalStreak;

    return {
        streak: globalStreak,
        todayCompleted,
        todayTotal,
        todayPct: Math.round((todayCompleted / todayTotal) * 100) || 0,
        best: bestStreak,
        activity: activityLog.reverse() // chronological order
    };
}

// Render the entire habit dashboard
function renderHabitDashboard() {
    const stats = calculateStats();
    
    // 1. Stats Card
    habitStreakDisplay.textContent = stats.streak;
    habitTodayDisplay.textContent = `${stats.todayCompleted}/${stats.todayTotal}`;
    habitCompleteDisplay.textContent = `${stats.todayPct}%`;
    habitBestDisplay.textContent = stats.best;

    // 2. Activity Graph
    renderActivityGraph(stats.activity);

    // 3. Habit List
    renderHabitList();
}

function calculateIndividualStreak(habit) {
    let streak = 0;
    let isActive = true;
    for (let i = 0; i < 365; i++) {
        const dStr = getPastDateString(i);
        if (habit.history && habit.history[dStr]) {
            streak++;
        } else {
            if (i > 0) {
                isActive = false;
                break; // streak broke
            }
        }
    }
    return streak;
}

function renderHabitList() {
    // Keep empty state element
    const emptyState = habitEmptyState;
    habitListContainer.innerHTML = '';
    
    if (habitsData.length === 0) {
        habitListContainer.appendChild(emptyState);
        emptyState.classList.add('visible');
        return;
    }
    
    emptyState.classList.remove('visible');
    const today = getTodayString();

    habitsData.forEach((habit, index) => {
        const isDone = habit.history && habit.history[today];
        const streak = calculateIndividualStreak(habit);

        const el = document.createElement('div');
        el.className = 'habit-item';
        el.innerHTML = `
            <div class="habit-checkbox ${isDone ? 'checked' : ''}" data-index="${index}">
                <svg viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
            <div class="habit-icon">${habit.icon}</div>
            <div class="habit-info">
                <div class="habit-name">${habit.name}</div>
                ${streak > 0 ? `<div class="habit-streak-badge"><span class="habit-streak-badge-fire">🔥</span> ${streak} day${streak>1?'s':''}</div>` : ''}
            </div>
        `;
        
        el.querySelector('.habit-checkbox').addEventListener('click', () => {
            toggleHabitComplete(index);
        });

        habitListContainer.appendChild(el);
    });
}

function toggleHabitComplete(index) {
    const today = getTodayString();
    if (!habitsData[index].history) habitsData[index].history = {};
    
    if (habitsData[index].history[today]) {
        delete habitsData[index].history[today];
    } else {
        habitsData[index].history[today] = true;
    }
    
    saveHabits();
}

function renderActivityGraph(activityData) {
    habitActivityGraph.innerHTML = '';
    
    // activityData has length 84. group by 7 (cols)
    const cols = [];
    for (let i = 0; i < activityData.length; i += 7) {
        cols.push(activityData.slice(i, i + 7));
    }

    cols.forEach(colData => {
        const colEl = document.createElement('div');
        colEl.className = 'activity-col';
        colData.forEach(day => {
            const dot = document.createElement('div');
            dot.className = 'activity-dot';
            if (day.pct > 0 && day.pct < 33) dot.classList.add('level-1');
            else if (day.pct >= 33 && day.pct < 66) dot.classList.add('level-2');
            else if (day.pct >= 66 && day.pct < 100) dot.classList.add('level-3');
            else if (day.pct === 100) dot.classList.add('level-4');
            colEl.appendChild(dot);
        });
        habitActivityGraph.appendChild(colEl);
    });
}

// Add Habit Flow
habitAddBtn.addEventListener('click', () => {
    habitViewMain.classList.add('hidden');
    habitViewChoose.classList.remove('hidden');
    renderChooseGrid();
});

habitBtnCancel.addEventListener('click', () => {
    habitViewChoose.classList.add('hidden');
    habitViewMain.classList.remove('hidden');
    selectedNewHabitId = null;
});

function renderChooseGrid() {
    habitGrid.innerHTML = '';
    selectedNewHabitId = null;
    habitBtnSave.classList.add('disabled');

    HABIT_PRESETS.forEach(preset => {
        // filter out already added? Or let them add multiple? Let's filter out
        const exists = habitsData.some(h => h.id === preset.id);
        if (exists) return;

        const el = document.createElement('div');
        el.className = 'habit-grid-item';
        el.innerHTML = `
            <div class="habit-grid-icon">${preset.icon}</div>
            <div class="habit-grid-name">${preset.name}</div>
        `;
        
        el.addEventListener('click', () => {
            document.querySelectorAll('.habit-grid-item').forEach(d => d.classList.remove('selected'));
            el.classList.add('selected');
            selectedNewHabitId = preset.id;
            habitBtnSave.classList.remove('disabled');
        });
        
        habitGrid.appendChild(el);
    });
}

habitBtnSave.addEventListener('click', () => {
    if (!selectedNewHabitId) return;
    
    const preset = HABIT_PRESETS.find(p => p.id === selectedNewHabitId);
    if (preset) {
        habitsData.push({
            id: preset.id,
            name: preset.name,
            icon: preset.icon,
            history: {},
            createdAt: getTodayString()
        });
        saveHabits();
    }
    
    habitViewChoose.classList.add('hidden');
    habitViewMain.classList.remove('hidden');
    selectedNewHabitId = null;
});

