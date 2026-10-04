/**
 * SmartPrint Central Reactive Observable State Store
 * Manages FIFO Queue, Physical Rack Compartments, Split Escrow Ledger, and Telemetry.
 */
import { DEFAULT_RATES, pricingEngine } from '../services/pricingEngine.js';
import { rackAllocator } from '../services/rackAllocator.js';
import { telemetryService } from '../services/telemetryService.js';
import { eventBus } from './events.js';
import { sound } from './audio.js';
class SmartPrintStore {
    STORAGE_KEY = 'smartprint_enterprise_state_v2';
    state;
    listeners = [];
    constructor() {
        this.state = this.loadInitialState();
    }
    loadInitialState() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.orders && parsed.rackSlots) {
                    // Re-evaluate overdue status on loaded slots
                    rackAllocator.getOccupancyStats(parsed.rackSlots);
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
        const rackSlots = rackAllocator.generateDefaultRack();
        // Pre-populate realistic orders with new fields
        const initialOrders = [
            {
                id: 'SP-100',
                token: '#SP-100',
                student: { name: 'Pooja Iyer', rollNo: '21CS044', phone: '+91 98401 23450', department: 'Computer Science' },
                fileName: 'VLSI_Design_Final_Lab_Manual.pdf',
                fileSizeKb: 4200,
                pageCount: 32,
                rangeMode: 'all',
                fromPage: 1,
                toPage: 32,
                pageRange: 'All (1-32)',
                bwPages: 28,
                colorPages: 4,
                colorMode: 'smart',
                duplex: true,
                paper: 'gsm75',
                paperFormat: 'A4',
                binding: 'spiral',
                bindingNotes: 'Transparent PVC front cover + Black cardstock back',
                customerNotes: 'Please print color graphs with high sharpness',
                priority: false,
                confidential: false,
                totalAmount: 98.00,
                vendorShare: 91.14,
                platformFee: 6.86,
                status: 'STAGED',
                rackSlot: 'A-08',
                pickupOtp: '3941',
                createdAt: now - 3600000 * 2,
                stagedAt: now - 1800000,
                collectedAt: null
            },
            {
                id: 'SP-098',
                token: '#SP-098',
                student: { name: 'Aditya Sen', rollNo: '20ME108', phone: '+91 97890 55412', department: 'Mechanical Eng' },
                fileName: 'Finite_Element_Analysis_Thesis_Draft.pdf',
                fileSizeKb: 18400,
                pageCount: 110,
                rangeMode: 'all',
                fromPage: 1,
                toPage: 110,
                pageRange: 'All (1-110)',
                bwPages: 96,
                colorPages: 14,
                colorMode: 'smart',
                duplex: true,
                paper: 'gsm100',
                paperFormat: 'A4',
                binding: 'hardcover',
                bindingNotes: 'Golden embossed lettering on Navy Blue hardback',
                customerNotes: 'Thesis submission copy for Academic Dean review',
                priority: false,
                confidential: false,
                totalAmount: 385.00,
                vendorShare: 358.05,
                platformFee: 26.95,
                status: 'STAGED',
                rackSlot: 'B-04',
                pickupOtp: '7182',
                createdAt: now - 3600000 * 4,
                stagedAt: now - 3600000 * 2.5,
                collectedAt: null
            },
            {
                id: 'SP-099',
                token: '#SP-099',
                student: { name: 'Rohan Deshmukh', rollNo: '23EC015', phone: '+91 94441 88992', department: 'Electronics' },
                fileName: 'Signals_and_Systems_MidTerm_Notes.pdf',
                fileSizeKb: 1250,
                pageCount: 16,
                rangeMode: 'all',
                fromPage: 1,
                toPage: 16,
                pageRange: 'All (1-16)',
                bwPages: 16,
                colorPages: 0,
                colorMode: 'mono',
                duplex: true,
                paper: 'gsm75',
                paperFormat: 'A4',
                binding: 'staple',
                customerNotes: 'Staple top-left corner neatly',
                priority: false,
                confidential: false,
                totalAmount: 18.00,
                vendorShare: 16.74,
                platformFee: 1.26,
                status: 'STAGED',
                rackSlot: 'C-02',
                pickupOtp: '8492',
                createdAt: now - 3600000 * 3,
                stagedAt: now - 3600000 * 1.2,
                collectedAt: null
            },
            {
                id: 'SP-101',
                token: '#SP-101',
                student: { name: 'Neha Varma', rollNo: '22BT029', phone: '+91 98200 44112', department: 'Biotechnology' },
                fileName: 'Biotech_Reaction_Kinetics_Paper.pdf',
                fileSizeKb: 3100,
                pageCount: 24,
                rangeMode: 'all',
                fromPage: 1,
                toPage: 24,
                pageRange: 'All (1-24)',
                bwPages: 24,
                colorPages: 0,
                colorMode: 'mono',
                duplex: true,
                paper: 'gsm75',
                paperFormat: 'A4',
                binding: 'spiral',
                customerNotes: 'Need plastic spiral ring, black preferred',
                priority: false,
                confidential: false,
                totalAmount: 58.00,
                vendorShare: 53.94,
                platformFee: 4.06,
                status: 'PRINTING',
                rackSlot: null,
                pickupOtp: '5031',
                createdAt: now - 1800000,
                stagedAt: null,
                collectedAt: null,
                printProgress: 65
            },
            {
                id: 'SP-102',
                token: '#SP-102',
                student: { name: 'Vikram Seth', rollNo: '21EE077', phone: '+91 98840 99123', department: 'Electrical' },
                fileName: 'Power_Electronics_Schematics.pdf',
                fileSizeKb: 2800,
                pageCount: 18,
                rangeMode: 'custom',
                fromPage: 1,
                toPage: 18,
                pageRange: 'Pages 1-18',
                bwPages: 14,
                colorPages: 4,
                colorMode: 'smart',
                duplex: false,
                paper: 'gsm100',
                paperFormat: 'A3', // Large drawing format
                binding: 'none',
                customerNotes: 'Large A3 schematic prints, do not fold!',
                priority: true, // Rush token
                confidential: false,
                totalAmount: 122.00,
                vendorShare: 113.46,
                platformFee: 8.54,
                status: 'QUEUED',
                rackSlot: null,
                pickupOtp: '6294',
                createdAt: now - 600000,
                stagedAt: null,
                collectedAt: null
            }
        ];
        // Mark staged slots in the rack
        initialOrders.forEach(o => {
            if (o.status === 'STAGED' && o.rackSlot && rackSlots[o.rackSlot]) {
                rackSlots[o.rackSlot].status = 'OCCUPIED';
                rackSlots[o.rackSlot].orderId = o.id;
                rackSlots[o.rackSlot].stagedTime = o.stagedAt;
            }
        });
        rackAllocator.getOccupancyStats(rackSlots, now);
        const hubs = [
            { id: 'hub-main', name: 'IIT Campus Central Hub', code: 'HUB-01', location: 'Main Library Ground Floor', activeOrders: 4, printersOnline: 2, status: 'ONLINE' },
            { id: 'hub-annex', name: 'Engineering Workshop Annex', code: 'HUB-02', location: 'Mechanical Block Wing B', activeOrders: 1, printersOnline: 1, status: 'ONLINE' },
            { id: 'hub-hostel', name: 'North Hostel Express Pod', code: 'HUB-03', location: 'Hostel 7 Common Hallway', activeOrders: 0, printersOnline: 1, status: 'ONLINE' }
        ];
        return {
            orders: initialOrders,
            rackSlots,
            pricing: DEFAULT_RATES,
            hubs,
            activeHubId: 'hub-main',
            printers: telemetryService.getPrinters(),
            events: eventBus.getHistory(),
            activeRole: 'student',
            activeStudentOrderId: 'SP-101',
            audioMuted: sound.isMuted()
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
            // Storage quota catch
        }
    }
    setActiveRole(role) {
        this.state.activeRole = role;
        sound.click();
        this.notify();
    }
    setActiveHub(hubId) {
        this.state.activeHubId = hubId;
        eventBus.emit('ESCROW', 'Campus Hub Switched', `Switched routing context to ${hubId}`, 'INFO');
        this.notify();
    }
    setActiveStudentOrder(orderId) {
        this.state.activeStudentOrderId = orderId;
        this.notify();
    }
    /**
     * Student creates a new order after instant UPI payment
     */
    createOrder(draft) {
        const nextNum = this.state.orders.length + 104;
        const orderId = `SP-${nextNum}`;
        const token = `#SP-${nextNum}`;
        const otp = String(Math.floor(1000 + Math.random() * 9000));
        const quote = pricingEngine.calculate(draft.pageCount, draft.colorPages, draft.bwPages, draft.colorMode, draft.duplex, draft.paper, draft.paperFormat, draft.binding, draft.priority);
        const newOrder = {
            id: orderId,
            token,
            student: draft.student,
            fileName: draft.fileName,
            pageCount: draft.pageCount,
            rangeMode: draft.rangeMode,
            fromPage: draft.fromPage,
            toPage: draft.toPage,
            pageRange: draft.pageRange,
            bwPages: draft.bwPages,
            colorPages: draft.colorPages,
            colorMode: draft.colorMode,
            duplex: draft.duplex,
            paper: draft.paper,
            paperFormat: draft.paperFormat,
            binding: draft.binding,
            bindingNotes: draft.bindingNotes,
            customerNotes: draft.customerNotes,
            priority: draft.priority,
            confidential: draft.confidential,
            totalAmount: quote.grandTotal,
            vendorShare: quote.vendorShare,
            platformFee: quote.platformFee,
            status: 'QUEUED',
            rackSlot: null,
            pickupOtp: otp,
            createdAt: Date.now(),
            stagedAt: null,
            collectedAt: null
        };
        // FIFO insertion: if priority, place at front of queued jobs; otherwise append
        if (draft.priority) {
            const firstNonPriorityQueuedIndex = this.state.orders.findIndex(o => o.status === 'QUEUED' && !o.priority);
            if (firstNonPriorityQueuedIndex !== -1) {
                this.state.orders.splice(firstNonPriorityQueuedIndex, 0, newOrder);
            }
            else {
                this.state.orders.push(newOrder);
            }
            eventBus.emit('QUEUE', '⚡ Rush Priority Order Ingested', `${newOrder.token} boosted to front of queue (${draft.student.name})`, 'WARN');
        }
        else {
            this.state.orders.push(newOrder);
            eventBus.emit('QUEUE', 'New Print Job Ingested', `${newOrder.token} queued for ${draft.student.name} [${draft.paperFormat}] (₹${quote.grandTotal})`, 'INFO');
        }
        eventBus.emit('ESCROW', 'UPI Split Transaction Settled', `Gross: ₹${quote.grandTotal} | Vendor 93%: ₹${quote.vendorShare} | Escrow 7%: ₹${quote.platformFee}`, 'SUCCESS');
        this.state.activeStudentOrderId = newOrder.id;
        sound.success();
        this.notify();
        return newOrder;
    }
    /**
     * Operator triggers printing
     */
    startPrinting(orderId) {
        const order = this.state.orders.find(o => o.id === orderId);
        if (!order)
            return;
        order.status = 'PRINTING';
        order.printProgress = 20;
        telemetryService.recordJobPrint(order.bwPages, order.colorPages);
        eventBus.emit('PRINT', 'Printer Engine Engaged', `Printing ${order.token} on Canon ImageRUNNER [${order.paperFormat}] (${order.pageCount} pages)`, 'INFO');
        sound.printStart();
        this.notify();
        // Simulate print completion progress
        let progress = 20;
        const interval = setInterval(() => {
            progress += 25;
            if (progress >= 100) {
                order.printProgress = 100;
                clearInterval(interval);
                eventBus.emit('PRINT', 'Print & Binding Finished', `${order.token} printed & assembled. Ready for shelf staging.`, 'SUCCESS');
                sound.printDone();
                this.notify();
            }
            else {
                order.printProgress = progress;
                this.notify();
            }
        }, 400);
    }
    /**
     * Operator stages the finished bundle into an assigned physical rack slot
     */
    stageOrder(orderId, customSlotCode) {
        const order = this.state.orders.find(o => o.id === orderId);
        if (!order)
            return null;
        const isHeavy = order.binding === 'hardcover' || order.pageCount > 80;
        const targetSlot = customSlotCode || rackAllocator.findOptimalSlot(this.state.rackSlots, isHeavy);
        if (!targetSlot) {
            eventBus.emit('RACK', 'Rack Overflow Warning', 'All 50 shelf compartments are currently occupied!', 'ALERT');
            sound.error();
            return null;
        }
        const slot = this.state.rackSlots[targetSlot];
        if (slot) {
            slot.status = 'OCCUPIED';
            slot.orderId = order.id;
            slot.stagedTime = Date.now();
        }
        order.status = 'STAGED';
        order.rackSlot = targetSlot;
        order.stagedAt = Date.now();
        eventBus.emit('RACK', 'Bundle Staged in Physical Shelf', `${order.token} placed in [RACK ${targetSlot}]. SMS & WhatsApp alert dispatched to student with OTP: ${order.pickupOtp}`, 'SUCCESS');
        sound.rackStaged();
        this.notify();
        return targetSlot;
    }
    /**
     * 15-Second Express Pickup Kiosk: Student authenticates with 4-digit OTP
     */
    authenticatePickupByOtp(otp) {
        const cleanOtp = otp.trim();
        const order = this.state.orders.find(o => o.pickupOtp === cleanOtp && o.status === 'STAGED');
        if (!order) {
            sound.error();
            return null;
        }
        sound.success();
        return order;
    }
    /**
     * Confirms pickup, releases the physical rack compartment, marks order collected
     */
    completePickup(orderId) {
        const order = this.state.orders.find(o => o.id === orderId);
        if (!order)
            return;
        if (order.rackSlot && this.state.rackSlots[order.rackSlot]) {
            const slot = this.state.rackSlots[order.rackSlot];
            slot.status = 'EMPTY';
            slot.orderId = null;
            slot.stagedTime = null;
        }
        order.status = 'COLLECTED';
        order.collectedAt = Date.now();
        eventBus.emit('KIOSK', 'Express Handover Completed', `${order.token} picked up by ${order.student.name}. Shelf ${order.rackSlot} liberated in under 15 seconds.`, 'SUCCESS');
        sound.success();
        this.notify();
    }
    /**
     * SuperAdmin: Concurrency Spike Stress-Test Simulator
     */
    simulateRushOrders(count = 3) {
        const samples = [
            { name: 'Karthik Raja', rollNo: '23CS112', phone: '+91 97891 00221', file: 'Operating_Systems_Project.pdf', pages: 28, bw: 24, col: 4, binding: 'spiral', format: 'A4', priority: true, note: 'Need transparent front spiral binding' },
            { name: 'Divya Nair', rollNo: '22EE041', phone: '+91 99402 33441', file: 'Control_Systems_Assignment_3.pdf', pages: 12, bw: 12, col: 0, binding: 'staple', format: 'A4', priority: false, note: 'Corner staple top left' },
            { name: 'Varun Patel', rollNo: '21ME090', phone: '+91 98211 44552', file: 'Robotics_Kinematics_Drawing.pdf', pages: 10, bw: 6, col: 4, binding: 'none', format: 'A3', priority: true, note: 'Do not fold A3 drawing sheets' }
        ];
        samples.slice(0, count).forEach(s => {
            this.createOrder({
                fileName: s.file,
                pageCount: s.pages,
                rangeMode: 'all',
                fromPage: 1,
                toPage: s.pages,
                pageRange: `1-${s.pages}`,
                bwPages: s.bw,
                colorPages: s.col,
                colorMode: s.col > 0 ? 'smart' : 'mono',
                duplex: true,
                paper: 'gsm75',
                paperFormat: s.format,
                binding: s.binding,
                customerNotes: s.note,
                priority: s.priority,
                confidential: false,
                student: { name: s.name, rollNo: s.rollNo, phone: s.phone }
            });
        });
        eventBus.emit('QUEUE', '⚡ Peak Concurrency Spike Injected', `Simulated ${count} simultaneous deadline submissions across IIT Central Hub.`, 'WARN');
    }
    resetData() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.state = this.getSeedState();
        eventBus.emit('ESCROW', 'Database Restored to Demo Seed', 'All FIFO queues, rack slots, and revenue ledgers re-initialized.', 'INFO');
        sound.click();
        this.notify();
    }
}
export const store = new SmartPrintStore();
