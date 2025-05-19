/**
 * Particle System for 8BitGE
 * Handles particle effects and visual flair with efficient pooling
 * Works across both desktop and mobile devices
 */

import { Vector2D } from '../types';
import { random, lerp, clamp } from '../utils/math';

export enum ParticleBlendMode {
  NORMAL = 'source-over',
  ADD = 'lighter',
  MULTIPLY = 'multiply',
  SCREEN = 'screen'
}

export interface ParticleOptions {
  /** Position of the particle */
  position: Vector2D;
  /** Velocity of the particle */
  velocity?: Vector2D;
  /** Acceleration of the particle (e.g. gravity) */
  acceleration?: Vector2D;
  /** Color of the particle (can be string or gradient) */
  color?: string | CanvasGradient | CanvasPattern;
  /** Array of colors for color transitions */
  colors?: string[];
  /** Size of the particle in pixels */
  size?: number | [number, number]; // [start, end]
  /** Particle shape: 'circle', 'square', 'triangle', 'image' */
  shape?: 'circle' | 'square' | 'triangle' | 'image';
  /** Optional image to use for the particle */
  image?: HTMLImageElement;
  /** Rotation of the particle in degrees */
  rotation?: number;
  /** Rotation velocity in degrees per second */
  rotationVelocity?: number;
  /** Opacity of the particle (0-1) */
  opacity?: number | [number, number]; // [start, end]
  /** Lifetime of particle in milliseconds */
  lifetime?: number;
  /** Blend mode for drawing */
  blendMode?: ParticleBlendMode;
  /** Whether to fade out at end of lifetime */
  fadeOut?: boolean;
  /** Function to call on particle creation */
  onStart?: (particle: Particle) => void;
  /** Function to call on each update */
  onUpdate?: (particle: Particle, dt: number) => void;
  /** Function to call when particle expires */
  onEnd?: (particle: Particle) => void;
}

export class Particle {
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  color: string | CanvasGradient | CanvasPattern;
  colors: string[];
  currentColor: string;
  size: number;
  startSize: number;
  endSize: number;
  shape: 'circle' | 'square' | 'triangle' | 'image';
  image?: HTMLImageElement;
  rotation: number;
  rotationVelocity: number;
  opacity: number;
  startOpacity: number;
  endOpacity: number;
  lifetime: number;
  age: number;
  active: boolean;
  blendMode: ParticleBlendMode;
  fadeOut: boolean;
  onStart?: (particle: Particle) => void;
  onUpdate?: (particle: Particle, dt: number) => void;
  onEnd?: (particle: Particle) => void;

  constructor(options: ParticleOptions) {
    this.position = { ...options.position };
    this.velocity = options.velocity ? { ...options.velocity } : { x: 0, y: 0 };
    this.acceleration = options.acceleration ? { ...options.acceleration } : { x: 0, y: 0 };
    
    // Handle size as single number or range
    if (Array.isArray(options.size)) {
      this.startSize = options.size[0];
      this.endSize = options.size[1];
      this.size = this.startSize;
    } else {
      this.size = options.size || 10;
      this.startSize = this.size;
      this.endSize = this.size;
    }
    
    // Handle opacity as single number or range
    if (Array.isArray(options.opacity)) {
      this.startOpacity = options.opacity[0];
      this.endOpacity = options.opacity[1];
      this.opacity = this.startOpacity;
    } else {
      this.opacity = options.opacity !== undefined ? options.opacity : 1;
      this.startOpacity = this.opacity;
      this.endOpacity = this.opacity;
    }
    
    this.color = options.color || '#ffffff';
    this.colors = options.colors || [];
    this.currentColor = this.colors.length > 0 ? this.colors[0] : this.color as string;
    this.shape = options.shape || 'circle';
    this.image = options.image;
    this.rotation = options.rotation || 0;
    this.rotationVelocity = options.rotationVelocity || 0;
    this.lifetime = options.lifetime || 1000;
    this.age = 0;
    this.active = true;
    this.blendMode = options.blendMode || ParticleBlendMode.NORMAL;
    this.fadeOut = options.fadeOut !== undefined ? options.fadeOut : true;
    this.onStart = options.onStart;
    this.onUpdate = options.onUpdate;
    this.onEnd = options.onEnd;
    
    // Call onStart callback
    if (this.onStart) {
      this.onStart(this);
    }
  }

