/**
 * SmartPrint UI Component: Modals (UPI Payment, Manifest Slip, Slot Inspector)
 */

import { store } from '../core/store.js';
import { sound } from '../core/audio.js';
import { StudentStudioComponent } from './StudentStudio.js';

export class ModalsComponent {
  private studentStudio: StudentStudioComponent;

  constructor(studentStudio: StudentStudioComponent) {
    this.studentStudio = studentStudio;
    this.bindPaymentModal();
  }

  private bindPaymentModal(): void {
    const payBtn = document.getElementById('btnSimulatePayment');
    const modal = document.getElementById('paymentModal');

    if (payBtn && modal) {
      payBtn.addEventListener('click', () => {
        const draft = this.studentStudio.getCurrentDraft();
        const newOrder = store.createOrder(draft);

        modal.classList.remove('open');

        // Show toast
        const toast = document.getElementById('toastContainer');
        if (toast) {
          const div = document.createElement('div');
          div.className = 'toast toast-success';
          div.innerHTML = `<strong>Order Paid & Placed!</strong> Token: ${newOrder.token}. Assigned Pickup OTP: <strong>${newOrder.pickupOtp}</strong>`;
          toast.appendChild(div);
          setTimeout(() => div.remove(), 4000);
        }
      });
    }

    // Modal close buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const overlay = (e.currentTarget as HTMLElement).closest('.modal-overlay');
        if (overlay) {
          overlay.classList.remove('open');
          sound.click();
        }
      });
    });

    // Close on overlay backdrop click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('open');
        }
      });
    });
  }
}
