/**
 * Input System for 8BitGE
 * Handles keyboard, mouse, touch, and gamepad input
 */

import { EventEmitter } from '../utils/eventEmitter';
import { InputState, Vector2D } from '../types';

export interface InputOptions {
  preventDefaults?: boolean;
  enableSwipe?: boolean;
  preventScroll?: boolean;
}

export interface VirtualJoystickOptions {
  size: number;
  position: Vector2D;
  alpha?: number;
  deadZone?: number;
}

export class InputSystem {
  private events: EventEmitter;
  private options: InputOptions;
  private inputState: InputState;
  private element: HTMLElement | null = null;
  private virtualJoystick: {
    element: HTMLElement | null;
    active: boolean;
    startPos: Vector2D;
    currentPos: Vector2D;
    size: number;
    deadZone: number;
    value: Vector2D;
  } | null = null;
  private boundHandleKeyDown: (e: KeyboardEvent) => void;
  private boundHandleKeyUp: (e: KeyboardEvent) => void;
  private boundHandleMouseDown: (e: MouseEvent) => void;
  private boundHandleMouseMove: (e: MouseEvent) => void;
  private boundHandleMouseUp: (e: MouseEvent) => void;
  private boundHandleTouchStart: (e: TouchEvent) => void;
  private boundHandleTouchMove: (e: TouchEvent) => void;
  private boundHandleTouchEnd: (e: TouchEvent) => void;
  private swipeData: {
    startX: number;
    startY: number;
    startTime: number;
    endX: number;
    endY: number;
    endTime: number;
  } | null = null;
  private swipeThreshold = 50; // Minimum distance for swipe
  private swipeTimeThreshold = 300; // Maximum time for swipe (ms)
  
  constructor(events: EventEmitter, options: InputOptions = {}) {
    this.events = events;
    this.options = {
      preventDefaults: options.preventDefaults ?? true,
      enableSwipe: options.enableSwipe ?? true,
      preventScroll: options.preventScroll ?? false
    };
    
    // Initialize input state
    this.inputState = {
      keyboard: {},
      mouse: {
        x: 0,
        y: 0,
        buttons: {
          left: false,
          middle: false,
          right: false
        }
      },
      touches: []
    };
    
    // Bind event handlers to maintain context
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleKeyUp = this.handleKeyUp.bind(this);
    this.boundHandleMouseDown = this.handleMouseDown.bind(this);
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);
    this.boundHandleMouseUp = this.handleMouseUp.bind(this);
    this.boundHandleTouchStart = this.handleTouchStart.bind(this);
    this.boundHandleTouchMove = this.handleTouchMove.bind(this);
    this.boundHandleTouchEnd = this.handleTouchEnd.bind(this);
  }
  
  /**
   * Initialize input handlers on a specific element
   */
  init(element: HTMLElement): void {
    this.element = element;
    
    // Add keyboard listeners (these are on document)
    document.addEventListener('keydown', this.boundHandleKeyDown);
    document.addEventListener('keyup', this.boundHandleKeyUp);
    
    // Add mouse listeners
    element.addEventListener('mousedown', this.boundHandleMouseDown);
    element.addEventListener('mousemove', this.boundHandleMouseMove);
    document.addEventListener('mouseup', this.boundHandleMouseUp);
    
    // Add touch listeners
    element.addEventListener('touchstart', this.boundHandleTouchStart, { passive: !this.options.preventDefaults });
    element.addEventListener('touchmove', this.boundHandleTouchMove, { passive: !this.options.preventScroll });
    element.addEventListener('touchend', this.boundHandleTouchEnd);
    element.addEventListener('touchcancel', this.boundHandleTouchEnd);
    
    // Disable context menu if preventing defaults
    if (this.options.preventDefaults) {
      element.addEventListener('contextmenu', e => e.preventDefault());
    }
  }
  
  /**
   * Clean up event listeners
   */
  destroy(): void {
    if (!this.element) return;
    
    // Remove keyboard listeners
    document.removeEventListener('keydown', this.boundHandleKeyDown);
    document.removeEventListener('keyup', this.boundHandleKeyUp);
    
    // Remove mouse listeners
    this.element.removeEventListener('mousedown', this.boundHandleMouseDown);
    this.element.removeEventListener('mousemove', this.boundHandleMouseMove);
    document.removeEventListener('mouseup', this.boundHandleMouseUp);
    
    // Remove touch listeners
    this.element.removeEventListener('touchstart', this.boundHandleTouchStart);
    this.element.removeEventListener('touchmove', this.boundHandleTouchMove);
    this.element.removeEventListener('touchend', this.boundHandleTouchEnd);
    this.element.removeEventListener('touchcancel', this.boundHandleTouchEnd);
    
    // Remove virtual joystick if exists
    this.removeVirtualJoystick();
  }
  
  /**
   * Update input state (called each frame)
   */
  update(): void {
    // No per-frame updates needed currently
  }
  
  /**
   * Get current input state
   */
  getState(): InputState {
    return { ...this.inputState };
  }
  
  /**
   * Check if a key is currently pressed
   */
  isKeyDown(key: string): boolean {
    return !!this.inputState.keyboard[key];
  }
  
  /**
   * Check if any key in the provided array is pressed
   */
  isAnyKeyDown(keys: string[]): boolean {
    return keys.some(key => this.isKeyDown(key));
  }
  
  /**
   * Get virtual joystick value (normalized -1 to 1 for each axis)
   */
  getJoystickValue(): Vector2D | null {
    return this.virtualJoystick ? { ...this.virtualJoystick.value } : null;
  }
  
  /**
   * Create a virtual joystick for mobile controls
   */
  createVirtualJoystick(options: VirtualJoystickOptions): void {
    if (!this.element) return;
    
    // Remove any existing joystick first
    this.removeVirtualJoystick();
    
    // Create joystick container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = `${options.position.x - options.size/2}px`;
    container.style.top = `${options.position.y - options.size/2}px`;
    container.style.width = `${options.size}px`;
    container.style.height = `${options.size}px`;
    container.style.borderRadius = '50%';
    container.style.backgroundColor = `rgba(255, 255, 255, ${options.alpha || 0.3})`;
    container.style.border = '2px solid rgba(255, 255, 255, 0.8)';
    container.style.touchAction = 'none';
    container.style.zIndex = '1000';
    container.classList.add('joystick-container');
    
    // Create joystick handle
    const handle = document.createElement('div');
    handle.style.position = 'absolute';
    handle.style.left = '50%';
    handle.style.top = '50%';
    handle.style.transform = 'translate(-50%, -50%)';
    handle.style.width = `${options.size * 0.5}px`;
    handle.style.height = `${options.size * 0.5}px`;
    handle.style.borderRadius = '50%';
    handle.style.backgroundColor = `rgba(255, 255, 255, ${options.alpha ? options.alpha * 2 : 0.6})`;
    handle.style.pointerEvents = 'none';
    handle.classList.add('joystick-handle');
    
    container.appendChild(handle);
    this.element.appendChild(container);
    
    // Setup joystick state
    this.virtualJoystick = {
      element: container,
      active: false,
      startPos: { x: options.size / 2, y: options.size / 2 },
      currentPos: { x: options.size / 2, y: options.size / 2 },
      size: options.size,
      deadZone: options.deadZone || 0.1,
      value: { x: 0, y: 0 }
    };
    
    // Add joystick touch handlers
    container.addEventListener('touchstart', this.handleJoystickStart.bind(this));
    container.addEventListener('touchmove', this.handleJoystickMove.bind(this));
    container.addEventListener('touchend', this.handleJoystickEnd.bind(this));
    container.addEventListener('touchcancel', this.handleJoystickEnd.bind(this));
  }
  
  /**
   * Remove virtual joystick
   */
  removeVirtualJoystick(): void {
    if (this.virtualJoystick?.element && this.element) {
      this.element.removeChild(this.virtualJoystick.element);
      this.virtualJoystick = null;
    }
  }
  
  /**
   * Handle joystick touch start
   */
  private handleJoystickStart(e: TouchEvent): void {
    if (!this.virtualJoystick) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    
    this.virtualJoystick.active = true;
    this.virtualJoystick.startPos = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
    
    // Reset current position to center
    this.virtualJoystick.currentPos = {
      x: this.virtualJoystick.size / 2,
      y: this.virtualJoystick.size / 2
    };
    
    this.updateJoystickPosition();
  }
  
  /**
   * Handle joystick touch move
   */
  private handleJoystickMove(e: TouchEvent): void {
    if (!this.virtualJoystick || !this.virtualJoystick.active) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    
    this.virtualJoystick.currentPos = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
    
    this.updateJoystickPosition();
  }
  
  /**
   * Handle joystick touch end
   */
  private handleJoystickEnd(e: TouchEvent): void {
    if (!this.virtualJoystick) return;
    
    e.preventDefault();
    this.virtualJoystick.active = false;
    
    // Reset to center position
    this.virtualJoystick.currentPos = {
      x: this.virtualJoystick.size / 2,
      y: this.virtualJoystick.size / 2
    };
    
    this.updateJoystickPosition();
  }
  
  /**
   * Update joystick handle position and values
   */
  private updateJoystickPosition(): void {
    if (!this.virtualJoystick || !this.virtualJoystick.element) return;
    
    const handle = this.virtualJoystick.element.querySelector('.joystick-handle') as HTMLElement;
    if (!handle) return;
    
    const centerX = this.virtualJoystick.size / 2;
    const centerY = this.virtualJoystick.size / 2;
    
    let deltaX = this.virtualJoystick.currentPos.x - centerX;
    let deltaY = this.virtualJoystick.currentPos.y - centerY;
    
    // Calculate distance from center
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = this.virtualJoystick.size / 2;
    
    // If distance is greater than max, normalize
    if (distance > maxDistance) {
      const ratio = maxDistance / distance;
      deltaX *= ratio;
      deltaY *= ratio;
    }
    
    // Update handle position
    handle.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
    
    // Update joystick values (-1 to 1 for each axis)
    let normalizedX = deltaX / maxDistance;
    let normalizedY = deltaY / maxDistance;
    
    // Apply dead zone
    const deadZone = this.virtualJoystick.deadZone;
    const deadZoneAdjustedX = Math.abs(normalizedX) < deadZone ? 0 : (normalizedX - Math.sign(normalizedX) * deadZone) / (1 - deadZone);
    const deadZoneAdjustedY = Math.abs(normalizedY) < deadZone ? 0 : (normalizedY - Math.sign(normalizedY) * deadZone) / (1 - deadZone);
    
    this.virtualJoystick.value = {
      x: deadZoneAdjustedX,
      y: deadZoneAdjustedY
    };
    
    // Emit joystick event
    this.events.emit('input:joystick', this.virtualJoystick.value);
  }
  
  /**
   * Handle keyboard key down event
   */
  private handleKeyDown(e: KeyboardEvent): void {
    const key = e.key.toLowerCase();
    
    // Update state
    if (!this.inputState.keyboard[key]) {
      this.inputState.keyboard[key] = true;
      
      // Emit key down event
      this.events.emit('input:keydown', { key, originalEvent: e });
    }
    
    // Prevent defaults if enabled
    if (this.options.preventDefaults) {
      // Don't prevent defaults for F keys, refresh, etc
      const allowDefault = e.key.match(/^(F\d+|Tab|Control|Alt|Shift|OS)$/) || 
                          (e.ctrlKey && e.key.toLowerCase() === 'r');
      
      if (!allowDefault) {
        e.preventDefault();
      }
    }
  }
  
  /**
   * Handle keyboard key up event
   */
  private handleKeyUp(e: KeyboardEvent): void {
    const key = e.key.toLowerCase();
    
    // Update state
    if (this.inputState.keyboard[key]) {
      this.inputState.keyboard[key] = false;
      
      // Emit key up event
      this.events.emit('input:keyup', { key, originalEvent: e });
    }
  }
  
  /**
   * Handle mouse down event
   */
  private handleMouseDown(e: MouseEvent): void {
    if (!this.element) return;
    
    // Get relative coordinates in the element
    const rect = this.element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update state
    this.inputState.mouse.x = x;
    this.inputState.mouse.y = y;
    
    if (e.button === 0) {
      this.inputState.mouse.buttons.left = true;
    } else if (e.button === 1) {
      this.inputState.mouse.buttons.middle = true;
    } else if (e.button === 2) {
      this.inputState.mouse.buttons.right = true;
    }
    
    // Emit mouse down event
    this.events.emit('input:mousedown', { 
      x, y, button: e.button, originalEvent: e 
    });
    
    // Prevent default if enabled
    if (this.options.preventDefaults) {
      e.preventDefault();
    }
  }
  
  /**
   * Handle mouse move event
   */
  private handleMouseMove(e: MouseEvent): void {
    if (!this.element) return;
    
    // Get relative coordinates in the element
    const rect = this.element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update state
    this.inputState.mouse.x = x;
    this.inputState.mouse.y = y;
    
    // Emit mouse move event
    this.events.emit('input:mousemove', { 
      x, y, originalEvent: e 
    });
  }
  
  /**
   * Handle mouse up event
   */
  private handleMouseUp(e: MouseEvent): void {
    if (!this.element) return;
    
    // Get relative coordinates in the element
    const rect = this.element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update state
    if (e.button === 0) {
      this.inputState.mouse.buttons.left = false;
    } else if (e.button === 1) {
      this.inputState.mouse.buttons.middle = false;
    } else if (e.button === 2) {
      this.inputState.mouse.buttons.right = false;
    }
    
    // Emit mouse up event
    this.events.emit('input:mouseup', { 
      x, y, button: e.button, originalEvent: e 
    });
  }
  
  /**
   * Handle touch start event
   */
  private handleTouchStart(e: TouchEvent): void {
    if (!this.element) return;
    
    // Prevent default if enabled
    if (this.options.preventDefaults) {
      e.preventDefault();
    }
    
    // Process each touch
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const rect = this.element.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Store for swipe detection
      if (this.options.enableSwipe && !this.swipeData) {
        this.swipeData = {
          startX: x,
          startY: y,
          startTime: Date.now(),
          endX: x,
          endY: y,
          endTime: Date.now()
        };
      }
      
      // Add to touches list
      this.inputState.touches.push({
        id: touch.identifier,
        x,
        y,
        active: true
      });
      
      // Emit touch start event
      this.events.emit('input:touchstart', { 
        id: touch.identifier, x, y, originalEvent: e 
      });
    }
  }
  
  /**
   * Handle touch move event
   */
  private handleTouchMove(e: TouchEvent): void {
    if (!this.element) return;
    
    // Prevent scroll if enabled
    if (this.options.preventScroll) {
      e.preventDefault();
    }
    
    // Process each touch
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const rect = this.element.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Update swipe data
      if (this.options.enableSwipe && this.swipeData) {
        this.swipeData.endX = x;
        this.swipeData.endY = y;
        this.swipeData.endTime = Date.now();
      }
      
      // Update touch in input state
      const touchIndex = this.inputState.touches.findIndex(t => t.id === touch.identifier);
      if (touchIndex >= 0) {
        this.inputState.touches[touchIndex].x = x;
        this.inputState.touches[touchIndex].y = y;
      }
      
      // Emit touch move event
      this.events.emit('input:touchmove', { 
        id: touch.identifier, x, y, originalEvent: e 
      });
    }
  }
  
  /**
   * Handle touch end/cancel event
   */
  private handleTouchEnd(e: TouchEvent): void {
    if (!this.element) return;
    
    // Process each touch
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const rect = this.element.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Finalize swipe detection
      if (this.options.enableSwipe && this.swipeData) {
        this.swipeData.endX = x;
        this.swipeData.endY = y;
        this.swipeData.endTime = Date.now();
        
        // Check for swipe
        this.detectSwipe();
        this.swipeData = null;
      }
      
      // Remove touch from input state
      const touchIndex = this.inputState.touches.findIndex(t => t.id === touch.identifier);
      if (touchIndex >= 0) {
        this.inputState.touches.splice(touchIndex, 1);
      }
      
      // Emit touch end event
      this.events.emit('input:touchend', { 
        id: touch.identifier, x, y, originalEvent: e 
      });
    }
  }
  
  /**
   * Detect swipe gesture
   */
  private detectSwipe(): void {
    if (!this.swipeData) return;
    
    const dx = this.swipeData.endX - this.swipeData.startX;
    const dy = this.swipeData.endY - this.swipeData.startY;
    const duration = this.swipeData.endTime - this.swipeData.startTime;
    
    // Check if duration is within threshold
    if (duration > this.swipeTimeThreshold) return;
    
    // Get distance
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if distance meets threshold
    if (distance < this.swipeThreshold) return;
    
    // Determine direction
    let direction = '';
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    if (angle > -45 && angle <= 45) {
      direction = 'right';
    } else if (angle > 45 && angle <= 135) {
      direction = 'down';
    } else if (angle > 135 || angle <= -135) {
      direction = 'left';
    } else {
      direction = 'up';
    }
    
    // Emit swipe event
    this.events.emit('input:swipe', { 
      direction, 
      distance,
      duration,
      velocity: distance / (duration / 1000),
      startX: this.swipeData.startX,
      startY: this.swipeData.startY,
      endX: this.swipeData.endX,
      endY: this.swipeData.endY
    });
  }
}