  /**
   * Update the particle state
   */
  update(deltaTime: number): boolean {
    if (!this.active) return false;
    
    // Update age
    this.age += deltaTime;
    
    // Check if particle lifetime is over
    if (this.age >= this.lifetime) {
      this.active = false;
      if (this.onEnd) {
        this.onEnd(this);
      }
      return false;
    }
    
    // Calculate progress through lifetime (0-1)
    const progress = this.age / this.lifetime;
    
    // Update physics
    this.velocity.x += this.acceleration.x * deltaTime / 1000;
    this.velocity.y += this.acceleration.y * deltaTime / 1000;
    
    this.position.x += this.velocity.x * deltaTime / 1000;
    this.position.y += this.velocity.y * deltaTime / 1000;
    
    // Update rotation
    this.rotation += this.rotationVelocity * deltaTime / 1000;
    
    // Interpolate size
    this.size = lerp(this.startSize, this.endSize, progress);
    
    // Interpolate opacity with optional fade out
    if (this.fadeOut) {
      const fadeStart = 0.75; // Start fading at 75% of lifetime
      if (progress > fadeStart) {
        const fadeProgress = (progress - fadeStart) / (1 - fadeStart);
        this.opacity = lerp(
          this.startOpacity + (this.endOpacity - this.startOpacity) * Math.min(progress / fadeStart, 1),
          0,
          fadeProgress
        );
      } else {
        this.opacity = lerp(this.startOpacity, this.endOpacity, progress / fadeStart);
      }
    } else {
      this.opacity = lerp(this.startOpacity, this.endOpacity, progress);
    }
    
    // Update color if using color array
    if (this.colors.length > 1) {
      const colorIndex = Math.floor(progress * (this.colors.length - 1));
      const colorProgress = (progress * (this.colors.length - 1)) % 1;
      
      if (colorIndex < this.colors.length - 1) {
        // Attempt to interpolate between colors
        this.currentColor = this.lerpColor(
          this.colors[colorIndex], 
          this.colors[colorIndex + 1], 
          colorProgress
        );
      } else {
        this.currentColor = this.colors[this.colors.length - 1];
      }
    }
    
    // Call custom update function if provided
    if (this.onUpdate) {
      this.onUpdate(this, deltaTime);
    }
    
    return true;
  }

  /**
   * Draw the particle to a canvas context
   */
  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.active || this.opacity <= 0) return;
    
    // Save context state
    ctx.save();
    
    // Set blend mode
    ctx.globalCompositeOperation = this.blendMode;
    
    // Set opacity
    ctx.globalAlpha = clamp(this.opacity, 0, 1);
    
    // Translate and rotate
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation * Math.PI / 180);
    
    // Set fill style
    ctx.fillStyle = this.color instanceof CanvasGradient || this.color instanceof CanvasPattern 
      ? this.color 
      : this.currentColor;
    
    // Draw based on shape
    switch (this.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'square':
        const halfSize = this.size / 2;
        ctx.fillRect(-halfSize, -halfSize, this.size, this.size);
        break;
        
      case 'triangle':
        const height = this.size * Math.sqrt(3) / 2;
        ctx.beginPath();
        ctx.moveTo(0, -height / 2);
        ctx.lineTo(-this.size / 2, height / 2);
        ctx.lineTo(this.size / 2, height / 2);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'image':
        if (this.image) {
          ctx.drawImage(
            this.image, 
            -this.size / 2, 
            -this.size / 2, 
            this.size, 
            this.size
          );
        }
        break;
    }
    
    // Restore context state
    ctx.restore();
  }

  /**
   * Reset the particle with new options
   */
  reset(options: ParticleOptions): void {
    this.position = { ...options.position };
    this.velocity = options.velocity ? { ...options.velocity } : { x: 0, y: 0 };
    this.acceleration = options.acceleration ? { ...options.acceleration } : { x: 0, y: 0 };
    
    // Handle size as single number or range
    if (Array.isArray(options.size)) {
      this.startSize = options.size[0];
      this.endSize = options.size[1];
      this.size = this.startSize;
    } else {
      this.size = options.size || 10;
      this.startSize = this.size;
      this.endSize = this.size;
    }
    
    // Handle opacity as single number or range
    if (Array.isArray(options.opacity)) {
      this.startOpacity = options.opacity[0];
      this.endOpacity = options.opacity[1];
      this.opacity = this.startOpacity;
    } else {
      this.opacity = options.opacity !== undefined ? options.opacity : 1;
      this.startOpacity = this.opacity;
      this.endOpacity = this.opacity;
    }
    
    this.color = options.color || '#ffffff';
    this.colors = options.colors || [];
    this.currentColor = this.colors.length > 0 ? this.colors[0] : this.color as string;
    this.shape = options.shape || 'circle';
    this.image = options.image;
    this.rotation = options.rotation || 0;
    this.rotationVelocity = options.rotationVelocity || 0;
    this.lifetime = options.lifetime || 1000;
    this.age = 0;
    this.active = true;
    this.blendMode = options.blendMode || ParticleBlendMode.NORMAL;
    this.fadeOut = options.fadeOut !== undefined ? options.fadeOut : true;
    this.onStart = options.onStart;
    this.onUpdate = options.onUpdate;
    this.onEnd = options.onEnd;
    
    // Call onStart callback
    if (this.onStart) {
      this.onStart(this);
    }
  }

  /**
   * Linear interpolation between two colors
   */
  private lerpColor(color1: string, color2: string, amount: number): string {
    // Parse colors to RGB
    const parseColor = (color: string): number[] => {
      if (color.startsWith('#')) {
        const hex = color.substring(1);
        return [
          parseInt(hex.substring(0, 2), 16),
          parseInt(hex.substring(2, 4), 16),
          parseInt(hex.substring(4, 6), 16)
        ];
      } else if (color.startsWith('rgba')) {
        return color.match(/[\d.]+/g)?.map(Number).slice(0, 3) || [255, 255, 255];
      } else if (color.startsWith('rgb')) {
        return color.match(/\d+/g)?.map(Number).slice(0, 3) || [255, 255, 255];
      }
      return [255, 255, 255]; // Default white
    };
    
    const c1 = parseColor(color1);
    const c2 = parseColor(color2);
    
    const r = Math.round(lerp(c1[0], c2[0], amount));
    const g = Math.round(lerp(c1[1], c2[1], amount));
    const b = Math.round(lerp(c1[2], c2[2], amount));
    
    return `rgb(${r}, ${g}, ${b})`;
  }
}

