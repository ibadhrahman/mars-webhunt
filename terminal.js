/**
 * SET 2: SIGNAL FROM MARS · MISSION CONTROL GAME LOGIC & SOUND ENGINE
 */

// cyrb53 hash implementation
function cyrb53(s) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

// Precomputed password hashes (salt: "mars:")
// Page 1: "beacon" -> 1959640243283381
// Page 2: "7492"   -> 7141386553768035
// Page 3: "mars"   -> 895228863433749
// Page 4: "phobos" -> 7474891140204748
// Set 3 Master Passcode: "beacon-7492-mars-phobos"
const HASH = {
  1: 1959640243283381,
  2: 7141386553768035,
  3: 895228863433749,
  4: 7474891140204748
};

const MASTER_HASHES = [
  975247915806302,  // "beacon-7492-mars-phobos"
  3990587294827580, // "beacon7492marsphobos"
  2771695460214256  // "beacon 7492 mars phobos"
];

function ok(targetPage, word) {
  if (!word) return false;
  const clean = word.trim().toLowerCase();
  if (targetPage === 5) {
    const h = cyrb53("mars:" + clean);
    return MASTER_HASHES.includes(h);
  }
  return cyrb53("mars:" + clean) === HASH[targetPage];
}

// -------------------------------------------------------------
// Retro Web Audio Synthesizer
// -------------------------------------------------------------
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem("mars_sound_enabled") !== "false";
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem("mars_sound_enabled", this.enabled ? "true" : "false");
    return this.enabled;
  }

  beep(freq = 800, duration = 0.08, type = "sine", gainVal = 0.08) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio play error", e);
    }
  }

  click() {
    this.beep(1200, 0.02, "triangle", 0.04);
  }

  keypad(val) {
    const freqs = [697, 770, 852, 941, 1209, 1336, 1477, 1633];
    const num = parseInt(val, 10);
    const f = isNaN(num) ? 800 : (700 + num * 65);
    this.beep(f, 0.06, "square", 0.05);
  }

  starNote(index) {
    // Pentatonic scale
    const notes = [440, 493.88, 554.37, 659.25, 739.99, 880];
    const f = notes[index % notes.length];
    this.beep(f, 0.22, "sine", 0.12);
  }

  success() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      setTimeout(() => this.beep(freq, 0.18, "triangle", 0.1), i * 80);
    });
  }

  error() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.beep(160, 0.25, "sawtooth", 0.12);
    setTimeout(() => this.beep(130, 0.35, "sawtooth", 0.12), 120);
  }

  async playMorse(dotsDashes, onLetter) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const unit = 0.09; // seconds
    const freq = 750;

    for (let i = 0; i < dotsDashes.length; i++) {
      const char = dotsDashes[i];
      if (char === "·") {
        this.beep(freq, unit, "sine", 0.1);
        await new Promise(r => setTimeout(r, unit * 1000 * 2));
      } else if (char === "−") {
        this.beep(freq, unit * 3, "sine", 0.1);
        await new Promise(r => setTimeout(r, unit * 1000 * 4));
      } else if (char === " ") {
        await new Promise(r => setTimeout(r, unit * 1000 * 3));
      } else if (char === "/") {
        await new Promise(r => setTimeout(r, unit * 1000 * 6));
      }
    }
  }

  playReverseTransmission() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // Synthesize a retro reverse sweep sound
    const sweepCount = 8;
    for (let i = 0; i < sweepCount; i++) {
      setTimeout(() => {
        const freq = 1200 - i * 110;
        this.beep(freq, 0.07, "sawtooth", 0.06);
      }, i * 65);
    }
    setTimeout(() => {
      this.success();
    }, sweepCount * 65 + 100);
  }
}

const sound = new SoundEngine();

// Auto unlock audio on any first user interaction
window.addEventListener("pointerdown", () => sound.init(), { once: true });
window.addEventListener("keydown", () => sound.init(), { once: true });

const $ = id => document.getElementById(id);
const page = document.body ? +document.body.dataset.page : 1;

