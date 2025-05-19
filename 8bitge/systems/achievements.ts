/**
 * Achievements System for 8BitGE
 * Handles game achievements, unlocks, and progress tracking
 */

import { EventEmitter } from '../utils/eventEmitter';
import { Achievement, GameState } from '../types';

export interface AchievementEvent {
  type: string;
  params?: Record<string, any>;
}

export class AchievementSystem {
  private achievements: Map<string, Achievement> = new Map();
  private events: EventEmitter;
  private gameId: string;
  private storagePrefix = '8bitge_achievements_';
  
  constructor(events: EventEmitter, achievements?: Achievement[]) {
    this.gameId = 'default';
    this.events = events;
    
    // Listen for achievement events
    this.events.on('achievement:progress', this.handleAchievementProgress.bind(this));
    this.events.on('achievement:trigger', this.handleTrigger.bind(this));
    
    // Register achievements if provided
    if (achievements && achievements.length) {
      this.register(achievements);
    }
  }
  
  /**
   * Register achievements for the game
   */
  register(achievements: Achievement[]): void {
    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, {
        ...achievement,
        progress: achievement.progress || { current: 0, target: 1 },
        unlocked: false
      });
    });
    
    // Load saved achievements
    this.loadSavedAchievements();
  }
  
  /**
   * Get all achievements
   */
  getAll(includeSecret: boolean = true): Achievement[] {
    const achievements = Array.from(this.achievements.values());
    if (includeSecret) {
      return achievements;
    }
    return achievements.filter(a => !a.secret || a.unlocked);
  }
  
  /**
   * Get a specific achievement
   */
  get(id: string): Achievement | undefined {
    return this.achievements.get(id);
  }
  
  /**
   * Update progress for an achievement
   */
  updateProgress(id: string, increment: number = 1): void {
    const achievement = this.achievements.get(id);
    if (!achievement || achievement.unlocked) return;
    
    const newValue = (achievement.progress?.current || 0) + increment;
    const target = achievement.progress?.target || 1;
    
    achievement.progress = {
      current: newValue,
      target
    };
    
    // Check if achievement is completed
    if (newValue >= target) {
      this.unlock(id);
    } else {
      // Save progress
      this.saveAchievements();
      
      // Emit progress event
      this.events.emit('achievement:updated', { 
        achievement,
        progress: achievement.progress
      });
    }
  }
  
  /**
   * Unlock an achievement
   */
  unlock(id: string): void {
    const achievement = this.achievements.get(id);
    if (!achievement || achievement.unlocked) return;
    
    // Update achievement
    achievement.unlocked = true;
    achievement.unlockDate = new Date();
    if (achievement.progress) {
      achievement.progress.current = achievement.progress.target;
    }
    
    // Save achievement state
    this.saveAchievements();
    
    // Emit unlock event
    this.events.emit('achievement:unlocked', { achievement });
  }
  
  /**
   * Reset all achievements
   */
  resetAll(): void {
    this.achievements.forEach(achievement => {
      achievement.unlocked = false;
      achievement.unlockDate = undefined;
      if (achievement.progress) {
        achievement.progress.current = 0;
      }
    });
    
    // Save achievement state
    this.saveAchievements();
    
    // Emit reset event
    this.events.emit('achievement:reset', { gameId: this.gameId });
  }
  
  /**
   * Get achievement stats (unlocked %, etc)
   */
  getStats(): { total: number, unlocked: number, percentage: number } {
    const total = this.achievements.size;
    let unlocked = 0;
    
    this.achievements.forEach(achievement => {
      if (achievement.unlocked) {
        unlocked++;
      }
    });
    
    const percentage = total > 0 ? (unlocked / total) * 100 : 0;
    
    return {
      total,
      unlocked,
      percentage
    };
  }
  
  /**
   * Check achievements against current game state
   */
  check(state: GameState): void {
    this.achievements.forEach(achievement => {
      if (achievement.unlocked || !achievement.condition) return;
      
      if (achievement.condition(state)) {
        this.unlock(achievement.id);
      }
    });
  }
  
  /**
   * Handle progress events for achievements
   */
  private handleAchievementProgress(event: { achievementId: string, increment?: number }): void {
    this.updateProgress(event.achievementId, event.increment || 1);
  }
  
  /**
   * Handle trigger events that could unlock achievements
   */
  private handleTrigger(event: AchievementEvent): void {
    const { type, params } = event;
    
    // Process each achievement to see if it should be triggered
    this.achievements.forEach(achievement => {
      if (achievement.unlocked) return;
      
      // Implement your trigger logic here
      // This is just an example - you'll need to customize this based on your game's needs
      if (type === 'score' && params?.score) {
        if (achievement.id === 'high_score_100' && params.score >= 100) {
          this.unlock(achievement.id);
        } else if (achievement.id === 'high_score_500' && params.score >= 500) {
          this.unlock(achievement.id);
        } else if (achievement.id === 'high_score_1000' && params.score >= 1000) {
          this.unlock(achievement.id);
        }
      }
      
      if (type === 'level_complete' && params?.level) {
        if (achievement.id === 'complete_level_5' && params.level >= 5) {
          this.unlock(achievement.id);
        } else if (achievement.id === 'complete_level_10' && params.level >= 10) {
          this.unlock(achievement.id);
        }
      }
    });
  }
  
  /**
   * Save achievements to localStorage
   */
  private saveAchievements(): void {
    try {
      const achievements = Array.from(this.achievements.values());
      localStorage.setItem(
        `${this.storagePrefix}${this.gameId}`, 
        JSON.stringify(achievements)
      );
    } catch (error) {
      console.error('[8BitGE] Failed to save achievements:', error);
    }
  }
  
  /**
   * Load saved achievements from localStorage
   */
  private loadSavedAchievements(): void {
    try {
      const savedData = localStorage.getItem(`${this.storagePrefix}${this.gameId}`);
      if (!savedData) return;
      
      const savedAchievements = JSON.parse(savedData) as Achievement[];
      
      savedAchievements.forEach(saved => {
        const achievement = this.achievements.get(saved.id);
        if (achievement) {
          achievement.unlocked = saved.unlocked || false;
          achievement.unlockDate = saved.unlockDate ? new Date(saved.unlockDate) : undefined;
          if (saved.progress && achievement.progress) {
            achievement.progress.current = saved.progress.current;
          }
        }
      });
    } catch (error) {
      console.error('[8BitGE] Failed to load achievements:', error);
    }
  }
}
