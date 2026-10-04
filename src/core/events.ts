/**
 * Click2Print Event Bus & Activity Log
 */

import { SystemEvent, EventCategory } from '../types/index.js';

type EventListener = (event: SystemEvent) => void;

class EventBus {
  private listeners: EventListener[] = [];
  private history: SystemEvent[] = [];

  public emit(category: EventCategory, title: string, details: string, level: 'INFO' | 'SUCCESS' | 'WARN' | 'ALERT' = 'INFO'): SystemEvent {
    const event: SystemEvent = {
      id: `EV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      category,
      level,
      title,
      details
    };

    this.history.unshift(event);
    if (this.history.length > 100) {
      this.history.pop();
    }

    this.listeners.forEach(fn => fn(event));
    return event;
  }

  public subscribe(listener: EventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getHistory(): SystemEvent[] {
    return [...this.history];
  }
}

export const eventBus = new EventBus();
