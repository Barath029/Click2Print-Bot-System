/**
 * Click2Print Customer Order Portal
 * Direct, lightweight customer workflow (matching Image 3):
 * 1. Customer Scans QR Code (Direct web access, no app download)
 * 2. Uploads Document & Selects Options (DOCX auto-convert, B&W/Colour auto-detect)
 * 3. Transparent Cost Calculation & Razorpay UPI Payment
 * 4. Real-time Order Tracker with Auto-Delete Privacy Guarantee
 */

import { store } from '../core/store.js';
import { pricingEngine } from '../services/pricingEngine.js';
import { sound } from '../core/audio.js';
import {
  SystemState,
  OrderDraft,
  ColorMode,
  PaperGrade,
  PaperFormat,
  BindingType,
  PaymentMethod,
  PrintOrder
} from '../types/index.js';

export class CustomerOrderComponent {
  private container: HTMLElement;

  private currentDraft: OrderDraft = {
    fileName: 'Project_Final_Submission.docx',
    fileType: 'docx',
    isDocxConverted: true,
    fileSizeKb: 3420,
    pageCount: 16,
    rangeMode: 'all',
    fromPage: 1,
    toPage: 16,
    pageRange: 'All Pages (1-16)',
    bwPages: 16,
    colorPages: 0,
    colorMode: 'mono',
    duplex: true,
    copies: 1,
    paper: 'gsm75',
    paperFormat: 'A4',
    binding: 'none',
    customerNotes: '',
    customer: {
      name: 'Ravi Teja',
      phone: '+91 98402 88419',
      email: 'ravi@example.com'
    },
    paymentMethod: 'RAZORPAY_UPI'
  };

