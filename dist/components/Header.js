/**
 * SmartPrint UI Component: Master Header & Multi-Role Command Bar
 */
import { store } from '../core/store.js';
import { sound } from '../core/audio.js';
export class HeaderComponent {
    container;
    constructor(container) {
        this.container = container;
        this.render(store.getState());
        store.subscribe((state) => this.update(state));
    }
    render(state) {
        const isMuted = sound.isMuted();
        this.container.innerHTML = `
      <div class="header-container">
        <!-- Holographic Brand Logo -->
        <div class="brand-wrapper" id="btnBrandHome" title="SmartPrint Institutional Hub">
          <div class="brand-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8" rx="1"></rect>
            </svg>
            <span class="brand-pulse-beacon"></span>
          </div>
          <div class="brand-identity">
            <div class="brand-name-row">
              <span class="brand-title">SmartPrint<span class="brand-tm">™</span></span>
              <span class="hub-pill">CAMPUS LOGISTICS</span>
            </div>
            <div class="brand-subtitle">
              <span class="live-dot"></span>
              <span id="headerHubName">IIT Central Hub • Station #01</span>
            </div>
          </div>
        </div>

        <!-- Role & Perspective Navigator -->
        <nav class="role-nav-bar" id="roleNavBar">
          <button class="nav-tab-btn ${state.activeRole === 'student' ? 'active' : ''}" data-role="student">
            <span class="tab-icon">🎓</span>
            <span class="tab-text">Student Studio</span>
          </button>
          <button class="nav-tab-btn ${state.activeRole === 'vendor' ? 'active' : ''}" data-role="vendor">
            <span class="tab-icon">🏪</span>
            <span class="tab-text">Vendor Dispatch</span>
            <span class="tab-badge queue-badge" id="navQueueBadge">0</span>
          </button>
          <button class="nav-tab-btn ${state.activeRole === 'rack' ? 'active' : ''}" data-role="rack">
            <span class="tab-icon">📦</span>
            <span class="tab-text">50-Slot Rack</span>
            <span class="tab-badge rack-badge" id="navRackBadge">0</span>
          </button>
          <button class="nav-tab-btn ${state.activeRole === 'kiosk' ? 'active' : ''}" data-role="kiosk">
            <span class="tab-icon">⚡</span>
            <span class="tab-text">15s Express Kiosk</span>
          </button>
          <button class="nav-tab-btn ${state.activeRole === 'admin' ? 'active' : ''}" data-role="admin">
            <span class="tab-icon">📊</span>
            <span class="tab-text">Escrow Ledger</span>
          </button>
          <button class="nav-tab-btn highlight-architecture ${state.activeRole === 'architecture' ? 'active' : ''}" data-role="architecture" title="Inspect system architecture, data flows, and live telemetry">
            <span class="tab-icon">🧬</span>
            <span class="tab-text">System Architecture</span>
            <span class="tab-badge live-tag">CONTEXT</span>
          </button>
        </nav>

        <!-- Command Utilities -->
        <div class="header-actions">
          <button class="btn-rush-spike" id="btnHeaderRushSpike" title="Inject 3 concurrent rush orders to stress-test the FIFO queue">
            <span class="rush-icon">⚡</span>
            <span class="rush-label">Simulate Rush</span>
          </button>

          <button class="utility-icon-btn" id="btnSoundToggle" title="Toggle Tactile Audio Feedback">
            <span id="soundIcon">${isMuted ? '🔇' : '🔊'}</span>
          </button>

          <button class="utility-icon-btn" id="btnResetDemo" title="Reset Demo Data">
            <span>🔄</span>
          </button>
        </div>
      </div>
    `;
        this.bindEvents();
        this.updateBadges(state);
    }
    bindEvents() {
        // Role switcher
        this.container.querySelectorAll('.nav-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget.dataset.role;
                if (target) {
                    store.setActiveRole(target);
                }
            });
        });
        // Brand logo home
        const brandHome = this.container.querySelector('#btnBrandHome');
        if (brandHome) {
            brandHome.addEventListener('click', () => {
                store.setActiveRole('student');
            });
        }
        // Rush spike
        const rushBtn = this.container.querySelector('#btnHeaderRushSpike');
        if (rushBtn) {
            rushBtn.addEventListener('click', () => {
                store.simulateRushOrders(3);
                const toast = document.getElementById('toastContainer');
                if (toast) {
                    const div = document.createElement('div');
                    div.className = 'toast toast-warn';
                    div.innerHTML = `<strong>⚡ Concurrency Spike!</strong> 3 simultaneous rush jobs placed in FIFO queue.`;
                    toast.appendChild(div);
                    setTimeout(() => div.remove(), 4000);
                }
            });
        }
        // Sound toggle
        const soundBtn = this.container.querySelector('#btnSoundToggle');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                const muted = sound.toggleMute();
                const icon = this.container.querySelector('#soundIcon');
                if (icon)
                    icon.textContent = muted ? '🔇' : '🔊';
                if (!muted)
                    sound.click();
            });
        }
        // Reset demo
        const resetBtn = this.container.querySelector('#btnResetDemo');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Reset SmartPrint system state back to default demo data?')) {
                    store.resetData();
                }
            });
        }
    }
    update(state) {
        // Update active tab highlighting
        this.container.querySelectorAll('.nav-tab-btn').forEach(btn => {
            const role = btn.dataset.role;
            if (role === state.activeRole) {
                btn.classList.add('active');
            }
            else {
                btn.classList.remove('active');
            }
        });
        this.updateBadges(state);
    }
    updateBadges(state) {
        const queueBadge = this.container.querySelector('#navQueueBadge');
        if (queueBadge) {
            const activeCount = state.orders.filter(o => o.status === 'QUEUED' || o.status === 'PRINTING').length;
            queueBadge.textContent = String(activeCount);
            queueBadge.classList.toggle('visible', activeCount > 0);
        }
        const rackBadge = this.container.querySelector('#navRackBadge');
        if (rackBadge) {
            const stagedCount = state.orders.filter(o => o.status === 'STAGED').length;
            rackBadge.textContent = String(stagedCount);
            rackBadge.classList.toggle('visible', stagedCount > 0);
        }
    }
}
