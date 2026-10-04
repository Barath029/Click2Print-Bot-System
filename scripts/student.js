// Student Portal Workflow Controller & Smart Auto Color-Spotter
class StudentPortal {
  constructor() {
    this.currentDocument = {
      name: 'VLSI_Embedded_Systems_Project.pdf',
      pageCount: 28,
      detectedColorPages: [1, 7, 14, 21], // Sample auto-detected color pages
      bwCount: 24,
      colorCount: 4
    };

    this.specs = {
      pageRange: 'All',
      colorMode: 'smart', // 'mono' | 'color' | 'smart'
      duplex: true,
      paper: 'gsm75',
      binding: 'spiral',
      priority: false,
      confidential: false
    };

    this.initElements();
    this.bindEvents();
    this.recalculate();
  }

  initElements() {
    // Dropzone & Samples
    this.dropzone = document.getElementById('studentDropzone');
    this.fileInput = document.getElementById('studentFileInput');
    this.fileNameDisplay = document.getElementById('uploadedFileName');
    this.pageCountDisplay = document.getElementById('uploadedPageCount');
    this.colorSpotterBanner = document.getElementById('colorSpotterBanner');
    this.colorPagesDetectedText = document.getElementById('colorPagesDetectedText');
    this.colorSavingsText = document.getElementById('colorSavingsText');

    // Config Inputs
    this.pageRangeInput = document.getElementById('pageRangeInput');
    this.colorModePills = document.querySelectorAll('.color-mode-pill');
    this.duplexToggle = document.getElementById('duplexToggle');
    this.paperGradePills = document.querySelectorAll('.paper-grade-pill');
    this.bindingPills = document.querySelectorAll('.binding-pill');
    this.priorityToggle = document.getElementById('priorityToggle');
    this.confidentialToggle = document.getElementById('confidentialToggle');

    // Bill breakdown fields
    this.billBwItem = document.getElementById('billBwItem');
    this.billColorItem = document.getElementById('billColorItem');
    this.billPaperItem = document.getElementById('billPaperItem');
    this.billBindingItem = document.getElementById('billBindingItem');
    this.billPriorityItem = document.getElementById('billPriorityItem');
    this.billTotalDisplay = document.getElementById('billTotalDisplay');
    this.billVendorShare = document.getElementById('billVendorShare');
    this.billPlatformFee = document.getElementById('billPlatformFee');
    this.greenprintNotice = document.getElementById('greenprintNotice');

    // Actions
    this.btnPayNow = document.getElementById('btnPayNow');
    this.activeOrderCard = document.getElementById('activeOrderCard');
  }