  private isConvertingDocx: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render(store.getState());
    store.subscribe((state) => this.update(state));
  }

  private getEffectivePageCount(): number {
    if (this.currentDraft.rangeMode === 'custom') {
      const from = Math.max(1, this.currentDraft.fromPage || 1);
      const to = Math.min(this.currentDraft.pageCount, Math.max(from, this.currentDraft.toPage || this.currentDraft.pageCount));
      return (to - from) + 1;
    }
    return this.currentDraft.pageCount;
  }

  private render(state: SystemState): void {
    const effectivePages = this.getEffectivePageCount();
    if (this.currentDraft.colorMode === 'color') {
      this.currentDraft.colorPages = effectivePages;
      this.currentDraft.bwPages = 0;
    } else {
      this.currentDraft.colorPages = 0;
      this.currentDraft.bwPages = effectivePages;
    }

    const quote = pricingEngine.calculate(
      effectivePages,
      this.currentDraft.colorPages,
      this.currentDraft.bwPages,
      this.currentDraft.colorMode,
      this.currentDraft.duplex,
      this.currentDraft.copies,
      this.currentDraft.paper,
      this.currentDraft.paperFormat,
      this.currentDraft.binding,
      state.pricing
    );

    // Active customer order for live tracking (syncs with customer's active placed order)
    const activeOrder: PrintOrder | undefined = state.orders.find(
      o => o.id === state.activeCustomerOrderId
    );

    this.container.innerHTML = `
      <div class="customer-portal-view">

        <!-- Top Welcome & Shop Station Strip -->
        <div class="customer-hero-strip">
          <div class="hero-shop-info">
            <div class="shop-badge-row">
              <span class="shop-tag">🏪 COUNTER PRINT STATION</span>
              <span class="auto-badge">⚡ Instant Cloud Upload • No App Required</span>
            </div>
            <h2 class="hero-shop-title">${state.shop.shopName} <span class="verified-partner-badge" title="Verified Campus Print Partner">✓ Verified Station</span></h2>
            <p class="hero-shop-address">📍 ${state.shop.address} • 📞 ${state.shop.phone}</p>
          </div>

          <!-- Feature Highlights matching product specs -->
          <div class="hero-rate-pills">
            <div class="rate-pill">
              <span class="rate-dot bw"></span>
              <span class="rate-name">B&W Print:</span>
              <span class="rate-val">₹${state.pricing.bwSingle.toFixed(2)}/pg</span>
            </div>
            <div class="rate-pill">
              <span class="rate-dot color"></span>
              <span class="rate-name">Colour Print:</span>
              <span class="rate-val">₹${state.pricing.colorSingle.toFixed(2)}/pg</span>
            </div>
            <div class="rate-pill privacy-pill" title="Zero data retained — automatic file deletion upon printing">
              <span class="rate-icon">🔒</span>
              <span class="rate-val">100% Private (Auto-Delete)</span>
            </div>
          </div>
        </div>

        <!-- Main 2-Column Work Surface -->
        <div class="customer-grid">
          
          <!-- Left Column: Upload & Print Configuration -->
          <div class="customer-col-main">

            <!-- STEP 1: Upload Document & Sample Selector -->
            <div class="clean-card">
              <div class="card-step-header">
                <span class="step-num">1</span>
                <div>
                  <h3 class="card-step-title">Upload Your Document</h3>
                  <p class="card-step-sub">Supports PDF, DOCX, DOC, JPG, and PNG files up to 50MB</p>
                </div>
              </div>

              <!-- Drag & Drop Upload Zone -->
              <div class="upload-dropzone" id="customerDropzone">
                <input type="file" id="customerFileInput" class="hidden-file-input" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg">
                <div class="dropzone-content">
                  <div class="upload-icon-circle">
                    <span class="upload-icon">☁️</span>
                  </div>
                  <div class="upload-instructions">
                    <strong class="upload-primary-text">Click to choose a file or drag & drop here</strong>
                    <span class="upload-secondary-text">PDF, Word (DOCX/DOC), Images up to 50MB</span>
                  </div>
                  <div class="upload-format-chips">
                    <span class="format-chip">PDF</span>
                    <span class="format-chip">DOCX</span>
                    <span class="format-chip">PNG</span>
                    <span class="format-chip">JPG</span>
                  </div>
                </div>
              </div>

              <!-- Quick Document Sample Presets for effortless testing -->
              <div class="sample-preset-row">
                <span class="sample-preset-label">Quick Test Presets:</span>
                <button type="button" class="preset-btn" data-preset="docx">
                  <span class="preset-icon">📝</span> DOCX Report (16 pgs)
                </button>
                <button type="button" class="preset-btn" data-preset="color">
                  <span class="preset-icon">🎨</span> Colour Deck (12 pgs)
                </button>
                <button type="button" class="preset-btn" data-preset="lab">
                  <span class="preset-icon">🔬</span> Lab Manual (8 pgs)
                </button>
                <button type="button" class="preset-btn" data-preset="single">
                  <span class="preset-icon">📄</span> Single Resume (2 pgs)
                </button>
              </div>

              <!-- Uploaded File Badge & Auto-Conversion Status -->
              <div class="uploaded-file-banner">
                <div class="file-info-left">
                  <span class="file-type-pill ${this.currentDraft.fileType}">
                    ${this.currentDraft.fileType.toUpperCase()}
                  </span>
                  <div class="file-text-details">
                    <span class="file-name-strong" id="lblUploadedFileName">${this.currentDraft.fileName}</span>
                    <span class="file-meta-sub" id="lblUploadedFileMeta">
                      ${this.currentDraft.pageCount} Pages • ${(this.currentDraft.fileSizeKb / 1024).toFixed(1)} MB
                    </span>
                  </div>
                </div>

                ${this.currentDraft.isDocxConverted ? `
                  <div class="docx-convert-pill" title="DOCX Support: Word files automatically converted to PDF before printing">
                    <span class="docx-icon">⚡</span>
                    <span>DOCX Auto-Converted to PDF</span>
                  </div>
                ` : `
                  <div class="clean-check-pill">
                    <span>✓ Ready to Print</span>
                  </div>
                `}
              </div>
            </div>

            <!-- STEP 2: Configure Print Options -->
            <div class="clean-card">
              <div class="card-step-header">
                <span class="step-num">2</span>
                <div>
                  <h3 class="card-step-title">Select Print Options</h3>
                  <p class="card-step-sub">Pick your colour mode, copies, duplex, and paper preferences</p>
                </div>
              </div>

              <div class="options-form-grid">
                
                <!-- Print Colour Mode (Auto-Routes to Dedicated Printers) -->
                <div class="form-group full-width">
                  <label class="form-label">
                    <span>Colour Mode (Auto-Hardware Routing)</span>
                    <span class="label-help">Orders route automatically to separate B&W or Colour printers</span>
                  </label>
                  
                  <div class="color-mode-selector">
                    <label class="mode-option-card ${this.currentDraft.colorMode === 'mono' ? 'selected' : ''}">
                      <input type="radio" name="colorMode" value="mono" ${this.currentDraft.colorMode === 'mono' ? 'checked' : ''}>
                      <span class="mode-icon">⚫</span>
                      <div class="mode-body">
                        <strong class="mode-title">Black & White Only</strong>
                        <span class="mode-desc">Routes to Dedicated HP LaserJet • ₹${state.pricing.bwSingle.toFixed(2)}/pg</span>
                      </div>
                    </label>

                    <label class="mode-option-card ${this.currentDraft.colorMode === 'color' ? 'selected' : ''}">
                      <input type="radio" name="colorMode" value="color" ${this.currentDraft.colorMode === 'color' ? 'checked' : ''}>
                      <span class="mode-icon">🌈</span>
                      <div class="mode-body">
                        <strong class="mode-title">Full Colour Print</strong>
                        <span class="mode-desc">Routes to Dedicated Canon EcoTank • ₹${state.pricing.colorSingle.toFixed(2)}/pg</span>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Number of Copies & Sides (Duplex) -->
                <div class="form-group half-width">
                  <label class="form-label" for="txtCopies">Number of Copies</label>
                  <div class="counter-input-row">
                    <button type="button" class="counter-btn" id="btnCopiesDec">−</button>
                    <input type="number" id="txtCopies" class="counter-field" min="1" max="100" value="${this.currentDraft.copies}">
                    <button type="button" class="counter-btn" id="btnCopiesInc">+</button>
                  </div>
                </div>

                <div class="form-group half-width">
                  <label class="form-label">Print Sides (Duplex)</label>
                  <div class="segment-picker">
                    <button type="button" class="segment-btn ${!this.currentDraft.duplex ? 'active' : ''}" id="btnSingleSided">
                      Single-Sided
                    </button>
                    <button type="button" class="segment-btn ${this.currentDraft.duplex ? 'active' : ''}" id="btnDoubleSided">
                      Double-Sided (Duplex)
                    </button>
                  </div>
                </div>

                <!-- Page Range Selection -->
                <div class="form-group full-width">
                  <label class="form-label">Page Range</label>
                  <div class="range-selector-row">
                    <label class="radio-chip ${this.currentDraft.rangeMode === 'all' ? 'active' : ''}">
                      <input type="radio" name="rangeMode" value="all" ${this.currentDraft.rangeMode === 'all' ? 'checked' : ''}>
                      All Pages (1 - ${this.currentDraft.pageCount})
                    </label>

                    <label class="radio-chip ${this.currentDraft.rangeMode === 'custom' ? 'active' : ''}">
                      <input type="radio" name="rangeMode" value="custom" ${this.currentDraft.rangeMode === 'custom' ? 'checked' : ''}>
                      Custom Page Range
                    </label>
                  </div>

                  ${this.currentDraft.rangeMode === 'custom' ? `
                    <div class="custom-range-inputs">
                      <div class="range-field-wrap">
                        <label for="txtFromPage">From Page:</label>
                        <input type="number" id="txtFromPage" class="clean-input" min="1" max="${this.currentDraft.pageCount}" value="${this.currentDraft.fromPage}">
                      </div>
                      <span class="range-separator">to</span>
                      <div class="range-field-wrap">
                        <label for="txtToPage">To Page:</label>
                        <input type="number" id="txtToPage" class="clean-input" min="1" max="${this.currentDraft.pageCount}" value="${this.currentDraft.toPage}">
                      </div>
                      <span class="range-hint">Printing ${effectivePages} pages total</span>
                    </div>
                  ` : ''}
                </div>

                <!-- Paper Quality & Format -->
                <div class="form-group half-width">
                  <label class="form-label" for="selPaperFormat">Paper Size & Orientation</label>
                  <select id="selPaperFormat" class="clean-select">
                    <option value="A4" ${this.currentDraft.paperFormat === 'A4' ? 'selected' : ''}>A4 Standard Sheet</option>
                    <option value="A3" ${this.currentDraft.paperFormat === 'A3' ? 'selected' : ''}>A3 Poster / Blueprint (+₹${state.pricing.paperFormat.A3.toFixed(2)})</option>
                    <option value="Legal" ${this.currentDraft.paperFormat === 'Legal' ? 'selected' : ''}>Legal Sheet (+₹${state.pricing.paperFormat.Legal.toFixed(2)})</option>
                  </select>
                </div>

                <div class="form-group half-width">
                  <label class="form-label" for="selPaperGrade">Paper Weight & Finish</label>
                  <select id="selPaperGrade" class="clean-select">
                    <option value="gsm75" ${this.currentDraft.paper === 'gsm75' ? 'selected' : ''}>75 GSM Standard Copy Paper</option>
                    <option value="gsm100" ${this.currentDraft.paper === 'gsm100' ? 'selected' : ''}>100 GSM Premium Bright (+₹${state.pricing.paper.gsm100.toFixed(2)}/pg)</option>
                    <option value="gsm250" ${this.currentDraft.paper === 'gsm250' ? 'selected' : ''}>250 GSM Heavy Cardstock (+₹${state.pricing.paper.gsm250.toFixed(2)}/pg)</option>
                  </select>
                </div>

                <!-- Optional Finishing / Binding -->
                <div class="form-group full-width">
                  <label class="form-label" for="selBinding">Finishing & Binding (Optional)</label>
                  <select id="selBinding" class="clean-select">
                    <option value="none" ${this.currentDraft.binding === 'none' ? 'selected' : ''}>No Binding (Loose Sheets)</option>
                    <option value="staple" ${this.currentDraft.binding === 'staple' ? 'selected' : ''}>Top-Left Corner Staple (+₹${state.pricing.binding.staple.toFixed(2)})</option>
                    <option value="spiral" ${this.currentDraft.binding === 'spiral' ? 'selected' : ''}>Spiral Coil Binding with Clear Cover (+₹${state.pricing.binding.spiral.toFixed(2)})</option>
                  </select>
                </div>

                <!-- Customer Details for Counter Notification -->
                <div class="form-group half-width">
                  <label class="form-label" for="txtCustName">Your Name *</label>
                  <input type="text" id="txtCustName" class="clean-input" placeholder="e.g. Rahul Sharma" value="${this.currentDraft.customer.name}" required>
                </div>

                <div class="form-group half-width">
                  <label class="form-label" for="txtCustPhone">WhatsApp / Mobile Number *</label>
                  <input type="tel" id="txtCustPhone" class="clean-input" placeholder="e.g. 98401 23450" value="${this.currentDraft.customer.phone}" required>
                </div>

                <div class="form-group full-width">
                  <label class="form-label" for="txtCustNotes">Special Instructions (Optional)</label>
                  <input type="text" id="txtCustNotes" class="clean-input" placeholder="e.g., Color cover page only, staple left margin..." value="${this.currentDraft.customerNotes || ''}">
                </div>

              </div>
            </div>

          </div>

          <!-- Right Column: Instant Live Price Summary & Order Tracker -->
          <div class="customer-col-side">

            <!-- Cost Quote Card -->
            <div class="clean-card price-quote-card">
              <h3 class="quote-title">Order Price Summary</h3>
              <p class="quote-sub">Transparent rates calculated directly by shop printer software</p>

              <div class="quote-lines-list">
                ${quote.bwCount > 0 ? `
                  <div class="quote-line">
                    <span class="line-label">B&W Pages (${quote.bwCount} pgs × ${this.currentDraft.copies} c)</span>
                    <span class="line-val">₹${quote.bwCost.toFixed(2)}</span>
                  </div>
                ` : ''}

                ${quote.colorCount > 0 ? `
                  <div class="quote-line">
                    <span class="line-label">Colour Pages (${quote.colorCount} pgs × ${this.currentDraft.copies} c)</span>
                    <span class="line-val color-indigo">₹${quote.colorCost.toFixed(2)}</span>
                  </div>
                ` : ''}

                ${quote.paperCost > 0 ? `
                  <div class="quote-line">
                    <span class="line-label">Paper Upgrade</span>
                    <span class="line-val">₹${quote.paperCost.toFixed(2)}</span>
                  </div>
                ` : ''}

                ${quote.formatCost > 0 ? `
                  <div class="quote-line">
                    <span class="line-label">Format Size (${this.currentDraft.paperFormat})</span>
                    <span class="line-val">₹${quote.formatCost.toFixed(2)}</span>
                  </div>
                ` : ''}

                ${quote.bindingCost > 0 ? `
                  <div class="quote-line">
                    <span class="line-label">Finishing (${this.currentDraft.binding})</span>
                    <span class="line-val">₹${quote.bindingCost.toFixed(2)}</span>
                  </div>
                ` : ''}

                <div class="quote-divider"></div>

                <div class="quote-total-row">
                  <div class="total-text-col">
                    <span class="total-caption">Total Amount Payable</span>
                    <span class="total-sheets-info">${quote.sheetsCount} sheets • ${this.currentDraft.copies} copy</span>
                  </div>
                  <div class="total-amount-display" id="lblGrandTotal">₹${quote.grandTotal.toFixed(2)}</div>
                </div>

                ${quote.sheetsSaved > 0 ? `
                  <div class="duplex-save-badge">
                    <span>🌱 Duplex saved ${quote.sheetsSaved} sheets of paper!</span>
                  </div>
                ` : ''}
              </div>

              <!-- Payment Method Selection (Razorpay Integration) -->
              <div class="payment-method-box">
                <label class="payment-box-title">Choose Payment Method:</label>

                <div class="pay-options-row">
                  <label class="pay-option ${this.currentDraft.paymentMethod === 'RAZORPAY_UPI' ? 'selected' : ''}">
                    <input type="radio" name="payMethod" value="RAZORPAY_UPI" ${this.currentDraft.paymentMethod === 'RAZORPAY_UPI' ? 'checked' : ''}>
                    <span class="pay-icon">💳</span>
                    <div>
                      <strong>Razorpay UPI Instant</strong>
                      <span class="pay-sub">GPay, PhonePe, Paytm, Card</span>
                    </div>
                  </label>

                  <label class="pay-option ${this.currentDraft.paymentMethod === 'CASH_COUNTER' ? 'selected' : ''}">
                    <input type="radio" name="payMethod" value="CASH_COUNTER" ${this.currentDraft.paymentMethod === 'CASH_COUNTER' ? 'checked' : ''}>
                    <span class="pay-icon">💵</span>
                    <div>
                      <strong>Pay at Counter</strong>
                      <span class="pay-sub">Cash or UPI upon pickup</span>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Submit Button -->
              <button type="button" class="btn-primary-action full-width" id="btnPlaceOrder">
                <span class="btn-action-icon">🚀</span>
                <span>Submit Order & Print (₹${quote.grandTotal.toFixed(2)})</span>
              </button>

              <div class="privacy-guarantee-footer">
                <span class="shield-icon">🔒</span>
                <span><strong>100% Private & Secure:</strong> File is permanently erased from server automatically once printed. Zero data retained.</span>
              </div>
            </div>

            <!-- LIVE ORDER STATUS TRACKER -->
            ${activeOrder ? `
              <div class="clean-card live-tracker-card">
                <div class="tracker-header">
                  <div class="tracker-title-wrap">
                    <span class="tracker-pulse"></span>
                    <h4 class="tracker-heading">Live Order Status</h4>
                  </div>
                  <span class="tracker-order-id">#${activeOrder.orderNumber}</span>
                </div>

                <div class="tracker-file-meta">
                  <span class="tracker-filename">${activeOrder.fileName}</span>
                  <span class="tracker-status-tag ${activeOrder.status.toLowerCase()}">${activeOrder.status}</span>
                </div>

                <!-- Step Progress Bar -->
                <div class="tracker-stepper">
                  <div class="step-point ${activeOrder.status !== 'REJECTED' ? 'done' : ''}">
                    <div class="step-circle">1</div>
                    <span class="step-name">Submitted</span>
                  </div>

                  <div class="step-line ${['APPROVED', 'PRINTING', 'READY', 'COMPLETED'].includes(activeOrder.status) ? 'done' : ''}"></div>

                  <div class="step-point ${['APPROVED', 'PRINTING', 'READY', 'COMPLETED'].includes(activeOrder.status) ? 'done' : ''}">
                    <div class="step-circle">2</div>
                    <span class="step-name">Approved</span>
                  </div>

                  <div class="step-line ${['PRINTING', 'READY', 'COMPLETED'].includes(activeOrder.status) ? 'done' : ''}"></div>

                  <div class="step-point ${['PRINTING', 'READY', 'COMPLETED'].includes(activeOrder.status) ? 'done' : ''}">
                    <div class="step-circle">${activeOrder.status === 'PRINTING' ? '⚙️' : '3'}</div>
                    <span class="step-name">Printing</span>
                  </div>

                  <div class="step-line ${['READY', 'COMPLETED'].includes(activeOrder.status) ? 'done' : ''}"></div>

                  <div class="step-point ${['READY', 'COMPLETED'].includes(activeOrder.status) ? 'done' : ''}">
                    <div class="step-circle">4</div>
                    <span class="step-name">Ready</span>
                  </div>
                </div>

                <!-- Printer Routing & Progress info -->
                <div class="tracker-routing-badge">
                  <span class="routing-icon">${activeOrder.routedPrinter === 'BW_PRINTER' ? '🖨️' : '🌈'}</span>
                  <span>
                    Auto-Routed to: <strong>${activeOrder.routedPrinter === 'BW_PRINTER' ? state.bwPrinter.name : state.colorPrinter.name}</strong>
                  </span>
                </div>

                ${activeOrder.status === 'PRINTING' ? `
                  <div class="live-print-bar-wrap">
                    <div class="live-print-bar" style="width: ${activeOrder.printProgress || 30}%"></div>
                  </div>
                  <span class="live-progress-caption">Printing in progress (${activeOrder.printProgress || 30}%) — ready in < 30s</span>
                ` : ''}

                ${activeOrder.status === 'READY' ? `
                  <div class="ready-pickup-banner">
                    <span class="ready-icon">🎉</span>
                    <div>
                      <strong>Your prints are ready at the counter!</strong>
                      <span>Show Order #${activeOrder.orderNumber} to collect.</span>
                    </div>
                  </div>
                ` : ''}

                <!-- Zero Data Retention Notice -->
                <div class="tracker-purge-notice">
                  ${activeOrder.fileErased ? `
                    <span class="purge-pill erased">
                      🔒 File permanently erased from server (Zero Data Retained)
                    </span>
                  ` : `
                    <span class="purge-pill pending">
                      ⏳ File will be deleted immediately upon print completion
                    </span>
                  `}
                </div>
              </div>
            ` : ''}

          </div>

        </div>

      </div>
    `;

    this.bindEvents(state);
  }

  private bindEvents(state: SystemState): void {
    const fileInput = this.container.querySelector('#customerFileInput') as HTMLInputElement;
    const dropzone = this.container.querySelector('#customerDropzone');

    dropzone?.addEventListener('click', () => {
      fileInput?.click();
    });

    fileInput?.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.handleFileSelected(file);
      }
    });

    // Preset sample buttons
    this.container.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const preset = (btn as HTMLElement).dataset.preset;
        this.applyPreset(preset || 'docx');
      });
    });

    // Color mode radios
    this.container.querySelectorAll('input[name="colorMode"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const val = (e.target as HTMLInputElement).value as ColorMode;
        this.currentDraft.colorMode = val;
        sound.click();
        this.render(store.getState());
      });
    });

    // Copies buttons
    const btnCopiesDec = this.container.querySelector('#btnCopiesDec');
    const btnCopiesInc = this.container.querySelector('#btnCopiesInc');
    const txtCopies = this.container.querySelector('#txtCopies') as HTMLInputElement;

    btnCopiesDec?.addEventListener('click', () => {
      this.currentDraft.copies = Math.max(1, this.currentDraft.copies - 1);
      sound.click();
      this.render(store.getState());
    });

    btnCopiesInc?.addEventListener('click', () => {
      this.currentDraft.copies = Math.min(100, this.currentDraft.copies + 1);
      sound.click();
      this.render(store.getState());
    });

    txtCopies?.addEventListener('change', () => {
      this.currentDraft.copies = Math.max(1, parseInt(txtCopies.value) || 1);
      this.render(store.getState());
    });

    // Duplex buttons
    const btnSingleSided = this.container.querySelector('#btnSingleSided');
    const btnDoubleSided = this.container.querySelector('#btnDoubleSided');

    btnSingleSided?.addEventListener('click', () => {
      this.currentDraft.duplex = false;
      sound.click();
      this.render(store.getState());
    });

    btnDoubleSided?.addEventListener('click', () => {
      this.currentDraft.duplex = true;
      sound.click();
      this.render(store.getState());
    });

    // Range mode
    this.container.querySelectorAll('input[name="rangeMode"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const val = (e.target as HTMLInputElement).value as 'all' | 'custom';
        this.currentDraft.rangeMode = val;
        sound.click();
        this.render(store.getState());
      });
    });

    const txtFromPage = this.container.querySelector('#txtFromPage') as HTMLInputElement;
    const txtToPage = this.container.querySelector('#txtToPage') as HTMLInputElement;

    txtFromPage?.addEventListener('change', () => {
      this.currentDraft.fromPage = Math.max(1, parseInt(txtFromPage.value) || 1);
      this.render(store.getState());
    });

    txtToPage?.addEventListener('change', () => {
      this.currentDraft.toPage = Math.min(this.currentDraft.pageCount, parseInt(txtToPage.value) || this.currentDraft.pageCount);
      this.render(store.getState());
    });

    // Paper Format & Grade
    const selPaperFormat = this.container.querySelector('#selPaperFormat') as HTMLSelectElement;
    selPaperFormat?.addEventListener('change', () => {
      this.currentDraft.paperFormat = selPaperFormat.value as PaperFormat;
      sound.click();
      this.render(store.getState());
    });

    const selPaperGrade = this.container.querySelector('#selPaperGrade') as HTMLSelectElement;
    selPaperGrade?.addEventListener('change', () => {
      this.currentDraft.paper = selPaperGrade.value as PaperGrade;
      sound.click();
      this.render(store.getState());
    });

    // Binding
    const selBinding = this.container.querySelector('#selBinding') as HTMLSelectElement;
    selBinding?.addEventListener('change', () => {
      this.currentDraft.binding = selBinding.value as BindingType;
      sound.click();
      this.render(store.getState());
    });

    // Customer Name & Phone
    const txtCustName = this.container.querySelector('#txtCustName') as HTMLInputElement;
    txtCustName?.addEventListener('input', () => {
      this.currentDraft.customer.name = txtCustName.value;
    });

    const txtCustPhone = this.container.querySelector('#txtCustPhone') as HTMLInputElement;
    txtCustPhone?.addEventListener('input', () => {
      this.currentDraft.customer.phone = txtCustPhone.value;
    });

    const txtCustNotes = this.container.querySelector('#txtCustNotes') as HTMLInputElement;
    txtCustNotes?.addEventListener('input', () => {
      this.currentDraft.customerNotes = txtCustNotes.value;
    });

    // Payment Method
    this.container.querySelectorAll('input[name="payMethod"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const val = (e.target as HTMLInputElement).value as PaymentMethod;
        this.currentDraft.paymentMethod = val;
        sound.click();
        this.render(store.getState());
      });
    });

    // Place Order Button
    const btnPlaceOrder = this.container.querySelector('#btnPlaceOrder');
    btnPlaceOrder?.addEventListener('click', () => {
      this.handleOrderSubmission();
    });
  }

  private handleFileSelected(file: File): void {
    const isDocx = file.name.endsWith('.docx') || file.name.endsWith('.doc');
    const isImg = file.type.startsWith('image/');

    this.currentDraft.fileName = file.name;
    this.currentDraft.fileSizeKb = Math.round(file.size / 1024);
    this.currentDraft.fileType = isDocx ? 'docx' : (isImg ? 'image' : 'pdf');
    this.currentDraft.isDocxConverted = isDocx;

    // Simulate page detection based on size
    if (isDocx) {
      this.currentDraft.pageCount = Math.max(2, Math.min(60, Math.round(file.size / 150000) || 12));
    } else if (isImg) {
      this.currentDraft.pageCount = 1;
      this.currentDraft.colorMode = 'color';
    } else {
      this.currentDraft.pageCount = Math.max(1, Math.min(100, Math.round(file.size / 100000) || 8));
    }

    this.currentDraft.fromPage = 1;
    this.currentDraft.toPage = this.currentDraft.pageCount;
    this.currentDraft.pageRange = `All Pages (1-${this.currentDraft.pageCount})`;

    sound.success();
    this.render(store.getState());
  }

  private applyPreset(preset: string): void {
    if (preset === 'docx') {
      this.currentDraft.fileName = 'Project_Final_Submission.docx';
      this.currentDraft.fileType = 'docx';
      this.currentDraft.isDocxConverted = true;
      this.currentDraft.pageCount = 16;
      this.currentDraft.colorMode = 'mono';
      this.currentDraft.duplex = true;
      this.currentDraft.copies = 1;
    } else if (preset === 'color') {
      this.currentDraft.fileName = 'Marketing_Pitch_Deck.pdf';
      this.currentDraft.fileType = 'pdf';
      this.currentDraft.isDocxConverted = false;
      this.currentDraft.pageCount = 12;
      this.currentDraft.colorMode = 'color';
      this.currentDraft.duplex = false;
      this.currentDraft.copies = 1;
    } else if (preset === 'lab') {
      this.currentDraft.fileName = 'Chemistry_Lab_Manual.pdf';
      this.currentDraft.fileType = 'pdf';
      this.currentDraft.isDocxConverted = false;
      this.currentDraft.pageCount = 8;
      this.currentDraft.colorMode = 'mono';
      this.currentDraft.duplex = true;
      this.currentDraft.copies = 1;
    } else {
      this.currentDraft.fileName = 'Ravi_Resume_2026.pdf';
      this.currentDraft.fileType = 'pdf';
      this.currentDraft.isDocxConverted = false;
      this.currentDraft.pageCount = 2;
      this.currentDraft.colorMode = 'mono';
      this.currentDraft.duplex = false;
      this.currentDraft.copies = 2;
    }

    this.currentDraft.fromPage = 1;
    this.currentDraft.toPage = this.currentDraft.pageCount;
    this.currentDraft.pageRange = `All Pages (1-${this.currentDraft.pageCount})`;

    sound.click();
    this.render(store.getState());
  }

  private handleOrderSubmission(): void {
    if (!this.currentDraft.customer.name.trim()) {
      this.currentDraft.customer.name = 'Walk-in Customer';
    }
    if (!this.currentDraft.customer.phone.trim()) {
      this.currentDraft.customer.phone = '+91 98401 23450';
    }

    if (this.currentDraft.paymentMethod === 'RAZORPAY_UPI') {
      // Trigger Razorpay UPI modal
      window.dispatchEvent(new CustomEvent('open-razorpay-modal', {
        detail: {
          draft: { ...this.currentDraft },
          onSuccess: (order: PrintOrder) => {
            store.setActiveCustomerOrderId(order.id);
            this.render(store.getState());
          }
        }
      }));
    } else {
      const order = store.createOrder(this.currentDraft);
      store.setActiveCustomerOrderId(order.id);
      this.render(store.getState());
    }
  }

  private update(state: SystemState): void {
    this.render(state);
  }
}