export interface EmitterOptions {
  /** Position of the emitter */
  position: Vector2D;
  /** Whether the emitter should follow a target position */
  followTarget?: boolean;
  /** Rate of particle emission (particles per second) */
  emissionRate: number;
  /** Burst count - emit this many particles at once */
  burstCount?: number;
  /** Maximum active particles at once (0 for unlimited) */
  maxParticles?: number;
  /** Duration in ms that the emitter should run (0 for infinite) */
  duration?: number;
  /** Whether to loop the emitter when duration ends */
  loop?: boolean;
  /** Base particle options - will be extended/randomized */
  particleOptions: Omit<ParticleOptions, 'position'>;
  /** Random variance to apply to particle position */
  positionVariance?: Vector2D;
  /** Random variance to apply to particle velocity */
  velocityVariance?: Vector2D;
  /** Random variance to apply to particle size */
  sizeVariance?: number;
  /** Random variance to apply to particle lifetime */
  lifetimeVariance?: number;
  /** Random variance to apply to particle color (hue shift degrees) */
  colorVariance?: number;
}

export class ParticleEmitter {
  position: Vector2D;
  followTarget: boolean;
  emissionRate: number;
  burstCount: number;
  maxParticles: number;
  duration: number;
  loop: boolean;
  particleOptions: Omit<ParticleOptions, 'position'>;
  positionVariance: Vector2D;
  velocityVariance: Vector2D;
  sizeVariance: number;
  lifetimeVariance: number;
  colorVariance: number;
  
  private active: boolean = false;
  private age: number = 0;
  private emissionAccumulator: number = 0;
  private particles: Particle[] = [];

  constructor(options: EmitterOptions) {
    this.position = { ...options.position };
    this.followTarget = options.followTarget || false;
    this.emissionRate = options.emissionRate;
    this.burstCount = options.burstCount || 0;
    this.maxParticles = options.maxParticles || 0;
    this.duration = options.duration || 0;
    this.loop = options.loop || false;
    this.particleOptions = { ...options.particleOptions };
    this.positionVariance = options.positionVariance || { x: 0, y: 0 };
    this.velocityVariance = options.velocityVariance || { x: 0, y: 0 };
    this.sizeVariance = options.sizeVariance || 0;
    this.lifetimeVariance = options.lifetimeVariance || 0;
    this.colorVariance = options.colorVariance || 0;
  }

