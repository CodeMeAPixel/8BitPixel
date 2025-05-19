import { GameConfig, GameOptions, GameState, GameStatus, Vector2D, Platform, OrientationMode } from './types';
import { EventEmitter } from './utils/eventEmitter';
import { AchievementSystem } from './systems/achievements';
import { LeaderboardSystem } from './systems/leaderboard';
import { StorageSystem } from './systems/storage';
import { InputSystem } from './systems/input';
import { AudioSystem } from './systems/audio';
import { ParticleSystem } from './systems/particles';

/**
 * Core Game Engine class
 * Manages the game loop, state, and systems
 * Provides cross-platform compatibility for mobile and desktop
 */
export class GameEngine {
  private config: GameConfig;
  private lastFrameTime: number = 0;
  private animationFrameId: number = 0;
  private events: EventEmitter;
  private gameElement: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private visibilityChangeHandler: () => void;
  private platform: Platform;
  private orientationHandler: () => void;
  private pixelRatio: number = 1;
  private paused: boolean = false;
  
  // Game state
  state: GameState;
  
  // Systems
  achievements: AchievementSystem;
  leaderboard: LeaderboardSystem;
  storage: StorageSystem;
  input: InputSystem;
  audio: AudioSystem;
  particles: ParticleSystem;
  
