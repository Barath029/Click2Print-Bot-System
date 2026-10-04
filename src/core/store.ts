/**
 * Click2Print Central Reactive State Store
 * Manages order queue, pricing, and system events.
 */

import {
  SystemState,
  PrintOrder,
  OrderDraft
} from '../types/index.js';
import { DEFAULT_RATES, pricingEngine } from '../services/pricingEngine.js';
import { eventBus } from './events.js';
import { sound } from './audio.js';

export type StateListener = (state: SystemState) => void;

class Click2PrintStore {
  private readonly STORAGE_KEY = 'click2print_state_v1';
  private state: SystemState;
  private listeners: StateListener[] = [];

  constructor() {
    this.state = this.loadInitialState();
  }

  private loadInitialState(): SystemState {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.orders) {
          return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse cached state, falling back to seed data.', e);
      }
    }
    return this.getSeedState();
  }

  private getSeedState(): SystemState {
    const now = Date.now();

    const initialOrders: PrintOrder[] = [
      {
        id: 'C2P-1001',
        orderNumber: 1001,
        customer: { name: 'Pooja Iyer', phone: '+91 98401 23450', email: 'pooja@email.com' },
        fileName: 'Annual_Report_2026.pdf',
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
        copies: 2,
        paper: 'gsm75',
        paperFormat: 'A4',
        binding: 'spiral',
        bindingNotes: 'Transparent PVC front cover + Black cardstock back',
        customerNotes: 'Please print color graphs with high sharpness',
        totalAmount: 196.00,
        status: 'READY',
        createdAt: now - 3600000 * 2,
        completedAt: null
      },
      {
        id: 'C2P-1002',
        orderNumber: 1002,
        customer: { name: 'Aditya Sen', phone: '+91 97890 55412' },
        fileName: 'Business_Plan_Draft.pdf',
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
        copies: 1,
        paper: 'gsm100',
        paperFormat: 'A4',
        binding: 'hardcover',
        bindingNotes: 'Navy Blue hardback with Gold lettering',
        customerNotes: 'Submission copy — needs to look professional',
        totalAmount: 385.00,
        status: 'PRINTING',
        createdAt: now - 3600000 * 4,
        completedAt: null,
        printProgress: 65
      },
      {
        id: 'C2P-1003',
        orderNumber: 1003,
        customer: { name: 'Rohan Deshmukh', phone: '+91 94441 88992', email: 'rohan.d@email.com' },
        fileName: 'Meeting_Notes_October.pdf',
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
        copies: 1,
        paper: 'gsm75',
        paperFormat: 'A4',
        binding: 'staple',
        customerNotes: 'Staple top-left corner neatly',
        totalAmount: 18.00,
        status: 'COMPLETED',
        createdAt: now - 3600000 * 5,
        completedAt: now - 3600000 * 3
      },
      {
        id: 'C2P-1004',
        orderNumber: 1004,
        customer: { name: 'Neha Varma', phone: '+91 98200 44112' },
        fileName: 'Product_Catalogue_Q4.pdf',
        fileSizeKb: 3100,
        pageCount: 24,
        rangeMode: 'all',
        fromPage: 1,
        toPage: 24,
        pageRange: 'All (1-24)',
        bwPages: 0,
        colorPages: 24,
        colorMode: 'color',
        duplex: false,
        copies: 3,
        paper: 'gsm250',
        paperFormat: 'A4',
        binding: 'spiral',
        customerNotes: 'High quality glossy print for client presentation',
        totalAmount: 702.00,
        status: 'PENDING',
        createdAt: now - 600000,
        completedAt: null
      },
      {
        id: 'C2P-1005',
        orderNumber: 1005,
        customer: { name: 'Vikram Seth', phone: '+91 98840 99123' },
        fileName: 'Architecture_Blueprints.pdf',
        fileSizeKb: 2800,
        pageCount: 8,
        rangeMode: 'all',
        fromPage: 1,
        toPage: 8,
        pageRange: 'All (1-8)',
        bwPages: 4,
        colorPages: 4,
        colorMode: 'smart',
        duplex: false,
        copies: 1,
        paper: 'gsm100',
        paperFormat: 'A3',
        binding: 'none',
        customerNotes: 'A3 blueprint prints, do not fold!',
        totalAmount: 60.00,
        status: 'PENDING',
        createdAt: now - 300000,
        completedAt: null
      }
    ];

    return {
      orders: initialOrders,
      pricing: DEFAULT_RATES,
      events: eventBus.getHistory(),
      activeRole: 'customer',
      nextOrderNumber: 1006
    };
  }

  public getState(): SystemState {
    return this.state;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(fn => fn(this.state));
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Storage quota catch
    }
  }

  public setActiveRole(role: SystemState['activeRole']): void {
    this.state.activeRole = role;
    sound.click();
    this.notify();
  }

  /**
   * Customer places a new print order
   */
  public createOrder(draft: OrderDraft): PrintOrder {
    const orderNum = this.state.nextOrderNumber;
    const orderId = `C2P-${orderNum}`;

    const quote = pricingEngine.calculate(
      draft.pageCount,
      draft.colorPages,
      draft.bwPages,
      draft.colorMode,
      draft.duplex,
      draft.copies,
      draft.paper,
      draft.paperFormat,
      draft.binding
    );

    const newOrder: PrintOrder = {
      id: orderId,
      orderNumber: orderNum,
      customer: draft.customer,
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
      copies: draft.copies,
      paper: draft.paper,
      paperFormat: draft.paperFormat,
      binding: draft.binding,
      bindingNotes: draft.bindingNotes,
      customerNotes: draft.customerNotes,
      totalAmount: quote.grandTotal,
      status: 'PENDING',
      createdAt: Date.now(),
      completedAt: null
    };

    this.state.orders.push(newOrder);
    this.state.nextOrderNumber = orderNum + 1;

    eventBus.emit('ORDER', 'New Order Placed', `Order #${orderNum} — ${draft.customer.name} — ₹${quote.grandTotal}`, 'SUCCESS');

    sound.success();
    this.notify();
    return newOrder;
  }

  /**
   * Shop owner approves a pending order
   */
  public approveOrder(orderId: string): void {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order || order.status !== 'PENDING') return;

    order.status = 'APPROVED';
    eventBus.emit('ORDER', 'Order Approved', `#${order.orderNumber} approved — ready to print`, 'SUCCESS');
    sound.click();
    this.notify();
  }

  /**
   * Shop owner starts printing an order
   */
  public startPrinting(orderId: string): void {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order || (order.status !== 'APPROVED' && order.status !== 'PENDING')) return;

    order.status = 'PRINTING';
    order.printProgress = 15;

    eventBus.emit('PRINT', 'Printing Started', `#${order.orderNumber} — ${order.fileName} (${order.pageCount} pages × ${order.copies} copies)`, 'INFO');
    sound.printStart();
    this.notify();

    // Simulate print completion progress
    let progress = 15;
    const interval = setInterval(() => {
      progress += 20;
      if (progress >= 100) {
        order.printProgress = 100;
        clearInterval(interval);
        eventBus.emit('PRINT', 'Printing Complete', `#${order.orderNumber} — Ready for pickup`, 'SUCCESS');
        sound.printDone();
        this.notify();
      } else {
        order.printProgress = progress;
        this.notify();
      }
    }, 500);
  }

  /**
   * Mark order as ready for pickup
   */
  public markReady(orderId: string): void {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return;

    order.status = 'READY';
    eventBus.emit('ORDER', 'Order Ready', `#${order.orderNumber} ready for pickup`, 'SUCCESS');
    sound.success();
    this.notify();
  }

  /**
   * Mark order as completed / handed over
   */
  public completeOrder(orderId: string): void {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return;

    order.status = 'COMPLETED';
    order.completedAt = Date.now();
    eventBus.emit('ORDER', 'Order Completed', `#${order.orderNumber} handed over to ${order.customer.name}`, 'SUCCESS');
    sound.success();
    this.notify();
  }

  public resetData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.state = this.getSeedState();
    eventBus.emit('SYSTEM', 'Data Reset', 'All orders and state restored to demo defaults.', 'INFO');
    sound.click();
    this.notify();
  }
}

export const store = new Click2PrintStore();