  /**
   * Start the emitter
   */
  start(): void {
    this.active = true;
    this.age = 0;
    
    // Initial burst if specified
    if (this.burstCount > 0) {
      this.burst(this.burstCount);
    }
  }

  /**
   * Stop the emitter
   */
  stop(): void {
    this.active = false;
  }

  /**
   * Emit a burst of particles
   */
  burst(count: number): void {
    for (let i = 0; i < count; i++) {
      // Check max particles limit
      if (this.maxParticles > 0 && this.particles.length >= this.maxParticles) {
        return;
      }
      
      this.emitParticle();
    }
  }

  /**
   * Update emitter and all its particles
   */
  update(deltaTime: number): void {
    if (!this.active) return;
    
    // Update emitter age
    this.age += deltaTime;
    
    // Check if duration expired
    if (this.duration > 0 && this.age >= this.duration) {
      if (this.loop) {
        this.age = 0;
        // Emit burst when looping if specified
        if (this.burstCount > 0) {
          this.burst(this.burstCount);
        }
      } else {
        this.active = false;
        return;
      }
    }
    
    // Calculate how many particles to emit this frame
    if (this.active && this.emissionRate > 0) {
      this.emissionAccumulator += (this.emissionRate * deltaTime) / 1000;
      
      const particlesToEmit = Math.floor(this.emissionAccumulator);
      this.emissionAccumulator -= particlesToEmit;
      
      // Emit calculated number of particles
      for (let i = 0; i < particlesToEmit; i++) {
        // Check max particles limit
        if (this.maxParticles > 0 && this.particles.length >= this.maxParticles) {
          break;
        }
        
        this.emitParticle();
      }
    }
    
    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update the particle
      const isAlive = particle.update(deltaTime);
      
      // Remove inactive particles
      if (!isAlive) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Draw all particles to canvas
   */
  draw(ctx: CanvasRenderingContext2D): void {
    // Draw all active particles
    for (const particle of this.particles) {
      particle.draw(ctx);
    }
  }

  /**
   * Set the emitter position
   */
  setPosition(position: Vector2D): void {
    this.position = { ...position };
  }

  /**
   * Get the current number of active particles
   */
  getParticleCount(): number {
    return this.particles.length;
  }

  /**
   * Check if the emitter is currently active
   */
  isActive(): boolean {
    return this.active || this.particles.length > 0;
  }

  /**
   * Remove all particles
   */
  clear(): void {
    this.particles = [];
  }

  /**
   * Create and emit a single particle with variation
   */
  private emitParticle(): void {
    // Apply position variance
    const position = {
      x: this.position.x + random(-this.positionVariance.x, this.positionVariance.x),
      y: this.position.y + random(-this.positionVariance.y, this.positionVariance.y),
    };
    
    // Clone base particle options
    const baseOptions = { ...this.particleOptions };
    
    // Apply velocity variance if defined
    if (baseOptions.velocity && this.velocityVariance) {
      baseOptions.velocity = {
        x: baseOptions.velocity.x + random(-this.velocityVariance.x, this.velocityVariance.x),
        y: baseOptions.velocity.y + random(-this.velocityVariance.y, this.velocityVariance.y),
      };
    }
    
    // Apply size variance if defined
    if (this.sizeVariance > 0) {
      if (Array.isArray(baseOptions.size)) {
        baseOptions.size = [
          baseOptions.size[0] * random(1 - this.sizeVariance, 1 + this.sizeVariance),
          baseOptions.size[1] * random(1 - this.sizeVariance, 1 + this.sizeVariance),
        ];
      } else if (baseOptions.size !== undefined) {
        baseOptions.size = baseOptions.size * random(1 - this.sizeVariance, 1 + this.sizeVariance);
      }
    }
    
    // Apply lifetime variance if defined
    if (this.lifetimeVariance > 0 && baseOptions.lifetime !== undefined) {
      baseOptions.lifetime = baseOptions.lifetime * random(1 - this.lifetimeVariance, 1 + this.lifetimeVariance);
    }
    
    // Create the particle
    const particle = new Particle({
      ...baseOptions,
      position,
    });
    
    // Add to particle list
    this.particles.push(particle);
  }
}

export interface PresetOptions {
  position: Vector2D;
  color?: string | string[];
  scale?: number;
}

export class ParticleSystem {
  private emitters: Map<string, ParticleEmitter> = new Map();
  private presets: Map<string, (options: PresetOptions) => EmitterOptions> = new Map();
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private lastUpdateTime: number = 0;
  private images: Map<string, HTMLImageElement> = new Map();
  private autoResizeObserver: ResizeObserver | null = null;

