// lib/api/index.js
import { api } from './api-client';
import { enhancePlayer, enhanceMatch, enhanceMatchStats } from '../../data/mock/enhancers';

// Player API với mock data fallback và enhancement
export const playerApi = {
  async getAll(params = {}) {
    try {
      const result = await api.players.getAll(params);
      // Enhance mỗi player với dữ liệu bổ sung
      return {
        ...result,
        players: (result.players || []).map(player => enhancePlayer(player))
      };
    } catch (error) {
      console.warn('Error fetching players, using mock data:', error);
      // Tạo mock data hoàn toàn
      const mockPlayers = Array(10).fill(0).map((_, i) => enhancePlayer({
        id: `mock-player-${i+1}`,
        name: `Player ${i+1}`,
        elo: 1200 + Math.floor(Math.random() * 500)
      }));
      
      return {
        players: mockPlayers,
        totalResults: mockPlayers.length
      };
    }
  },
  
  // Các methods khác tương tự
};

// Tương tự cho Match và Season API