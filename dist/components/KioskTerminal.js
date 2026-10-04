/**
 * SmartPrint UI Component: 15-Second Express Contactless Pickup Kiosk
 */
import { store } from '../core/store.js';
import { sound } from '../core/audio.js';
export class KioskTerminalComponent {
    container;
    currentPin = '';
    verifiedOrder = null;
    timerInterval = null;
    secondsLeft = 15;
    constructor(container) {
        this.container = container;
        this.render();
        store.subscribe((state) => this.update(state));
    }
    render() {
        const stagedOrders = store.getState().orders.filter(o => o.status === 'STAGED');
        this.container.innerHTML = `
      <div class="kiosk-terminal-viewport">
        <div class="kiosk-terminal-frame">
          
          <!-- Tablet Kiosk Header -->
          <div class="kiosk-brand-header">
            <div class="kiosk-lock-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h2 class="kiosk-main-title">15-Second Express Pickup Station</h2>
            <p class="kiosk-subtitle">
              Enter the 4-digit security OTP from your digital pass or SMS alert to authenticate and release your document bundle.
            </p>
          </div>

          <!-- 4-Digit Display Boxes -->
          <div class="kiosk-pin-display-row">
            <div class="pin-digit-box ${this.currentPin.length === 0 ? 'focused' : ''}" id="kioskDigit0">${this.currentPin[0] || '•'}</div>
            <div class="pin-digit-box ${this.currentPin.length === 1 ? 'focused' : ''}" id="kioskDigit1">${this.currentPin[1] || '•'}</div>
            <div class="pin-digit-box ${this.currentPin.length === 2 ? 'focused' : ''}" id="kioskDigit2">${this.currentPin[2] || '•'}</div>
            <div class="pin-digit-box ${this.currentPin.length === 3 ? 'focused' : ''}" id="kioskDigit3">${this.currentPin[3] || '•'}</div>
          </div>

          <!-- Touch Keypad Grid -->
          <div class="kiosk-numpad-grid">
            <button class="numpad-key" data-key="1">1</button>
            <button class="numpad-key" data-key="2">2</button>
            <button class="numpad-key" data-key="3">3</button>
            <button class="numpad-key" data-key="4">4</button>
            <button class="numpad-key" data-key="5">5</button>
            <button class="numpad-key" data-key="6">6</button>
            <button class="numpad-key" data-key="7">7</button>
            <button class="numpad-key" data-key="8">8</button>
            <button class="numpad-key" data-key="9">9</button>
            <button class="numpad-key action-clear" data-key="clear">CLEAR</button>
            <button class="numpad-key" data-key="0">0</button>
            <button class="numpad-key action-backspace" data-key="back">⌫</button>
          </div>

          <!-- Test Staged OTP Shortcuts -->
          <div class="kiosk-test-presets">
            <span class="test-label">TAP TO TEST CURRENT STAGED OTPS:</span>
            <div class="staged-chips-list" id="kioskStagedChips">
              ${stagedOrders.length > 0 ? stagedOrders.map(o => `
                <button class="staged-otp-chip" data-otp="${o.pickupOtp}" title="Order for ${o.student.name} at RACK ${o.rackSlot}">
                  <span>${o.student.name.split(' ')[0]}</span>
                  <strong class="color-cyan">OTP: ${o.pickupOtp}</strong>
                  <span class="chip-slot">(${o.rackSlot})</span>
                </button>
              `).join('') : '<span style="font-size:0.8rem; color:var(--text-muted);">No staged jobs in shelf currently.</span>'}
            </div>
          </div>

          <!-- Verified Success Beacon Card -->
          <div class="kiosk-success-card ${this.verifiedOrder ? 'visible' : ''}" id="kioskSuccessCard">
            <div class="success-top-badge">
              <span class="check-icon">✓</span> AUTHENTICATION VERIFIED
            </div>

            <div class="success-student-title" id="kioskStudentName">
              ${this.verifiedOrder ? this.verifiedOrder.student.name : 'Student Name'}
            </div>
            <div class="success-doc-meta" id="kioskDocMeta">
              ${this.verifiedOrder ? `${this.verifiedOrder.fileName} (${this.verifiedOrder.pageCount} pgs • ${this.verifiedOrder.binding.toUpperCase()})` : 'Document details'}
            </div>

            <!-- Giant Shelf Locator Beacon -->
            <div class="shelf-beacon-box">
              <div class="beacon-instruction">PLEASE RETRIEVE YOUR BUNDLE FROM COMPARTMENT:</div>
              <div class="beacon-giant-slot" id="kioskTargetSlot">
                ${this.verifiedOrder && this.verifiedOrder.rackSlot ? `RACK ${this.verifiedOrder.rackSlot}` : 'RACK --'}
              </div>
              <div class="beacon-guidance" id="kioskShelfGuidance">
                Look for glowing green compartment on the physical shelving unit.
              </div>
            </div>

            <!-- 15-Second Speed Countdown -->
            <div class="speed-timer-bar">
              <div class="speed-timer-text">
                Express Pickup SLA: <strong id="kioskCountdownSec">${this.secondsLeft}s</strong> remaining
              </div>
              <div class="speed-timer-progress">
                <div class="speed-timer-fill" id="kioskTimerFill" style="width: 100%;"></div>
              </div>
            </div>

            <button class="cyber-btn-primary kiosk-confirm-btn" id="btnConfirmPickupHandover">
              Confirm Handover & Liberate Shelf Compartment
            </button>
          </div>

        </div>
      </div>
    `;
        this.bindEvents();
    }
    bindEvents() {
        // Numpad clicks
        this.container.querySelectorAll('.numpad-key').forEach(key => {
            key.addEventListener('click', (e) => {
                const val = e.currentTarget.dataset.key;
                if (!val)
                    return;
                if (val === 'clear') {
                    this.currentPin = '';
                    this.verifiedOrder = null;
                    sound.click();
                }
                else if (val === 'back') {
                    this.currentPin = this.currentPin.slice(0, -1);
                    this.verifiedOrder = null;
                    sound.click();
                }
                else if (this.currentPin.length < 4) {
                    this.currentPin += val;
                    sound.keypadBeep(val);
                }
                this.updatePinDisplay();
                if (this.currentPin.length === 4) {
                    this.verifyPin();
                }
            });
        });
        // Test staged OTP chips
        this.container.querySelectorAll('.staged-otp-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const otp = e.currentTarget.dataset.otp;
                if (otp) {
                    this.currentPin = otp;
                    sound.click();
                    this.updatePinDisplay();
                    this.verifyPin();
                }
            });
        });
        // Confirm pickup button
        const btnConfirm = this.container.querySelector('#btnConfirmPickupHandover');
        if (btnConfirm) {
            btnConfirm.addEventListener('click', () => {
                if (this.verifiedOrder) {
                    store.completePickup(this.verifiedOrder.id);
                    this.verifiedOrder = null;
                    this.currentPin = '';
                    this.stopTimer();
                    this.render();
                    const toast = document.getElementById('toastContainer');
                    if (toast) {
                        const div = document.createElement('div');
                        div.className = 'toast toast-success';
                        div.innerHTML = `<strong>⚡ Express Pickup Complete!</strong> Shelf slot liberated in under 15 seconds.`;
                        toast.appendChild(div);
                        setTimeout(() => div.remove(), 4000);
                    }
                }
            });
        }
    }
    updatePinDisplay() {
        for (let i = 0; i < 4; i++) {
            const box = this.container.querySelector(`#kioskDigit${i}`);
            if (box) {
                box.textContent = this.currentPin[i] || '•';
                box.classList.toggle('focused', i === this.currentPin.length);
            }
        }
    }
    verifyPin() {
        const order = store.authenticatePickupByOtp(this.currentPin);
        if (order) {
            this.verifiedOrder = order;
            this.startSpeedTimer();
            const successCard = this.container.querySelector('#kioskSuccessCard');
            const studentName = this.container.querySelector('#kioskStudentName');
            const docMeta = this.container.querySelector('#kioskDocMeta');
            const targetSlot = this.container.querySelector('#kioskTargetSlot');
            if (successCard)
                successCard.classList.add('visible');
            if (studentName)
                studentName.textContent = order.student.name;
            if (docMeta)
                docMeta.textContent = `${order.fileName} (${order.pageCount} pgs • ${order.binding.toUpperCase()} BINDING)`;
            if (targetSlot)
                targetSlot.textContent = `RACK ${order.rackSlot}`;
            sound.success();
        }
        else {
            sound.error();
            const toast = document.getElementById('toastContainer');
            if (toast) {
                const div = document.createElement('div');
                div.className = 'toast toast-error';
                div.innerHTML = `<strong>Invalid Pickup OTP:</strong> No staged order found matching '${this.currentPin}'.`;
                toast.appendChild(div);
                setTimeout(() => div.remove(), 4000);
            }
            setTimeout(() => {
                this.currentPin = '';
                this.updatePinDisplay();
            }, 800);
        }
    }
    startSpeedTimer() {
        this.stopTimer();
        this.secondsLeft = 15;
        const secEl = this.container.querySelector('#kioskCountdownSec');
        const fillEl = this.container.querySelector('#kioskTimerFill');
        this.timerInterval = window.setInterval(() => {
            this.secondsLeft--;
            if (secEl)
                secEl.textContent = `${this.secondsLeft}s`;
            if (fillEl)
                fillEl.style.width = `${(this.secondsLeft / 15) * 100}%`;
            if (this.secondsLeft <= 0) {
                this.stopTimer();
            }
        }, 1000);
    }
    stopTimer() {
        if (this.timerInterval !== null) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    update(state) {
        const stagedOrders = state.orders.filter(o => o.status === 'STAGED');
        const chipsList = this.container.querySelector('#kioskStagedChips');
        if (chipsList) {
            chipsList.innerHTML = stagedOrders.length > 0 ? stagedOrders.map(o => `
        <button class="staged-otp-chip" data-otp="${o.pickupOtp}" title="Order for ${o.student.name} at RACK ${o.rackSlot}">
          <span>${o.student.name.split(' ')[0]}</span>
          <strong class="color-cyan">OTP: ${o.pickupOtp}</strong>
          <span class="chip-slot">(${o.rackSlot})</span>
        </button>
      `).join('') : '<span style="font-size:0.8rem; color:var(--text-muted);">No staged jobs in shelf currently.</span>';
            // Re-bind chip events
            chipsList.querySelectorAll('.staged-otp-chip').forEach(chip => {
                chip.addEventListener('click', (e) => {
                    const otp = e.currentTarget.dataset.otp;
                    if (otp) {
                        this.currentPin = otp;
                        sound.click();
                        this.updatePinDisplay();
                        this.verifyPin();
                    }
                });
            });
        }
    }
}