// -------------------------------------------------------------
// UI Wire Up & Lock Controls
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Audio toggle button in header
  const audioBtn = $("audio-toggle");
  if (audioBtn) {
    const updateAudioLabel = () => {
      audioBtn.textContent = sound.enabled ? "AUDIO: [ONLINE]" : "AUDIO: [MUTED]";
      audioBtn.style.color = sound.enabled ? "var(--text-main)" : "var(--alert-amber)";
    };
    updateAudioLabel();
    audioBtn.onclick = () => {
      sound.toggle();
      updateAudioLabel();
      sound.click();
    };
  }

  // Generic keypress audio blip for typing
  document.querySelectorAll("input").forEach(inp => {
    inp.addEventListener("input", () => sound.click());
  });

  // Pages 2-4: Gate check
  const gateForm = $("gate");
  if (gateForm) {
    gateForm.onsubmit = e => {
      e.preventDefault();
      const val = gateForm.elements.w.value;
      if (ok(page - 1, val)) {
        sound.success();
        gateForm.hidden = true;
        const content = $("content");
        if (content) content.hidden = false;
        sessionStorage.setItem("mars_unlocked_" + page, "true");
      } else {
        sound.error();
        const msg = gateForm.querySelector(".msg");
        if (msg) {
          msg.textContent = "[SECURITY LOCK ENGAGED] Invalid access code. Check previous sector telemetry.";
          msg.className = "msg error";
        }
      }
    };

    // Auto-unlock if previously solved in this session
    if (sessionStorage.getItem("mars_unlocked_" + page) === "true") {
      gateForm.hidden = true;
      const content = $("content");
      if (content) content.hidden = false;
    }
  }

  // Answer submission for pages 1-4
  const answerForm = $("answer");
  if (answerForm) {
    answerForm.onsubmit = e => {
      e.preventDefault();
      const val = answerForm.elements.w.value;
      if (ok(page, val)) {
        sound.success();
        answerForm.hidden = true;
        const next = $("next");
        if (next) {
          next.hidden = false;
          next.querySelectorAll(".key-badge").forEach(el => {
            el.textContent = val.trim().toUpperCase();
          });
        }
        sessionStorage.setItem("mars_solved_" + page, val.trim().toLowerCase());
      } else {
        sound.error();
        const msg = answerForm.querySelector(".msg");
        if (msg) {
          msg.textContent = "[CHECKSUM ERROR] Data does not match terminal decrypt parameters.";
          msg.className = "msg error";
        }
      }
    };
  }

  // Page 1: Morse Code Audio Player
  const morseBtn = $("play-morse-btn");
  if (morseBtn) {
    const pattern = "− · · · / · / · − / − · − · / − − − / − ·"; // BEACON
    morseBtn.onclick = async () => {
      morseBtn.disabled = true;
      morseBtn.textContent = "[TRANSMITTING BEACON AUDIO...]";
      await sound.playMorse(pattern);
      morseBtn.disabled = false;
      morseBtn.textContent = "[▶ REPLAY TRANSMISSION BEACON]";
    };
  }

  // Page 2: Keypad entry
  const keypad = $("keypad");
  if (keypad) {
    const input = document.querySelector('input[name="w"]');
    keypad.querySelectorAll(".keypad-btn").forEach(btn => {
      btn.onclick = () => {
        const key = btn.dataset.key;
        if (!key) return;
        sound.keypad(key);
        if (key === "clear") {
          if (input) input.value = "";
        } else if (key === "enter") {
          if (answerForm) {
            answerForm.dispatchEvent(new Event("submit", { cancelable: true }));
          }
        } else {
          if (input && input.value.length < 8) {
            input.value += key;
          }
        }
      };
    });
  }

  // Page 2: Interactive Oscilloscope Reticle Tracker
  const scopeBox = $("scope-box");
  const scopeReadout = $("scope-readout");
  const crosshairH = $("crosshair-h");
  if (scopeBox && crosshairH && scopeReadout) {
    scopeBox.addEventListener("mousemove", e => {
      const rect = scopeBox.getBoundingClientRect();
      const relY = e.clientY - rect.top;
      const svgHeight = 260;
      const scaleY = (relY / rect.height) * svgHeight;
      crosshairH.setAttribute("y1", scaleY);
      crosshairH.setAttribute("y2", scaleY);
      const kpa = Math.max(0, Math.min(10, ((236 - scaleY) / 21.6))).toFixed(1);
      scopeReadout.textContent = `RETICLE ALIGNMENT: ${kpa} kPa`;
      scopeReadout.style.borderColor = "var(--text-bright)";
    });

    scopeBox.addEventListener("mouseleave", () => {
      crosshairH.setAttribute("y1", -10);
      crosshairH.setAttribute("y2", -10);
      scopeReadout.textContent = "CALIBRATION GRID: 0-10 kPa";
      scopeReadout.style.borderColor = "var(--panel-border-dim)";
    });
  }

  // Page 4: Interactive Star Map Constellation
  setupStarMap();

  // Page 5: Final Transmission Dials & Reverse Audio
  setupFinalTransmission();
});

