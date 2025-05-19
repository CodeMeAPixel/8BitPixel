/**
 * Audio System for 8BitGE
 * Handles sound effects and background music
 */

import { EventEmitter } from '../utils/eventEmitter';
import { AudioOptions } from '../types';

export class AudioSystem {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private music: Map<string, HTMLAudioElement> = new Map();
  private currentMusic: HTMLAudioElement | null = null;
  private events: EventEmitter;
  private options: Required<AudioOptions>;
  private audioContext: AudioContext | null = null;
  private unlocked: boolean = false;
  
  constructor(events: EventEmitter, options: AudioOptions = {}) {
    this.events = events;
    
    // Set default options
    this.options = {
      muted: options.muted ?? false,
      volume: options.volume ?? 1.0,
      sounds: options.sounds || {},
      autoUnlock: options.autoUnlock ?? true,
      autoSuspend: options.autoSuspend ?? true
    };
    
    // Listen for game pause/resume events
    this.events.on('gamePause', () => this.handleGamePause());
    this.events.on('gameResume', () => this.handleGameResume());
  }
  
  /**
   * Initialize the audio system
   */
  init(): void {
    // Create AudioContext if Web Audio API is available
    if (window.AudioContext || (window as any).webkitAudioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Pre-load any sounds from options
    this.preloadSounds(this.options.sounds);
    
    // Set up audio unlock for mobile
    if (this.options.autoUnlock) {
      this.setupAudioUnlock();
    }
  }
  
  /**
   * Add a sound effect
   */
  addSound(id: string, url: string): void {
    const audio = new Audio();
    audio.src = url;
    audio.preload = 'auto';
    
    this.sounds.set(id, audio);
  }
  
  /**
   * Add background music
   */
  addMusic(id: string, url: string): void {
    const audio = new Audio();
    audio.src = url;
    audio.preload = 'auto';
    audio.loop = true;
    
    this.music.set(id, audio);
  }
  
  /**
   * Play a sound effect
   */
  playSound(id: string, volume?: number): void {
    if (this.options.muted) return;
    
    const sound = this.sounds.get(id);
    if (!sound) return;
    
    // Clone the audio to allow overlapping playback
    const soundInstance = sound.cloneNode() as HTMLAudioElement;
    soundInstance.volume = (volume !== undefined ? volume : this.options.volume);
    
    soundInstance.play().catch(err => {
      console.warn(`[8BitGE] Could not play sound '${id}':`, err);
      
      // Try to unlock audio if it failed
      if (!this.unlocked) {
        this.unlockAudio();
      }
    });
    
    // Remove from DOM when finished
    soundInstance.onended = () => {
      soundInstance.onended = null;
    };
  }
  
  /**
   * Play background music
   */
  playMusic(id: string, volume?: number, fadeIn: number = 0): void {
    if (this.options.muted) return;
    
    // Stop current music if playing
    this.stopMusic();
    
    const music = this.music.get(id);
    if (!music) return;
    
    // Set volume and play
    music.volume = fadeIn > 0 ? 0 : (volume !== undefined ? volume : this.options.volume);
    music.currentTime = 0;
    this.currentMusic = music;
    
    music.play().catch(err => {
      console.warn(`[8BitGE] Could not play music '${id}':`, err);
      
      // Try to unlock audio if it failed
      if (!this.unlocked) {
        this.unlockAudio();
      }
    });
    
    // Set up fade if requested
    if (fadeIn > 0) {
      this.fadeIn(music, volume !== undefined ? volume : this.options.volume, fadeIn);
    }
    
    // Emit event
    this.events.emit('audio:musicStarted', { id });
  }
  
  /**
   * Stop background music
   */
  stopMusic(fadeOut: number = 0): void {
    if (!this.currentMusic) return;
    
    if (fadeOut > 0) {
      this.fadeOut(this.currentMusic, fadeOut).then(() => {
        if (this.currentMusic) {
          this.currentMusic.pause();
          this.currentMusic.currentTime = 0;
        }
      });
    } else {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
    }
    
    // Emit event
    this.events.emit('audio:musicStopped', {});
  }
  
  /**
   * Pause all audio
   */
  pauseAll(): void {
    // Pause current music
    if (this.currentMusic && !this.currentMusic.paused) {
      this.currentMusic.pause();
    }
    
    // Pause all playing sound effects
    this.sounds.forEach(sound => {
      if (!sound.paused) {
        sound.pause();
      }
    });
    
    // Suspend audio context if available
    if (this.options.autoSuspend && this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
    }
  }
  
  /**
   * Resume all audio
   */
  resumeAll(): void {
    // Resume audio context if available
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    // Resume current music
    if (this.currentMusic && this.currentMusic.paused) {
      this.currentMusic.play().catch(console.error);
    }
  }
  
  /**
   * Set global volume
   */
  setVolume(volume: number): void {
    this.options.volume = Math.max(0, Math.min(1, volume));
    
    // Update current music volume if playing
    if (this.currentMusic) {
      this.currentMusic.volume = this.options.volume;
    }
    
    // Emit event
    this.events.emit('audio:volumeChanged', { volume: this.options.volume });
  }
  
  /**
   * Mute/unmute all audio
   */
  setMuted(muted: boolean): void {
    this.options.muted = muted;
    
    if (muted) {
      this.pauseAll();
    } else {
      this.resumeAll();
    }
    
    // Emit event
    this.events.emit('audio:mutedChanged', { muted });
  }
  
  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    this.setMuted(!this.options.muted);
    return this.options.muted;
  }
  
