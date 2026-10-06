/**
 * Click2Print Event Bus & Activity Log
 */
class EventBus {
    listeners = [];
    history = [];
    emit(category, title, details, level = 'INFO') {
        const event = {
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
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    getHistory() {
        return [...this.history];
    }
}
export const eventBus = new EventBus();
