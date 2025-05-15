// Mock data to enhance backend responses
const champions = [
  {
    id: "yasuo",
    name: "Yasuo",
    image:
      "https://ddragon.leagueoflegends.com/cdn/8.24.1/img/champion/Yasuo.png",
  },
  {
    id: "zed",
    name: "Zed",
    image:
      "https://ddragon.leagueoflegends.com/cdn/8.24.1/img/champion/Zed.png",
  },
  {
    id: "leesin",
    name: "Lee Sin",
    image:
      "https://ddragon.leagueoflegends.com/cdn/8.24.1/img/champion/LeeSin.png",
  },
  {
    id: "orianna",
    name: "Orianna",
    image:
      "https://ddragon.leagueoflegends.com/cdn/8.24.1/img/champion/Orianna.png",
  },
  {
    id: "viktor",
    name: "Viktor",
    image:
      "https://ddragon.leagueoflegends.com/cdn/8.24.1/img/champion/Viktor.png",
  },
];

const badges = ["MVP", "ACE", "CARRY", "CLUTCH", "CONSISTENT", "STRUGGLE"];

// Generate random performance stats
const generateRandomPerformance = () => {
  return {
    kda: {
      kills: Math.floor(Math.random() * 15),
      deaths: Math.floor(Math.random() * 8),
      assists: Math.floor(Math.random() * 20),
    },
    cs: Math.floor(Math.random() * 300) + 100,
    csPerMin: (Math.random() * 5 + 5).toFixed(1),
    vision: Math.floor(Math.random() * 30) + 10,
    damage: Math.floor(Math.random() * 30000) + 10000,
    gold: Math.floor(Math.random() * 15000) + 5000,
    position: ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"][
      Math.floor(Math.random() * 5)
    ],
    champion: champions[Math.floor(Math.random() * champions.length)],
    badges: [...Array(Math.floor(Math.random() * 2))].map(
      () => badges[Math.floor(Math.random() * badges.length)]
    ),
  };
};

// Enhance player data from backend
export function enhancePlayer(player, index) {
  return {
    ...player,
    profileIcon:
      player.profileIcon ||
      `https://avatar.iran.liara.run/public/${
        Math.floor(Math.random() * 40) + 1
      }.png`,
    tier: "CHALLENGER", // player.tier || ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER'][Math.floor(Math.random() * 7)],
    tierIcon:
      "https://opgg-static.akamaized.net/images/medals_mini/challenger.png?image=q_auto:good,f_webp,w_48&v=1746762518",
    rank: index + 1,
    champions:
      player.champions ||
      (() => {
        const shuffledChampions = [...champions];

        // Thuật toán Fisher-Yates để xáo trộn mảng một cách hiệu quả
        for (let i = shuffledChampions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledChampions[i], shuffledChampions[j]] = [
            shuffledChampions[j],
            shuffledChampions[i],
          ];
        }

        const count = Math.floor(Math.random() * 3) + 1;
        return shuffledChampions
          .slice(0, count)
          .map((champion) => champion.image);
      })(),
    winRate: player.winRate || Math.floor(Math.random() * 30) + 40,
    recentPerformance: player.recentPerformance || {
      kda: (Math.random() * 3 + 1).toFixed(2),
      winRate: Math.floor(Math.random() * 30) + 40,
      averageKills: (Math.random() * 5 + 3).toFixed(1),
      averageDeaths: (Math.random() * 4 + 1).toFixed(1),
      averageAssists: (Math.random() * 8 + 3).toFixed(1),
    },
    badges:
      player.badges ||
      [...Array(Math.floor(Math.random() * 3))].map(
        () => badges[Math.floor(Math.random() * badges.length)]
      ),
  };
}

