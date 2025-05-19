/**
 * Leaderboard System for 8BitGE
 * Handles score submission, retrieval, and display
 */

import { EventEmitter } from '../utils/eventEmitter';
import { LeaderboardEntry } from '../types';

export class LeaderboardSystem {
  private gameId: string;
  private events: EventEmitter;
  private storagePrefix = '8bitge_leaderboard_';
  private localLeaderboard: LeaderboardEntry[] = [];
  private apiEndpoint = 'https://api.8bitpixel.io/leaderboard'; // Example API endpoint
  
  constructor(events: EventEmitter, gameId: string) {
    this.events = events;
    this.gameId = gameId;
    
    // Load local leaderboard on init
    this.loadLocalLeaderboard();
  }
  
  /**
   * Submit a score to the leaderboard
   */
  submitScore(score: number, playerName: string = 'Player'): Promise<boolean> {
    const entry: LeaderboardEntry = {
      playerId: this.getOrCreatePlayerId(),
      playerName,
      score,
      date: Date.now(),
      gameVersion: this.getGameVersion()
    };
    
    // Add to local leaderboard
    this.addToLocalLeaderboard(entry);
    
    // Emit event
    this.events.emit('leaderboard:scoreSubmitted', { entry });
    
    // Try to submit to server if online
    return this.submitToServer(entry)
      .then(success => {
        if (success) {
          this.events.emit('leaderboard:scoreSubmittedOnline', { entry });
        }
        return success;
      })
      .catch(() => false);
  }
  
  /**
   * Get top scores from the leaderboard
   */
  getTopScores(limit: number = 10): LeaderboardEntry[] {
    return [...this.localLeaderboard]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
  
  /**
   * Get player's best scores
   */
  getPlayerBestScores(limit: number = 5): LeaderboardEntry[] {
    const playerId = this.getOrCreatePlayerId();
    
    return [...this.localLeaderboard]
      .filter(entry => entry.playerId === playerId)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
  
  /**
   * Fetch online leaderboard data
   */
  async fetchOnlineLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}/${this.gameId}?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch online leaderboard');
      }
      
      const data = await response.json();
      this.events.emit('leaderboard:onlineDataLoaded', { entries: data });
      return data;
    } catch (error) {
      console.error('[8BitGE] Failed to fetch online leaderboard:', error);
      return [];
    }
  }
  
  /**
   * Add an entry to the local leaderboard
   */
  private addToLocalLeaderboard(entry: LeaderboardEntry): void {
    this.localLeaderboard.push(entry);
    
    // Sort and limit to top 100 entries
    this.localLeaderboard.sort((a, b) => b.score - a.score);
    if (this.localLeaderboard.length > 100) {
      this.localLeaderboard = this.localLeaderboard.slice(0, 100);
    }
    
    // Save to local storage
    this.saveLocalLeaderboard();
  }
  
  /**
   * Submit score to the server
   */
  private async submitToServer(entry: LeaderboardEntry): Promise<boolean> {
    if (!navigator.onLine) {
      return false;
    }
    
    try {
      const response = await fetch(`${this.apiEndpoint}/${this.gameId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry)
      });
      
      return response.ok;
    } catch (error) {
      console.error('[8BitGE] Failed to submit score to server:', error);
      return false;
    }
  }
  
  /**
   * Save local leaderboard to localStorage
   */
  private saveLocalLeaderboard(): void {
    try {
      localStorage.setItem(
        `${this.storagePrefix}${this.gameId}`, 
        JSON.stringify(this.localLeaderboard)
      );
    } catch (error) {
      console.error('[8BitGE] Failed to save local leaderboard:', error);
    }
  }
  
  /**
   * Load local leaderboard from localStorage
   */
  private loadLocalLeaderboard(): void {
    try {
      const data = localStorage.getItem(`${this.storagePrefix}${this.gameId}`);
      if (data) {
        this.localLeaderboard = JSON.parse(data);
      }
    } catch (error) {
      console.error('[8BitGE] Failed to load local leaderboard:', error);
    }
  }
  
  /**
   * Get or create a player ID
   */
  private getOrCreatePlayerId(): string {
    let playerId = localStorage.getItem('8bitge_player_id');
    
    if (!playerId) {
      playerId = 'player_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('8bitge_player_id', playerId);
    }
    
    return playerId;
  }
  
  /**
   * Get the current game version
   */
  private getGameVersion(): string {
    return '1.0.0'; // This should be dynamically retrieved in a real implementation
  }
  
  /**
   * Clear local leaderboard data
   */
  clearLocalLeaderboard(): void {
    this.localLeaderboard = [];
    localStorage.removeItem(`${this.storagePrefix}${this.gameId}`);
    this.events.emit('leaderboard:cleared', { gameId: this.gameId });
  }
}
