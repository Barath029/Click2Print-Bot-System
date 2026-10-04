# SmartPrint™ Institutional Print Queue Automation & Rack Logistics

> **Enterprise Clean Architecture, Pure TypeScript & Node.js, 7%/93% Split-Revenue Escrow Platform, and Contactless 15-Second FIFO Express-Pickup Model for Campus Hubs.**

---

## 🚀 Quick Start

The platform uses **Node.js** and compile-time **TypeScript (ES2022)** with standard ES modules natively loaded by the browser:

```powershell
# Navigate to the project directory
cd C:\Users\barat\.gemini\antigravity-ide\scratch\smartprint-app

# Compile TypeScript to dist/
npm run build

# Start the Node.js web server
npm start
# or: node server.js
```

Open your browser at: **`http://localhost:3000`**

---

## 🏛️ System Architecture

SmartPrint follows a clean, decoupled **Layered Domain-Driven Architecture**:

```
smartprint-app/
├── src/                                  # 100% Modern TypeScript Architecture
│   ├── types/                            # Domain Contracts & Type Definitions
│   │   ├── order.ts                      # Order, PageRange, Finishing, StatusEnums
│   │   ├── rack.ts                       # RackSlot, GridCoordinates, Occupancy
│   │   ├── finance.ts                    # EscrowSplit, PricingQuote, SettlementLedger
│   │   ├── telemetry.ts                  # HardwareStatus, TonerLevels, TrayPaper
│   │   └── index.ts                      # Centralized Type Barrel
│   ├── core/                             # Core Application State Engine
│   │   ├── store.ts                      # Strongly typed Observable Store (Pub/Sub)
│   │   ├── events.ts                     # System-wide Event Bus for cross-module sync
│   │   └── audio.ts                      # Tactile Web Audio Synthesizer (Zero asset dependencies)
│   ├── services/                         # Pure Business Logic (Decoupled from DOM)
│   │   ├── pricingEngine.ts              # Unit Economics, Split Calculator (7%/93%), GreenPrint ESG
│   │   ├── colorAnalyzer.ts              # Auto Color-Spotting & Spectral Page Histogram Simulation
│   │   ├── rackAllocator.ts              # FIFO Shelf Allocation & Ergonomic Proximity Sorting
│   │   └── telemetryService.ts           # Hardware Cluster Simulation & Live Machine Heartbeats
│   ├── components/                       # Modular UI Components (Encapsulated Views & Logic)
│   │   ├── Header.ts                     # Brand, Role Navigation, Master Quick Controls
│   │   ├── TelemetryHUD.ts               # Global Hardware & Logistics Telemetry Bar
│   │   ├── StudentStudio.ts              # Interactive Upload, Color Heatmap, Spec Matrix, UPI Checkout
│   │   ├── VendorConsole.ts              # Chronological FIFO Kanban with 1-Click Operations
│   │   ├── RackMatrix.ts                 # 50-Slot Visual Dispatch Shelving with 3D compartment depth
│   │   ├── KioskTerminal.ts              # High-Speed 15-Second Express Touch Kiosk with visual beacons
│   │   ├── AdminLedger.ts                # Multi-Shop T+1 Clearing Ledger & Concurrency Spike Simulator
│   │   ├── ArchitectureExplorer.ts       # Visual Interactive Architecture & System Context Inspector
│   │   └── Modals.ts                     # UPI QR Modal, Manifest Slip Modal, Slot Details Modal
│   └── main.ts                           # Application Bootstrap & Lifecycle Orchestrator
├── tsconfig.json                         # TypeScript Strict Mode, ES2022 Output
├── dist/                                 # Compiled standard ES Modules (zero bundler overhead)
├── server.js                             # Node.js Static Server + TS Auto-Build Integration
├── styles/
│   └── main.css                          # Modern obsidian cyber-glass design system
├── index.html                            # Semantic HTML5, modern typography, SEO metadata
└── package.json                          # Scripts for tsc build, watch, and node server
```

---

## 🎯 System Modules & Perspectives

### 1. 🎓 Student Order Studio (`#studentSection`)
- **Smart Document Parser:** Drag-and-drop ingestion with simulated PDF/DOCX/PPTX page inspection.
- **✨ Intelligent Auto Color-Spotting:** Scans page-by-page spectral color histograms to isolate color pages from monochrome pages, cutting student printing expenses by up to 70%.
- **Interactive Page Spectral Strip:** Visual page-by-page color heatmap previewing which exact pages contain diagrams/charts.
- **Granular Spec Builder:** Page ranges, Duplex (back-to-back), Paper thickness (75 GSM Standard, 100 GSM Bond, 250 GSM Cardstock), and Finishing (Corner Staple, Spiral Coil, Soft Thermal, Hardcover Thesis).
- **Special Add-ons:** ⚡ *Rush Priority Token* (+₹20) and 🔒 *Confidential Faculty / Exam Mode* (PIN release with auto-watermarking).
- **Dynamic Pricing & Split:** Itemized breakdown with 7% Developer Escrow and 93% Vendor Payout.
- **GreenPrint ESG Tracker:** Calculates saved paper sheets and manufacturing water.
- **Express Digital Pass:** Real-time 5-stage FIFO milestone tracker, QR code pickup ticket, 4-digit security OTP, and dynamic shelf coordinates (e.g. `RACK B-04`).