  constructor() {
    // Register default presets
    this.registerDefaultPresets();
  }

  /**
   * Initialize the particle system with a canvas
   */
  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Ensure canvas is sized correctly
    this.resizeCanvas();
    
    // Set up auto-resize if ResizeObserver is available
    if (typeof ResizeObserver !== 'undefined') {
      this.autoResizeObserver = new ResizeObserver(() => this.resizeCanvas());
      this.autoResizeObserver.observe(canvas);
    }
    
    // Start the update loop
    this.lastUpdateTime = performance.now();
    this.update();
  }

  /**
   * Create a new emitter with the given options
   */
  createEmitter(id: string, options: EmitterOptions): ParticleEmitter {
    const emitter = new ParticleEmitter(options);
    this.emitters.set(id, emitter);
    return emitter;
  }

  /**
   * Create an emitter from a preset
   */
  createEmitterFromPreset(id: string, presetName: string, options: PresetOptions): ParticleEmitter | null {
    const presetFn = this.presets.get(presetName);
    if (!presetFn) {
      console.warn(`Particle preset not found: ${presetName}`);
      return null;
    }
    
    const emitterOptions = presetFn(options);
    return this.createEmitter(id, emitterOptions);
  }

  /**
   * Get an existing emitter by ID
   */
  getEmitter(id: string): ParticleEmitter | undefined {
    return this.emitters.get(id);
  }

  /**
   * Remove an emitter
   */
  removeEmitter(id: string): boolean {
    return this.emitters.delete(id);
  }

  /**
   * Update all emitters
   */
  private update(): void {
    const now = performance.now();
    const deltaTime = now - this.lastUpdateTime;
    this.lastUpdateTime = now;
    
    // Clear canvas if we have a context
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Update and draw all emitters
      this.emitters.forEach(emitter => {
        emitter.update(deltaTime);
        emitter.draw(this.ctx!);
      });
    }
    