  bindEvents() {
    // Sample document loaders
    document.querySelectorAll('.sample-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const type = e.target.dataset.sample;
        this.loadSampleDoc(type);
        window.soundFx.click();
      });
    });

    // Dropzone triggers
    this.dropzone.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        this.handleNewFile(file.name, Math.floor(12 + Math.random() * 30));
      }
    });

    // Drag-drop
    this.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropzone.classList.add('drag-active');
    });
    this.dropzone.addEventListener('dragleave', () => {
      this.dropzone.classList.remove('drag-active');
    });
    this.dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropzone.classList.remove('drag-active');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        this.handleNewFile(file.name, Math.floor(14 + Math.random() * 25));
      }
    });

    // Page range input
    this.pageRangeInput.addEventListener('input', () => this.recalculate());

    // Color mode selectors
    this.colorModePills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.colorModePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.specs.colorMode = pill.dataset.val;
        window.soundFx.click();
        this.recalculate();
      });
    });

    // Duplex toggle
    this.duplexToggle.addEventListener('change', () => {
      this.specs.duplex = this.duplexToggle.checked;
      window.soundFx.click();
      this.recalculate();
    });

    // Paper Grade
    this.paperGradePills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.paperGradePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.specs.paper = pill.dataset.val;
        window.soundFx.click();
        this.recalculate();
      });
    });

    // Binding
    this.bindingPills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.bindingPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.specs.binding = pill.dataset.val;
        window.soundFx.click();
        this.recalculate();
      });
    });

    // Priority & Confidential
    this.priorityToggle.addEventListener('change', () => {
      this.specs.priority = this.priorityToggle.checked;
      window.soundFx.click();
      this.recalculate();
    });

    this.confidentialToggle.addEventListener('change', () => {
      this.specs.confidential = this.confidentialToggle.checked;
      window.soundFx.click();
      this.recalculate();
    });

    // Checkout button
    this.btnPayNow.addEventListener('click', () => {
      this.openPaymentModal();
    });
  }

  loadSampleDoc(type) {
    if (type === 'project') {
      this.currentDocument = {
        name: 'Autonomous_Drone_Navigation_Project_Report.pdf',
        pageCount: 24,
        detectedColorPages: [1, 4, 12, 18],
        bwCount: 20,
        colorCount: 4
      };
    } else if (type === 'thesis') {
      this.currentDocument = {
        name: 'Deep_Learning_Architectures_Thesis_Draft.pdf',
        pageCount: 64,
        detectedColorPages: [1, 8, 15, 23, 31, 42, 50, 58],
        bwCount: 56,
        colorCount: 8
      };
      // For thesis default to hardcover
      this.specs.binding = 'hardcover';
      this.bindingPills.forEach(p => p.classList.toggle('active', p.dataset.val === 'hardcover'));
    } else if (type === 'lab') {
      this.currentDocument = {
        name: 'Data_Structures_Lab_Assignment_04.pdf',
        pageCount: 12,
        detectedColorPages: [],
        bwCount: 12,
        colorCount: 0
      };
      this.specs.binding = 'staple';
      this.bindingPills.forEach(p => p.classList.toggle('active', p.dataset.val === 'staple'));
    }
    this.updateDocumentDisplay();
    this.recalculate();
  }

  handleNewFile(name, estimatedPages) {
    // Generate simulated auto color spotting
    const colorCount = Math.floor(Math.random() * 5);
    const colorPages = [];
    for (let i = 0; i < colorCount; i++) {
      colorPages.push(Math.floor(1 + Math.random() * estimatedPages));
    }
    const uniqueColors = [...new Set(colorPages)].sort((a,b) => a - b);

    this.currentDocument = {
      name: name,
      pageCount: estimatedPages,
      detectedColorPages: uniqueColors,
      bwCount: estimatedPages - uniqueColors.length,
      colorCount: uniqueColors.length
    };
    this.updateDocumentDisplay();
    this.recalculate();
    window.showToast(`Document parsed: ${estimatedPages} pages loaded!`, 'success');
  }

  updateDocumentDisplay() {
    this.fileNameDisplay.textContent = this.currentDocument.name;
    this.pageCountDisplay.textContent = `${this.currentDocument.pageCount} Pages detected`;

    if (this.currentDocument.colorCount > 0) {
      this.colorSpotterBanner.style.display = 'flex';
      this.colorPagesDetectedText.textContent = `${this.currentDocument.colorCount} Color Pages detected (Pages: ${this.currentDocument.detectedColorPages.join(', ')})`;
      const estimatedSaving = (this.currentDocument.bwCount * (8.00 - 1.50)).toFixed(0);
      this.colorSavingsText.textContent = `Smart Color-Spotter auto-configured: You save ₹${estimatedSaving} vs printing the entire document in color!`;
    } else {
      this.colorSpotterBanner.style.display = 'none';
    }
  }

  recalculate() {
    let effectiveBw = 0;
    let effectiveColor = 0;

    // Parse page count based on range
    const totalPages = this.currentDocument.pageCount;
    
    if (this.specs.colorMode === 'smart') {
      effectiveColor = this.currentDocument.colorCount;
      effectiveBw = totalPages - effectiveColor;
    } else if (this.specs.colorMode === 'mono') {
      effectiveBw = totalPages;
      effectiveColor = 0;
    } else if (this.specs.colorMode === 'color') {
      effectiveBw = 0;
      effectiveColor = totalPages;
    }

    const pricing = window.smartStore.calculatePrice({
      bwPages: effectiveBw,
      colorPages: effectiveColor,
      duplex: this.specs.duplex,
      paper: this.specs.paper,
      binding: this.specs.binding,
      priority: this.specs.priority
    });

    this.currentPricing = pricing;

    // Update UI elements
    const sheetsUsed = pricing.physicalSheets;
    this.billBwItem.innerHTML = `<span>B&W Pages (${effectiveBw} pgs)</span><span class="price">₹${pricing.bwPageCost.toFixed(2)}</span>`;
    this.billColorItem.innerHTML = `<span>Color Pages (${effectiveColor} pgs)</span><span class="price">₹${pricing.colorPageCost.toFixed(2)}</span>`;
    this.billPaperItem.innerHTML = `<span>Paper Stock (${this.specs.paper.toUpperCase()} - ${sheetsUsed} sheets)</span><span class="price">₹${pricing.paperSurcharge.toFixed(2)}</span>`;
    this.billBindingItem.innerHTML = `<span>Finishing (${this.specs.binding})</span><span class="price">₹${pricing.bindingCost.toFixed(2)}</span>`;
    
    if (this.specs.priority) {
      this.billPriorityItem.style.display = 'flex';
      this.billPriorityItem.innerHTML = `<span>⚡ Rush/Priority Token</span><span class="price">₹${pricing.priorityFee.toFixed(2)}</span>`;
    } else {
      this.billPriorityItem.style.display = 'none';
    }

    this.billTotalDisplay.textContent = `₹${pricing.grandTotal.toFixed(2)}`;
    this.billVendorShare.textContent = `₹${pricing.vendorShare.toFixed(2)}`;
    this.billPlatformFee.textContent = `₹${pricing.platformFee.toFixed(2)}`;

    // GreenPrint ESG calculation
    if (this.specs.duplex) {
      const savedSheets = Math.floor(totalPages / 2);
      const savedWaterMl = savedSheets * 10;
      this.greenprintNotice.innerHTML = `🌱 <strong>GreenPrint ESG:</strong> Choosing Duplex saved <strong>${savedSheets} paper sheets</strong> and ~<strong>${savedWaterMl} ml</strong> of manufacturing water!`;
      this.greenprintNotice.parentElement.style.display = 'flex';
    } else {
      this.greenprintNotice.parentElement.style.display = 'none';
    }
  }

  openPaymentModal() {
    window.soundFx.click();
    const modal = document.getElementById('paymentModal');
    const modalAmount = document.getElementById('modalPayAmount');
    const modalVendor = document.getElementById('modalVendorSplit');
    const modalPlatform = document.getElementById('modalPlatformSplit');

    modalAmount.textContent = `₹${this.currentPricing.grandTotal.toFixed(2)}`;
    modalVendor.textContent = `₹${this.currentPricing.vendorShare.toFixed(2)}`;
    modalPlatform.textContent = `₹${this.currentPricing.platformFee.toFixed(2)}`;

    modal.classList.add('open');

    // Instant payment simulation handler
    const btnSimulatePay = document.getElementById('btnSimulatePayment');
    btnSimulatePay.onclick = () => {
      btnSimulatePay.disabled = true;
      btnSimulatePay.innerHTML = `<span>Verifying UPI Webhook...</span>`;
      window.soundFx.printStart();

      setTimeout(() => {
        btnSimulatePay.disabled = false;
        btnSimulatePay.innerHTML = `<span>Pay & Confirm Order</span>`;
        modal.classList.remove('open');
        this.handlePaymentSuccess();
      }, 1200);
    };
  }

  handlePaymentSuccess() {
    window.soundFx.success();
    // Create new order in the store
    const studentInfo = {
      name: document.getElementById('studentNameInput').value || 'Rahul Sharma',
      rollNo: document.getElementById('studentRollInput').value || '22CS084',
      phone: '+91 98402 11987'
    };

    const newOrder = window.smartStore.createOrder({
      student: studentInfo,
      fileName: this.currentDocument.name,
      pageCount: this.currentDocument.pageCount,
      pageRange: this.pageRangeInput.value || 'All',
      bwPages: this.currentDocument.bwCount,
      colorPages: this.currentDocument.colorCount,
      colorMode: this.specs.colorMode,
      duplex: this.specs.duplex,
      paper: this.specs.paper,
      binding: this.specs.binding,
      priority: this.specs.priority,
      confidential: this.specs.confidential,
      pricing: this.currentPricing
    });

    window.showToast(`Payment Confirmed! Order #${newOrder.id} entered FIFO Queue.`, 'success');
    this.renderActiveOrderCard(newOrder);

    // Scroll to tracker
    this.activeOrderCard.scrollIntoView({ behavior: 'smooth' });
  }

  renderActiveOrderCard(order) {
    this.activeOrderCard.style.display = 'block';

    const tokenDisplay = document.getElementById('orderTokenDisplay');
    const statusText = document.getElementById('orderStatusBadge');
    const otpDisplay = document.getElementById('orderOtpDisplay');
    const rackBadge = document.getElementById('orderRackSlotBadge');
    const timelineFill = document.getElementById('orderTimelineFill');

    tokenDisplay.textContent = order.token;
    otpDisplay.textContent = `OTP: ${order.pickupOtp}`;

    // Timeline progress logic
    const stepPlaced = document.getElementById('stepPlaced');
    const stepQueued = document.getElementById('stepQueued');
    const stepPrinting = document.getElementById('stepPrinting');
    const stepStaged = document.getElementById('stepStaged');
    const stepCollected = document.getElementById('stepCollected');

    [stepPlaced, stepQueued, stepPrinting, stepStaged, stepCollected].forEach(el => {
      el.className = 'timeline-step';
    });

    stepPlaced.classList.add('done');

    if (order.status === 'QUEUED') {
      stepQueued.classList.add('active');
      timelineFill.style.width = '25%';
      statusText.textContent = 'FIFO Queued (#2 in line)';
      rackBadge.textContent = 'QUEUED';
    } else if (order.status === 'PRINTING') {
      stepQueued.classList.add('done');
      stepPrinting.classList.add('active');
      timelineFill.style.width = '50%';
      statusText.textContent = 'Printing & Binding in progress...';
      rackBadge.textContent = 'IN PRINT';
    } else if (order.status === 'STAGED') {
      stepQueued.classList.add('done');
      stepPrinting.classList.add('done');
      stepStaged.classList.add('active');
      timelineFill.style.width = '75%';
      statusText.textContent = `READY FOR PICKUP AT RACK ${order.rackSlot}`;
      rackBadge.textContent = `RACK ${order.rackSlot}`;
      rackBadge.style.color = '#10b981';
      window.soundFx.rackStaged();
    } else if (order.status === 'COLLECTED') {
      [stepPlaced, stepQueued, stepPrinting, stepStaged, stepCollected].forEach(el => el.classList.add('done'));
      timelineFill.style.width = '100%';
      statusText.textContent = 'Order Collected & Completed';
      rackBadge.textContent = 'COLLECTED';
    }
  }
}

window.initStudentPortal = () => {
  window.studentApp = new StudentPortal();
};