### 2. 🏪 Xerox Vendor Operations Console (`#vendorSection`)
- **Operator KPI Strip:** Real-time metrics on Active FIFO Queue, 50-Slot Rack Occupancy, Gross Volume, Escrow Deductions, and Net Vendor Balance.
- **Chronological FIFO Queue Kanban:** Real-time queue board sorted by millisecond payment timestamps with urgency tags and bold print parameters.
- **1-Click Actions:** `▶ Start Print` (with simulated printing progress bar), `📦 Stage in Rack`, and `📄 Manifest Slip`.
- **Printer Cluster Telemetry:** Live toner levels (K/C/M/Y) and tray capacities for Canon ImageRUNNER 2645 & Xerox VersaLink C7020.

### 3. 📦 Interactive 50-Slot Visual Rack Matrix (`#rackSection`)
- High-contrast visual representation of physical campus shelving units (Rows A–E, Columns 01–10).
- Ergonomic allocation: Row B (Eye-Level / Prime Reach), Row C (Chest), Row A (Top), Rows D & E (Heavy & Hardcover Thesis).
- Color-coded compartments: 🟢 *Available (Empty)*, 🟡 *Staged / Pending Pickup*, 🔴 *Overdue (>1 hr)*.
- Click any occupied shelf slot to inspect order manifest, resend customer WhatsApp alerts, or mark hand-delivered.

### 4. ⚡ 15-Second Express Contactless Pickup Kiosk (`#kioskSection`)
- Touch-friendly 4-digit OTP keypad for tablets placed directly beside physical pickup shelves.
- Instant validation and visual beacon highlighting the assigned shelf slot (e.g., `COLLECT FROM RACK B-04`).
- Real-time 15-second pickup SLA countdown timer.
- 1-Click collection confirmation that auto-deallocates the shelf slot for subsequent orders.

### 5. 📊 Master Platform SuperAdmin & Escrow Split Ledger (`#adminSection`)
- Multi-tenant campus shop monitoring (IIT Central Hub, Workshop Annex, North Hostel Pod).
- Real-time revenue split accounting ledger (7% Escrow Take-Rate vs. 93% Vendor Bank Payout via automated T+1 clearing).
- Concurrency Spike Simulator: Generates instant rush orders to test FIFO queue throughput.

### 6. 🧬 Interactive System Architecture & Context Explorer (`#architectureSection`)
- **3-Tier Interactive Component Blueprint:** Clickable architectural nodes (Presentation, Domain Services, Hardware Cluster, Node.js Infrastructure).
- **TypeScript Domain Contract Inspector:** View the exact TypeScript interfaces and operational SLAs for every module.
- **Campus Physical Layout Diagram:** Visualizes the journey from student mobile order to physical library shelf and tablet kiosk.
- **Live Event Stream Terminal:** Real-time scrolling black-glass terminal displaying every event emitted by the reactive event bus.

---

## 💳 Unit Economics & Split Model

| Service Item | Campus Rate | Platform Take-Rate (7%) | Vendor Net Payout (93%) |
| :--- | :--- | :--- | :--- |
| Black & White (Single Side) | ₹ 1.50 / page | ₹ 0.10 | ₹ 1.40 |
| Black & White (Double Sided) | ₹ 2.00 / sheet | ₹ 0.14 | ₹ 1.86 |
| Full Color (Single Side) | ₹ 8.00 / page | ₹ 0.56 | ₹ 7.44 |
| Spiral Binding (Plastic Coil) | ₹ 30.00 / book | ₹ 2.10 | ₹ 27.90 |
| Soft / Thermal Book Binding | ₹ 60.00 / book | ₹ 4.20 | ₹ 55.80 |
| Hardcover Thesis Binding | ₹ 150.00 / book | ₹ 10.50 | ₹ 139.50 |
| Rush Priority Token | ₹ 20.00 / order | ₹ 1.40 | ₹ 18.60 |

---

## 🛠️ Technology Stack

- **Frontend & UI/UX:** TypeScript (ES2022), Standard ES Modules, Vanilla CSS (Modern Obsidian Glassmorphic Design System).
- **Audio Feedback:** Web Audio API zero-dependency synthesizer for tactile micro-interactions.
- **State Management:** Reactive Observable Store with Pub/Sub event bus and LocalStorage persistence.
- **Backend & Serving:** Native Node.js HTTP server (`server.js`) with complete MIME streaming and zero external runtime dependencies.