    // Request next frame
    requestAnimationFrame(() => this.update());
  }

  /**
   * Load an image for use with image particles
   */
  loadImage(id: string, src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(id, img);
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Failed to load particle image: ${src}`));
      img.src = src;
    });
  }

  /**
   * Get a loaded image by ID
   */
  getImage(id: string): HTMLImageElement | undefined {
    return this.images.get(id);
  }

  /**
   * Register a new particle effect preset
   */
  registerPreset(
    name: string, 
    presetFn: (options: PresetOptions) => EmitterOptions
  ): void {
    this.presets.set(name, presetFn);
  }

  /**
   * Handle canvas resizing
   */
  private resizeCanvas(): void {
    if (!this.canvas) return;
    
    // Match canvas size to its display size
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  /**
   * Register default particle effect presets
   */
  private registerDefaultPresets(): void {
    // Explosion effect
    this.registerPreset('explosion', (options: PresetOptions) => {
      const scale = options.scale || 1;
      return {
        position: options.position,
        emissionRate: 0,
        burstCount: 30 * scale,
        maxParticles: 30 * scale,
        duration: 0,
        particleOptions: {
          velocity: { x: 0, y: 0 },
          acceleration: { x: 0, y: 0 },
          color: options.color || ['#ff5500', '#ffcc00'],
          size: [10 * scale, 5 * scale],
          shape: 'circle',
          opacity: [1, 0],
          lifetime: 800,
          blendMode: ParticleBlendMode.ADD,
          fadeOut: true
        },
        velocityVariance: { x: 400 * scale, y: 400 * scale },
        positionVariance: { x: 5 * scale, y: 5 * scale },
        lifetimeVariance: 0.2,
        sizeVariance: 0.5
      };
    });
    
    // Confetti effect
    this.registerPreset('confetti', (options: PresetOptions) => {
      const scale = options.scale || 1;
      const colors = options.color 
        ? Array.isArray(options.color) 
          ? options.color 
          : [options.color] 
        : ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
      
      return {
        position: options.position,
        emissionRate: 20 * scale,
        maxParticles: 100 * scale,
        duration: 3000,
        particleOptions: {
          velocity: { x: 0, y: -100 * scale },
          acceleration: { x: 0, y: 98 * scale }, // Light gravity
          color: colors[0],
          colors: colors,
          size: 8 * scale,
          shape: 'square',
          rotation: 0,
          rotationVelocity: 50,
          opacity: 1,
          lifetime: 3000,
          fadeOut: false
        },
        velocityVariance: { x: 100 * scale, y: 50 * scale },
        positionVariance: { x: 50 * scale, y: 0 },
        lifetimeVariance: 0.2,
        sizeVariance: 0.3
      };
    });
    
    // Sparkles effect
    this.registerPreset('sparkles', (options: PresetOptions) => {
      const scale = options.scale || 1;
      return {
        position: options.position,
        emissionRate: 10 * scale,
        maxParticles: 30 * scale,
        duration: 0,
        loop: true,
        particleOptions: {
          velocity: { x: 0, y: -20 * scale },
          acceleration: { x: 0, y: 0 },
          color: options.color || '#ffffff',
          size: [3 * scale, 1 * scale],
          shape: 'circle',
          opacity: [1, 0],
          lifetime: 1000,
          blendMode: ParticleBlendMode.ADD,
          fadeOut: true
        },
        velocityVariance: { x: 20 * scale, y: 10 * scale },
        positionVariance: { x: 20 * scale, y: 20 * scale },
        lifetimeVariance: 0.5,
        sizeVariance: 0.5
      };
    });
    
    // Fire effect
    this.registerPreset('fire', (options: PresetOptions) => {
      const scale = options.scale || 1;
      return {
        position: options.position,
        emissionRate: 25 * scale,
        maxParticles: 50 * scale,
        duration: 0,
        loop: true,
        particleOptions: {
          velocity: { x: 0, y: -60 * scale },
          acceleration: { x: 0, y: -20 * scale },
          color: options.color || ['#ff4400', '#ff8800', '#ffcc00'],
          size: [15 * scale, 5 * scale],
          shape: 'circle',
          opacity: [0.8, 0],
          lifetime: 1200,
          blendMode: ParticleBlendMode.ADD,
          fadeOut: true
        },
        velocityVariance: { x: 10 * scale, y: 20 * scale },
        positionVariance: { x: 10 * scale, y: 0 },
        lifetimeVariance: 0.2,
        sizeVariance: 0.25
      };
    });
    
    // Smoke effect
    this.registerPreset('smoke', (options: PresetOptions) => {
      const scale = options.scale || 1;
      return {
        position: options.position,
        emissionRate: 5 * scale,
        maxParticles: 20 * scale,
        duration: 0,
        loop: true,
        particleOptions: {
          velocity: { x: 0, y: -15 * scale },
          acceleration: { x: 0, y: -5 * scale },
          color: options.color || ['#333333', '#555555', '#777777'],
          size: [20 * scale, 40 * scale],
          shape: 'circle',
          opacity: [0.3, 0],
          lifetime: 3000,
          blendMode: ParticleBlendMode.NORMAL,
          fadeOut: true
        },
        velocityVariance: { x: 8 * scale, y: 3 * scale },
        positionVariance: { x: 5 * scale, y: 5 * scale },
        lifetimeVariance: 0.2,
        sizeVariance: 0.2
      };
    });
    
    // Rain effect
    this.registerPreset('rain', (options: PresetOptions) => {
      const scale = options.scale || 1;
      return {
        position: { x: options.position.x, y: 0 }, // Start from top
        emissionRate: 50 * scale,
        maxParticles: 200 * scale,
        duration: 0,
        loop: true,
        followTarget: true, // Follow the x position of emitter
        particleOptions: {
          velocity: { x: -20 * scale, y: 300 * scale },
          acceleration: { x: 0, y: 50 * scale },
          color: options.color || '#aaccff',
          size: [2 * scale, 2 * scale],
          shape: 'line',
          rotation: 20, // Slight angle for rain
          opacity: [0.5, 0.3],
          lifetime: 1200,
          blendMode: ParticleBlendMode.NORMAL,
          fadeOut: false
        },
        velocityVariance: { x: 10 * scale, y: 30 * scale },
        positionVariance: { x: 150 * scale, y: 0 },
        lifetimeVariance: 0.3,
        sizeVariance: 0.5
      };
    });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Stop resize observer if exists
    if (this.autoResizeObserver && this.canvas) {
      this.autoResizeObserver.unobserve(this.canvas);
      this.autoResizeObserver.disconnect();
    }
    
    // Clear all emitters
    this.emitters.clear();
    
    // Clean up images
    this.images.clear();
  }
}
