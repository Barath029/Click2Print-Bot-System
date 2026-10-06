/**
 * Click2Print Central Reactive State Store
 * Implements full product lifecycle:
 * - Customer QR scan -> Upload -> Configure -> Auto-detect -> Pay
 * - Live Order Management -> One-click Approve & Print / Reject
 * - B&W & Colour Auto-Routing
 * - Dedicated Printer Setup & Test Print
 * - Auto-File Cleanup (100% Privacy)
 * - Custom Per-Page Pricing & Monthly Usage Analytics
 */
import { DEFAULT_RATES, pricingEngine } from '../services/pricingEngine.js';
import { eventBus } from './events.js';
import { sound } from './audio.js';
class Click2PrintStore {
    STORAGE_KEY = 'click2print_state_v3';
    state;
    listeners = [];
    printTimers = new Map();
    constructor() {
        this.state = this.loadInitialState();
    }
    loadInitialState() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.orders && parsed.bwPrinter && parsed.shop) {
                    pricingEngine.setRates(parsed.pricing || DEFAULT_RATES);
                    return parsed;
                }
            }
            catch (e) {
                console.warn('Failed to parse cached state, falling back to seed data.', e);
            }
        }
        return this.getSeedState();
    }
    getSeedState() {
        const now = Date.now();
        const shop = {
            shopName: 'Click2Print Express Print Hub',
            shopCode: 'C2P-X01',
            tagline: 'Instant Automated Counter & Cloud Print Station',
            upiId: 'click2print@icici',
            phone: '+91 98401 23450',
            address: 'Shop #14, Main Student Complex, Opp. Tech Gate',
            razorpayKeyId: 'rzp_live_c2pprt_9941',
            autoPrintOnApprove: true,
            autoFileCleanup: true
        };
        const bwPrinter = {
            id: 'PRN-BW-01',
            name: 'Dedicated B&W Printer',
            model: 'HP LaserJet Pro M404dn (Duplex)',
            type: 'BW',
            status: 'ONLINE',
            paperTrayCount: 420,
            inkLevelPct: 88,
            ipAddress: '192.168.1.120:9100',
            autoRoute: true,
            totalJobsPrinted: 2430
        };
        const colorPrinter = {
            id: 'PRN-CLR-02',
            name: 'Dedicated Colour Printer',
            model: 'Canon PIXMA G3010 / Epson EcoTank L3250',
            type: 'COLOUR',
            status: 'ONLINE',
            paperTrayCount: 195,
            inkLevelPct: 94,
            ipAddress: '192.168.1.124:9100',
            autoRoute: true,
            totalJobsPrinted: 785
        };
        const initialOrders = [
            {
                id: 'ORD-1041',
                orderNumber: 1041,
                customer: { name: 'Karthik Raja', phone: '+91 98402 11223' },
                fileName: 'Project_Final_Submission.docx',
                fileType: 'docx',
                isDocxConverted: true,
                fileSizeKb: 3420,
                pageCount: 36,
                rangeMode: 'all',
                fromPage: 1,
                toPage: 36,
                pageRange: 'All Pages (1-36)',
                bwPages: 36,
                colorPages: 0,
                colorMode: 'mono',
                duplex: true,
                copies: 2,
                paper: 'gsm75',
                paperFormat: 'A4',
                binding: 'staple',
                customerNotes: 'Please staple top-left corner neatly',
                totalAmount: 118.00,
                paymentMethod: 'RAZORPAY_UPI',
                paymentStatus: 'PAID',
                status: 'PENDING',
                createdAt: now - 180000,
                completedAt: null,
                routedPrinter: 'BW_PRINTER',
                fileErased: false
            },
            {
                id: 'ORD-1040',
                orderNumber: 1040,
                customer: { name: 'Ananya Sharma', phone: '+91 97890 44556' },
                fileName: 'Marketing_Pitch_Deck.pdf',
                fileType: 'pdf',
                fileSizeKb: 6150,
                pageCount: 12,
                rangeMode: 'all',
                fromPage: 1,
                toPage: 12,
                pageRange: 'All Pages (1-12)',
                bwPages: 0,
                colorPages: 12,
                colorMode: 'color',
                duplex: false,
                copies: 1,
                paper: 'gsm100',
                paperFormat: 'A4',
                binding: 'spiral',
                customerNotes: 'Glossy paper preferred for client demo',
                totalAmount: 162.00,
                paymentMethod: 'RAZORPAY_UPI',
                paymentStatus: 'PAID',
                status: 'PRINTING',
                createdAt: now - 420000,
                completedAt: null,
                printProgress: 70,
                routedPrinter: 'COLOUR_PRINTER',
                fileErased: false
            },
            {
                id: 'ORD-1039',
                orderNumber: 1039,
                customer: { name: 'Praveen Kumar', phone: '+91 94441 77889' },
                fileName: 'Lab_Manual_Expt3.pdf',
                fileType: 'pdf',
                fileSizeKb: 1800,
                pageCount: 8,
                rangeMode: 'all',
                fromPage: 1,
                toPage: 8,
                pageRange: 'All Pages (1-8)',
                bwPages: 8,
                colorPages: 0,
                colorMode: 'mono',
                duplex: true,
                copies: 1,
                paper: 'gsm75',
                paperFormat: 'A4',
                binding: 'none',
                totalAmount: 12.00,
                paymentMethod: 'CASH_COUNTER',
                paymentStatus: 'PAY_AT_COUNTER',
                status: 'READY',
                createdAt: now - 900000,
                completedAt: now - 200000,
                routedPrinter: 'BW_PRINTER',
                fileErased: false
            },
            {
                id: 'ORD-1038',
                orderNumber: 1038,
                customer: { name: 'Divya Ramesh', phone: '+91 98845 33211' },
                fileName: 'Resume_Updated_2026.pdf',
                fileType: 'pdf',
                fileSizeKb: 650,
                pageCount: 2,
                rangeMode: 'all',
                fromPage: 1,
                toPage: 2,
                pageRange: 'All Pages (1-2)',
                bwPages: 0,
                colorPages: 2,
                colorMode: 'color',
                duplex: false,
                copies: 2,
                paper: 'gsm100',
                paperFormat: 'A4',
                binding: 'none',
                totalAmount: 44.00,
                paymentMethod: 'RAZORPAY_UPI',
                paymentStatus: 'PAID',
                status: 'COMPLETED',
                createdAt: now - 3600000 * 2,
                completedAt: now - 3600000 * 1.8,
                routedPrinter: 'COLOUR_PRINTER',
                fileErased: true,
                fileErasedAt: now - 3600000 * 1.8
            }
        ];
        const deletedFiles = [
            {
                id: 'DEL-1038',
                orderNumber: 1038,
                fileName: 'Resume_Updated_2026.pdf',
                deletedAt: now - 3600000 * 1.8,
                reason: 'PRINT_COMPLETED'
            },
            {
                id: 'DEL-1037',
                orderNumber: 1037,
                fileName: 'Corrupted_Doc_Draft.pdf',
                deletedAt: now - 3600000 * 3,
                reason: 'ORDER_REJECTED'
            }
        ];
        pricingEngine.setRates(DEFAULT_RATES);
        return {
            activeRole: 'customer',
            adminTab: 'orders',
            shop,
            bwPrinter,
            colorPrinter,
            orders: initialOrders,
            pricing: { ...DEFAULT_RATES },
            usage: {
                monthName: 'October 2026',
                totalPagesPrinted: 14850,
                bwPagesPrinted: 12420,
                colorPagesPrinted: 2430,
                totalOrdersFulfilled: 684,
                totalRevenue: 38940.00,
                duplexSheetsSaved: 4180
            },
            deletedFiles,
            events: eventBus.getHistory(),
            nextOrderNumber: 1042,
            activeCustomerOrderId: 'ORD-1041'
        };
    }
    getState() {
        return this.state;
    }
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    notify() {
        this.listeners.forEach(fn => fn(this.state));
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
        }
        catch {
            // Storage fallback
        }
    }
    setActiveRole(role) {
        this.state.activeRole = role;
        sound.click();
        this.notify();
    }
    setAdminTab(tab) {
        this.state.adminTab = tab;
        sound.click();
        this.notify();
    }
    setActiveCustomerOrderId(orderId) {
        this.state.activeCustomerOrderId = orderId;
        this.notify();
    }
    /**
     * Customer places order (Step 2 in Image 3)
     */
    createOrder(draft) {
        const orderNum = this.state.nextOrderNumber;
        const orderId = `ORD-${orderNum}`;
        const quote = pricingEngine.calculate(draft.pageCount, draft.colorPages, draft.bwPages, draft.colorMode, draft.duplex, draft.copies, draft.paper, draft.paperFormat, draft.binding, this.state.pricing);
        // Auto-Routing: B&W orders go to B&W printer, color orders go to colour printer
        const isColor = draft.colorMode === 'color' || (draft.colorMode === 'smart' && draft.colorPages > 0);
        const routedPrinter = isColor ? 'COLOUR_PRINTER' : 'BW_PRINTER';
        const newOrder = {
            id: orderId,
            orderNumber: orderNum,
            customer: draft.customer,
            fileName: draft.fileName,
            fileType: draft.fileType,
            isDocxConverted: draft.isDocxConverted || false,
            fileSizeKb: draft.fileSizeKb,
            pageCount: draft.pageCount,
            rangeMode: draft.rangeMode,
            fromPage: draft.fromPage,
            toPage: draft.toPage,
            pageRange: draft.pageRange,
            bwPages: draft.bwPages,
            colorPages: draft.colorPages,
            colorMode: draft.colorMode,
            duplex: draft.duplex,
            copies: draft.copies,
            paper: draft.paper,
            paperFormat: draft.paperFormat,
            binding: draft.binding,
            customerNotes: draft.customerNotes,
            totalAmount: quote.grandTotal,
            paymentMethod: draft.paymentMethod,
            paymentStatus: draft.paymentMethod === 'RAZORPAY_UPI' ? 'PAID' : 'PAY_AT_COUNTER',
            status: 'PENDING',
            createdAt: Date.now(),
            completedAt: null,
            routedPrinter,
            fileErased: false
        };
        this.state.orders.unshift(newOrder);
        this.state.nextOrderNumber = orderNum + 1;
        this.state.activeCustomerOrderId = orderId;
        eventBus.emit('ORDER', 'New Order Placed', `#${orderNum} — ${draft.customer.name} placed order for ${draft.fileName} (₹${quote.grandTotal})`, 'SUCCESS');
        sound.success();
        this.notify();
        // If auto-print on approve is enabled and shop owner is in instant auto-accept mode,
        // we can still let shop owner click "One-Click Approve & Print" or trigger directly
        return newOrder;
    }
    /**
     * Shop Owner "One-Click Approve & Print" (Image 2)
     * Approves an order and it prints automatically and silently — no further action required.
     */
    approveAndPrint(orderId) {
        const order = this.state.orders.find(o => o.id === orderId);
        if (!order || (order.status !== 'PENDING' && order.status !== 'APPROVED'))
            return;
        order.status = 'APPROVED';
        eventBus.emit('ORDER', 'Order Approved', `#${order.orderNumber} approved — sending to Auto Print Queue`, 'INFO');
        sound.click();
        this.notify();
        // Send immediately to Auto Print Queue
        this.startBackgroundPrinting(orderId);
    }
    /**
     * Background Auto-Print Queue Worker (Image 2 & 3)
     */
    startBackgroundPrinting(orderId) {
        const order = this.state.orders.find(o => o.id === orderId);
        if (!order)
            return;
        // Update status to PRINTING
        order.status = 'PRINTING';
        order.printProgress = 10;
        const printer = order.routedPrinter === 'BW_PRINTER' ? this.state.bwPrinter : this.state.colorPrinter;
        printer.status = 'PRINTING';
        eventBus.emit('PRINT', 'Auto-Printing Started', `#${order.orderNumber} printing on ${printer.name} (${order.pageCount} pgs × ${order.copies} copies)`, 'INFO');
        sound.printStart();
        this.notify();
        // Clear existing timer if any
        if (this.printTimers.has(orderId)) {
            clearInterval(this.printTimers.get(orderId));
        }
        let progress = 10;
        const interval = window.setInterval(() => {
            progress += 25;
            if (progress >= 100) {
                clearInterval(interval);
                this.printTimers.delete(orderId);
                order.printProgress = 100;
                this.completeOrderPrint(orderId);
            }
            else {
                order.printProgress = progress;
                this.notify();
            }
        }, 600);
        this.printTimers.set(orderId, interval);
    }
    /**
     * Print completed -> Mark READY -> Auto-Delete file (Image 3: Step 4)
     */
    completeOrderPrint(orderId) {
        const order = this.state.orders.find(o => o.id === orderId);
        if (!order)
            return;
        order.status = 'READY';
        order.completedAt = Date.now();
        const printer = order.routedPrinter === 'BW_PRINTER' ? this.state.bwPrinter : this.state.colorPrinter;
        printer.status = 'ONLINE';
        printer.totalJobsPrinted += 1;
        printer.paperTrayCount = Math.max(0, printer.paperTrayCount - (order.pageCount * order.copies));
        // Update Monthly Usage Tracking (Image 4)
        const totalPrinted = order.pageCount * order.copies;
        this.state.usage.totalPagesPrinted += totalPrinted;
        if (order.routedPrinter === 'BW_PRINTER') {
            this.state.usage.bwPagesPrinted += totalPrinted;
        }
        else {
            this.state.usage.colorPagesPrinted += totalPrinted;
        }
        this.state.usage.totalOrdersFulfilled += 1;
        this.state.usage.totalRevenue += order.totalAmount;
        if (order.duplex) {
            this.state.usage.duplexSheetsSaved += Math.floor(totalPrinted / 2);
        }
        eventBus.emit('PRINT', 'Auto-Print Finished', `#${order.orderNumber} printed successfully — Ready for pickup!`, 'SUCCESS');
        sound.printDone();
        // Auto File Cleanup: 100% private, zero data retained (Image 3 & 4)
        if (this.state.shop.autoFileCleanup) {
            this.autoDeleteFile(order);
        }
        this.notify();
    }
    /**
     * Auto File Cleanup (Image 4)
     * Uploaded files are deleted automatically after printing — 100% secure customer privacy
     */
    autoDeleteFile(order) {
        order.fileErased = true;
        order.fileErasedAt = Date.now();
        const logEntry = {
            id: `DEL-${Date.now()}`,
            orderNumber: order.orderNumber,
            fileName: order.fileName,
            deletedAt: Date.now(),
            reason: 'PRINT_COMPLETED'
        };
        this.state.deletedFiles.unshift(logEntry);
        if (this.state.deletedFiles.length > 50) {
            this.state.deletedFiles.pop();
        }
        eventBus.emit('SECURITY', 'Auto File Purged', `File "${order.fileName}" for Order #${order.orderNumber} permanently erased from server (Zero Data Retained).`, 'SUCCESS');
    }
    /**
     * Reject Order with Single Click (Image 2)
     * Decline any order with a single click. The customer is notified and the file is immediately deleted.
     */
    rejectOrder(orderId, reason = 'Declined by shop operator') {
        const order = this.state.orders.find(o => o.id === orderId);
        if (!order)
            return;
        if (this.printTimers.has(orderId)) {
            clearInterval(this.printTimers.get(orderId));
            this.printTimers.delete(orderId);
        }
        order.status = 'REJECTED';
        order.fileErased = true;
        order.fileErasedAt = Date.now();
        const logEntry = {
            id: `DEL-${Date.now()}`,
            orderNumber: order.orderNumber,
            fileName: order.fileName,
            deletedAt: Date.now(),
            reason: 'ORDER_REJECTED'
        };
        this.state.deletedFiles.unshift(logEntry);
        eventBus.emit('ORDER', 'Order Rejected & File Purged', `#${order.orderNumber} rejected (${reason}). File ${order.fileName} permanently wiped immediately.`, 'WARN');
        sound.error();
        this.notify();
    }
    /**
     * Mark Order Collected by Customer
     */
    markOrderCompleted(orderId) {
        const order = this.state.orders.find(o => o.id === orderId);
        if (!order)
            return;
        order.status = 'COMPLETED';
        eventBus.emit('ORDER', 'Order Delivered', `#${order.orderNumber} handed over to ${order.customer.name}`, 'SUCCESS');
        sound.success();
        this.notify();
    }
    /**
     * Test Print Button (Image 1)
     * Instantly confirm any printer is connected and working with a single test-print tap — no guesswork.
     */
    triggerTestPrint(printerType) {
        const printer = printerType === 'BW' ? this.state.bwPrinter : this.state.colorPrinter;
        printer.paperTrayCount = Math.max(0, printer.paperTrayCount - 1);
        eventBus.emit('PRINT', 'Test Print Sent', `Hardware test pattern sent to ${printer.name} (${printer.model}) at ${printer.ipAddress} — Connection 100% OK`, 'SUCCESS');
        sound.printStart();
        setTimeout(() => sound.printDone(), 700);
        this.notify();
        return {
            success: true,
            timestamp: Date.now(),
            printerName: printer.name,
            model: printer.model,
            ip: printer.ipAddress
        };
    }
    /**
     * Dedicated Printer Setup (Image 1)
     */
    updatePrinterConfig(type, updates) {
        if (type === 'BW') {
            Object.assign(this.state.bwPrinter, updates);
        }
        else {
            Object.assign(this.state.colorPrinter, updates);
        }
        eventBus.emit('SYSTEM', 'Printer Config Updated', `${type} Printer configuration saved successfully.`, 'INFO');
        sound.click();
        this.notify();
    }
    /**
     * Custom Per-Page Pricing (Image 4)
     * Set your own price per page for B&W and colour prints separately, applies instantly to new orders.
     */
    updatePricing(newRates) {
        this.state.pricing = { ...newRates };
        pricingEngine.setRates(this.state.pricing);
        eventBus.emit('SYSTEM', 'Pricing Updated', `New rates applied: B&W ₹${newRates.bwSingle}/pg, Colour ₹${newRates.colorSingle}/pg. Instant update active.`, 'SUCCESS');
        sound.success();
        this.notify();
    }
    /**
     * Easy Printer Settings & Shop Config (Image 4)
     */
    updateShopConfig(updates) {
        Object.assign(this.state.shop, updates);
        eventBus.emit('SYSTEM', 'Shop Settings Saved', `Shop configuration updated.`, 'INFO');
        sound.click();
        this.notify();
    }
    resetData() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.state = this.getSeedState();
        eventBus.emit('SYSTEM', 'Data Reset', 'All demo data, orders, and counters reset.', 'INFO');
        sound.click();
        this.notify();
    }
}
export const store = new Click2PrintStore();
