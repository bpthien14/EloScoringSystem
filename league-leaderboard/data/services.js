import { api } from '../lib/api';
import { mockDataService } from './mock/enhancers';

// Helper function to handle API errors with mock data fallback
async function safeApiCall(apiCall, mockGenerator, ...args) {
  try {
    const data = await apiCall();
    // Enhance backend data with mock data
    return mockGenerator ? mockGenerator(data, ...args) : data;
  } catch (error) {
    console.warn(`API call failed: ${error.message}. Using mock data instead.`);
    // Return mock data if API call fails
    return mockGenerator ? mockGenerator({}, ...args) : {};
  }
}

// Player service
export const playerService = {
  // Get all players
  async getPlayers(params = {}) {
    const players = await safeApiCall(
      () => api.players.getAll(params),
      (data) => {
        // If we got data from API, enhance each player
        if (data.players) {
          return {
            ...data,
            players: data.players.map(player => mockDataService.enhancePlayer(player))
          };
        }
        
        // Otherwise create full mock data
        return {
          players: [
            { id: 'player1', name: 'Player 1', elo: 1350 },
            { id: 'player2', name: 'Player 2', elo: 1420 },
            { id: 'player3', name: 'Player 3', elo: 1280 },
            { id: 'player4', name: 'Player 4', elo: 1390 },
            { id: 'player5', name: 'Player 5', elo: 1510 },
          ].map(player => mockDataService.enhancePlayer(player))
        };
      }
    );
    
    return players;
  },
  
  // Get player by ID
  async getPlayer(playerId) {
    return safeApiCall(
      () => api.players.getById(playerId),
      (data) => mockDataService.enhancePlayer(data)
    );
  },
  
  // Get player statistics
  async getPlayerStats(playerId) {
    return safeApiCall(
      () => api.players.getStats(playerId),
      (data) => mockDataService.enhanceMatchStats(data)
    );
  }
};

// Match service
export const matchService = {
  // Get all matches
  async getMatches(params = {}) {
    const matches = await safeApiCall(
      () => api.matches.getAll(params),
      (data) => {
        // If we got data from API, enhance each match
        if (data.matches) {
          return {
            ...data,
            matches: data.matches.map(match => mockDataService.enhanceMatch(match))
          };
        }
        
        // Otherwise create full mock data
        return {
          matches: [
            { id: 'match1', date: '2024-05-08T15:30:00Z', result: 'WIN' },
            { id: 'match2', date: '2024-05-06T18:20:00Z', result: 'LOSS' },
            { id: 'match3', date: '2024-05-04T14:45:00Z', result: 'WIN' },
            { id: 'match4', date: '2024-05-01T20:10:00Z', result: 'WIN' },
            { id: 'match5', date: '2024-04-29T19:30:00Z', result: 'LOSS' },
          ].map(match => mockDataService.enhanceMatch(match))
        };
      }
    );
    
    return matches;
  },
  
  // Get match by ID
  async getMatch(matchId, playerId) {
    return safeApiCall(
      () => api.matches.getById(matchId),
      (data) => mockDataService.enhanceMatch(data, playerId) 
    );
  },
  
  // Get player's matches
  async getPlayerMatches(playerId) {
    return safeApiCall(
      () => api.matches.getByPlayer(playerId),
      (data) => {
        // If we got data from API, enhance each match
        if (data.matches) {
          return {
            ...data,
            matches: data.matches.map(match => mockDataService.enhanceMatch(match, playerId))
          };
        }
        
        // Otherwise create full mock data
        return {
          matches: [
            { id: 'match1', date: '2024-05-08T15:30:00Z', result: 'WIN' },
            { id: 'match2', date: '2024-05-06T18:20:00Z', result: 'LOSS' },
            { id: 'match3', date: '2024-05-04T14:45:00Z', result: 'WIN' },
          ].map(match => mockDataService.enhanceMatch(match, playerId))
        };
      }
    );
  }
};

// Season service
export const seasonService = {
  // Get all seasons
  async getSeasons() {
    return safeApiCall(
      () => api.seasons.getAll(),
      (data) => {
        if (data.seasons) return data;
        
        return {
          seasons: [
            { id: 'season1', name: 'Season 1', startDate: '2024-01-01', endDate: '2024-03-31' },
            { id: 'season2', name: 'Season 2', startDate: '2024-04-01', endDate: '2024-06-30', isCurrent: true },
            { id: 'season3', name: 'Season 3', startDate: '2024-07-01', endDate: '2024-09-30' },
          ]
        };
      }
    );
  },
  
  // Get current season
  async getCurrentSeason() {
    return safeApiCall(
      () => api.seasons.getCurrent(),
      (data) => {
        if (Object.keys(data).length > 0) return data;
        
        return {
          id: 'season2',
          name: 'Season 2',
          startDate: '2024-04-01',
          endDate: '2024-06-30',
          isCurrent: true
        };
      }
    );
  }
};