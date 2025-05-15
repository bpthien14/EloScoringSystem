// src/utils/seeder.js
const mongoose = require('mongoose');
const config = require('../config');
const logger = require('./logger');
const { Player, Season, Match } = require('../models');

/**
 * Tạo dữ liệu mẫu cho hệ thống
 */
const seedData = async () => {
  try {
    // Kết nối đến MongoDB
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('Đã kết nối đến MongoDB');

    // Xóa dữ liệu cũ
    await clearDatabase();
    logger.info('Đã xóa dữ liệu cũ');

    // Tạo mùa giải mẫu
    const season = await createSeason();
    logger.info(`Đã tạo mùa giải mẫu: ${season.name}`);

    // Tạo người chơi mẫu
    const players = await createPlayers();
    logger.info(`Đã tạo ${players.length} người chơi mẫu`);

    // Tạo các trận đấu mẫu
    await createMatches(players, season);
    logger.info('Đã tạo các trận đấu mẫu');

    logger.info('Đã tạo xong dữ liệu mẫu');
    process.exit(0);
  } catch (error) {
    logger.error(`Lỗi khi tạo dữ liệu mẫu: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Xóa dữ liệu hiện tại
 */
const clearDatabase = async () => {
  await Player.deleteMany({});
  await Season.deleteMany({});
  await Match.deleteMany({});
};

/**
 * Tạo mùa giải mẫu
 */
const createSeason = async () => {
  const season = await Season.create({
    name: 'Mùa 1',
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 ngày
    isActive: true,
    settings: {
      kFactors: {
        new: 32,
        regular: 24,
        experienced: 16
      },
      positionFactors: {
        Top: 1.1,
        Jungle: 1.2,
        Mid: 1.15,
        ADC: 1.1,
        Support: 0.9
      }
    }
  });

  return season;
};

/**
 * Tạo người chơi mẫu
 */
const createPlayers = async () => {
  // Chuẩn bị dữ liệu người chơi
  const playerData = [
    { name: 'Player1', preferredPosition: 'Top', currentElo: 1100 },
    { name: 'Player2', preferredPosition: 'Jungle', currentElo: 1050 },
    { name: 'Player3', preferredPosition: 'Mid', currentElo: 1200 },
    { name: 'Player4', preferredPosition: 'ADC', currentElo: 950 },
    { name: 'Player5', preferredPosition: 'Support', currentElo: 900 },
    { name: 'Player6', preferredPosition: 'Top', currentElo: 1150 },
    { name: 'Player7', preferredPosition: 'Jungle', currentElo: 1000 },
    { name: 'Player8', preferredPosition: 'Mid', currentElo: 1100 },
    { name: 'Player9', preferredPosition: 'ADC', currentElo: 1050 },
    { name: 'Player10', preferredPosition: 'Support', currentElo: 950 },
    { name: 'Player11', preferredPosition: 'Top', currentElo: 1300 },
    { name: 'Player12', preferredPosition: 'Jungle', currentElo: 850 },
    { name: 'Player13', preferredPosition: 'Mid', currentElo: 1250 },
    { name: 'Player14', preferredPosition: 'ADC', currentElo: 1000 },
    { name: 'Player15', preferredPosition: 'Support', currentElo: 900 }
  ];

  // Tạo người chơi và trả về
  return await Player.insertMany(playerData);
};

/**
 * Tạo trận đấu mẫu
 */
const createMatches = async (players, season) => {
  // Tạo một vài trận đấu mẫu
  for (let i = 0; i < 5; i++) {
    // Chọn ngẫu nhiên người chơi cho hai đội
    const shuffledPlayers = players.sort(() => 0.5 - Math.random());
    const blueTeamPlayers = shuffledPlayers.slice(0, 5);
    const redTeamPlayers = shuffledPlayers.slice(5, 10);

    // Xác định người thắng ngẫu nhiên
    const winnerTeamColor = Math.random() > 0.5 ? 'blue' : 'red';

    // Tính ELO trung bình cho mỗi đội
    const blueTeamAvgElo = blueTeamPlayers.reduce((sum, p) => sum + p.currentElo, 0) / 5;
    const redTeamAvgElo = redTeamPlayers.reduce((sum, p) => sum + p.currentElo, 0) / 5;

    // Tính tỉ lệ thắng dự đoán
    const blueTeamExpectedWinRate = 1 / (1 + Math.pow(10, (redTeamAvgElo - blueTeamAvgElo) / 400));
    const redTeamExpectedWinRate = 1 - blueTeamExpectedWinRate;

    // Chọn vị trí cho người chơi mỗi đội
    const positions = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

    // Tạo thông tin người chơi cho trận đấu
    const createTeamPlayers = (teamPlayers, isWinner) => {
      return teamPlayers.map((player, index) => {
        const position = positions[index];
        const eloChange = isWinner 
          ? Math.floor(Math.random() * 15) + 10 
          : -Math.floor(Math.random() * 15) - 10;
        
        return {
          playerId: player._id,
          position,
          eloBefore: player.currentElo,
          eloAfter: player.currentElo + eloChange,
          eloChange,
          performanceStats: {
            kills: Math.floor(Math.random() * 10),
            deaths: Math.floor(Math.random() * 8),
            assists: Math.floor(Math.random() * 15),
            damage: Math.floor(Math.random() * 20000) + 5000,
            gold: Math.floor(Math.random() * 15000) + 5000,
            cs: Math.floor(Math.random() * 200) + 50
          },
          performanceFactor: 1 + (Math.random() * 0.5 - 0.25),
          positionFactor: position === 'Jungle' ? 1.2 : position === 'Support' ? 0.9 : 1.1,
          streakFactor: 1.0,
          leftEarly: Math.random() < 0.1 // 10% chance to leave early
        };
      });
    };

    // Tạo trận đấu
    await Match.create({
      matchDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Ngày giảm dần
      isRandom: true,
      duration: Math.floor(Math.random() * 20) + 20, // 20-40 phút
      seasonId: season._id,
      teams: {
        blue: {
          players: createTeamPlayers(blueTeamPlayers, winnerTeamColor === 'blue'),
          averageElo: blueTeamAvgElo,
          expectedWinRate: blueTeamExpectedWinRate
        },
        red: {
          players: createTeamPlayers(redTeamPlayers, winnerTeamColor === 'red'),
          averageElo: redTeamAvgElo,
          expectedWinRate: redTeamExpectedWinRate
        }
      },
      winnerTeamColor
    });
  }
};

// Chạy seeder
seedData();