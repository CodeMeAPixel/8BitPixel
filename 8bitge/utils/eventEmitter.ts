/**
 * Simple Event Emitter for the 8BitPixel Game Engine
 */

export class EventEmitter {
  private events: Record<string, Function[]> = {};

  /**
   * Register an event listener
   */
  on(event: string, callback: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  /**
   * Remove an event listener
   */
  off(event: string, callback?: Function): void {
    if (!this.events[event]) return;

    if (callback) {
      const index = this.events[event].indexOf(callback);
      if (index !== -1) {
        this.events[event].splice(index, 1);
      }
    } else {
      // Remove all listeners for this event
      delete this.events[event];
    }
  }

  /**
   * Emit an event
   */
  emit(event: string, data?: any): void {
    if (!this.events[event]) return;

    for (const callback of this.events[event]) {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    }
  }

  /**
   * Register a one-time event listener
   */
  once(event: string, callback: Function): void {
    const onceCallback = (data: any) => {
      this.off(event, onceCallback);
      callback(data);
    };
    this.on(event, onceCallback);
  }

  /**
   * Remove all event listeners
   */
  clear(): void {
    this.events = {};
  }
}