  /**
   * Handle game pause event
   */
  private handleGamePause(): void {
    // Automatically pause audio when game is paused
    this.pauseAll();
  }
  
  /**
   * Handle game resume event
   */
  private handleGameResume(): void {
    // Automatically resume audio when game is resumed
    if (!this.options.muted) {
      this.resumeAll();
    }
  }
  
  /**
   * Set up audio unlock for mobile devices
   */
  private setupAudioUnlock(): void {
    const unlockEvents = ['touchstart', 'touchend', 'mousedown', 'keydown'];
    
    const unlock = () => {
      if (this.unlocked) return;
      
      // Create and play a silent audio element
      const silentSound = new Audio();
      silentSound.src = "data:audio/mp3;base64,SUQzBAAAAAABEUgAEgAAABdpZjE2LW1kYXQAAAADYXVkAAAAAA==";
      silentSound.play().then(() => {
        this.unlocked = true;
        
        // Also resume AudioContext if suspended
        if (this.audioContext && this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
        
        // Clean up event listeners
        unlockEvents.forEach(event => {
          document.body.removeEventListener(event, unlock);
        });
        
        // Emit event
        this.events.emit('audio:unlocked', {});
      }).catch(err => {
        console.warn('[8BitGE] Audio unlock failed:', err);
      });
    };
    
    // Add event listeners for unlock
    unlockEvents.forEach(event => {
      document.body.addEventListener(event, unlock, false);
    });
  }
  
  /**
   * Attempt to unlock audio manually
   */
  unlockAudio(): void {
    if (this.unlocked) return;
    
    // Try to play all audio elements briefly
    this.sounds.forEach(sound => {
      sound.play().then(() => {
        sound.pause();
        sound.currentTime = 0;
      }).catch(() => {});
    });
    
    this.music.forEach(music => {
      music.play().then(() => {
        music.pause();
        music.currentTime = 0;
      }).catch(() => {});
    });
    
    // Try to resume audio context
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    this.unlocked = true;
    this.events.emit('audio:unlocked', {});
  }
  
  /**
   * Preload sounds from a dictionary
   */
  private preloadSounds(sounds: Record<string, string>): void {
    Object.entries(sounds).forEach(([id, url]) => {
      this.addSound(id, url);
    });
  }
  
  /**
   * Fade in audio
   */
  private fadeIn(audio: HTMLAudioElement, targetVolume: number, duration: number): void {
    const startTime = performance.now();
    const initialVolume = audio.volume;
    
    const fade = () => {
      const elapsed = (performance.now() - startTime) / 1000; // Convert to seconds
      const progress = Math.min(elapsed / duration, 1);
      
      audio.volume = initialVolume + (targetVolume - initialVolume) * progress;
      
      if (progress < 1) {
        requestAnimationFrame(fade);
      }
    };
    
    requestAnimationFrame(fade);
  }
  
  /**
   * Fade out audio
   */
  private fadeOut(audio: HTMLAudioElement, duration: number): Promise<void> {
    return new Promise(resolve => {
      const startTime = performance.now();
      const initialVolume = audio.volume;
      
      const fade = () => {
        const elapsed = (performance.now() - startTime) / 1000; // Convert to seconds
        const progress = Math.min(elapsed / duration, 1);
        
        audio.volume = initialVolume * (1 - progress);
        
        if (progress < 1) {
          requestAnimationFrame(fade);
        } else {
          resolve();
        }
      };
      
      requestAnimationFrame(fade);
    });
  }
}