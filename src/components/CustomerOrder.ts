/**
 * Click2Print UI Component: Customer Order Form
 * Clean flow: Upload -> Page Range -> Print Options -> Notes -> Place Order
 */

import { store } from '../core/store.js';
import { pricingEngine } from '../services/pricingEngine.js';
import { colorAnalyzer } from '../services/colorAnalyzer.js';
import { sound } from '../core/audio.js';
import {
  SystemState,
  OrderDraft,
  ColorMode,
  PaperGrade,
  PaperFormat,
  BindingType
} from '../types/index.js';

export class CustomerOrderComponent {
  private container: HTMLElement;

  private currentDraft: OrderDraft = {
    fileName: 'Company_Brochure_2026.pdf',
    pageCount: 28,
    rangeMode: 'all',
    fromPage: 1,
    toPage: 28,
    pageRange: 'All Pages (1-28)',
    bwPages: 24,
    colorPages: 4,
    colorMode: 'smart',
    duplex: true,
    copies: 1,
    paper: 'gsm75',
    paperFormat: 'A4',
    binding: 'spiral',
    bindingNotes: 'Transparent PVC front cover',
    customerNotes: '',
    customer: {
      name: '',
      phone: '',
      email: ''
    }
  };

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
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

  private render(): void {
    const effectivePages = this.getEffectivePageCount();
    const analysis = colorAnalyzer.analyzeDocument(this.currentDraft.fileName, effectivePages);
    this.currentDraft.colorPages = analysis.colorPagesCount;
    this.currentDraft.bwPages = analysis.bwPagesCount;

    const quote = pricingEngine.calculate(
      effectivePages,
      this.currentDraft.colorPages,
      this.currentDraft.bwPages,
      this.currentDraft.colorMode,
      this.currentDraft.duplex,
      this.currentDraft.copies,
      this.currentDraft.paper,
      this.currentDraft.paperFormat,
      this.currentDraft.binding
    );

    this.container.innerHTML = `
      <!-- Hero Banner -->
      <div class="c2p-hero-banner">
        <div class="hero-content">
          <div class="hero-pill-badge">
            <span class="pulse-beacon"></span>
            UPLOAD • CONFIGURE • PRINT
          </div>
          <h2 class="hero-heading">Place Your Print Order</h2>
          <p class="hero-desc">
            Upload your document, choose your print options, and we'll handle the rest. Track your order in real-time.
          </p>
        </div>
      </div>

      <!-- Main Order Form Grid -->
      <div class="studio-two-column-grid">
        <!-- Left: Order Configuration -->
        <div class="studio-left-column">

          <!-- STEP 1: Upload Document -->
          <div class="cyber-glass-panel">
            <div class="panel-header">
              <span class="step-num">01</span>
              <div>
                <h3 class="panel-title">Upload Document</h3>
                <p class="panel-sub">Upload your PDF, DOCX, or PPTX file.</p>
              </div>
            </div>

            <div class="file-dropzone-interactive" id="dropzoneEl">
              <input type="file" id="fileInputEl" accept=".pdf,.docx,.pptx" style="display: none;">
              <div class="dropzone-body">
                <div class="drop-icon-sphere">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <div class="dropzone-info">
                  <div class="file-name-display" id="studioFileName">${this.currentDraft.fileName}</div>
                  <div class="file-meta-display" id="studioFileMeta">
                    ${this.currentDraft.pageCount} Pages Detected • Ready for Print
                  </div>
                </div>
                <button class="btn-browse-file" type="button" id="btnBrowseFile">Browse File</button>
              </div>
            </div>

            <!-- Quick Presets -->
            <div class="sample-preset-row">
              <span class="preset-label">Try a sample:</span>
              <button class="sample-chip active" data-sample="brochure">📄 28-Page Brochure</button>
              <button class="sample-chip" data-sample="report">📑 60-Page Report</button>
              <button class="sample-chip" data-sample="flyer">📝 8-Page Flyer</button>
            </div>
          </div>

          <!-- STEP 2: Page Range -->
          <div class="cyber-glass-panel">
            <div class="panel-header">
              <span class="step-num">02</span>
              <div>
                <h3 class="panel-title">Page Selection</h3>
                <p class="panel-sub">Print the entire document or select specific pages.</p>
              </div>
            </div>

            <div class="range-selector-toggle-row">
              <button class="range-tab-btn ${this.currentDraft.rangeMode === 'all' ? 'active' : ''}" id="btnRangeAll">
                <span>📄 Full Document</span>
                <span class="range-badge">All ${this.currentDraft.pageCount} Pages</span>
              </button>
              <button class="range-tab-btn ${this.currentDraft.rangeMode === 'custom' ? 'active' : ''}" id="btnRangeCustom">
                <span>📑 Custom Range</span>
                <span class="range-badge">Select Pages</span>
              </button>
            </div>

            <div class="custom-range-inputs-box ${this.currentDraft.rangeMode === 'custom' ? 'open' : ''}" id="customRangeBox">
              <div class="range-inputs-grid">
                <div class="range-field">
                  <label class="form-label">From Page</label>
                  <input type="number" id="inputFromPage" class="cyber-input font-mono" min="1" max="${this.currentDraft.pageCount}" value="${this.currentDraft.fromPage}">
                </div>
                <div class="range-separator">to</div>
                <div class="range-field">
                  <label class="form-label">To Page</label>
                  <input type="number" id="inputToPage" class="cyber-input font-mono" min="1" max="${this.currentDraft.pageCount}" value="${this.currentDraft.toPage}">
                </div>
                <div class="range-summary-chip">
                  <span id="effectivePagesCountText">${effectivePages}</span> of ${this.currentDraft.pageCount} Pages
                </div>
              </div>
            </div>

            <!-- Color Analysis -->
            <div class="color-spotter-insight-card" id="colorSpotterCard">
              <div class="spotter-top-row">
                <div class="spotter-title-group">
                  <span class="spotter-sparkle">✨</span>
                  <div>
                    <h4>Smart Color Detection</h4>
                    <p class="spotter-pages-summary" id="spotterPagesSummary">
                      ${analysis.colorPagesCount} Color Pages detected (${analysis.colorPagesList.join(', ') || 'None'})
                    </p>
                  </div>
                </div>
                <div class="savings-glow-pill" id="spotterSavingsBadge">
                  Save ₹${analysis.savingsAmount} vs Full Color
                </div>
              </div>

              <div class="spectral-page-strip-container">
                <div class="spectral-strip-label">
                  <span>PAGE COLOR MAP</span>
                  <span class="legend-color-indicator">
                    <span class="dot-amber"></span> Color
                    <span class="dot-mono"></span> B&W
                  </span>
                </div>
                <div class="page-blocks-strip" id="pageBlocksStrip"></div>
              </div>
            </div>
          </div>

          <!-- STEP 3: Print Options -->
          <div class="cyber-glass-panel">
            <div class="panel-header">
              <span class="step-num">03</span>
              <div>
                <h3 class="panel-title">Print Options</h3>
                <p class="panel-sub">Color mode, sides, paper size and weight.</p>
              </div>
            </div>

            <!-- Color Mode -->
            <div class="form-group">
              <label class="form-label">Color Mode</label>
              <div class="spec-pills-grid" id="colorModePills">
                <div class="spec-pill ${this.currentDraft.colorMode === 'smart' ? 'active' : ''}" data-val="smart">
                  <div class="pill-top">✨ Smart Auto-Split</div>
                  <div class="pill-meta">Color only when needed</div>
                </div>
                <div class="spec-pill ${this.currentDraft.colorMode === 'mono' ? 'active' : ''}" data-val="mono">
                  <div class="pill-top">⚫ Black & White</div>
                  <div class="pill-meta">₹1.50 / page</div>
                </div>
                <div class="spec-pill ${this.currentDraft.colorMode === 'color' ? 'active' : ''}" data-val="color">
                  <div class="pill-top">🌈 Full Color</div>
                  <div class="pill-meta">₹8.00 / page</div>
                </div>
              </div>
            </div>

            <!-- Sides -->
            <div class="form-group">
              <label class="form-label">Sides</label>
              <div class="spec-pills-grid" style="grid-template-columns: 1fr 1fr;">
                <div class="spec-pill ${!this.currentDraft.duplex ? 'active' : ''}" id="pillSingleSided">
                  <div class="pill-top">📄 Single-Sided</div>
                  <div class="pill-meta">Front only</div>
                </div>
                <div class="spec-pill ${this.currentDraft.duplex ? 'active' : ''}" id="pillDoubleSided">
                  <div class="pill-top">🔄 Double-Sided</div>
                  <div class="pill-meta">Saves 50% paper</div>
                </div>
              </div>
            </div>

            <!-- Copies -->
            <div class="form-group">
              <label class="form-label">Number of Copies</label>
              <div class="copies-input-row">
                <button class="copies-btn" id="btnCopiesMinus" type="button">−</button>
                <input type="number" id="inputCopies" class="cyber-input copies-input font-mono" min="1" max="100" value="${this.currentDraft.copies}">
                <button class="copies-btn" id="btnCopiesPlus" type="button">+</button>
              </div>
            </div>

            <!-- Paper Format -->
            <div class="form-group">
              <label class="form-label">Paper Size</label>
              <div class="spec-pills-grid paper-format-grid" id="paperFormatPills">
                <div class="spec-pill ${this.currentDraft.paperFormat === 'A4' ? 'active' : ''}" data-val="A4">
                  <div class="pill-top">A4 Standard</div>
                  <div class="pill-meta">210 × 297 mm</div>
                </div>
                <div class="spec-pill ${this.currentDraft.paperFormat === 'A3' ? 'active' : ''}" data-val="A3">
                  <div class="pill-top">A3 Large</div>
                  <div class="pill-meta">297 × 420 mm (+₹3.00)</div>
                </div>
                <div class="spec-pill ${this.currentDraft.paperFormat === 'Legal' ? 'active' : ''}" data-val="Legal">
                  <div class="pill-top">Legal</div>
                  <div class="pill-meta">8.5 × 14 in (+₹0.50)</div>
                </div>
                <div class="spec-pill ${this.currentDraft.paperFormat === 'Letter' ? 'active' : ''}" data-val="Letter">
                  <div class="pill-top">Letter</div>
                  <div class="pill-meta">8.5 × 11 in</div>
                </div>
              </div>
            </div>

            <!-- Paper Weight -->
            <div class="form-group">
              <label class="form-label">Paper Weight</label>
              <div class="spec-pills-grid" id="paperGradePills">
                <div class="spec-pill ${this.currentDraft.paper === 'gsm75' ? 'active' : ''}" data-val="gsm75">
                  <div class="pill-top">75 GSM Standard</div>
                  <div class="pill-meta">Everyday printing</div>
                </div>
                <div class="spec-pill ${this.currentDraft.paper === 'gsm100' ? 'active' : ''}" data-val="gsm100">
                  <div class="pill-top">100 GSM Premium</div>
                  <div class="pill-meta">+₹0.50 / sheet</div>
                </div>
                <div class="spec-pill ${this.currentDraft.paper === 'gsm250' ? 'active' : ''}" data-val="gsm250">
                  <div class="pill-top">250 GSM Glossy Card</div>
                  <div class="pill-meta">+₹2.00 / sheet</div>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 4: Binding -->
          <div class="cyber-glass-panel">
            <div class="panel-header">
              <span class="step-num">04</span>
              <div>
                <h3 class="panel-title">Binding & Finishing</h3>
                <p class="panel-sub">Choose how your document is bound.</p>
              </div>
            </div>

            <div class="spec-pills-grid binding-grid" id="bindingPills">
              <div class="spec-pill ${this.currentDraft.binding === 'none' ? 'active' : ''}" data-val="none">
                <div class="pill-top">None</div>
                <div class="pill-meta">Loose Sheets</div>
              </div>
              <div class="spec-pill ${this.currentDraft.binding === 'staple' ? 'active' : ''}" data-val="staple">
                <div class="pill-top">Staple</div>
                <div class="pill-meta">Free</div>
              </div>
              <div class="spec-pill ${this.currentDraft.binding === 'spiral' ? 'active' : ''}" data-val="spiral">
                <div class="pill-top">Spiral</div>
                <div class="pill-meta">+₹30.00</div>
              </div>
              <div class="spec-pill ${this.currentDraft.binding === 'thermal' ? 'active' : ''}" data-val="thermal">
                <div class="pill-top">Thermal</div>
                <div class="pill-meta">+₹60.00</div>
              </div>
              <div class="spec-pill ${this.currentDraft.binding === 'hardcover' ? 'active' : ''}" data-val="hardcover">
                <div class="pill-top">Hardcover</div>
                <div class="pill-meta">+₹150.00</div>
              </div>
            </div>
          </div>

          <!-- STEP 5: Notes & Customer Info -->
          <div class="cyber-glass-panel">
            <div class="panel-header">
              <span class="step-num">05</span>
              <div>
                <h3 class="panel-title">Notes & Your Details</h3>
                <p class="panel-sub">Add special instructions and your contact info.</p>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 0.75rem;">
              <label class="form-label">Special Instructions (Optional)</label>
              <textarea id="inputCustomerNotes" class="cyber-textarea" rows="3" placeholder="E.g., Staple top-left corner, leave margin for binding, print cover on glossy...">${this.currentDraft.customerNotes || ''}</textarea>
            </div>

            <div class="suggestion-chips-row">
              <button type="button" class="note-chip" data-note="Staple top-left corner">📌 Staple Top-Left</button>
              <button type="button" class="note-chip" data-note="Leave margin for binding">📑 Binding Margin</button>
              <button type="button" class="note-chip" data-note="Print cover in color">🎨 Color Cover</button>
            </div>

            <div class="form-row-grid-2" style="margin-top: 1.25rem;">
              <div>
                <label class="form-label">Your Name *</label>
                <input type="text" id="inputCustomerName" class="cyber-input" value="${this.currentDraft.customer.name}" placeholder="Enter your name">
              </div>
              <div>
                <label class="form-label">Phone Number *</label>
                <input type="tel" id="inputCustomerPhone" class="cyber-input" value="${this.currentDraft.customer.phone}" placeholder="+91 XXXXX XXXXX">
              </div>
            </div>
            <div class="form-group" style="margin-top: 0.75rem;">
              <label class="form-label">Email (Optional)</label>
              <input type="email" id="inputCustomerEmail" class="cyber-input" value="${this.currentDraft.customer.email || ''}" placeholder="your@email.com">
            </div>
          </div>
        </div>

        <!-- Right Column: Live Bill & Order Tracker -->
        <div class="studio-right-column">
          <!-- Live Bill -->
          <div class="cyber-glass-panel bill-panel">
            <div class="panel-header">
              <span class="step-num">💰</span>
              <div>
                <h3 class="panel-title">Order Summary</h3>
                <p class="panel-sub">Live pricing as you configure.</p>
              </div>
            </div>

            <div class="bill-line-items">
              <div class="bill-line" id="billBwLine">
                <span>B&W Pages (${quote.bwCount} pgs × ${this.currentDraft.copies})</span>
                <span class="price-val">₹${quote.bwCost.toFixed(2)}</span>
              </div>
              <div class="bill-line" id="billColorLine">
                <span>Color Pages (${quote.colorCount} pgs × ${this.currentDraft.copies})</span>
                <span class="price-val">₹${quote.colorCost.toFixed(2)}</span>
              </div>
              <div class="bill-line" id="billFormatLine">
                <span>Paper Size (${this.currentDraft.paperFormat})</span>
                <span class="price-val">₹${quote.formatCost.toFixed(2)}</span>
              </div>
              <div class="bill-line" id="billPaperLine">
                <span>Paper Weight (${this.currentDraft.paper.toUpperCase()})</span>
                <span class="price-val">₹${quote.paperCost.toFixed(2)}</span>
              </div>
              <div class="bill-line" id="billBindingLine">
                <span>Binding (${this.currentDraft.binding.charAt(0).toUpperCase() + this.currentDraft.binding.slice(1)})</span>
                <span class="price-val">₹${quote.bindingCost.toFixed(2)}</span>
              </div>
            </div>

            <div class="bill-grand-total">
              <span class="total-label">Total</span>
              <span class="total-number" id="billGrandTotal">₹${quote.grandTotal.toFixed(2)}</span>
            </div>

            <div class="bill-copies-note" id="billCopiesNote" style="${this.currentDraft.copies > 1 ? '' : 'display:none;'}">
              ${this.currentDraft.copies} copies × ₹${(quote.grandTotal / this.currentDraft.copies).toFixed(2)} each
            </div>

            <!-- Place Order CTA -->
            <button class="cyber-btn-primary" id="btnPlaceOrder">
              <span>Place Order</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>

          <!-- Recent Orders -->
          <div id="recentOrdersContainer" class="recent-orders-container"></div>
        </div>
      </div>
    `;

    this.renderSpectralStrip(analysis);
    this.bindEvents();
    this.updateRecentOrders(store.getState());
  }