  constructor(options: GameOptions) {
    // Set up configuration with defaults
    this.config = {
      gameId: options.gameId,
      element: options.element,
      width: options.width || 800,
      height: options.height || 600,
      fps: options.fps || 60,
      debug: options.debug || false,
      pixelPerfect: options.pixelPerfect ?? true,
      persistState: options.persistState ?? true,
      orientation: options.orientation || OrientationMode.BOTH,
      responsive: options.responsive ?? true,
      pixelRatio: options.pixelRatio ?? window.devicePixelRatio || 1,
      allowPause: options.allowPause ?? true,
      fullscreenOnMobile: options.fullscreenOnMobile ?? true
    };
    
    // Initialize state
    this.state = {
      status: GameStatus.IDLE,
      score: 0,
      level: 1,
      timer: 0,
      entities: [],
      custom: {},
    };
    
    // Set up event system
    this.events = new EventEmitter();
    
    // Detect platform
    this.platform = this.detectPlatform();
    
    // Store pixel ratio for rendering
    this.pixelRatio = this.config.pixelRatio;
    
    // Initialize the game element
    if (typeof options.element === 'string') {
      this.gameElement = document.getElementById(options.element);
    } else if (options.element instanceof HTMLElement) {
      this.gameElement = options.element;
    }
    
    // Set up canvas if we have a game element
    if (this.gameElement) {
      this.setupCanvas();
    }
    
    // Initialize systems
    this.achievements = new AchievementSystem(this.events, options.achievements);
    this.leaderboard = new LeaderboardSystem(this.events, options.gameId);
    this.storage = new StorageSystem(this.config.gameId, this.config.persistState);
    this.input = new InputSystem(this.events, {
      preventDefaults: true,
      enableSwipe: true,
      preventScroll: this.platform.isMobile
    });
    this.audio = new AudioSystem(this.events, {
      autoUnlock: true,
      autoSuspend: true,
      ...options.audioOptions
    });
    this.particles = new ParticleSystem();
    
    // Try to restore previous state if persistence is enabled
    if (this.config.persistState) {
      const savedState = this.storage.getItem('gameState');
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          // Merge saved state with default state
          this.state = { ...this.state, ...parsedState };
        } catch (e) {
          console.error('Failed to parse saved game state', e);
        }
      }
    }
    
    // Set up window resize handling for responsive design
    if (this.config.responsive) {
      this.setupResizeHandling();
    }
    
    // Set up visibility change handling (pause when tab/window inactive)
    if (this.config.allowPause) {
      this.setupVisibilityHandling();
    }
    
    // Setup orientation handling
    this.setupOrientationHandling();
    
    // Initialize systems that need DOM elements
    this.initSystems();
  }
  
  /**
   * Initialize systems that need DOM elements
   */
  private initSystems(): void {
    // Initialize input system with the game element
    if (this.gameElement) {
      this.input.init(this.gameElement);
    }
    
    // Initialize audio system
    this.audio.init();
    
    // Initialize particle system with canvas if available
    if (this.canvas) {
      this.particles.init(this.canvas);
    }
    
    // Create virtual joystick for mobile if needed
    if (this.platform.isMobile && this.gameElement) {
      this.input.createVirtualJoystick({
        size: 120,
        alpha: 0.6,
        position: { 
          x: 120, 
          y: this.config.height - 120 
        }
      });
    }
  }
  
  /**
   * Detect the current platform
   */
  private detectPlatform(): Platform {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    // Check if mobile
    const isMobile = Boolean(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
      (typeof window.orientation !== "undefined")
    );
    
    // Check if iOS specifically
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    
    // Check if Android specifically
    const isAndroid = /Android/i.test(userAgent);
    
    // Check for specific browsers
    const isChrome = /Chrome/i.test(userAgent);
    const isSafari = /Safari/i.test(userAgent) && !isChrome;
    const isFirefox = /Firefox/i.test(userAgent);
    const isEdge = /Edg/i.test(userAgent);
    
    // Check for touch support
    const hasTouch = 'ontouchstart' in window || 
                     navigator.maxTouchPoints > 0 || 
                     (navigator as any).msMaxTouchPoints > 0;
    
    // Detect if this is a PWA display mode
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                 (window.navigator as any).standalone === true;
    
    return {
      isMobile,
      isDesktop: !isMobile,
      isIOS,
      isAndroid,
      isChrome,
      isSafari,
      isFirefox,
      isEdge,
      hasTouch,
      isPWA,
      pixelRatio: window.devicePixelRatio || 1
    };
  }
  
  /**
   * Set up the canvas element
   */
  private setupCanvas(): void {
    if (!this.gameElement) return;
    
    // Create canvas if it doesn't exist
    let canvas = this.gameElement.querySelector('canvas');
    
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.style.display = 'block';
      this.gameElement.appendChild(canvas);
    }
    
    this.canvas = canvas as HTMLCanvasElement;
    this.context = this.canvas.getContext('2d');
    
    // Apply initial size
    this.resizeCanvas();
  }
  
  /**
   * Set up responsive resize handling
   */
  private setupResizeHandling(): void {
    // Set up resize observer if available
    if (typeof ResizeObserver !== 'undefined' && this.gameElement) {
      this.resizeObserver = new ResizeObserver(() => {
        this.resizeCanvas();
      });
      
      this.resizeObserver.observe(this.gameElement);
    } else {
      // Fallback to window resize event
      window.addEventListener('resize', () => this.resizeCanvas());
    }
  }
  
  /**
   * Set up visibility change handling
   */
  private setupVisibilityHandling(): void {
    this.visibilityChangeHandler = () => {
      if (document.hidden) {
        // Auto-pause when page becomes hidden
        if (this.state.status === GameStatus.RUNNING && this.config.allowPause) {
          this.paused = true;
          this.pause();
          
          // Also pause audio
          this.audio.pauseAll();
        }
      } else {
        // Auto-resume when page becomes visible again
        if (this.paused && this.state.status === GameStatus.PAUSED) {
          this.paused = false;
          this.resume();
          
          // Resume audio
          this.audio.resumeAll();
        }
      }
    };
    
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }
  
  /**
   * Set up orientation change handling
   */
  private setupOrientationHandling(): void {
    if (!this.platform.isMobile) return;
    
    this.orientationHandler = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      
      // Check if current orientation matches allowed orientation
      const orientationMismatch = (
        (this.config.orientation === OrientationMode.LANDSCAPE && !isLandscape) ||
        (this.config.orientation === OrientationMode.PORTRAIT && isLandscape)
      );
      
      if (orientationMismatch) {
        // Show orientation change message
        this.showOrientationMessage();
        
        // Pause the game
        if (this.state.status === GameStatus.RUNNING) {
          this.pause();
        }
      } else {
        // Hide orientation message if visible
        this.hideOrientationMessage();
        
        // Resize canvas for new orientation
        this.resizeCanvas();
      }
    };
    
    // Listen for orientation changes
    window.addEventListener('orientationchange', this.orientationHandler);
    window.addEventListener('resize', this.orientationHandler);
    
    // Initial check
    this.orientationHandler();
  }
  
  /**
   * Show orientation change message
   */
  private showOrientationMessage(): void {
    if (!this.gameElement) return;
    
    let msg = this.gameElement.querySelector('.orientation-message');
    if (!msg) {
      msg = document.createElement('div');
      msg.className = 'orientation-message';
      msg.style.position = 'absolute';
      msg.style.top = '0';
      msg.style.left = '0';
      msg.style.width = '100%';
      msg.style.height = '100%';
      msg.style.display = 'flex';
      msg.style.flexDirection = 'column';
      msg.style.alignItems = 'center';
      msg.style.justifyContent = 'center';
      msg.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      msg.style.color = 'white';
      msg.style.zIndex = '1000';
      
      const icon = document.createElement('div');
      icon.innerHTML = this.config.orientation === OrientationMode.LANDSCAPE 
        ? '↔️' // Landscape icon
        : '↕️'; // Portrait icon
      icon.style.fontSize = '64px';
      icon.style.marginBottom = '20px';
      
      const text = document.createElement('p');
      text.innerText = this.config.orientation === OrientationMode.LANDSCAPE
        ? 'Please rotate your device to landscape mode'
        : 'Please rotate your device to portrait mode';
      text.style.fontSize = '18px';
      text.style.fontFamily = 'sans-serif';
      text.style.textAlign = 'center';
      text.style.padding = '0 20px';
      
      msg.appendChild(icon);
      msg.appendChild(text);
      this.gameElement.appendChild(msg);
    } else {
      (msg as HTMLElement).style.display = 'flex';
    }
  }
  
  /**
   * Hide orientation change message
   */
  private hideOrientationMessage(): void {
    if (!this.gameElement) return;
    
    const msg = this.gameElement.querySelector('.orientation-message');
    if (msg) {
      (msg as HTMLElement).style.display = 'none';
    }
  }
  
  /**
   * Resize the canvas to match container or window
   */
  private resizeCanvas(): void {
    if (!this.canvas || !this.gameElement) return;
    
    // Get the container size
    const containerWidth = this.gameElement.clientWidth;
    const containerHeight = this.gameElement.clientHeight;
    
    // Calculate scale to maintain aspect ratio
    const targetRatio = this.config.width / this.config.height;
    let width = containerWidth;
    let height = width / targetRatio;
    
    if (height > containerHeight) {
      height = containerHeight;
      width = height * targetRatio;
    }
    
    // Set canvas display size
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    
    // Set canvas drawing buffer size for pixel perfection if enabled
    if (this.config.pixelPerfect) {
      // Use device pixel ratio for high-DPI displays
      const scale = this.pixelRatio;
      this.canvas.width = Math.floor(width * scale);
      this.canvas.height = Math.floor(height * scale);
      
      // Apply scale to context if we have one
      if (this.context) {
        this.context.setTransform(scale, 0, 0, scale, 0, 0);
      }
    } else {
      // Just match the display size
      this.canvas.width = Math.floor(width);
      this.canvas.height = Math.floor(height);
    }
    
    // Emit resize event
    this.events.emit('resize', { 
      width, 
      height, 
      pixelRatio: this.pixelRatio
    });
  }
  
  /**
   * Start the game
   */
  start(): void {
    if (this.state.status === GameStatus.RUNNING) return;
    
    this.state.status = GameStatus.RUNNING;
    this.lastFrameTime = performance.now();
    this.events.emit('gameStart', {});
    
    // Start the game loop
    this.gameLoop();
  }
  
  /**
   * Pause the game
   */
  pause(): void {
    if (this.state.status !== GameStatus.RUNNING) return;
    
    this.state.status = GameStatus.PAUSED;
    this.events.emit('gamePause', {});
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
  
  /**
   * Resume the game from a paused state
   */
  resume(): void {
    if (this.state.status !== GameStatus.PAUSED) return;
    
    this.state.status = GameStatus.RUNNING;
    this.lastFrameTime = performance.now();
    this.events.emit('gameResume', {});
    
    // Resume the game loop
    this.gameLoop();
  }
  
  /**
   * End the game
   */
  end(finalScore?: number): void {
    if (this.state.status === GameStatus.ENDED) return;
    
    const score = finalScore !== undefined ? finalScore : this.state.score;
    
    this.state.status = GameStatus.ENDED;
    this.events.emit('gameEnd', { score });
    
    // Submit score to leaderboard
    this.leaderboard.submitScore(score);
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    // Persist final game state if enabled
    if (this.config.persistState) {
      this.saveState();
    }
  }
  
  /**
   * Reset the game to initial state
   */
  reset(): void {
    this.state = {
      status: GameStatus.IDLE,
      score: 0,
      level: 1,
      timer: 0,
      entities: [],
      custom: {},
    };
    
    this.events.emit('gameReset', {});
    
    // Clear stored state if persistence is enabled
    if (this.config.persistState) {
      this.storage.removeItem('gameState');
    }
  }
  
  /**
   * Save the current game state
   */
  saveState(): void {
    if (!this.config.persistState) return;
    
    try {
      // Clone the state and remove any circular references or functions
      const stateCopy = JSON.parse(JSON.stringify(this.state));
      this.storage.setItem('gameState', JSON.stringify(stateCopy));
    } catch (e) {
      console.error('Failed to save game state', e);
    }
  }
  
  /**
   * Main game loop
   */
  private gameLoop(): void {
    if (this.state.status !== GameStatus.RUNNING) return;
    
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
    this.lastFrameTime = currentTime;
    
    // Update game state
    this.update(deltaTime);
    
    // Render game
    this.render();
    
    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }
  
  /**
   * Update game state
   */
  update(deltaTime: number): void {
    if (this.state.status !== GameStatus.RUNNING) return;
    
    // Update timer
    this.state.timer += deltaTime;
    
    // Update input state
    this.input.update();
    
    // Update all entities
    for (const entity of this.state.entities) {
      if (entity.update) {
        entity.update(deltaTime, this);
      }
    }
    
    // Update particle effects
    this.particles.update(deltaTime);
    
    // Emit update event for game-specific logic
    this.events.emit('update', { deltaTime });
    
    // Check achievements
    this.achievements.check(this.state);
  }
  
  /**
   * Render the game
   */
  render(): void {
    // Emit render event for game-specific rendering
    this.events.emit('render', { context: null });
  }
  
  /**
   * Add an entity to the game
   */
  addEntity(entity: any): void {
    this.state.entities.push(entity);
    this.events.emit('entityAdded', { entity });
  }
  
  /**
   * Remove an entity from the game
   */
  removeEntity(entity: any): void {
    const index = this.state.entities.indexOf(entity);
    if (index !== -1) {
      this.state.entities.splice(index, 1);
      this.events.emit('entityRemoved', { entity });
    }
  }
  
  /**
   * Register an event listener
   */
  on(event: string, callback: Function): void {
    this.events.on(event, callback);
  }
  
  /**
   * Remove an event listener
   */
  off(event: string, callback: Function): void {
    this.events.off(event, callback);
  }
  
  /**
   * Get configuration
   */
  getConfig(): GameConfig {
    return { ...this.config };
  }
}

export const createGame = (options: GameOptions): GameEngine => {
  return new GameEngine(options);
};
