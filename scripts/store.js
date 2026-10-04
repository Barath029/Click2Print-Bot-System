// SmartPrint Central Reactive State Store & Business Logic
class SmartPrintStore {
  constructor() {
    this.STORAGE_KEY = 'smartprint_state_v1';
    this.listeners = [];
    this.state = this.loadState();
  }

  loadState() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved state, resetting to seed data.', e);
      }
    }
    return this.getSeedData();
  }

  save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  getSeedData() {
    // Generate 50 physical rack slots (Rows A-E, Cols 01-10)
    const rackSlots = {};
    const rows = ['A', 'B', 'C', 'D', 'E'];
    rows.forEach(r => {
      for (let c = 1; c <= 10; c++) {
        const code = `${r}-${c < 10 ? '0' + c : c}`;
        rackSlots[code] = {
          code,
          row: r,
          col: c,
          status: 'EMPTY', // 'EMPTY' | 'OCCUPIED' | 'OVERDUE'
          orderId: null,
          stagedTime: null
        };
      }
    });

    // Realistic pre-existing campus orders
    const now = Date.now();
    const orders = [
      {
        id: 'SP-100',
        token: '#SP-100',
        student: { name: 'Pooja Iyer', rollNo: '21CS044', phone: '+91 98401 23450' },
        fileName: 'VLSI_Design_Final_Lab_Manual.pdf',
        pageCount: 32,
        pageRange: 'All (1-32)',
        bwPages: 28,
        colorPages: 4,
        colorMode: 'smart',
        duplex: true,
        paper: 'gsm75',
        binding: 'spiral',
        priority: false,
        confidential: false,
        totalAmount: 98.00,
        vendorShare: 91.14,
        platformFee: 6.86,
        status: 'STAGED',
        rackSlot: 'A-08',
        pickupOtp: '3941',
        createdAt: now - 3600000 * 2, // 2 hrs ago
        stagedAt: now - 1800000
      },
      {
        id: 'SP-98',
        token: '#SP-098',
        student: { name: 'Aditya Sen', rollNo: '20ME108', phone: '+91 97890 55412' },
        fileName: 'Finite_Element_Analysis_Thesis_Draft.pdf',
        pageCount: 110,
        pageRange: 'All (1-110)',
        bwPages: 96,
        colorPages: 14,
        colorMode: 'smart',
        duplex: true,
        paper: 'gsm100',
        binding: 'hardcover',
        priority: false,
        confidential: false,
        totalAmount: 385.00,
        vendorShare: 358.05,
        platformFee: 26.95,
        status: 'STAGED',
        rackSlot: 'B-04',
        pickupOtp: '7182',
        createdAt: now - 3600000 * 4,
        stagedAt: now - 3600000 * 2.5
      },
      {
        id: 'SP-99',
        token: '#SP-099',
        student: { name: 'Rohan Deshmukh', rollNo: '23EC015', phone: '+91 94441 88992' },
        fileName: 'Signals_and_Systems_MidTerm_Notes.pdf',
        pageCount: 16,
        pageRange: 'All (1-16)',
        bwPages: 16,
        colorPages: 0,
        colorMode: 'mono',
        duplex: true,
        paper: 'gsm75',
        binding: 'staple',
        priority: false,
        confidential: false,
        totalAmount: 18.00,
        vendorShare: 16.74,
        platformFee: 1.26,
        status: 'STAGED',
        rackSlot: 'C-02',
        pickupOtp: '8492',
        createdAt: now - 3600000 * 3,
        stagedAt: now - 3600000 * 1.2
      },
      {
        id: 'SP-101',
        token: '#SP-101',
        student: { name: 'Neha Varma', rollNo: '22BT029', phone: '+91 98200 44112' },
        fileName: 'Biotech_Reaction_Kinetics_Paper.pdf',
        pageCount: 24,
        pageRange: 'All (1-24)',
        bwPages: 24,
        colorPages: 0,
        colorMode: 'mono',
        duplex: true,
        paper: 'gsm75',
        binding: 'spiral',
        priority: false,
        confidential: false,
        totalAmount: 58.00,
        vendorShare: 53.94,
        platformFee: 4.06,
        status: 'PRINTING',
        rackSlot: null,
        pickupOtp: '5031',
        createdAt: now - 600000,
        stagedAt: null
      },
      {
        id: 'SP-102',
        token: '#SP-102',
        student: { name: 'Kartik Nair', rollNo: '21CS112', phone: '+91 91760 33921' },
        fileName: 'Computer_Networks_Lab_Record.pdf',
        pageCount: 45,
        pageRange: '1-40',
        bwPages: 36,
        colorPages: 4,
        colorMode: 'smart',
        duplex: true,
        paper: 'gsm75',
        binding: 'spiral',
        priority: true, // Urgent token
        confidential: false,
        totalAmount: 112.00,
        vendorShare: 104.16,
        platformFee: 7.84,
        status: 'QUEUED',
        rackSlot: null,
        pickupOtp: '6249',
        createdAt: now - 300000,
        stagedAt: null
      },
      {
        id: 'SP-103',
        token: '#SP-103',
        student: { name: 'Dr. S. K. Raman', rollNo: 'FACULTY-CS-09', phone: '+91 98840 99110' },
        fileName: 'CONFIDENTIAL_CS402_EndSem_Exam_Paper.pdf',
        pageCount: 8,
        pageRange: 'All (1-8)',
        bwPages: 8,
        colorPages: 0,
        colorMode: 'mono',
        duplex: true,
        paper: 'gsm100',
        binding: 'staple',
        priority: true,
        confidential: true,
        totalAmount: 32.00,
        vendorShare: 29.76,
        platformFee: 2.24,
        status: 'QUEUED',
        rackSlot: null,
        pickupOtp: '9920',
        createdAt: now - 120000,
        stagedAt: null
      }
    ];

    // Mark rack slots corresponding to staged orders
    rackSlots['A-08'].status = 'OCCUPIED';
    rackSlots['A-08'].orderId = 'SP-100';
    rackSlots['A-08'].stagedTime = now - 1800000;

    rackSlots['B-04'].status = 'OCCUPIED';
    rackSlots['B-04'].orderId = 'SP-98';
    rackSlots['B-04'].stagedTime = now - 3600000 * 2.5;

    rackSlots['C-02'].status = 'OCCUPIED';
    rackSlots['C-02'].orderId = 'SP-99';
    rackSlots['C-02'].stagedTime = now - 3600000 * 1.2;

    return {
      orders,
      rackSlots,
      rateCard: {
        bw_single: 1.50,
        bw_duplex_sheet: 2.00,
        color_single: 8.00,
        spiral: 30.00,
        thermal: 60.00,
        hardcover: 150.00,
        bond100_surcharge: 0.50,
        cardstock250_surcharge: 2.00,
        priority_fee: 20.00,
        platform_commission_pct: 7.00 // 7% Developer escrow
      },
      vendorHub: {
        name: 'IIT Madras Central Campus Library Print Hub',
        isOpen: true,
        activeMachines: [
          { id: 'M-01', name: 'Canon ImageRUNNER 2645 (High-Speed B&W 65ppm)', status: 'BUSY', job: 'SP-101' },
          { id: 'M-02', name: 'Xerox VersaLink C7020 (Color Digital Press)', status: 'IDLE', job: null },
          { id: 'M-03', name: 'GBC Professional Heavy CombBinder', status: 'IDLE', job: null }
        ]
      },
      activeStudentOrder: null // Track user's latest placed order
    };
  }

  // Calculate pricing breakdown with 7% platform fee and 93% vendor share
  calculatePrice(specs) {
    const rate = this.state.rateCard;
    let bwPageCost = 0;
    let colorPageCost = 0;
    const totalPages = specs.bwPages + specs.colorPages;

    if (specs.duplex) {
      // In duplex, each physical sheet takes 2 pages. Rate is per sheet.
      const bwSheets = Math.ceil(specs.bwPages / 2);
      bwPageCost = bwSheets * rate.bw_duplex_sheet;
      // Color pages typically priced per page
      colorPageCost = specs.colorPages * rate.color_single;
    } else {
      bwPageCost = specs.bwPages * rate.bw_single;
      colorPageCost = specs.colorPages * rate.color_single;
    }

    // Paper grade surcharge
    let paperSurcharge = 0;
    const physicalSheets = specs.duplex ? Math.ceil(totalPages / 2) : totalPages;
    if (specs.paper === 'gsm100') {
      paperSurcharge = physicalSheets * rate.bond100_surcharge;
    } else if (specs.paper === 'gsm250') {
      paperSurcharge = physicalSheets * rate.cardstock250_surcharge;
    }

    // Binding cost
    let bindingCost = 0;
    if (specs.binding === 'spiral') bindingCost = rate.spiral;
    else if (specs.binding === 'thermal') bindingCost = rate.thermal;
    else if (specs.binding === 'hardcover') bindingCost = rate.hardcover;

    // Priority token
    const priorityFee = specs.priority ? rate.priority_fee : 0;

    const subtotal = bwPageCost + colorPageCost + paperSurcharge + bindingCost + priorityFee;
    
    // Split: 7% Platform escrow, 93% Vendor Bank Payout
    const platformFee = Math.round(subtotal * (rate.platform_commission_pct / 100) * 100) / 100;
    const vendorShare = Math.round((subtotal - platformFee) * 100) / 100;
    const grandTotal = Math.round(subtotal * 100) / 100;

    return {
      bwPageCost,
      colorPageCost,
      paperSurcharge,
      bindingCost,
      priorityFee,
      subtotal,
      platformFee,
      vendorShare,
      grandTotal,
      physicalSheets
    };
  }

  // Add new student order to FIFO queue
  createOrder(orderData) {
    const idNum = this.state.orders.length + 101;
    const newOrder = {
      id: `SP-${idNum}`,
      token: `#SP-${idNum}`,
      student: orderData.student || { name: 'Rahul Sharma', rollNo: '22CS084', phone: '+91 98402 11987' },
      fileName: orderData.fileName || 'Assignment_Submission.pdf',
      pageCount: orderData.pageCount || 20,
      pageRange: orderData.pageRange || 'All',
      bwPages: orderData.bwPages || 20,
      colorPages: orderData.colorPages || 0,
      colorMode: orderData.colorMode || 'smart',
      duplex: orderData.duplex !== undefined ? orderData.duplex : true,
      paper: orderData.paper || 'gsm75',
      binding: orderData.binding || 'none',
      priority: orderData.priority || false,
      confidential: orderData.confidential || false,
      totalAmount: orderData.pricing.grandTotal,
      vendorShare: orderData.pricing.vendorShare,
      platformFee: orderData.pricing.platformFee,
      status: 'QUEUED',
      rackSlot: null,
      pickupOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      createdAt: Date.now(),
      stagedAt: null,
      collectedAt: null
    };

    if (newOrder.priority) {
      // Priority orders are placed right after currently printing jobs in FIFO
      const printingIndex = this.state.orders.findIndex(o => o.status === 'PRINTING');
      const insertAt = printingIndex >= 0 ? printingIndex + 1 : 0;
      this.state.orders.splice(insertAt, 0, newOrder);
    } else {
      this.state.orders.push(newOrder);
    }

    this.state.activeStudentOrder = newOrder;
    this.save();
    return newOrder;
  }

  // Update order status: QUEUED -> PRINTING -> STAGED -> COLLECTED
  updateOrderStatus(orderId, newStatus, extra = {}) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return null;

    order.status = newStatus;
    if (newStatus === 'PRINTING') {
      // Assign machine
      const idleMachine = this.state.vendorHub.activeMachines.find(m => m.status === 'IDLE');
      if (idleMachine) {
        idleMachine.status = 'BUSY';
        idleMachine.job = order.id;
      }
    } else if (newStatus === 'STAGED') {
      order.stagedAt = Date.now();
      if (extra.rackSlot) {
        this.assignRackSlot(order.id, extra.rackSlot);
      }
      // Free machine
      const busyMachine = this.state.vendorHub.activeMachines.find(m => m.job === order.id);
      if (busyMachine) {
        busyMachine.status = 'IDLE';
        busyMachine.job = null;
      }
    } else if (newStatus === 'COLLECTED') {
      order.collectedAt = Date.now();
      if (order.rackSlot && this.state.rackSlots[order.rackSlot]) {
        this.freeRackSlot(order.rackSlot);
      }
    }

    this.save();
    return order;
  }

  // Assign order to physical rack slot (e.g. 'B-04')
  assignRackSlot(orderId, slotCode) {
    const order = this.state.orders.find(o => o.id === orderId);
    const slot = this.state.rackSlots[slotCode];
    if (!order || !slot) return false;

    // If slot had another order, free it or swap
    slot.status = 'OCCUPIED';
    slot.orderId = order.id;
    slot.stagedTime = Date.now();
    order.rackSlot = slotCode;
    order.status = 'STAGED';
    order.stagedAt = Date.now();

    this.save();
    return true;
  }

  // Free rack slot upon customer express collection
  freeRackSlot(slotCode) {
    const slot = this.state.rackSlots[slotCode];
    if (!slot) return false;
    slot.status = 'EMPTY';
    slot.orderId = null;
    slot.stagedTime = null;
    this.save();
    return true;
  }

  // Find the closest available shelf slot (Rows B & C are prime waist-level slots)
  findRecommendedSlot() {
    const preferredRows = ['B', 'C', 'A', 'D', 'E'];
    for (const r of preferredRows) {
      for (let c = 1; c <= 10; c++) {
        const code = `${r}-${c < 10 ? '0' + c : c}`;
        if (this.state.rackSlots[code].status === 'EMPTY') {
          return code;
        }
      }
    }
    return null;
  }

  // Express 15-second pickup validation by OTP
  verifyPickupByOtp(otpInput) {
    const trimmed = otpInput.toString().trim();
    const order = this.state.orders.find(o => o.pickupOtp === trimmed && o.status === 'STAGED');
    if (!order) return { success: false, message: 'Invalid or expired OTP. Please verify on your pass.' };

    const slotCode = order.rackSlot;
    return {
      success: true,
      order,
      slotCode,
      message: `Verified! Document ready at RACK ${slotCode}`
    };
  }

  completePickup(orderId) {
    return this.updateOrderStatus(orderId, 'COLLECTED');
  }

  resetToDefaults() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.state = this.getSeedData();
    this.save();
  }
}

window.smartStore = new SmartPrintStore();