// Enhance match data from backend
export function enhanceMatch(match, playerId) {
  const enhancedMatch = {
    ...match,
    duration: match.duration || Math.floor(Math.random() * 25) + 15 + "m",
    queue: match.queue || "Ranked Solo/Duo",
    map: match.map || "Summoner's Rift",
    gameVersion: match.gameVersion || "14.8",
    teamStats: match.teamStats || {
      blue: {
        kills: Math.floor(Math.random() * 30) + 10,
        gold: Math.floor(Math.random() * 50000) + 30000,
        towers: Math.floor(Math.random() * 11),
        barons: Math.floor(Math.random() * 3),
        dragons: Math.floor(Math.random() * 5),
      },
      red: {
        kills: Math.floor(Math.random() * 30) + 10,
        gold: Math.floor(Math.random() * 50000) + 30000,
        towers: Math.floor(Math.random() * 11),
        barons: Math.floor(Math.random() * 3),
        dragons: Math.floor(Math.random() * 5),
      },
    },
    players: match.players || [],
  };

  // If players info is missing in match data, generate mock data
  if (!enhancedMatch.players.length) {
    // Generate players with performances for both teams
    enhancedMatch.players = [...Array(10)].map((_, index) => {
      const isCurrentPlayer = index === 0; // First player is current
      const teamId = index < 5 ? "blue" : "red";
      const performanceData = generateRandomPerformance();

      return {
        id: isCurrentPlayer ? playerId : `player-${index}`,
        name: isCurrentPlayer
          ? match.playerName || "You"
          : `Player ${index + 1}`,
        teamId,
        ...performanceData,
        // Thêm các field cho match player overview
        championImage: performanceData.champion.image,
        spells: [
          "https://wiki.leagueoflegends.com/en-us/images/Teleport_HD.png",
          "https://wiki.leagueoflegends.com/en-us/images/Flash_HD.png",
        ],
        runes: [
          "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/a/a0/Rune_Conqueror.png/",
          "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/3/3e/Rune_Domination.png/",
        ],
        items: [
          "https://ddragon.leagueoflegends.com/cdn/8.24.1/img/item/3153.png",
          "https://ddragon.leagueoflegends.com/cdn/8.24.1/img/item/3078.png",
          "https://ddragon.leagueoflegends.com/cdn/8.24.1/img/item/3031.png",
          "https://ddragon.leagueoflegends.com/cdn/8.24.1/img/item/3046.png",
          "https://ddragon.leagueoflegends.com/cdn/8.24.1/img/item/3026.png",
          "https://ddragon.leagueoflegends.com/cdn/8.24.1/img/item/3006.png",
        ],
      };
    });
  }

  // Nếu đã có players từ backend, bổ sung field cho từng player nếu thiếu
  enhancedMatch.players = enhancedMatch.players.map((p, idx) => ({
    ...p,
    championImage:
      p.championImage ||
      (p.champion && p.champion.image) ||
      champions[idx % champions.length].image,
    spells: p.spells || [
      "https://wiki.leagueoflegends.com/en-us/images/Teleport_HD.png",
      "https://wiki.leagueoflegends.com/en-us/images/Flash_HD.png",
    ],
    runes: p.runes || [
      "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/a/a0/Rune_Conqueror.png/",
      "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/3/3e/Rune_Domination.png/",
    ],
    items: p.items || [
      "https://ddragon.leagueoflegends.com/cdn/8.24.1/img/item/3153.png",
      "https://ddragon.leagueoflegends.com/cdn/8.24.1/img/item/3078.png",
      "https://ddragon.leagueoflegends.com/cdn/8.24.1/img/item/3031.png",
      "https://ddragon.leagueoflegends.com/cdn/8.24.1/img/item/3046.png",
      "https://ddragon.leagueoflegends.com/cdn/8.24.1/img/item/3026.png",
      "https://ddragon.leagueoflegends.com/cdn/8.24.1/img/item/3006.png",
    ],
  }));

  return enhancedMatch;
}

// Enhance match stats data
export function enhanceMatchStats(stats) {
  return {
    ...stats,
    championStats: stats.championStats || [
      { champion: champions[0], games: 15, winRate: 60, kda: "3.8", cs: "8.4" },
      { champion: champions[1], games: 12, winRate: 50, kda: "2.9", cs: "7.8" },
      { champion: champions[2], games: 8, winRate: 75, kda: "4.2", cs: "7.1" },
    ],
    roleStats: stats.roleStats || [
      { role: "TOP", games: 25, winRate: 56 },
      { role: "JUNGLE", games: 18, winRate: 61 },
      { role: "MID", games: 30, winRate: 53 },
      { role: "ADC", games: 12, winRate: 58 },
      { role: "SUPPORT", games: 5, winRate: 40 },
    ],
    recentMatches: stats.recentMatches || [
      { date: "7d ago", wins: 4, losses: 1 },
      { date: "14d ago", wins: 3, losses: 2 },
      { date: "21d ago", wins: 2, losses: 3 },
      { date: "28d ago", wins: 5, losses: 0 },
    ],
    eloHistory: stats.eloHistory || [
      { date: "2024-04-01", elo: 1200 },
      { date: "2024-04-07", elo: 1232 },
      { date: "2024-04-14", elo: 1258 },
      { date: "2024-04-21", elo: 1245 },
      { date: "2024-04-28", elo: 1267 },
      { date: "2024-05-05", elo: 1290 },
    ],
  };
}

// Mock data service
export const mockDataService = {
  enhancePlayer,
  enhanceMatch,
  enhanceMatchStats,
};
