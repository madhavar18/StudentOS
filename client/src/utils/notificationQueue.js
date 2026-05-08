// client/src/utils/notificationQueue.js
//
// WHY a Queue for notifications:
// Notifications should display in the order they were generated.
// The first notification added is the first one shown and dismissed.
// FIFO = Queue. If it were LIFO (Stack), the oldest notification
// would never show if new ones kept arriving — starvation.

class NotificationQueue {
    constructor(maxSize= 5) {
        this.queue = [];
        this.maxSize = maxSize; // prevent infinite notification buildup
    }

    // Enqueue - add to back - O(1) with push (JS arrays are dynamic)
    enqueue(notification) {
        if(this.queue.length >= this.maxSize) {
            this.dequeue(); // drop oldest if at capacity
        }
        this.queue.push({
            id = Date.now(),
            message: notification.message,
            type: notification.type || 'info', // 'info', 'warning', 'error', 'success'
            timestamp: new Date().toISOString()
        });
    }

    // Dequeue — remove from front — O(n) with shift
    // NOTE: JS array shift() is O(n) — same as ArrayList removeFirst.
    // For production with thousands of notifications, use a proper circular buffer.
    // For StudentOS's scale (< 100 notifications), this is acceptable.
    dequeue() {
        return this.queue.shift();
    }

    peek() { return this.queue[0]; }
    isEmpty() { return this.queue.length === 0; }
    size() { return this.queue.length; }
    getAll() { return [...this.queue]; } // immutable copy - same Day 7  principle
}

export default NotificationQueue;

// Usage in App.jsx (Day 24 will integrate this properly):
// const notifQueue = new NotificationQueue();
// notifQueue.enqueue({ message: 'Task "React Assignment" is due tomorrow', type: 'warning' });
// notifQueue.enqueue({ message: 'Task "DBMS Exam" is overdue!', type: 'error' });