/**
 * SmartPrint UI Component: Student Order Studio & Express Digital Pass
 * Clean Guided Flow: Upload -> Range -> Color/Sides/Format -> Binding Studio -> Customer Notes -> Split Pay
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

export class StudentStudioComponent {
  private container: HTMLElement;
  private isBindingStudioExpanded: boolean = false;

  private currentDraft: OrderDraft = {
    fileName: 'VLSI_Embedded_Systems_Project.pdf',
    pageCount: 28,
    rangeMode: 'all',
    fromPage: 1,
    toPage: 28,
    pageRange: 'All Pages (1-28)',
    bwPages: 24,
    colorPages: 4,
    colorMode: 'smart',
    duplex: true,
    paper: 'gsm75',
    paperFormat: 'A4',
    binding: 'spiral',
    bindingNotes: 'Transparent PVC front cover + Black opaque cardstock back',
    customerNotes: 'Please staple top-left and leave 1-inch margin for binding',
    priority: false,
    confidential: false,
    student: {
      name: 'Rahul Sharma',
      rollNo: '22CS084',
      phone: '+91 98401 99221',
      department: 'Computer Science'
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
      this.currentDraft.paper,
      this.currentDraft.paperFormat,
      this.currentDraft.binding,
      this.currentDraft.priority
    );

    this.container.innerHTML = `
      <!-- Architectural Hero Banner -->
      <div class="smartprint-hero-banner">
        <img src="assets/hero_banner.jpg" alt="SmartPrint Campus Hub" class="hero-bg-img" onerror="this.style.display='none'">
        <div class="hero-overlay-gradient"></div>
        <div class="hero-content">
          <div class="hero-pill-badge">
            <span class="pulse-beacon"></span>
            ZERO PHYSICAL COUNTER QUEUE • 15s EXPRESS PICKUP
          </div>
          <h2 class="hero-heading">Automated Campus Print Dispatch & Modular Rack System</h2>
          <p class="hero-desc">
            Upload document, configure pages, colors, sides, format and binding, add special instructions for the operator, and pick up directly from numbered shelf compartments.
          </p>
        </div>
      </div>

      <!-- Main Dual Column Studio Grid -->
      <div class="studio-two-column-grid">
        <!-- Left: Guided Order Specification Flow -->
        <div class="studio-left-column">
          
          <!-- STEP 1: Upload Document & Smart Page Inspection -->
          <div class="cyber-glass-panel">
            <div class="panel-header">
              <span class="step-num">01</span>
              <div>
                <h3 class="panel-title">Upload Document</h3>
                <p class="panel-sub">Ingest your PDF, DOCX, or PPTX file. File size and page structure are auto-parsed.</p>
              </div>
            </div>

            <!-- Drag & Drop Zone -->
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
                    ${this.currentDraft.pageCount} Total Pages Detected • PDF 1.7 Ready • Ready for Print
                  </div>
                </div>
                <button class="btn-browse-file" type="button" id="btnBrowseFile">Browse File</button>
              </div>
            </div>

            <!-- Quick Document Presets -->
            <div class="sample-preset-row">
              <span class="preset-label">Test Samples:</span>
              <button class="sample-chip active" data-sample="project">📄 24-Page Project Report</button>
              <button class="sample-chip" data-sample="thesis">📑 60-Page Thesis (Color Graphs)</button>
              <button class="sample-chip" data-sample="lab">📝 12-Page Lab Manual</button>
            </div>
          </div>

          <!-- STEP 2: Page Range (Full Document vs Custom Pages) -->
          <div class="cyber-glass-panel">
            <div class="panel-header">
              <span class="step-num">02</span>
              <div>
                <h3 class="panel-title">Page Selection & Target Range</h3>
                <p class="panel-sub">Choose whether to print the complete document or select specific page intervals.</p>
              </div>
            </div>

            <div class="range-selector-toggle-row">
              <button class="range-tab-btn ${this.currentDraft.rangeMode === 'all' ? 'active' : ''}" id="btnRangeAll">
                <span>📄 Full Document</span>
                <span class="range-badge">All ${this.currentDraft.pageCount} Pages</span>
              </button>
              <button class="range-tab-btn ${this.currentDraft.rangeMode === 'custom' ? 'active' : ''}" id="btnRangeCustom">
                <span>📑 Custom Page Range</span>
                <span class="range-badge">Select From - To</span>
              </button>
            </div>

            <!-- Custom Range Inputs (Visible when custom is selected) -->
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
                  <span id="effectivePagesCountText">${effectivePages}</span> of ${this.currentDraft.pageCount} Pages Selected
                </div>
              </div>
            </div>

            <!-- Auto Color-Spotting Visualizer Card -->
            <div class="color-spotter-insight-card" id="colorSpotterCard">
              <div class="spotter-top-row">
                <div class="spotter-title-group">
                  <span class="spotter-sparkle">✨</span>
                  <div>
                    <h4>Intelligent Auto Color-Spotter</h4>
                    <p class="spotter-pages-summary" id="spotterPagesSummary">
                      ${analysis.colorPagesCount} Color Pages detected in selection (${analysis.colorPagesList.join(', ') || 'None'})
                    </p>
                  </div>
                </div>
                <div class="savings-glow-pill" id="spotterSavingsBadge">
                  Save ₹${analysis.savingsAmount} vs Full Color
                </div>
              </div>

              <!-- Interactive Page-by-Page Spectral Strip -->
              <div class="spectral-page-strip-container">
                <div class="spectral-strip-label">
                  <span>SPECTRAL COLOR HEATMAP</span>
                  <span class="legend-color-indicator">
                    <span class="dot-amber"></span> Color
                    <span class="dot-mono"></span> B&W
                  </span>
                </div>
                <div class="page-blocks-strip" id="pageBlocksStrip">
                  <!-- Rendered dynamically -->
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 3: Color, Sides & Paper Format (A4, A3, Legal, Letter) -->
          <div class="cyber-glass-panel">
            <div class="panel-header">
              <span class="step-num">03</span>
              <div>
                <h3 class="panel-title">Color, Sides & Paper Format</h3>
                <p class="panel-sub">Select color reproduction, single or double sided duplex, and printer paper formats.</p>
              </div>
            </div>

            <!-- Color Reproduction Mode -->
            <div class="form-group">
              <label class="form-label">Color Reproduction Mode</label>
              <div class="spec-pills-grid" id="colorModePills">
                <div class="spec-pill ${this.currentDraft.colorMode === 'smart' ? 'active' : ''}" data-val="smart">
                  <div class="pill-top">✨ Smart Auto-Split</div>
                  <div class="pill-meta">Color when needed</div>
                </div>
                <div class="spec-pill ${this.currentDraft.colorMode === 'mono' ? 'active' : ''}" data-val="mono">
                  <div class="pill-top">⚫ Monochrome (B&W)</div>
                  <div class="pill-meta">₹1.50 / page</div>
                </div>
                <div class="spec-pill ${this.currentDraft.colorMode === 'color' ? 'active' : ''}" data-val="color">
                  <div class="pill-top">🌈 Full Color All</div>
                  <div class="pill-meta">₹8.00 / page</div>
                </div>
              </div>
            </div>

            <!-- Single vs Double-Sided Duplex -->
            <div class="form-group">
              <label class="form-label">Printing Sides (Single or Double Sided)</label>
              <div class="spec-pills-grid" style="grid-template-columns: 1fr 1fr;">
                <div class="spec-pill ${!this.currentDraft.duplex ? 'active' : ''}" id="pillSingleSided">
                  <div class="pill-top">📄 Single-Sided</div>
                  <div class="pill-meta">Prints on front only</div>
                </div>
                <div class="spec-pill ${this.currentDraft.duplex ? 'active' : ''}" id="pillDoubleSided">
                  <div class="pill-top">🔄 Double-Sided (Duplex)</div>
                  <div class="pill-meta">Saves 50% physical paper</div>
                </div>
              </div>
            </div>

            <!-- Paper Format Selection (Campus Printer Eligible Formats) -->
            <div class="form-group">
              <label class="form-label">Paper Format (Campus Printer Formats)</label>
              <div class="spec-pills-grid paper-format-grid" id="paperFormatPills">
                <div class="spec-pill ${this.currentDraft.paperFormat === 'A4' ? 'active' : ''}" data-val="A4">
                  <div class="pill-top">A4 Standard</div>
                  <div class="pill-meta">210 × 297 mm • Standard</div>
                  <span class="printer-fit-badge">Canon & Xerox</span>
                </div>
                <div class="spec-pill ${this.currentDraft.paperFormat === 'A3' ? 'active' : ''}" data-val="A3">
                  <div class="pill-top">A3 Ledger / Drawing</div>
                  <div class="pill-meta">297 × 420 mm (+₹3.00)</div>
                  <span class="printer-fit-badge xerox">Xerox Press Tray 2</span>
                </div>
                <div class="spec-pill ${this.currentDraft.paperFormat === 'Legal' ? 'active' : ''}" data-val="Legal">
                  <div class="pill-top">Legal (Affidavit)</div>
                  <div class="pill-meta">8.5 × 14 in (+₹0.50)</div>
                  <span class="printer-fit-badge">Canon Tray 3</span>
                </div>
                <div class="spec-pill ${this.currentDraft.paperFormat === 'Letter' ? 'active' : ''}" data-val="Letter">
                  <div class="pill-top">Letter</div>
                  <div class="pill-meta">8.5 × 11 in • Standard</div>
                  <span class="printer-fit-badge">All Printers</span>
                </div>
              </div>
            </div>

            <!-- Paper Weight Selection -->
            <div class="form-group">
              <label class="form-label">Paper Weight & Finish</label>
              <div class="spec-pills-grid" id="paperGradePills">
                <div class="spec-pill ${this.currentDraft.paper === 'gsm75' ? 'active' : ''}" data-val="gsm75">
                  <div class="pill-top">75 GSM Standard</div>
                  <div class="pill-meta">Daily Notes & Records</div>
                </div>
                <div class="spec-pill ${this.currentDraft.paper === 'gsm100' ? 'active' : ''}" data-val="gsm100">
                  <div class="pill-top">100 GSM Executive</div>
                  <div class="pill-meta">+₹0.50 / sheet</div>
                </div>
                <div class="spec-pill ${this.currentDraft.paper === 'gsm250' ? 'active' : ''}" data-val="gsm250">
                  <div class="pill-top">250 GSM Glossy Card</div>
                  <div class="pill-meta">+₹2.00 / sheet</div>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 4: Bookbinding & Dedicated Finishing Studio -->
          <div class="cyber-glass-panel">
            <div class="panel-header">
              <span class="step-num">04</span>
              <div>
                <h3 class="panel-title">Finishing & Bookbinding Studio</h3>
                <p class="panel-sub">Select bookbinding style. Dedicated customizer available for spiral, thermal, or thesis hardcover.</p>
              </div>
            </div>

            <div class="spec-pills-grid binding-grid" id="bindingPills">
              <div class="spec-pill ${this.currentDraft.binding === 'none' ? 'active' : ''}" data-val="none">
                <div class="pill-top">None</div>
                <div class="pill-meta">Loose Sheets</div>
              </div>
              <div class="spec-pill ${this.currentDraft.binding === 'staple' ? 'active' : ''}" data-val="staple">
                <div class="pill-top">Corner Staple</div>
                <div class="pill-meta">Free</div>
              </div>
              <div class="spec-pill ${this.currentDraft.binding === 'spiral' ? 'active' : ''}" data-val="spiral">
                <div class="pill-top">Spiral Coil</div>
                <div class="pill-meta">+₹30.00</div>
              </div>
              <div class="spec-pill ${this.currentDraft.binding === 'thermal' ? 'active' : ''}" data-val="thermal">
                <div class="pill-top">Thermal Soft</div>
                <div class="pill-meta">+₹60.00</div>
              </div>
              <div class="spec-pill ${this.currentDraft.binding === 'hardcover' ? 'active' : ''}" data-val="hardcover">
                <div class="pill-top">Hardcover Thesis</div>
                <div class="pill-meta">+₹150.00</div>
              </div>
            </div>

            <!-- Dedicated Binding Customizer Studio Section -->
            <div class="dedicated-binding-studio-box ${['spiral', 'thermal', 'hardcover'].includes(this.currentDraft.binding) ? 'visible' : ''}" id="dedicatedBindingStudio">
              <div class="studio-sub-header">
                <span class="studio-badge">🎨 DEDICATED BINDING STUDIO</span>
                <span class="binding-type-label" id="currentBindingTitle">${this.currentDraft.binding.toUpperCase()} BINDING CONFIGURATION</span>
              </div>

              <div class="binding-customizer-grid">
                <div>
                  <label class="form-label">Cover Finish & Materials</label>
                  <select id="selectCoverMaterial" class="cyber-select">
                    ${this.currentDraft.binding === 'spiral' ? `
                      <option value="Transparent PVC + Black Cardstock Back" selected>Transparent PVC Front + Black Cardstock Back</option>
                      <option value="Frosted Clear Front + Navy Blue Back">Frosted Clear Front + Navy Blue Back</option>
                      <option value="Color Cardstock Front & Back">Full Color Cardstock Front & Back</option>
                    ` : this.currentDraft.binding === 'thermal' ? `
                      <option value="Matte Laminated Thermal Soft Cover" selected>Matte Laminated Thermal Soft Cover</option>
                      <option value="Gloss Laminated Book Wrap">Gloss Laminated Book Wrap</option>
                      <option value="Embossed Linen Spine Soft Cover">Embossed Linen Spine Soft Cover</option>
                    ` : `
                      <option value="Royal Navy Blue Hardback with Gold Lettering" selected>Royal Navy Blue Hardback with Gold Lettering</option>
                      <option value="Maroon Hardback with Silver Foil Lettering">Maroon Hardback with Silver Foil Lettering</option>
                      <option value="Jet Black Hardback with Golden University Crest">Jet Black Hardback with Golden University Crest</option>
                    `}
                  </select>
                </div>

                <div>
                  <label class="form-label">Book Spine / Cover Title Text</label>
                  <input type="text" id="inputSpineTitle" class="cyber-input" value="B.Tech Final Project Report 2026" placeholder="Enter title for cover or spine embossing">
                </div>
              </div>

              <!-- Dedicated Separate Cover Upload if needed -->
              <div class="cover-file-upload-box">
                <div class="cover-upload-info">
                  <span class="upload-icon">📑</span>
                  <div>
                    <div style="font-size:0.82rem; font-weight:700; color:white;">Separate Cover Page PDF (Optional)</div>
                    <div style="font-size:0.72rem; color:var(--text-muted);">If your cover design is a separate high-res file, upload it here.</div>
                  </div>
                </div>
                <button type="button" class="btn-browse-file" id="btnUploadCoverFile">Attach Cover PDF</button>
                <input type="file" id="coverFileInput" accept=".pdf,.png,.jpg" style="display:none;">
              </div>
            </div>
          </div>

          <!-- STEP 5: Customer Special Instructions / Notes Field -->
          <div class="cyber-glass-panel">
            <div class="panel-header">
              <span class="step-num">05</span>
              <div>
                <h3 class="panel-title">Customer Instructions & Description Notes</h3>
                <p class="panel-sub">Share any specific requirements directly with the Xerox operator before printing begins.</p>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 0.75rem;">
              <textarea id="inputCustomerNotes" class="cyber-textarea" rows="3" placeholder="E.g., Please staple top-left corner, print certificate on glossy card, leave 1-inch left margin for thesis binding...">${this.currentDraft.customerNotes || ''}</textarea>
            </div>

            <!-- Quick Suggestion Helper Chips -->
            <div class="suggestion-chips-row">
              <span class="preset-label">Quick Suggestions:</span>
              <button type="button" class="note-chip" data-note="Please staple top-left corner neatly">📌 Staple Top-Left</button>
              <button type="button" class="note-chip" data-note="Leave 1.25 inch left margin for spiral coil">📑 Binding Margin</button>
              <button type="button" class="note-chip" data-note="Print certificate page in color">🎨 Color Certificate</button>
              <button type="button" class="note-chip" data-note="Exam / Faculty Confidential Submission">🔒 Exam Confidential</button>
            </div>

            <!-- Student Identification -->
            <div class="form-row-grid-2" style="margin-top: 1.25rem; margin-bottom: 0;">
              <div>
                <label class="form-label">Student Full Name</label>
                <input type="text" id="inputStudentName" class="cyber-input" value="${this.currentDraft.student.name}">
              </div>
              <div>
                <label class="form-label">College Roll Number</label>
                <input type="text" id="inputStudentRoll" class="cyber-input" value="${this.currentDraft.student.rollNo}">
              </div>
            </div>
          </div>

        </div>

        <!-- Right Column: Live Transparent Bill, Automated Split & Active Order Digital Pass -->
        <div class="studio-right-column">
          <!-- Live Transparent Bill Breakdown -->
          <div class="cyber-glass-panel bill-panel">
            <div class="panel-header">
              <span class="step-num">06</span>
              <div>
                <h3 class="panel-title">Itemized Bill & Escrow Split</h3>
                <p class="panel-sub">Live calculations with 7% Developer Escrow & 93% Vendor Net.</p>
              </div>
            </div>

            <div class="bill-line-items">
              <div class="bill-line" id="billBwLine">
                <span>B&W Pages (${quote.bwCount} pgs)</span>
                <span class="price-val">₹${quote.bwCost.toFixed(2)}</span>
              </div>
              <div class="bill-line" id="billColorLine">
                <span>Color Pages (${quote.colorCount} pgs)</span>
                <span class="price-val">₹${quote.colorCost.toFixed(2)}</span>
              </div>
              <div class="bill-line" id="billFormatLine">
                <span>Paper Format (${this.currentDraft.paperFormat})</span>
                <span class="price-val">₹${quote.formatCost.toFixed(2)}</span>
              </div>
              <div class="bill-line" id="billPaperLine">
                <span>Paper Weight (${this.currentDraft.paper.toUpperCase()})</span>
                <span class="price-val">₹${quote.paperCost.toFixed(2)}</span>
              </div>
              <div class="bill-line" id="billBindingLine">
                <span>Binding (${this.currentDraft.binding.toUpperCase()})</span>
                <span class="price-val">₹${quote.bindingCost.toFixed(2)}</span>
              </div>
              <div class="bill-line priority-line" id="billPriorityLine" style="${this.currentDraft.priority ? 'display:flex;' : 'display:none;'}">
                <span>⚡ Rush Priority Token</span>
                <span class="price-val">₹20.00</span>
              </div>
            </div>

            <div class="bill-grand-total">
              <span class="total-label">Grand Total</span>
              <span class="total-number" id="billGrandTotal">₹${quote.grandTotal.toFixed(2)}</span>
            </div>

            <!-- Automated Escrow Split Diagram -->
            <div class="escrow-split-box">
              <div class="escrow-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
                <span>Automated Split-Settlement Engine</span>
              </div>
              <div class="split-meter-bar">
                <div class="split-bar-vendor" style="width: 93%;" title="Vendor 93% Net Payout"></div>
                <div class="split-bar-platform" style="width: 7%;" title="Platform 7% Developer Commission"></div>
              </div>
              <div class="split-legend-row">
                <span class="vendor-tag">Vendor Payout (93%): <strong id="billVendorShare">₹${quote.vendorShare.toFixed(2)}</strong></span>
                <span class="platform-tag">Escrow Take-Rate (7%): <strong id="billPlatformFee">₹${quote.platformFee.toFixed(2)}</strong></span>
              </div>
            </div>

            <!-- GreenPrint ESG Tracker -->
            <div class="greenprint-card">
              <span class="green-leaf">🌱</span>
              <div class="green-meta">
                <h5>GreenPrint ESG Metric</h5>
                <p id="greenprintText">Saved ${quote.sheetsSaved} sheets of virgin paper & ${quote.waterSavedMl}ml water via duplexing.</p>
              </div>
            </div>

            <!-- CTA Button -->
            <button class="cyber-btn-primary" id="btnInitiatePayment">
              <span>Proceed to Instant UPI Checkout</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>

          <!-- Active Digital Pickup Pass -->
          <div id="activePassContainer" class="active-pass-container"></div>
        </div>
      </div>
    `;

    this.renderSpectralStrip(analysis);
    this.bindEvents();
    this.updatePass(store.getState());
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
    // Dropzone click & browse
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

        if (sample === 'thesis') {
          this.currentDraft.fileName = 'Finite_Element_Analysis_Thesis_Draft.pdf';
          this.currentDraft.pageCount = 60;
          this.currentDraft.fromPage = 1;
          this.currentDraft.toPage = 60;
          this.currentDraft.binding = 'hardcover';
        } else if (sample === 'lab') {
          this.currentDraft.fileName = 'Digital_Signal_Processing_Lab_Manual.pdf';
          this.currentDraft.pageCount = 12;
          this.currentDraft.fromPage = 1;
          this.currentDraft.toPage = 12;
          this.currentDraft.binding = 'staple';
        } else {
          this.currentDraft.fileName = 'VLSI_Embedded_Systems_Project.pdf';
          this.currentDraft.pageCount = 24;
          this.currentDraft.fromPage = 1;
          this.currentDraft.toPage = 24;
          this.currentDraft.binding = 'spiral';
        }

        sound.click();
        this.recalculateSpecs();
      });
    });

    // Range mode buttons (Full Document vs Custom Range)
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
        this.currentDraft.pageRange = `All Pages (1-${this.currentDraft.pageCount})`;
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

    // From Page / To Page Inputs
    const inputFrom = this.container.querySelector('#inputFromPage') as HTMLInputElement;
    const inputTo = this.container.querySelector('#inputToPage') as HTMLInputElement;
    if (inputFrom && inputTo) {
      inputFrom.addEventListener('input', () => {
        const val = parseInt(inputFrom.value, 10) || 1;
        this.currentDraft.fromPage = Math.max(1, Math.min(this.currentDraft.pageCount, val));
        this.currentDraft.pageRange = `Pages ${this.currentDraft.fromPage}-${this.currentDraft.toPage}`;
        this.recalculateSpecs();
      });

      inputTo.addEventListener('input', () => {
        const val = parseInt(inputTo.value, 10) || this.currentDraft.pageCount;
        this.currentDraft.toPage = Math.max(this.currentDraft.fromPage, Math.min(this.currentDraft.pageCount, val));
        this.currentDraft.pageRange = `Pages ${this.currentDraft.fromPage}-${this.currentDraft.toPage}`;
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

    // Single vs Double-Sided Duplex pills
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

    // Paper Format pills (A4, A3, Legal, Letter)
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
        
        // Show/hide dedicated binding studio
        const studio = this.container.querySelector('#dedicatedBindingStudio');
        const title = this.container.querySelector('#currentBindingTitle');
        if (studio && title) {
          const isEligible = ['spiral', 'thermal', 'hardcover'].includes(this.currentDraft.binding);
          studio.classList.toggle('visible', isEligible);
          title.textContent = `${this.currentDraft.binding.toUpperCase()} BINDING CONFIGURATION`;
        }

        sound.click();
        this.recalculateSpecs();
      });
    });

    // Cover material dropdown
    const selectCover = this.container.querySelector('#selectCoverMaterial') as HTMLSelectElement;
    if (selectCover) {
      selectCover.addEventListener('change', () => {
        this.currentDraft.bindingNotes = selectCover.value;
      });
    }

    // Spine title input
    const inputSpine = this.container.querySelector('#inputSpineTitle') as HTMLInputElement;
    if (inputSpine) {
      inputSpine.addEventListener('input', () => {
        this.currentDraft.bindingNotes = `${selectCover?.value || ''} • Title: ${inputSpine.value}`;
      });
    }

    // Cover file upload button
    const btnCoverUpload = this.container.querySelector('#btnUploadCoverFile');
    const coverFileInput = this.container.querySelector('#coverFileInput') as HTMLInputElement;
    if (btnCoverUpload && coverFileInput) {
      btnCoverUpload.addEventListener('click', () => coverFileInput.click());
      coverFileInput.addEventListener('change', () => {
        if (coverFileInput.files && coverFileInput.files[0]) {
          btnCoverUpload.textContent = `Attached: ${coverFileInput.files[0].name.slice(0, 14)}...`;
          sound.click();
        }
      });
    }

    // Customer Notes textarea
    const notesInput = this.container.querySelector('#inputCustomerNotes') as HTMLTextAreaElement;
    if (notesInput) {
      notesInput.addEventListener('input', () => {
        this.currentDraft.customerNotes = notesInput.value;
      });
    }

    // Note suggestion chips
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

    // Student identity
    const nameInput = this.container.querySelector('#inputStudentName') as HTMLInputElement;
    const rollInput = this.container.querySelector('#inputStudentRoll') as HTMLInputElement;
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        this.currentDraft.student.name = nameInput.value || 'Student';
      });
    }
    if (rollInput) {
      rollInput.addEventListener('input', () => {
        this.currentDraft.student.rollNo = rollInput.value || '22CS000';
      });
    }

    // Payment CTA
    const btnPay = this.container.querySelector('#btnInitiatePayment');
    if (btnPay) {
      btnPay.addEventListener('click', () => {
        const modal = document.getElementById('paymentModal');
        if (modal) {
          modal.classList.add('open');
          sound.click();
        }
      });
    }
  }

  private recalculateSpecs(): void {
    const effectivePages = this.getEffectivePageCount();
    const analysis = colorAnalyzer.analyzeDocument(this.currentDraft.fileName, effectivePages);
    this.currentDraft.colorPages = analysis.colorPagesCount;
    this.currentDraft.bwPages = analysis.bwPagesCount;

    // Update fileName & page display
    const fileNameEl = this.container.querySelector('#studioFileName');
    const fileMetaEl = this.container.querySelector('#studioFileMeta');
    const pagesTextEl = this.container.querySelector('#effectivePagesCountText');

    if (fileNameEl) fileNameEl.textContent = this.currentDraft.fileName;
    if (fileMetaEl) fileMetaEl.textContent = `${this.currentDraft.pageCount} Total Pages Detected • ${effectivePages} Selected for Print`;
    if (pagesTextEl) pagesTextEl.textContent = String(effectivePages);

    // Update spotter info
    const spotterSummary = this.container.querySelector('#spotterPagesSummary');
    const spotterSavings = this.container.querySelector('#spotterSavingsBadge');
    if (spotterSummary) {
      spotterSummary.textContent = `${analysis.colorPagesCount} Color Pages detected in selection (${analysis.colorPagesList.join(', ') || 'None'})`;
    }
    if (spotterSavings) {
      spotterSavings.textContent = `Save ₹${analysis.savingsAmount} vs Full Color`;
    }

    this.renderSpectralStrip(analysis);

    // Calculate pricing quote
    const quote = pricingEngine.calculate(
      effectivePages,
      this.currentDraft.colorPages,
      this.currentDraft.bwPages,
      this.currentDraft.colorMode,
      this.currentDraft.duplex,
      this.currentDraft.paper,
      this.currentDraft.paperFormat,
      this.currentDraft.binding,
      this.currentDraft.priority
    );

    // Update Bill lines
    const bwLine = this.container.querySelector('#billBwLine');
    const colorLine = this.container.querySelector('#billColorLine');
    const formatLine = this.container.querySelector('#billFormatLine');
    const paperLine = this.container.querySelector('#billPaperLine');
    const bindingLine = this.container.querySelector('#billBindingLine');
    const grandTotal = this.container.querySelector('#billGrandTotal');
    const vendorShare = this.container.querySelector('#billVendorShare');
    const platformFee = this.container.querySelector('#billPlatformFee');
    const greenprint = this.container.querySelector('#greenprintText');

    if (bwLine) bwLine.innerHTML = `<span>B&W Pages (${quote.bwCount} pgs)</span><span class="price-val">₹${quote.bwCost.toFixed(2)}</span>`;
    if (colorLine) colorLine.innerHTML = `<span>Color Pages (${quote.colorCount} pgs)</span><span class="price-val">₹${quote.colorCost.toFixed(2)}</span>`;
    if (formatLine) formatLine.innerHTML = `<span>Paper Format (${this.currentDraft.paperFormat})</span><span class="price-val">₹${quote.formatCost.toFixed(2)}</span>`;
    if (paperLine) paperLine.innerHTML = `<span>Paper (${this.currentDraft.paper.toUpperCase()})</span><span class="price-val">₹${quote.paperCost.toFixed(2)}</span>`;
    if (bindingLine) bindingLine.innerHTML = `<span>Binding (${this.currentDraft.binding.toUpperCase()})</span><span class="price-val">₹${quote.bindingCost.toFixed(2)}</span>`;
    if (grandTotal) grandTotal.textContent = `₹${quote.grandTotal.toFixed(2)}`;
    if (vendorShare) vendorShare.textContent = `₹${quote.vendorShare.toFixed(2)}`;
    if (platformFee) platformFee.textContent = `₹${quote.platformFee.toFixed(2)}`;
    if (greenprint) greenprint.textContent = `Saved ${quote.sheetsSaved} sheets of virgin paper & ${quote.waterSavedMl}ml water via duplexing.`;

    // Update modal amount
    const modalAmt = document.getElementById('modalPayAmount');
    const modalVendor = document.getElementById('modalVendorSplit');
    const modalPlatform = document.getElementById('modalPlatformSplit');
    if (modalAmt) modalAmt.textContent = `₹${quote.grandTotal.toFixed(2)}`;
    if (modalVendor) modalVendor.textContent = `₹${quote.vendorShare.toFixed(2)}`;
    if (modalPlatform) modalPlatform.textContent = `₹${quote.platformFee.toFixed(2)}`;
  }

  public getCurrentDraft(): OrderDraft {
    return { ...this.currentDraft };
  }

  public update(state: SystemState): void {
    this.updatePass(state);
  }

  private updatePass(state: SystemState): void {
    const passContainer = this.container.querySelector('#activePassContainer');
    if (!passContainer) return;

    const order = state.orders.find(o => o.id === state.activeStudentOrderId) || state.orders[state.orders.length - 1];

    if (!order) {
      passContainer.innerHTML = '';
      return;
    }

    const stages: Array<{ key: string; label: string; done: boolean; active: boolean }> = [
      { key: 'PAID', label: 'Paid', done: true, active: false },
      { key: 'QUEUED', label: 'In Queue', done: order.status !== 'PAID', active: order.status === 'QUEUED' },
      { key: 'PRINTING', label: 'Printing', done: ['STAGED', 'COLLECTED'].includes(order.status), active: order.status === 'PRINTING' },
      { key: 'STAGED', label: 'In Shelf', done: order.status === 'COLLECTED', active: order.status === 'STAGED' },
      { key: 'COLLECTED', label: 'Collected', done: order.status === 'COLLECTED', active: order.status === 'COLLECTED' }
    ];

    passContainer.innerHTML = `
      <div class="cyber-glass-panel pass-card">
        <div class="pass-card-top">
          <div>
            <div class="pass-eyebrow">ACTIVE DIGITAL BOARDING PASS</div>
            <h4 class="pass-token-title">${order.token}</h4>
          </div>
          <div class="status-pill status-${order.status.toLowerCase()}">
            ${order.status}
          </div>
        </div>

        <!-- 5-Stage Milestone Timeline -->
        <div class="pass-timeline-track">
          ${stages.map((st, i) => `
            <div class="timeline-node ${st.done ? 'is-done' : ''} ${st.active ? 'is-active' : ''}">
              <div class="node-circle">${st.done && !st.active ? '✓' : i + 1}</div>
              <span class="node-text">${st.label}</span>
            </div>
          `).join('')}
        </div>

        <!-- Shelf Location & Security OTP Ticket -->
        <div class="pass-ticket-body">
          <div class="pass-slot-info">
            <span class="ticket-label">DESIGNATED STAGING SHELF:</span>
            <div class="target-shelf-badge">
              ${order.rackSlot ? `RACK ${order.rackSlot}` : 'CALCULATING ERGONOMIC SLOT...'}
            </div>
            <div class="ticket-sub">
              ${order.rackSlot ? 'Walk directly to the physical shelf and enter OTP at kiosk.' : 'Auto-allocated once printing finishes.'}
            </div>
            <div class="otp-token-strip">
              <span>PICKUP OTP:</span>
              <strong class="color-cyan">${order.pickupOtp}</strong>
            </div>
          </div>

          <!-- Dynamic SVG QR Code -->
          <div class="pass-qr-box">
            <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
              <rect width="100" height="100" fill="white" rx="6"/>
              <rect x="10" y="10" width="24" height="24" fill="#0b0f19"/>
              <rect x="14" y="14" width="16" height="16" fill="white"/>
              <rect x="18" y="18" width="8" height="8" fill="#0b0f19"/>
              <rect x="66" y="10" width="24" height="24" fill="#0b0f19"/>
              <rect x="70" y="14" width="16" height="16" fill="white"/>
              <rect x="74" y="18" width="8" height="8" fill="#0b0f19"/>
              <rect x="10" y="66" width="24" height="24" fill="#0b0f19"/>
              <rect x="14" y="70" width="16" height="16" fill="white"/>
              <rect x="18" y="74" width="8" height="8" fill="#0b0f19"/>
              <rect x="42" y="12" width="12" height="6" fill="#0b0f19"/>
              <rect x="42" y="24" width="6" height="12" fill="#0b0f19"/>
              <rect x="52" y="24" width="6" height="6" fill="#0b0f19"/>
              <rect x="15" y="42" width="6" height="12" fill="#0b0f19"/>
              <rect x="25" y="48" width="12" height="6" fill="#0b0f19"/>
              <rect x="45" y="45" width="12" height="12" fill="#0b0f19"/>
              <rect x="65" y="45" width="8" height="8" fill="#0b0f19"/>
              <rect x="80" y="45" width="8" height="14" fill="#0b0f19"/>
              <rect x="65" y="65" width="12" height="6" fill="#0b0f19"/>
              <rect x="82" y="65" width="8" height="20" fill="#0b0f19"/>
              <rect x="45" y="72" width="12" height="8" fill="#0b0f19"/>
              <rect x="62" y="80" width="12" height="8" fill="#0b0f19"/>
            </svg>
            <span class="qr-sub">SCAN AT TABLET</span>
          </div>
        </div>
      </div>
    `;
  }
}
