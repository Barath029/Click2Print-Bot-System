/**
 * SmartPrint Business Service: Physical 50-Slot Dispatch Rack Allocation Engine
 * Manages shelf logistics, ergonomic slot assignment, and overdue package detection.
 */
export const ERGONOMIC_ROW_PRIORITY = ['B', 'C', 'A', 'D', 'E'];
export class RackAllocator {
    /**
     * Initializes 50 physical shelf compartments (Rows A-E, Cols 01-10)
     */
    generateDefaultRack() {
        const slots = {};
        const rows = ['A', 'B', 'C', 'D', 'E'];
        const levelNames = {
            'A': 'Top Shelf (Lightweight)',
            'B': 'Eye-Level Shelf (Priority Reach)',
            'C': 'Chest-Level Shelf (Fast Access)',
            'D': 'Lower Shelf (Heavy & Bound)',
            'E': 'Base Shelf (Overflow Storage)'
        };
        rows.forEach(r => {
            for (let c = 1; c <= 10; c++) {
                const code = `${r}-${c < 10 ? '0' + c : c}`;
                slots[code] = {
                    code,
                    row: r,
                    col: c,
                    status: 'EMPTY',
                    orderId: null,
                    stagedTime: null,
                    shelfLevelName: levelNames[r]
                };
            }
        });
        return slots;
    }
    /**
     * Finds the best ergonomic compartment for an incoming finished job.
     */
    findOptimalSlot(slots, isHeavyOrHardcover = false) {
        // If hardcover/heavy thesis, prioritize bottom shelves (D, E) to avoid shelf tilt
        const searchOrder = isHeavyOrHardcover ? ['D', 'E', 'C', 'B', 'A'] : ERGONOMIC_ROW_PRIORITY;
        for (const r of searchOrder) {
            for (let c = 1; c <= 10; c++) {
                const code = `${r}-${c < 10 ? '0' + c : c}`;
                if (slots[code] && slots[code].status === 'EMPTY') {
                    return code;
                }
            }
        }
        return null;
    }
    /**
     * Evaluates rack occupancy and updates overdue slots (> 60 minutes)
     */
    getOccupancyStats(slots, nowMs = Date.now()) {
        let empty = 0;
        let occupied = 0;
        let overdue = 0;
        const ONE_HOUR_MS = 60 * 60 * 1000;
        Object.values(slots).forEach(slot => {
            if (slot.status === 'EMPTY') {
                empty++;
            }
            else {
                occupied++;
                // Check if overdue
                if (slot.stagedTime && (nowMs - slot.stagedTime) > ONE_HOUR_MS) {
                    slot.status = 'OVERDUE';
                    overdue++;
                }
            }
        });
        const total = Object.keys(slots).length || 50;
        const occupancyPct = Math.round((occupied / total) * 100);
        return {
            total,
            empty,
            occupied,
            overdue,
            occupancyPct
        };
    }
}
export const rackAllocator = new RackAllocator();
