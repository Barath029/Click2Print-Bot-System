// Express 15-Second Contactless Pickup Kiosk Controller
class ExpressPickupKiosk {
  constructor() {
    this.enteredOtp = '';
    this.currentVerifiedOrder = null;
    this.initElements();
    this.bindEvents();
    this.renderSampleOtps();
  }

  initElements() {
    this.digitBoxes = [
      document.getElementById('otpD1'),
      document.getElementById('otpD2'),
      document.getElementById('otpD3'),
      document.getElementById('otpD4')
    ];

    this.keypadButtons = document.querySelectorAll('.keypad-btn');
    this.resultCard = document.getElementById('kioskResultCard');
    this.kioskStudentName = document.getElementById('kioskStudentName');
    this.kioskDocDetails = document.getElementById('kioskDocDetails');
    this.kioskSlotTarget = document.getElementById('kioskSlotTarget');
    this.btnConfirmHandover = document.getElementById('btnKioskConfirmPickup');
    this.sampleOtpsContainer = document.getElementById('kioskSampleOtps');
  }

  bindEvents() {
    this.keypadButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.val;
        this.handleKeypadInput(val);
      });
    });

    if (this.btnConfirmHandover) {
      this.btnConfirmHandover.addEventListener('click', () => {
        this.completeHandover();
      });
    }

    // Physical keyboard support
    document.addEventListener('keydown', (e) => {
      // Only process when Kiosk tab is visible
      const kioskSection = document.getElementById('kioskSection');
      if (!kioskSection || !kioskSection.classList.contains('active')) return;

      if (e.key >= '0' && e.key <= '9') {
        this.handleKeypadInput(e.key);
      } else if (e.key === 'Backspace') {
        this.handleKeypadInput('del');
      } else if (e.key === 'Enter') {
        this.handleKeypadInput('enter');
      }
    });
  }

  handleKeypadInput(key) {
    window.soundFx.click();

    if (key === 'clear') {
      this.enteredOtp = '';
    } else if (key === 'del') {
      this.enteredOtp = this.enteredOtp.slice(0, -1);
    } else if (key === 'enter') {
      this.verifyOtp();
      return;
    } else {
      if (this.enteredOtp.length < 4) {
        this.enteredOtp += key;
      }
    }

    this.updateDigitDisplay();

    // Auto verify when 4 digits reached
    if (this.enteredOtp.length === 4) {
      setTimeout(() => this.verifyOtp(), 150);
    }
  }

  updateDigitDisplay() {
    for (let i = 0; i < 4; i++) {
      const box = this.digitBoxes[i];
      if (box) {
        const char = this.enteredOtp[i] || '';
        box.textContent = char;
        box.classList.toggle('has-val', !!char);
      }
    }
  }

  verifyOtp() {
    if (this.enteredOtp.length < 4) {
      window.showToast('Please enter complete 4-digit OTP.', 'alert');
      window.soundFx.error();
      return;
    }

    const res = window.smartStore.verifyPickupByOtp(this.enteredOtp);

    if (res.success) {
      this.currentVerifiedOrder = res.order;
      window.soundFx.success();

      this.kioskStudentName.textContent = `${res.order.student.name} (${res.order.student.rollNo})`;
      this.kioskDocDetails.textContent = `📄 ${res.order.fileName} • ${res.order.pageCount} pgs (${res.order.binding})`;
      this.kioskSlotTarget.textContent = `RACK ${res.slotCode}`;
      
      this.resultCard.classList.add('active');
      window.showToast(`Order Verified! Ready in Shelf [${res.slotCode}]`, 'success');

      // Scroll smoothly to results
      this.resultCard.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.soundFx.error();
      window.showToast(res.message, 'alert');
      this.resultCard.classList.remove('active');
      // Shake effect
      const box = document.querySelector('.otp-pin-display');
      if (box) {
        box.style.animation = 'none';
        box.offsetHeight; // trigger reflow
        box.style.animation = 'shake 0.4s ease';
      }
    }
  }

  completeHandover() {
    if (!this.currentVerifiedOrder) return;
    const order = this.currentVerifiedOrder;
    const slotCode = order.rackSlot;

    window.smartStore.completePickup(order.id);
    window.soundFx.success();
    window.showToast(`✅ Handover Complete! Order #${order.token} picked up. Shelf [${slotCode}] is now available.`, 'success');

    // Reset kiosk screen
    this.enteredOtp = '';
    this.currentVerifiedOrder = null;
    this.updateDigitDisplay();
    this.resultCard.classList.remove('active');
    this.renderSampleOtps();
  }

  renderSampleOtps() {
    if (!this.sampleOtpsContainer) return;
    this.sampleOtpsContainer.innerHTML = '';

    const stagedOrders = window.smartStore.state.orders.filter(o => o.status === 'STAGED');
    if (stagedOrders.length === 0) {
      this.sampleOtpsContainer.innerHTML = `<span style="color: var(--text-muted); font-size: 0.75rem;">No orders currently staged in rack.</span>`;
      return;
    }

    stagedOrders.forEach(o => {
      const chip = document.createElement('button');
      chip.className = 'sample-chip';
      chip.style.display = 'inline-flex';
      chip.style.alignItems = 'center';
      chip.style.gap = '0.35rem';
      chip.innerHTML = `<span>⚡ Test OTP: <strong>${o.pickupOtp}</strong></span> <span style="color: var(--emerald); font-family: var(--font-mono);">[${o.rackSlot}]</span>`;
      
      chip.addEventListener('click', () => {
        this.enteredOtp = o.pickupOtp;
        this.updateDigitDisplay();
        this.verifyOtp();
      });

      this.sampleOtpsContainer.appendChild(chip);
    });
  }
}

window.initPickupKiosk = () => {
  window.pickupKiosk = new ExpressPickupKiosk();
};
