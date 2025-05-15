// lib/api/data-adapter.js

// Chuyển đổi player từ API sang định dạng frontend
export function adaptPlayerData(apiPlayer) {
    if (!apiPlayer) return null;
    
    // Tính win rate nếu có thông tin về wins và losses
    let winRate = 0;
    if ((apiPlayer.wins || 0) + (apiPlayer.losses || 0) > 0) {
      winRate = Math.floor((apiPlayer.wins || 0) / ((apiPlayer.wins || 0) + (apiPlayer.losses || 0)) * 100);
    }
    
    return {
      id: apiPlayer._id || apiPlayer.id,
      name: apiPlayer.name || "Unknown Player",
      tag: apiPlayer.tag || "#0000",
      avatar: apiPlayer.avatar || "/placeholder.svg?height=32&width=32",
      tier: apiPlayer.tier || "Unranked",
      lp: apiPlayer.elo || 0,
      level: apiPlayer.level || 1,
      wins: apiPlayer.wins || 0,
      losses: apiPlayer.losses || 0,
      winRate: apiPlayer.winRate || winRate,
      champions: apiPlayer.champions || [
        "/placeholder.svg?height=24&width=24",
        "/placeholder.svg?height=24&width=24",
        "/placeholder.svg?height=24&width=24",
      ],
      // Thêm các trường khác nếu cần
    };
  }
  
  // Chuyển đổi match data từ API
  export function adaptMatchData(apiMatch, currentPlayerId) {
    if (!apiMatch) return null;
    
    // Xác định kết quả trận đấu cho người chơi hiện tại
    let result = 'unknown';
    let playerTeam = null;
    
    // Tìm người chơi trong danh sách team để xác định team và kết quả
    if (apiMatch.teams) {
      // Check blue team
      const bluePlayer = apiMatch.teams.blue.players?.find(
        p => p.playerId === currentPlayerId || p.id === currentPlayerId
      );
      if (bluePlayer) {
        playerTeam = 'blue';
        result = apiMatch.winnerTeamColor === 'blue' ? 'victory' : 'defeat';
      } else {
        // Check red team
        const redPlayer = apiMatch.teams.red.players?.find(
          p => p.playerId === currentPlayerId || p.id === currentPlayerId
        );
        if (redPlayer) {
          playerTeam = 'red';
          result = apiMatch.winnerTeamColor === 'red' ? 'victory' : 'defeat';
        }
      }
    }
    
    // Format match time
    const matchDate = apiMatch.matchDate ? new Date(apiMatch.matchDate) : new Date();
    const timeAgo = formatTimeAgo(matchDate);
    
    // Format duration
    const duration = formatDuration(apiMatch.duration || 0);
    
    return {
      id: apiMatch._id || apiMatch.id,
      matchDate: apiMatch.matchDate,
      timeAgo,
      result,
      duration,
      // Thêm các trường khác
      // Nếu backend không cung cấp đủ trường, bạn có thể thêm mock data
    };
  }
  
  // Helper functions
  function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} year${interval > 1 ? 's' : ''} ago`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} month${interval > 1 ? 's' : ''} ago`;
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval > 1 ? 's' : ''} ago`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval > 1 ? 's' : ''} ago`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minute${interval > 1 ? 's' : ''} ago`;
    
    return 'just now';
  }
  
  function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }