/**
 * Animation utilities for 8BitGE
 * Provides sprite animation and tweening functionality
 * Works across both desktop and mobile platforms
 */

import { Vector2D } from '../types';
import { lerp, lerpVectors, easeInOut, easeIn, easeOut } from './math';

/**
 * Animation frame definition
 */
export interface AnimationFrame {
  /** Position of the frame in the spritesheet (pixel coordinates) */
  x: number;
  /** Position of the frame in the spritesheet (pixel coordinates) */
  y: number;
  /** Width of the frame */
  width: number;
  /** Height of the frame */
  height: number;
  /** Duration of this frame in milliseconds (optional) */
  duration?: number;
  /** Anchor point for this frame (pivot point, defaults to center) */
  anchor?: { x: number; y: number };
  /** Optional metadata for this frame (e.g., collision data) */
  meta?: Record<string, any>;
}

/**
 * Animation definition
 */
export interface Animation {
  /** Unique identifier for this animation */
  id: string;
  /** The frames of the animation */
  frames: AnimationFrame[];
  /** Image/spritesheet to use */
  image: HTMLImageElement | string;
  /** Whether the animation should loop */
  loop?: boolean;
  /** Playback speed multiplier */
  speed?: number;
  /** Whether to ping-pong the animation (play forward then backward) */
  pingPong?: boolean;
  /** Animation tag for categorization */
  tag?: string;
  /** Events to trigger at specific frames */
  events?: Array<{
    /** Frame index to trigger at */
    frame: number;
    /** Event name to emit */
    name: string;
    /** Data to pass with the event */
    data?: any;
  }>;
}

/**
 * Supported easing functions
 */
export enum EasingFunction {
  LINEAR = 'linear',
  EASE_IN = 'easeIn',
  EASE_OUT = 'easeOut',
  EASE_IN_OUT = 'easeInOut',
  CUBIC_IN = 'cubicIn',
  CUBIC_OUT = 'cubicOut',
  CUBIC_IN_OUT = 'cubicInOut',
  ELASTIC_IN = 'elasticIn',
  ELASTIC_OUT = 'elasticOut',
  BOUNCE_IN = 'bounceIn',
  BOUNCE_OUT = 'bounceOut'
}

/**
 * A property tween definition
 */
export interface Tween<T> {
  /** Property to animate */
  property: string;
  /** Starting value */
  from: T;
  /** Target value */
  to: T;
  /** Duration in milliseconds */
  duration: number;
  /** Delay before starting in milliseconds */
  delay?: number;
  /** Easing function to use */
  easing?: EasingFunction;
  /** Whether to yoyo (go back to start value) */
  yoyo?: boolean;
  /** Number of times to repeat (-1 for infinite) */
  repeat?: number;
  /** Callback when the tween completes */
  onComplete?: () => void;
  /** Callback for each update of the tween */
  onUpdate?: (value: T) => void;
}

export class Animator {
  /** The current animation playing */
  private currentAnimation: Animation | null = null;
  /** Current frame index */
  private currentFrameIndex: number = 0;
  /** Time accumulated on current frame */
  private frameTime: number = 0;
  /** Direction of animation (1 = forward, -1 = backward) */
  private direction: number = 1;
  /** Is the animation playing */
  private playing: boolean = false;
  /** Map of available animations by ID */
  private animations: Map<string, Animation> = new Map();
  /** Image cache */
  private images: Map<string, HTMLImageElement> = new Map();
  /** Event handler function */
  private eventHandler: ((name: string, data?: any) => void) | null = null;
  
  /**
   * Register an animation
   */
  registerAnimation(animation: Animation): void {
    this.animations.set(animation.id, animation);
    
    // Load and cache image if it's a string path
    if (typeof animation.image === 'string') {
      this.loadImage(animation.id, animation.image);
    } else {
      // Store the HTMLImageElement directly
      this.images.set(animation.id, animation.image);
    }
  }
  
  /**
   * Register multiple animations
   */
  registerAnimations(animations: Animation[]): void {
    animations.forEach(anim => this.registerAnimation(anim));
  }
  
  /**
   * Load and cache an image
   */
  private loadImage(id: string, path: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(id, img);
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
      img.src = path;
    });
  }
  
  /**
   * Play an animation
   */
  play(animationId: string, resetIfSame: boolean = false): boolean {
    const animation = this.animations.get(animationId);
    
    if (!animation) {
      console.warn(`Animation not found: ${animationId}`);
      return false;
    }
    
    // Check if already playing this animation
    if (this.currentAnimation === animation && !resetIfSame) {
      if (!this.playing) {
        this.playing = true;
      }
      return true;
    }
    
    // Reset animation state
    this.currentAnimation = animation;
    this.currentFrameIndex = 0;
    this.frameTime = 0;
    this.direction = 1;
    this.playing = true;
    
    return true;
  }
  
  /**
   * Pause the current animation
   */
  pause(): void {
    this.playing = false;
  }
  
  /**
   * Resume the current animation
   */
  resume(): void {
    if (this.currentAnimation) {
      this.playing = true;
    }
  }
  
  /**
   * Stop the current animation
   */
  stop(): void {
    this.playing = false;
    this.currentAnimation = null;
    this.currentFrameIndex = 0;
    this.frameTime = 0;
  }
  
  /**
   * Update the animation
   */
  update(deltaTime: number): void {
    if (!this.playing || !this.currentAnimation) {
      return;
    }
    
    const animation = this.currentAnimation;
    const frames = animation.frames;
    
    if (frames.length === 0) {
      return;
    }
    
    // Apply playback speed
    const speed = animation.speed !== undefined ? animation.speed : 1;
    const adjustedDelta = deltaTime * speed;
    
    // Update frame time
    this.frameTime += adjustedDelta;
    
    // Get current frame duration
    const currentFrame = frames[this.currentFrameIndex];
    const frameDuration = currentFrame.duration !== undefined 
      ? currentFrame.duration 
      : 100; // Default 100ms
    
    // Check for frame change
    if (this.frameTime >= frameDuration) {
      // Reset frame time with remainder
      this.frameTime -= frameDuration;
      
      // Handle frame events
      this.processFrameEvents();
      
      // Move to next frame
      const nextFrameIndex = this.currentFrameIndex + this.direction;
      
      // Handle animation boundaries
      if (nextFrameIndex >= frames.length || nextFrameIndex < 0) {
        if (animation.pingPong) {
          // Reverse direction at boundaries
          this.direction *= -1;
          this.currentFrameIndex += this.direction;
        } else if (animation.loop) {
          // Loop to beginning/end
          this.currentFrameIndex = this.direction > 0 ? 0 : frames.length - 1;
        } else {
          // Stop at end
          this.playing = false;
        }
      } else {
        // Standard frame increment/decrement
        this.currentFrameIndex = nextFrameIndex;
      }
    }
  }
  
  /**
   * Process events for the current frame
   */
  private processFrameEvents(): void {
    if (!this.eventHandler || !this.currentAnimation || !this.currentAnimation.events) {
      return;
    }
    
    // Check for events on current frame
    for (const event of this.currentAnimation.events) {
      if (event.frame === this.currentFrameIndex) {
        this.eventHandler(event.name, event.data);
      }
    }
  }
  
  /**
   * Get the current frame
   */
  getCurrentFrame(): AnimationFrame | null {
    if (!this.currentAnimation) {
      return null;
    }
    
    const frames = this.currentAnimation.frames;
    if (frames.length === 0) {
      return null;
    }
    
    return frames[this.currentFrameIndex];
  }
  
  /**
   * Draw the current animation frame to a canvas
   */
  draw(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    options: {
      scale?: number;
      rotation?: number;
      flipX?: boolean;
      flipY?: boolean;
      alpha?: number;
    } = {}
  ): void {
    if (!this.currentAnimation) {
      return;
    }
    
    const frame = this.getCurrentFrame();
    if (!frame) {
      return;
    }
    
    // Get image
    const image = typeof this.currentAnimation.image === 'string' 
      ? this.images.get(this.currentAnimation.id)
      : this.currentAnimation.image;
      
    if (!image) {
      return;
    }
    
    // Default options
    const scale = options.scale ?? 1;
    const rotation = options.rotation ?? 0;
    const flipX = options.flipX ?? false;
    const flipY = options.flipY ?? false;
    const alpha = options.alpha ?? 1;
    
    // Get anchor point (default to center)
    const anchor = frame.anchor ?? { x: 0.5, y: 0.5 };
    const anchorX = frame.width * anchor.x;
    const anchorY = frame.height * anchor.y;
    
    // Save context state
    ctx.save();
    
    // Set alpha
    ctx.globalAlpha = alpha;
    
    // Position, rotate, and scale
    ctx.translate(x, y);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.scale(flipX ? -scale : scale, flipY ? -scale : scale);
    
    // Draw frame
    ctx.drawImage(
      image,
      frame.x, frame.y, frame.width, frame.height,
      -anchorX, -anchorY, frame.width, frame.height
    );
    
    // Restore context
    ctx.restore();
  }
  
  /**
   * Set event handler function
   */
  setEventHandler(handler: (name: string, data?: any) => void): void {
    this.eventHandler = handler;
  }
  
  /**
   * Check if an animation is currently playing
   */
  isPlaying(): boolean {
    return this.playing;
  }
  
  /**
   * Get the current animation ID or null
   */
  getCurrentAnimationId(): string | null {
    return this.currentAnimation?.id ?? null;
  }
  
  /**
   * Get animation progress (0-1)
   */
  getProgress(): number {
    if (!this.currentAnimation || !this.playing) {
      return 0;
    }
    
    const frames = this.currentAnimation.frames;
    if (frames.length <= 1) {
      return 1;
    }
    
    // Calculate frame progress
    const currentFrame = frames[this.currentFrameIndex];
    const frameDuration = currentFrame.duration !== undefined 
      ? currentFrame.duration 
      : 100; // Default 100ms
      
    const frameProgress = this.frameTime / frameDuration;
    
    // Calculate overall progress
    return (this.currentFrameIndex + frameProgress) / frames.length;
  }
}

/**
 * Class to handle tweening of values
 */
export class Tweener {
  private tweens: Map<string, any> = new Map();
  private activeTweens: Array<{
    target: any;
    property: string;
    from: any;
    to: any;
    start: number;
    end: number;
    easing: EasingFunction;
    yoyo: boolean;
    repeat: number;
    onUpdate?: Function;
    onComplete?: Function;
    elapsed: number;
    duration: number;
    delay: number;
    delayElapsed: boolean;
    completed: boolean;
    tweenId: string;
  }> = [];
  
  private nextTweenId = 0;
  
  /**
   * Apply an easing function to a t value (0-1)
   */
  private applyEasing(t: number, easing: EasingFunction): number {
    switch (easing) {
      case EasingFunction.LINEAR:
        return t;
        
      case EasingFunction.EASE_IN:
        return easeIn(t);
        
      case EasingFunction.EASE_OUT:
        return easeOut(t);
        
      case EasingFunction.EASE_IN_OUT:
        return easeInOut(t);
        
      case EasingFunction.CUBIC_IN:
        return t * t * t;
        
      case EasingFunction.CUBIC_OUT:
        return 1 - Math.pow(1 - t, 3);
        
      case EasingFunction.CUBIC_IN_OUT:
        return t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
          
      case EasingFunction.ELASTIC_IN:
        return t === 0
          ? 0
          : t === 1
            ? 1
            : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3));
            
      case EasingFunction.ELASTIC_OUT:
        return t === 0
          ? 0
          : t === 1
            ? 1
            : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
            
      case EasingFunction.BOUNCE_IN:
        return 1 - this.applyEasing(1 - t, EasingFunction.BOUNCE_OUT);
        
      case EasingFunction.BOUNCE_OUT:
        const n1 = 7.5625;
        const d1 = 2.75;
        
        if (t < 1 / d1) {
          return n1 * t * t;
        } else if (t < 2 / d1) {
          return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
          return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
          return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
        
      default:
        return t;
    }
  }
  
  /**
   * Create a new tween
   */
  tween<T>(target: any, tween: Tween<T>): string {
    const tweenId = `tween_${++this.nextTweenId}`;
    
    this.activeTweens.push({
      target,
      property: tween.property,
      from: tween.from,
      to: tween.to,
      start: Date.now() + (tween.delay || 0),
      end: Date.now() + (tween.delay || 0) + tween.duration,
      easing: tween.easing || EasingFunction.LINEAR,
      yoyo: tween.yoyo || false,
      repeat: tween.repeat !== undefined ? tween.repeat : 0,
      onUpdate: tween.onUpdate,
      onComplete: tween.onComplete,
      elapsed: 0,
      duration: tween.duration,
      delay: tween.delay || 0,
      delayElapsed: tween.delay ? false : true,
      completed: false,
      tweenId
    });
    
    this.tweens.set(tweenId, this.activeTweens[this.activeTweens.length - 1]);
    return tweenId;
  }
  
  /**
   * Stop a tween by its ID
   */
  stopTween(tweenId: string): void {
    const index = this.activeTweens.findIndex(t => t.tweenId === tweenId);
    
    if (index >= 0) {
      this.activeTweens.splice(index, 1);
      this.tweens.delete(tweenId);
    }
  }
  
  /**
   * Update all tweens
   */
  update(deltaTime: number): void {
    const now = Date.now();
    
    // Process each active tween
    for (let i = this.activeTweens.length - 1; i >= 0; i--) {
      const tween = this.activeTweens[i];
      
      // Handle delay
      if (!tween.delayElapsed) {
        if (now >= tween.start) {
          tween.delayElapsed = true;
          tween.start = now;
          tween.end = now + tween.duration;
        } else {
          continue;
        }
      }
      
      // Update elapsed time
      tween.elapsed += deltaTime;
      
      // Calculate progress
      let t = Math.min(1, Math.max(0, (now - tween.start) / tween.duration));
      t = this.applyEasing(t, tween.easing);
      
      // Update the value based on type
      if (typeof tween.from === 'number' && typeof tween.to === 'number') {
        // Number interpolation
        tween.target[tween.property] = lerp(tween.from as number, tween.to as number, t);
      } else if (
        typeof tween.from === 'object' && 
        tween.from !== null && 
        typeof tween.to === 'object' && 
        tween.to !== null
      ) {
        // Object interpolation (e.g., Vector2D)
        if ('x' in tween.from && 'y' in tween.from && 'x' in tween.to && 'y' in tween.to) {
          // Vector2D interpolation
          tween.target[tween.property] = lerpVectors(
            tween.from as Vector2D, 
            tween.to as Vector2D, 
            t
          );
        } else {
          // Generic object interpolation
          if (!tween.target[tween.property]) {
            tween.target[tween.property] = {};
          }
          
          for (const key in tween.from) {
            if (
              typeof tween.from[key] === 'number' && 
              typeof tween.to[key] === 'number'
            ) {
              tween.target[tween.property][key] = lerp(
                tween.from[key], 
                tween.to[key], 
                t
              );
            }
          }
        }
      }
      
      // Call onUpdate
      if (tween.onUpdate) {
        tween.onUpdate(tween.target[tween.property]);
      }
      
      // Check if tween is complete
      if (now >= tween.end) {
        // Ensure final value is exactly the target value
        tween.target[tween.property] = tween.to;
        
        // Handle yoyo
        if (tween.yoyo) {
          // Swap from and to
          const temp = tween.from;
          tween.from = tween.to;
          tween.to = temp;
          
          // Reset timing
          tween.start = now;
          tween.end = now + tween.duration;
          
          // Handle repeat
          if (tween.repeat !== -1) { // -1 is infinite
            tween.repeat--;
            if (tween.repeat < 0) {
              tween.completed = true;
            }
          }
        } else if (tween.repeat !== -1) { // -1 is infinite
          tween.repeat--;
          
          if (tween.repeat < 0) {
            tween.completed = true;
          } else {
            // Reset timing for repeat
            tween.start = now;
            tween.end = now + tween.duration;
          }
        } else {
          tween.completed = true;
        }
        
        // Call onComplete if tween is fully completed
        if (tween.completed && tween.onComplete) {
          tween.onComplete();
        }
        
        // Remove completed tween
        if (tween.completed) {
          this.activeTweens.splice(i, 1);
          this.tweens.delete(tween.tweenId);
        }
      }
    }
  }
  
  /**
   * Check if there are any active tweens
   */
  hasActiveTweens(): boolean {
    return this.activeTweens.length > 0;
  }
  
  /**
   * Stop all active tweens
   */
  stopAll(): void {
    this.activeTweens = [];
    this.tweens.clear();
  }
}