// -------------------------------------------------------------
// Page 4: Star Map Logic
// -------------------------------------------------------------
function setupStarMap() {
  const starMapContainer = $("starmap-stage");
  if (!starMapContainer) return;

  const targetSequence = ["VEGA", "DENEB", "ALTAIR", "POLARIS"];
  let clickedSequence = [];

  const lineLayer = $("constellation-lines");
  const starNodes = document.querySelectorAll(".star-node");
  const statusDisplay = $("starmap-status");
  const starInput = document.querySelector('input[name="w"]');

  const starPositions = {
    VEGA: { x: 220, y: 70 },
    DENEB: { x: 540, y: 90 },
    ALTAIR: { x: 380, y: 260 },
    POLARIS: { x: 710, y: 160 },
    SIRIUS: { x: 120, y: 280 },
    BETELGEUSE: { x: 290, y: 180 },
    ARCTURUS: { x: 620, y: 310 }
  };

  starNodes.forEach((node, idx) => {
    node.onclick = () => {
      const starName = node.dataset.star;
      sound.starNote(clickedSequence.length);

      // Check if next in sequence
      const expected = targetSequence[clickedSequence.length];
      if (starName === expected) {
        clickedSequence.push(starName);
        node.classList.add("selected");

        // Draw line if not first
        if (clickedSequence.length > 1) {
          const prevStar = clickedSequence[clickedSequence.length - 2];
          const p1 = starPositions[prevStar];
          const p2 = starPositions[starName];
          if (p1 && p2 && lineLayer) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", p1.x);
            line.setAttribute("y1", p1.y);
            line.setAttribute("x2", p2.x);
            line.setAttribute("y2", p2.y);
            line.setAttribute("class", "constellation-line");
            lineLayer.appendChild(line);
          }
        }

        if (statusDisplay) {
          statusDisplay.textContent = `[ALIGNMENT ROUTE]: ${clickedSequence.join(" ➔ ")} (${clickedSequence.length}/${targetSequence.length})`;
          statusDisplay.style.color = "var(--text-bright)";
        }

        // Complete!
        if (clickedSequence.length === targetSequence.length) {
          sound.success();
          if (statusDisplay) {
            statusDisplay.innerHTML = `★ <strong>[CELESTIAL ARRAY LOCKED]</strong> DISH ALIGNED WITH SOL-EARTH RELAY.<br>Frequency burst captured &mdash; decrypt the signal to retrieve the subsystem key.`;
            statusDisplay.style.color = "var(--text-bright)";
          }
          // Reveal the frequency cipher panel
          const freqPanel = document.getElementById("freq-panel");
          if (freqPanel) freqPanel.hidden = false;
        }
      } else {
        // Wrong star clicked
        sound.error();
        if (statusDisplay) {
          statusDisplay.textContent = `[ALIGNMENT ERROR]: Incorrect vector '${starName}'. Resetting array telescope...`;
          statusDisplay.style.color = "var(--alert-red)";
        }
        // Flash reset
        clickedSequence = [];
        starNodes.forEach(n => n.classList.remove("selected"));
        if (lineLayer) lineLayer.innerHTML = "";
      }
    };
  });

  const resetBtn = $("reset-starmap-btn");
  if (resetBtn) {
    resetBtn.onclick = () => {
      sound.click();
      clickedSequence = [];
      starNodes.forEach(n => n.classList.remove("selected"));
      if (lineLayer) lineLayer.innerHTML = "";
      if (statusDisplay) {
        statusDisplay.textContent = "[ARRAY READY]: Select 1st star according to flight navigation log.";
        statusDisplay.style.color = "var(--text-dim)";
      }
    };
  }
}

// -------------------------------------------------------------
// Page 5: Final Transmission Decryption Logic
// -------------------------------------------------------------
function setupFinalTransmission() {
  const finalForm = $("final");
  const playReverseBtn = $("play-reverse-btn");

  if (playReverseBtn) {
    playReverseBtn.onclick = () => {
      sound.playReverseTransmission();
      const buffer = $("reversed-buffer");
      if (buffer) {
        buffer.style.animation = "pulse 0.4s 4 alternate";
      }
    };
  }

  // Pre-fill dials from previous pages if saved in sessionStorage
  if (finalForm) {
    const k1 = sessionStorage.getItem("mars_solved_1");
    const k2 = sessionStorage.getItem("mars_solved_2");
    const k3 = sessionStorage.getItem("mars_solved_3");
    const k4 = sessionStorage.getItem("mars_solved_4");
    if (k1 && finalForm.elements.w1) finalForm.elements.w1.value = k1;
    if (k2 && finalForm.elements.w2) finalForm.elements.w2.value = k2;
    if (k3 && finalForm.elements.w3) finalForm.elements.w3.value = k3;
    if (k4 && finalForm.elements.w4) finalForm.elements.w4.value = k4;

    finalForm.onsubmit = e => {
      e.preventDefault();
      const f = e.target;
      const w1 = f.elements.w1.value;
      const w2 = f.elements.w2.value;
      const w3 = f.elements.w3.value;
      const w4 = f.elements.w4.value;

      const allSolved = ok(1, w1) && ok(2, w2) && ok(3, w3) && ok(4, w4);

      if (allSolved) {
        sound.success();
        f.hidden = true;
        const found = $("found");
        if (found) found.hidden = false;
      } else {
        sound.error();
        const msg = f.querySelector(".msg");
        if (msg) {
          msg.textContent = "[DECRYPTION FAILED] One or more sector clearance codes are invalid.";
          msg.className = "msg error";
        }
      }
    };
  }

  // Copy passcode to clipboard button
  const copyBtn = $("copy-passcode-btn");
  if (copyBtn) {
    copyBtn.onclick = () => {
      const code = "BEACON-7492-MARS-PHOBOS";
      navigator.clipboard.writeText(code).then(() => {
        sound.success();
        copyBtn.textContent = "✔ COPIED TO CLIPBOARD!";
        setTimeout(() => {
          copyBtn.textContent = "📋 COPY SET 3 PASSCODE";
        }, 2500);
      }).catch(() => {
        // Fallback
        prompt("Passcode for Set 3:", code);
      });
    };
  }
}
