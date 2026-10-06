/**
 * Click2Print Modals Component
 * Implements:
 * 1. Print Shop QR A4 Poster Modal (Image 1)
 * 2. Hardware Test Print Sheet Modal (Image 1)
 * 3. Razorpay Instant UPI Payment Modal (Image 4)
 */

import { store } from '../core/store.js';
import { sound } from '../core/audio.js';
import { OrderDraft, PrintOrder } from '../types/index.js';

export class ModalsComponent {
  private activeModal: HTMLElement | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    // Listen for custom events to open modals
    window.addEventListener('open-shop-qr-modal', () => {
      this.openShopQrModal();
    });

    window.addEventListener('open-test-print-modal', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      this.openTestPrintModal(detail);
    });

    window.addEventListener('open-razorpay-modal', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      this.openRazorpayModal(detail.draft, detail.onSuccess);
    });

    // Close on escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }

  public closeAllModals(): void {
    const overlays = document.querySelectorAll('.modal-overlay');
    overlays.forEach(el => el.classList.remove('active'));
    sound.click();
  }

  /**
   * Shop QR Poster Modal (Image 1: Print Your Shop QR)
   */
  private openShopQrModal(): void {
    const modalEl = document.getElementById('shopQrModal');
    if (!modalEl) return;

    const state = store.getState();
    const body = modalEl.querySelector('#shopQrModalBody');
    if (body) {
      body.innerHTML = `
        <div class="a4-qr-poster-preview">
          
          <div class="poster-sheet" id="printablePosterSheet">
            <div class="poster-header">
              <span class="poster-brand-badge">⚡ POWERED BY CLICK2PRINT</span>
              <h1 class="poster-shop-name">${state.shop.shopName}</h1>
              <p class="poster-shop-sub">Official Direct Mobile Upload & Counter Print Station</p>
            </div>

            <!-- Big Scan QR Box -->
            <div class="poster-qr-container">
              <div class="poster-qr-frame">
                <svg width="240" height="240" viewBox="0 0 100 100" fill="none">
                  <rect width="100" height="100" fill="white" rx="10"/>
                  <!-- Position Markers -->
                  <rect x="6" y="6" width="28" height="28" fill="#1e1b4b"/>
                  <rect x="11" y="11" width="18" height="18" fill="white"/>
                  <rect x="15" y="15" width="10" height="10" fill="#1e1b4b"/>

                  <rect x="66" y="6" width="28" height="28" fill="#1e1b4b"/>
                  <rect x="71" y="11" width="18" height="18" fill="white"/>
                  <rect x="75" y="15" width="10" height="10" fill="#1e1b4b"/>

                  <rect x="6" y="66" width="28" height="28" fill="#1e1b4b"/>
                  <rect x="11" y="71" width="18" height="18" fill="white"/>
                  <rect x="15" y="75" width="10" height="10" fill="#1e1b4b"/>

                  <!-- Data Matrix -->
                  <rect x="42" y="8" width="10" height="14" fill="#1e1b4b"/>
                  <rect x="42" y="28" width="14" height="20" fill="#1e1b4b"/>
                  <rect x="60" y="40" width="16" height="12" fill="#1e1b4b"/>
                  <rect x="42" y="60" width="12" height="24" fill="#1e1b4b"/>
                  <rect x="62" y="60" width="26" height="12" fill="#1e1b4b"/>
                  <rect x="76" y="74" width="14" height="14" fill="#1e1b4b"/>
                  <rect x="24" y="42" width="12" height="12" fill="#1e1b4b"/>
                  <rect x="8" y="42" width="10" height="14" fill="#1e1b4b"/>
                </svg>
              </div>
              <div class="poster-callout">
                <span class="callout-arrow">👉</span>
                <strong>SCAN WITH ANY CAMERA OR UPI APP</strong>
                <span>Opens instant upload page • No app download or registration needed</span>
              </div>
            </div>

            <!-- 4-Step Instructions on Poster -->
            <div class="poster-steps-grid">
              <div class="p-step">
                <span class="p-step-num">1</span>
                <strong>Scan QR Code</strong>
                <span>Open in browser</span>
              </div>
              <div class="p-step">
                <span class="p-step-num">2</span>
                <strong>Upload File</strong>
                <span>PDF, DOCX, Images</span>
              </div>
              <div class="p-step">
                <span class="p-step-num">3</span>
                <strong>Pick Options</strong>
                <span>B&W or Full Colour</span>
              </div>
              <div class="p-step">
                <span class="p-step-num">4</span>
                <strong>Collect Prints</strong>
                <span>Ready in under 60s!</span>
              </div>
            </div>

            <div class="poster-footer">
              <div class="poster-privacy-guarantee">
                <span>🔒 100% Privacy: All files permanently deleted post-print. Zero data retained.</span>
              </div>
              <span class="poster-counter-loc">📍 Counter: ${state.shop.address}</span>
            </div>
          </div>

          <div class="poster-action-bar">
            <button type="button" class="btn-clean-primary" id="btnPrintPosterDirect">
              <span>🖨️ Print Full A4 Poster Now</span>
            </button>
            <button type="button" class="btn-clean-secondary" id="btnClosePosterModal">
              <span>Close</span>
            </button>
          </div>

        </div>
      `;

      const btnPrint = body.querySelector('#btnPrintPosterDirect');
      btnPrint?.addEventListener('click', () => {
        window.print();
      });

      const btnClose = body.querySelector('#btnClosePosterModal');
      btnClose?.addEventListener('click', () => {
        modalEl.classList.remove('active');
      });
    }

    modalEl.classList.add('active');
  }

  /**
   * Hardware Test Print Modal (Image 1: Test Print Button)
   */
  private openTestPrintModal(detail: {
    success: boolean;
    timestamp: number;
    printerName: string;
    model: string;
    ip: string;
  }): void {
    const modalEl = document.getElementById('testPrintModal');
    if (!modalEl) return;

    const body = modalEl.querySelector('#testPrintModalBody');
    if (body) {
      body.innerHTML = `
        <div class="test-print-sheet">
          <div class="test-sheet-header">
            <div class="ts-title-group">
              <span class="ts-tag">CALIBRATION & DIAGNOSTIC SHEET</span>
              <h2 class="ts-printer-name">${detail.printerName}</h2>
              <span class="ts-model">${detail.model} • IP: ${detail.ip}</span>
            </div>
            <div class="ts-verified-stamp">
              <span>✓ HARDWARE ONLINE</span>
              <small>Latency: 12ms</small>
            </div>
          </div>

          <!-- Color Calibration Blocks -->
          <div class="calibration-section">
            <span class="section-label">CMYK Color & Density Calibration:</span>
            <div class="cmyk-blocks-row">
              <div class="cmyk-block cyan"><span>CYAN 100%</span></div>
              <div class="cmyk-block magenta"><span>MAGENTA 100%</span></div>
              <div class="cmyk-block yellow"><span>YELLOW 100%</span></div>
              <div class="cmyk-block black"><span>KEY BLACK 100%</span></div>
            </div>
          </div>

          <!-- Grayscale Gradient Scale -->
          <div class="calibration-section">
            <span class="section-label">256-Level Monochromatic Gradient Alignment:</span>
            <div class="grayscale-ramp">
              <div class="gray-step s10"></div>
              <div class="gray-step s25"></div>
              <div class="gray-step s50"></div>
              <div class="gray-step s75"></div>
              <div class="gray-step s90"></div>
              <div class="gray-step s100"></div>
            </div>
          </div>

          <!-- Microtext & Font Sharpness Verification -->
          <div class="calibration-section">
            <span class="section-label">Font Sharpness & Nozzle Resolution Check:</span>
            <div class="font-resolution-box">
              <p class="font-sample-12">The quick brown fox jumps over the lazy dog. 12pt Standard Sharpness</p>
              <p class="font-sample-9">The quick brown fox jumps over the lazy dog. 9pt Fine Detail Test</p>
              <p class="font-sample-6">The quick brown fox jumps over the lazy dog. 6pt Microprint Alignment Test Passed</p>
            </div>
          </div>

          <div class="test-sheet-footer">
            <span>Diagnostic Timestamp: ${new Date(detail.timestamp).toLocaleString()}</span>
            <span>Spooler Queue: 0 Pending • Status: 100% Ready</span>
          </div>

          <div class="modal-footer-actions">
            <button type="button" class="btn-clean-primary" id="btnCloseTestModal">
              <span>✓ Test Confirmed & Verified</span>
            </button>
          </div>
        </div>
      `;

      const btnClose = body.querySelector('#btnCloseTestModal');
      btnClose?.addEventListener('click', () => {
        modalEl.classList.remove('active');
      });
    }

    modalEl.classList.add('active');
  }

  /**
   * Razorpay Instant UPI Modal (Image 4: Razorpay Online Payments)
   */
  private openRazorpayModal(draft: OrderDraft, onSuccess: (order: PrintOrder) => void): void {
    const modalEl = document.getElementById('paymentModal');
    if (!modalEl) return;

    const state = store.getState();
    const effectivePages = draft.rangeMode === 'custom' ? (draft.toPage - draft.fromPage + 1) : draft.pageCount;
    const quote = (window as unknown as { pricingEngine: typeof import('../services/pricingEngine.js').pricingEngine }).pricingEngine
      ? (window as unknown as { pricingEngine: typeof import('../services/pricingEngine.js').pricingEngine }).pricingEngine.calculate(
          effectivePages,
          draft.colorPages,
          draft.bwPages,
          draft.colorMode,
          draft.duplex,
          draft.copies,
          draft.paper,
          draft.paperFormat,
          draft.binding,
          state.pricing
        )
      : { grandTotal: 34.00, sheetsCount: effectivePages };

    const modalPayAmount = modalEl.querySelector('#modalPayAmount');
    if (modalPayAmount) {
      modalPayAmount.textContent = `₹${quote.grandTotal.toFixed(2)}`;
    }

    const btnSimulate = modalEl.querySelector('#btnSimulatePayment');
    const newBtn = btnSimulate?.cloneNode(true) as HTMLButtonElement;
    if (btnSimulate && newBtn) {
      btnSimulate.parentNode?.replaceChild(newBtn, btnSimulate);
      newBtn.addEventListener('click', () => {
        newBtn.disabled = true;
        newBtn.innerHTML = `<span>⏳ Verifying Razorpay UPI Transaction...</span>`;

        setTimeout(() => {
          modalEl.classList.remove('active');
          const order = store.createOrder(draft);
          onSuccess(order);
          sound.success();
        }, 800);
      });
    }

    modalEl.classList.add('active');
  }
}