  private renderSpectralStrip(analysis: ReturnType<typeof colorAnalyzer.analyzeDocument>): void {
    const strip = this.container.querySelector('#pageBlocksStrip');
    if (!strip) return;

    strip.innerHTML = analysis.pageBreakdown.map(page => `
      <div class="page-spectral-chip ${page.isColor ? 'is-color' : 'is-mono'}" title="Page ${page.pageNumber}: ${page.description}">
        <span class="page-num">${page.pageNumber}</span>
        <span class="page-type-badge">${page.isColor ? '🎨' : '📝'}</span>
      </div>
    `).join('');
  }

  private bindEvents(): void {
    // Dropzone
    const dropzone = this.container.querySelector('#dropzoneEl');
    const fileInput = this.container.querySelector('#fileInputEl') as HTMLInputElement;
    const btnBrowse = this.container.querySelector('#btnBrowseFile');

    if (btnBrowse && fileInput) {
      btnBrowse.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
      });
    }

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files[0]) {
          const file = fileInput.files[0];
          this.currentDraft.fileName = file.name;
          const simulatedPages = Math.floor(12 + Math.random() * 30);
          this.currentDraft.pageCount = simulatedPages;
          this.currentDraft.fromPage = 1;
          this.currentDraft.toPage = simulatedPages;
          this.recalculateSpecs();
          sound.click();
        }
      });
    }

    // Sample chips
    this.container.querySelectorAll('.sample-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        this.container.querySelectorAll('.sample-chip').forEach(c => c.classList.remove('active'));
        const target = e.currentTarget as HTMLElement;
        target.classList.add('active');
        const sample = target.dataset.sample;

        if (sample === 'report') {
          this.currentDraft.fileName = 'Annual_Business_Report_2026.pdf';
          this.currentDraft.pageCount = 60;
          this.currentDraft.fromPage = 1;
          this.currentDraft.toPage = 60;
          this.currentDraft.binding = 'hardcover';
        } else if (sample === 'flyer') {
          this.currentDraft.fileName = 'Marketing_Flyer_Q4.pdf';
          this.currentDraft.pageCount = 8;
          this.currentDraft.fromPage = 1;
          this.currentDraft.toPage = 8;
          this.currentDraft.binding = 'staple';
        } else {
          this.currentDraft.fileName = 'Company_Brochure_2026.pdf';
          this.currentDraft.pageCount = 28;
          this.currentDraft.fromPage = 1;
          this.currentDraft.toPage = 28;
          this.currentDraft.binding = 'spiral';
        }

        sound.click();
        this.recalculateSpecs();
      });
    });

    // Range mode
    const btnRangeAll = this.container.querySelector('#btnRangeAll');
    const btnRangeCustom = this.container.querySelector('#btnRangeCustom');
    const customRangeBox = this.container.querySelector('#customRangeBox');

    if (btnRangeAll && btnRangeCustom && customRangeBox) {
      btnRangeAll.addEventListener('click', () => {
        this.currentDraft.rangeMode = 'all';
        btnRangeAll.classList.add('active');
        btnRangeCustom.classList.remove('active');
        customRangeBox.classList.remove('open');
        this.currentDraft.fromPage = 1;
        this.currentDraft.toPage = this.currentDraft.pageCount;
        sound.click();
        this.recalculateSpecs();
      });

      btnRangeCustom.addEventListener('click', () => {
        this.currentDraft.rangeMode = 'custom';
        btnRangeCustom.classList.add('active');
        btnRangeAll.classList.remove('active');
        customRangeBox.classList.add('open');
        sound.click();
        this.recalculateSpecs();
      });
    }

    // Page range inputs
    const inputFrom = this.container.querySelector('#inputFromPage') as HTMLInputElement;
    const inputTo = this.container.querySelector('#inputToPage') as HTMLInputElement;
    if (inputFrom && inputTo) {
      inputFrom.addEventListener('input', () => {
        this.currentDraft.fromPage = Math.max(1, Math.min(this.currentDraft.pageCount, parseInt(inputFrom.value, 10) || 1));
        this.recalculateSpecs();
      });
      inputTo.addEventListener('input', () => {
        this.currentDraft.toPage = Math.max(this.currentDraft.fromPage, Math.min(this.currentDraft.pageCount, parseInt(inputTo.value, 10) || this.currentDraft.pageCount));
        this.recalculateSpecs();
      });
    }

    // Color mode pills
    this.container.querySelectorAll('#colorModePills .spec-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        this.container.querySelectorAll('#colorModePills .spec-pill').forEach(p => p.classList.remove('active'));
        const target = e.currentTarget as HTMLElement;
        target.classList.add('active');
        this.currentDraft.colorMode = target.dataset.val as ColorMode;
        sound.click();
        this.recalculateSpecs();
      });
    });

    // Sides
    const pillSingle = this.container.querySelector('#pillSingleSided');
    const pillDouble = this.container.querySelector('#pillDoubleSided');
    if (pillSingle && pillDouble) {
      pillSingle.addEventListener('click', () => {
        this.currentDraft.duplex = false;
        pillSingle.classList.add('active');
        pillDouble.classList.remove('active');
        sound.click();
        this.recalculateSpecs();
      });
      pillDouble.addEventListener('click', () => {
        this.currentDraft.duplex = true;
        pillDouble.classList.add('active');
        pillSingle.classList.remove('active');
        sound.click();
        this.recalculateSpecs();
      });
    }

    // Copies
    const copiesInput = this.container.querySelector('#inputCopies') as HTMLInputElement;
    const btnMinus = this.container.querySelector('#btnCopiesMinus');
    const btnPlus = this.container.querySelector('#btnCopiesPlus');
    if (copiesInput) {
      copiesInput.addEventListener('input', () => {
        this.currentDraft.copies = Math.max(1, Math.min(100, parseInt(copiesInput.value, 10) || 1));
        this.recalculateSpecs();
      });
    }
    if (btnMinus && copiesInput) {
      btnMinus.addEventListener('click', () => {
        this.currentDraft.copies = Math.max(1, this.currentDraft.copies - 1);
        copiesInput.value = String(this.currentDraft.copies);
        sound.click();
        this.recalculateSpecs();
      });
    }
    if (btnPlus && copiesInput) {
      btnPlus.addEventListener('click', () => {
        this.currentDraft.copies = Math.min(100, this.currentDraft.copies + 1);
        copiesInput.value = String(this.currentDraft.copies);
        sound.click();
        this.recalculateSpecs();
      });
    }

    // Paper format pills
    this.container.querySelectorAll('#paperFormatPills .spec-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        this.container.querySelectorAll('#paperFormatPills .spec-pill').forEach(p => p.classList.remove('active'));
        const target = e.currentTarget as HTMLElement;
        target.classList.add('active');
        this.currentDraft.paperFormat = target.dataset.val as PaperFormat;
        sound.click();
        this.recalculateSpecs();
      });
    });

    // Paper grade pills
    this.container.querySelectorAll('#paperGradePills .spec-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        this.container.querySelectorAll('#paperGradePills .spec-pill').forEach(p => p.classList.remove('active'));
        const target = e.currentTarget as HTMLElement;
        target.classList.add('active');
        this.currentDraft.paper = target.dataset.val as PaperGrade;
        sound.click();
        this.recalculateSpecs();
      });
    });

    // Binding pills
    this.container.querySelectorAll('#bindingPills .spec-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        this.container.querySelectorAll('#bindingPills .spec-pill').forEach(p => p.classList.remove('active'));
        const target = e.currentTarget as HTMLElement;
        target.classList.add('active');
        this.currentDraft.binding = target.dataset.val as BindingType;
        sound.click();
        this.recalculateSpecs();
      });
    });

    // Customer Notes
    const notesInput = this.container.querySelector('#inputCustomerNotes') as HTMLTextAreaElement;
    if (notesInput) {
      notesInput.addEventListener('input', () => {
        this.currentDraft.customerNotes = notesInput.value;
      });
    }

    this.container.querySelectorAll('.note-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const text = (e.currentTarget as HTMLElement).dataset.note;
        if (text && notesInput) {
          notesInput.value = notesInput.value ? `${notesInput.value}; ${text}` : text;
          this.currentDraft.customerNotes = notesInput.value;
          sound.click();
        }
      });
    });

    // Customer identity
    const nameInput = this.container.querySelector('#inputCustomerName') as HTMLInputElement;
    const phoneInput = this.container.querySelector('#inputCustomerPhone') as HTMLInputElement;
    const emailInput = this.container.querySelector('#inputCustomerEmail') as HTMLInputElement;
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        this.currentDraft.customer.name = nameInput.value;
      });
    }
    if (phoneInput) {
      phoneInput.addEventListener('input', () => {
        this.currentDraft.customer.phone = phoneInput.value;
      });
    }
    if (emailInput) {
      emailInput.addEventListener('input', () => {
        this.currentDraft.customer.email = emailInput.value;
      });
    }

    // Place Order CTA
    const btnPlace = this.container.querySelector('#btnPlaceOrder');
    if (btnPlace) {
      btnPlace.addEventListener('click', () => {
        if (!this.currentDraft.customer.name.trim()) {
          alert('Please enter your name.');
          return;
        }
        if (!this.currentDraft.customer.phone.trim()) {
          alert('Please enter your phone number.');
          return;
        }

        const newOrder = store.createOrder(this.currentDraft);

        // Show toast
        const toast = document.getElementById('toastContainer');
        if (toast) {
          const div = document.createElement('div');
          div.className = 'toast toast-success';
          div.innerHTML = `<strong>Order Placed!</strong> Your order #${newOrder.orderNumber} has been submitted. Total: ₹${newOrder.totalAmount.toFixed(2)}`;
          toast.appendChild(div);
          setTimeout(() => div.remove(), 5000);
        }
      });
    }
  }

  private recalculateSpecs(): void {
    const effectivePages = this.getEffectivePageCount();
    const analysis = colorAnalyzer.analyzeDocument(this.currentDraft.fileName, effectivePages);
    this.currentDraft.colorPages = analysis.colorPagesCount;
    this.currentDraft.bwPages = analysis.bwPagesCount;

    // Update file display
    const fileNameEl = this.container.querySelector('#studioFileName');
    const fileMetaEl = this.container.querySelector('#studioFileMeta');
    const pagesTextEl = this.container.querySelector('#effectivePagesCountText');
    if (fileNameEl) fileNameEl.textContent = this.currentDraft.fileName;
    if (fileMetaEl) fileMetaEl.textContent = `${this.currentDraft.pageCount} Pages Detected • ${effectivePages} Selected`;
    if (pagesTextEl) pagesTextEl.textContent = String(effectivePages);

    // Update spotter
    const spotterSummary = this.container.querySelector('#spotterPagesSummary');
    const spotterSavings = this.container.querySelector('#spotterSavingsBadge');
    if (spotterSummary) spotterSummary.textContent = `${analysis.colorPagesCount} Color Pages detected (${analysis.colorPagesList.join(', ') || 'None'})`;
    if (spotterSavings) spotterSavings.textContent = `Save ₹${analysis.savingsAmount} vs Full Color`;

    this.renderSpectralStrip(analysis);

    // Calculate price
    const quote = pricingEngine.calculate(
      effectivePages,
      this.currentDraft.colorPages,
      this.currentDraft.bwPages,
      this.currentDraft.colorMode,
      this.currentDraft.duplex,
      this.currentDraft.copies,
      this.currentDraft.paper,
      this.currentDraft.paperFormat,
      this.currentDraft.binding
    );

    // Update bill
    const bwLine = this.container.querySelector('#billBwLine');
    const colorLine = this.container.querySelector('#billColorLine');
    const formatLine = this.container.querySelector('#billFormatLine');
    const paperLine = this.container.querySelector('#billPaperLine');
    const bindingLine = this.container.querySelector('#billBindingLine');
    const grandTotal = this.container.querySelector('#billGrandTotal');
    const copiesNote = this.container.querySelector('#billCopiesNote');

    if (bwLine) bwLine.innerHTML = `<span>B&W Pages (${quote.bwCount} pgs × ${this.currentDraft.copies})</span><span class="price-val">₹${quote.bwCost.toFixed(2)}</span>`;
    if (colorLine) colorLine.innerHTML = `<span>Color Pages (${quote.colorCount} pgs × ${this.currentDraft.copies})</span><span class="price-val">₹${quote.colorCost.toFixed(2)}</span>`;
    if (formatLine) formatLine.innerHTML = `<span>Paper Size (${this.currentDraft.paperFormat})</span><span class="price-val">₹${quote.formatCost.toFixed(2)}</span>`;
    if (paperLine) paperLine.innerHTML = `<span>Paper Weight (${this.currentDraft.paper.toUpperCase()})</span><span class="price-val">₹${quote.paperCost.toFixed(2)}</span>`;
    if (bindingLine) bindingLine.innerHTML = `<span>Binding (${this.currentDraft.binding.charAt(0).toUpperCase() + this.currentDraft.binding.slice(1)})</span><span class="price-val">₹${quote.bindingCost.toFixed(2)}</span>`;
    if (grandTotal) grandTotal.textContent = `₹${quote.grandTotal.toFixed(2)}`;
    if (copiesNote) {
      if (this.currentDraft.copies > 1) {
        (copiesNote as HTMLElement).style.display = 'block';
        copiesNote.textContent = `${this.currentDraft.copies} copies × ₹${(quote.grandTotal / this.currentDraft.copies).toFixed(2)} each`;
      } else {
        (copiesNote as HTMLElement).style.display = 'none';
      }
    }
  }

  public getCurrentDraft(): OrderDraft {
    return { ...this.currentDraft };
  }

  public update(state: SystemState): void {
    this.updateRecentOrders(state);
  }

  private updateRecentOrders(state: SystemState): void {
    const container = this.container.querySelector('#recentOrdersContainer');
    if (!container) return;

    const recentOrders = state.orders.filter(o => o.status !== 'COMPLETED').slice(-5).reverse();
    if (recentOrders.length === 0) {
      container.innerHTML = '';
      return;
    }

    const statusColors: Record<string, string> = {
      PENDING: 'pending',
      APPROVED: 'approved',
      PRINTING: 'printing',
      READY: 'ready',
      COMPLETED: 'completed'
    };

    const statusLabels: Record<string, string> = {
      PENDING: '⏳ Pending Approval',
      APPROVED: '✅ Approved',
      PRINTING: '🖨️ Printing...',
      READY: '📦 Ready for Pickup',
      COMPLETED: '✓ Completed'
    };

    container.innerHTML = `
      <div class="cyber-glass-panel">
        <h3 class="panel-title" style="margin-bottom: 0.8rem;">
          <span>📋</span> Active Orders
        </h3>
        ${recentOrders.map(order => `
          <div class="recent-order-card">
            <div class="order-card-top">
              <span class="order-number-badge">#${order.orderNumber}</span>
              <span class="status-pill status-${statusColors[order.status]}">${statusLabels[order.status]}</span>
            </div>
            <div class="order-card-file">${order.fileName}</div>
            <div class="order-card-meta">
              ${order.pageCount} pages • ${order.copies > 1 ? order.copies + ' copies • ' : ''}${order.paperFormat} • ₹${order.totalAmount.toFixed(2)}
            </div>
            ${order.status === 'PRINTING' && order.printProgress ? `
              <div class="printing-progress-container">
                <div class="progress-bar-stripes" style="width: ${order.printProgress}%;"></div>
                <span class="printing-label">PRINTING (${order.printProgress}%)</span>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }
}
