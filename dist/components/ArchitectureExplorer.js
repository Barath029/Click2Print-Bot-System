/**
 * SmartPrint UI Component: Interactive System Architecture & Context Explorer
 * Makes all project context, data flows, TypeScript type contracts, and unit economics 100% visible.
 */
import { eventBus } from '../core/events.js';
import { sound } from '../core/audio.js';
const ARCH_NODES = {
    'student-portal': {
        title: 'Student Order Studio (Client UI)',
        category: 'Presentation Layer (TypeScript)',
        role: 'Provides drag-and-drop document ingestion, granular specification builder, auto color-spotting visualization, and digital pickup boarding pass with dynamic QR code.',
        sla: '< 30s submission time • Zero physical counter queue',
        interfaceSnippet: `export interface OrderDraft {\n  fileName: string;\n  pageCount: number;\n  bwPages: number;\n  colorPages: number;\n  colorMode: 'smart' | 'mono' | 'color';\n  duplex: boolean;\n  paper: 'gsm75' | 'gsm100' | 'gsm250';\n  binding: 'none' | 'staple' | 'spiral' | 'thermal' | 'hardcover';\n  priority: boolean;\n  student: StudentInfo;\n}`
    },
    'color-analyzer': {
        title: 'Intelligent Auto Color-Spotter',
        category: 'Business Domain Service',
        role: 'Simulates page-by-page spectral color histogram analysis. Automatically isolates color pages from monochrome pages to slash student printing costs by up to 70%.',
        sla: '100% page coverage accuracy • Saves ₹150+ per thesis',
        interfaceSnippet: `export interface PageColorAnalysis {\n  pageNumber: number;\n  isColor: boolean;\n  colorCoveragePct: number;\n  description: string;\n}`
    },
    'escrow-engine': {
        title: 'Automated 7% / 93% Split Escrow Engine',
        category: 'Financial Core Service',
        role: 'Instantly splits UPI payments: 7% platform fee retained in developer escrow for software maintenance, and 93% allocated for automated T+1 vendor bank payout.',
        sla: 'T+0 instantaneous split calculation • T+1 bank clearing',
        interfaceSnippet: `export interface PriceQuote {\n  grandTotal: number;\n  vendorShare: number;   // 93% Net Payout\n  platformFee: number;   // 7% Platform Escrow\n  sheetsSaved: number;   // Duplex ESG metric\n  waterSavedMl: number;  // ESG metric\n}`
    },
    'fifo-queue': {
        title: 'Chronological FIFO Priority Queue',
        category: 'Application State Engine',
        role: 'Orders print jobs with millisecond payment timestamps. Supports dynamic priority tokens (+₹20) that instantly bump urgent assignments to the front of the production queue.',
        sla: 'Millisecond FIFO fairness • Dynamic priority elevation',
        interfaceSnippet: `export interface PrintOrder {\n  id: string;\n  token: string;          // e.g. #SP-104\n  status: 'PAID' | 'QUEUED' | 'PRINTING' | 'STAGED' | 'COLLECTED';\n  priority: boolean;\n  pickupOtp: string;      // 4-digit security code\n  rackSlot: string | null;// Assigned physical slot\n}`
    },
    'rack-allocator': {
        title: 'Ergonomic 50-Slot Rack Allocator',
        category: 'Physical Logistics Service',
        role: 'Digital twin of physical campus pickup shelving. Allocates slots based on ergonomic reach: Row B (eye-level), Row C (chest), Row A (top), Rows D/E (heavy hardcover thesis).',
        sla: '50-compartment capacity • Automated overdue alerts (>1 hr)',
        interfaceSnippet: `export interface RackSlot {\n  code: string;           // e.g. "B-04"\n  row: 'A' | 'B' | 'C' | 'D' | 'E';\n  col: number;            // 1 to 10\n  status: 'EMPTY' | 'OCCUPIED' | 'OVERDUE';\n  orderId: string | null;\n  stagedTime: number | null;\n}`
    },
    'kiosk-station': {
        title: '15-Second Express Contactless Kiosk',
        category: 'Hardware Terminal Interface',
        role: 'Tablet UI positioned beside physical shelves. Student punches in 4-digit OTP or scans QR; kiosk flashes directional beacon to the assigned compartment and releases in under 15 seconds.',
        sla: '< 15 seconds total handover SLA • 0 staff interaction required',
        interfaceSnippet: `export interface KioskVerificationResult {\n  verified: boolean;\n  targetSlot: string;\n  studentName: string;\n  countdownSeconds: number;\n}`
    },
    'node-server': {
        title: 'Node.js Zero-Dependency Server & TS Pipeline',
        category: 'Infrastructure & Backend Layer',
        role: 'Ultra-lightweight native Node.js HTTP server. Serves standard ES2022 modules compiled from TypeScript with zero runtime overhead and complete MIME type streaming.',
        sla: '< 5ms latency • Zero external npm runtime dependencies',
        interfaceSnippet: `// Server Architecture: Native Node.js HTTP + ES2022 TypeScript\nconst http = require('http');\nconst PORT = process.env.PORT || 3000;\n// Pure ES Modules running natively in browser without bundler bloat`
    }
};
export class ArchitectureExplorerComponent {
    container;
    selectedNodeKey = 'student-portal';
    constructor(container) {
        this.container = container;
        this.render();
        eventBus.subscribe((ev) => this.onNewEvent(ev));
    }
    render() {
        const selected = ARCH_NODES[this.selectedNodeKey];
        this.container.innerHTML = `
      <div class="architecture-explorer-view">
        
        <!-- Header Ribbon -->
        <div class="arch-header-card">
          <div class="arch-title-group">
            <span class="arch-spark-icon">🧬</span>
            <div>
              <h2 class="arch-main-title">SmartPrint Clean System Architecture & Project Context</h2>
              <p class="arch-subtitle">
                Complete architectural blueprint, end-to-end data pipeline, TypeScript domain contracts, and physical campus deployment model.
              </p>
            </div>
          </div>
          <div class="arch-badges-group">
            <span class="tech-badge nodejs">Node.js Native</span>
            <span class="tech-badge typescript">TypeScript ES2022</span>
            <span class="tech-badge zero-deps">0-Runtime NPM Deps</span>
            <span class="tech-badge escrow">7% Escrow Model</span>
          </div>
        </div>

        <!-- 3-Tier Layered Interactive Architecture Diagram -->
        <div class="cyber-glass-panel">
          <h3 class="panel-title" style="margin-bottom: 0.3rem;">
            <span>🗺️</span> Interactive Component Blueprint (Click any node to inspect context & types)
          </h3>
          <p class="panel-sub" style="margin-bottom: 1.25rem;">
            Every node in this diagram is active in the codebase. Click to view its exact TypeScript interface, operational SLA, and business logic.
          </p>

          <div class="arch-blueprint-grid">
            <!-- Tier 1: Client & Presentation -->
            <div class="blueprint-tier">
              <div class="tier-label">TIER 1: PRESENTATION & CLIENT HUBS</div>
              <div class="tier-nodes-row">
                <div class="arch-node-card ${this.selectedNodeKey === 'student-portal' ? 'active' : ''}" data-node="student-portal">
                  <div class="node-icon">🎓</div>
                  <div class="node-name">Student Studio</div>
                  <div class="node-tech">TypeScript UI / Web Audio</div>
                </div>
                <div class="arch-node-card ${this.selectedNodeKey === 'kiosk-station' ? 'active' : ''}" data-node="kiosk-station">
                  <div class="node-icon">⚡</div>
                  <div class="node-name">15s Express Kiosk</div>
                  <div class="node-tech">Tablet Numpad / QR Auth</div>
                </div>
              </div>
            </div>

            <!-- Tier 2: Business Logic & State Engine -->
            <div class="blueprint-tier">
              <div class="tier-label">TIER 2: REACTIVE DOMAIN & BUSINESS SERVICES</div>
              <div class="tier-nodes-row">
                <div class="arch-node-card ${this.selectedNodeKey === 'color-analyzer' ? 'active' : ''}" data-node="color-analyzer">
                  <div class="node-icon">✨</div>
                  <div class="node-name">Color Spotter</div>
                  <div class="node-tech">Spectral Page Analysis</div>
                </div>
                <div class="arch-node-card ${this.selectedNodeKey === 'escrow-engine' ? 'active' : ''}" data-node="escrow-engine">
                  <div class="node-icon">⚖️</div>
                  <div class="node-name">Split Escrow</div>
                  <div class="node-tech">7% Platform / 93% Vendor</div>
                </div>
                <div class="arch-node-card ${this.selectedNodeKey === 'fifo-queue' ? 'active' : ''}" data-node="fifo-queue">
                  <div class="node-icon">📋</div>
                  <div class="node-name">FIFO Priority Queue</div>
                  <div class="node-tech">Observable State Store</div>
                </div>
                <div class="arch-node-card ${this.selectedNodeKey === 'rack-allocator' ? 'active' : ''}" data-node="rack-allocator">
                  <div class="node-icon">📦</div>
                  <div class="node-name">Rack Logistics</div>
                  <div class="node-tech">50-Slot Ergonomic Matrix</div>
                </div>
              </div>
            </div>

            <!-- Tier 3: Infrastructure & Hardware Cluster -->
            <div class="blueprint-tier">
              <div class="tier-label">TIER 3: HARDWARE CLUSTER & NODE.JS HOSTING</div>
              <div class="tier-nodes-row">
                <div class="arch-node-card ${this.selectedNodeKey === 'node-server' ? 'active' : ''}" data-node="node-server">
                  <div class="node-icon">⚡</div>
                  <div class="node-name">Node.js Server</div>
                  <div class="node-tech">Native HTTP Static / TS Build</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Inspector Panel for Selected Node -->
          <div class="arch-inspector-box" id="archInspectorBox">
            <div class="inspector-header">
              <div>
                <span class="inspector-category" id="inspCategory">${selected.category}</span>
                <h4 class="inspector-title" id="inspTitle">${selected.title}</h4>
              </div>
              <div class="inspector-sla-badge" id="inspSla">
                SLA: ${selected.sla}
              </div>
            </div>

            <p class="inspector-role-text" id="inspRole">${selected.role}</p>

            <div class="inspector-code-block">
              <div class="code-header">
                <span>TypeScript Domain Contract</span>
                <span class="code-lang">TypeScript 5.x</span>
              </div>
              <pre><code id="inspCode">${selected.interfaceSnippet}</code></pre>
            </div>
          </div>
        </div>

        <!-- Dual Column: Physical Campus Deployment & Live Telemetry Stream -->
        <div class="arch-split-grid">
          
          <!-- Left: Campus Physical Logistics Model -->
          <div class="cyber-glass-panel">
            <h3 class="panel-title" style="margin-bottom: 0.3rem;">
              <span>🏫</span> Campus Physical Logistics Deployment
            </h3>
            <p class="panel-sub" style="margin-bottom: 1rem;">
              How SmartPrint integrates into university libraries and collegiate photocopy shops.
            </p>

            <div class="campus-layout-graphic">
              <div class="layout-zone zone-student">
                <div class="zone-badge">ZONE A</div>
                <div class="zone-title">Student Mobile / Laptop</div>
                <div class="zone-desc">Order placed anywhere on campus WiFi. UPI paid.</div>
              </div>
              <div class="layout-arrow">➔</div>
              <div class="layout-zone zone-vendor">
                <div class="zone-badge">ZONE B</div>
                <div class="zone-title">Central Print Production Hub</div>
                <div class="zone-desc">Canon 65ppm & Xerox Color press auto-process jobs.</div>
              </div>
              <div class="layout-arrow">➔</div>
              <div class="layout-zone zone-shelf">
                <div class="zone-badge">ZONE C</div>
                <div class="zone-title">50-Slot Numbered Shelving Unit</div>
                <div class="zone-desc">Operator stages finished bound parcel into slot.</div>
              </div>
              <div class="layout-arrow">➔</div>
              <div class="layout-zone zone-kiosk">
                <div class="zone-badge">ZONE D</div>
                <div class="zone-title">15-Sec Express Tablet Kiosk</div>
                <div class="zone-desc">Student inputs OTP, gets visual slot beacon, grabs & leaves.</div>
              </div>
            </div>

            <!-- Economic Summary Table -->
            <div class="unit-economics-summary">
              <h4 style="font-size:0.95rem; font-weight:700; color:white; margin-bottom:0.6rem;">Unit Economics Breakdown</h4>
              <div class="econ-row">
                <span>B&W Single Sided</span>
                <strong>₹1.50</strong>
                <span class="color-indigo">Platform: ₹0.10</span>
                <span class="color-emerald">Vendor: ₹1.40</span>
              </div>
              <div class="econ-row">
                <span>Full Color Page</span>
                <strong>₹8.00</strong>
                <span class="color-indigo">Platform: ₹0.56</span>
                <span class="color-emerald">Vendor: ₹7.44</span>
              </div>
              <div class="econ-row">
                <span>Spiral Coil Binding</span>
                <strong>₹30.00</strong>
                <span class="color-indigo">Platform: ₹2.10</span>
                <span class="color-emerald">Vendor: ₹27.90</span>
              </div>
              <div class="econ-row">
                <span>Rush Priority Token</span>
                <strong>₹20.00</strong>
                <span class="color-indigo">Platform: ₹1.40</span>
                <span class="color-emerald">Vendor: ₹18.60</span>
              </div>
            </div>
          </div>

          <!-- Right: Live System Event Stream Terminal -->
          <div class="cyber-glass-panel">
            <div class="panel-header-split">
              <div>
                <h3 class="panel-title">
                  <span>⚡</span> Live System Event Stream Terminal
                </h3>
                <p class="panel-sub">Real-time reactive event bus broadcasting every system transition.</p>
              </div>
              <div class="live-console-beacon">
                <span class="pulse-green-dot"></span>
                <span>STREAMING</span>
              </div>
            </div>

            <!-- Terminal Window -->
            <div class="cyber-terminal-window">
              <div class="terminal-bar">
                <div class="term-dots">
                  <span class="dot-red"></span>
                  <span class="dot-yellow"></span>
                  <span class="dot-green"></span>
                </div>
                <div class="term-title">smartprint-event-daemon :: stdout</div>
              </div>
              <div class="terminal-body" id="archEventTerminal">
                <!-- Dynamically populated with eventBus history -->
              </div>
            </div>
          </div>

        </div>

      </div>
    `;
        this.renderEvents();
        this.bindEvents();
    }
    renderEvents() {
        const term = this.container.querySelector('#archEventTerminal');
        if (!term)
            return;
        const events = eventBus.getHistory();
        term.innerHTML = events.map(ev => {
            const timeStr = new Date(ev.timestamp).toLocaleTimeString();
            return `
        <div class="term-line line-${ev.level.toLowerCase()}">
          <span class="term-time">[${timeStr}]</span>
          <span class="term-cat">[${ev.category}]</span>
          <span class="term-title">${ev.title}:</span>
          <span class="term-msg">${ev.details}</span>
        </div>
      `;
        }).join('');
    }
    onNewEvent(ev) {
        const term = this.container.querySelector('#archEventTerminal');
        if (!term)
            return;
        const timeStr = new Date(ev.timestamp).toLocaleTimeString();
        const div = document.createElement('div');
        div.className = `term-line line-${ev.level.toLowerCase()}`;
        div.innerHTML = `
      <span class="term-time">[${timeStr}]</span>
      <span class="term-cat">[${ev.category}]</span>
      <span class="term-title">${ev.title}:</span>
      <span class="term-msg">${ev.details}</span>
    `;
        term.prepend(div);
    }
    bindEvents() {
        this.container.querySelectorAll('.arch-node-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.container.querySelectorAll('.arch-node-card').forEach(c => c.classList.remove('active'));
                const target = e.currentTarget;
                target.classList.add('active');
                const nodeKey = target.dataset.node;
                if (nodeKey && ARCH_NODES[nodeKey]) {
                    this.selectedNodeKey = nodeKey;
                    const info = ARCH_NODES[nodeKey];
                    const categoryEl = this.container.querySelector('#inspCategory');
                    const titleEl = this.container.querySelector('#inspTitle');
                    const slaEl = this.container.querySelector('#inspSla');
                    const roleEl = this.container.querySelector('#inspRole');
                    const codeEl = this.container.querySelector('#inspCode');
                    if (categoryEl)
                        categoryEl.textContent = info.category;
                    if (titleEl)
                        titleEl.textContent = info.title;
                    if (slaEl)
                        slaEl.textContent = `SLA: ${info.sla}`;
                    if (roleEl)
                        roleEl.textContent = info.role;
                    if (codeEl)
                        codeEl.textContent = info.interfaceSnippet;
                    sound.click();
                }
            });
        });
    }
}
