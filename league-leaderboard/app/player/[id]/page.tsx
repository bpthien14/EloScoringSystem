"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { api } from "../../../lib/api/api-client";
import { enhancePlayer } from "../../../data/mock/enhancers";

// Helper functions
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function calculateKda(kills: number, deaths: number, assists: number): string {
  if (deaths === 0) {
    return "Perfect";
  }
  return ((kills + assists) / deaths).toFixed(2);
}

export default function PlayerDetail({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("summary");
  const [activeMatchTab, setActiveMatchTab] = useState("overview");
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const [playerMatches, setPlayerMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlayerData() {
      try {
        setLoading(true);
        // Fetch player details
        const playerData = await api.players.getById(params.id);
        const playerStats = await api.players.getStats(params.id);
        // Fetch matches with the populate option enabled to get full player details
        const matchesResponse = await api.matches.getByPlayer(params.id, true);

        // Enhance player data with frontend-specific properties
        const enhancedPlayer = enhancePlayer(
          {
            ...playerData,
            stats: playerStats,
            id: params.id,
            matches: matchesResponse?.results || [],
          },
          0
        ); // 0 is the index, not important here

        setPlayer(enhancedPlayer);
        setPlayerMatches(matchesResponse?.results || []);

        console.log(
          "Fetched match data with populated players:",
          matchesResponse?.results
        );
      } catch (err) {
        console.error("Error fetching player data:", err);
        setError("Failed to load player data");
      } finally {
        setLoading(false);
      }
    }

    fetchPlayerData();
  }, [params.id]);

  // Hàm xử lý khi bấm nút Update
  async function handleUpdateMatch() {
    setUpdating(true);
    setUpdateError(null);
    try {
      // Lấy danh sách tất cả player
      const allPlayers = await api.players.getAll();
      const allIds = (allPlayers?.results || allPlayers || []).map(
        (p: any) => p.id || p._id
      );
      // Chọn ngẫu nhiên 10 id
      const randomIds = allIds.sort(() => 0.5 - Math.random()).slice(0, 10);
      if (randomIds.length < 10)
        throw new Error("Không đủ người chơi để tạo trận đấu");
      await api.matches.createRandomMatch(randomIds);
      await new Promise((res) => setTimeout(res, 500));
      // Gọi lại fetchPlayerData
      const playerData = await api.players.getById(params.id);
      const playerStats = await api.players.getStats(params.id);
      const matchesResponse = await api.matches.getByPlayer(params.id, true);
      const enhancedPlayer = enhancePlayer(
        {
          ...playerData,
          stats: playerStats,
          id: params.id,
          matches: matchesResponse?.results || [],
        },
        0
      );
      setPlayer(enhancedPlayer);
      setPlayerMatches(matchesResponse?.results || []);
    } catch (err) {
      setUpdateError("Tạo trận đấu thất bại. Vui lòng thử lại.");
    } finally {
      setUpdating(false);
    }
  }

  const toggleMatchDetails = (matchId: string) => {
    if (expandedMatch === matchId) {
      setExpandedMatch(null);
    } else {
      setExpandedMatch(matchId);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <main>
        <div className="container">
          <div className="loading-spinner">Loading player data...</div>
        </div>
      </main>
    );
  }

  // Show error state
  if (error || !player) {
    return (
      <main>
        <div className="container">
          <div className="error-message">{error || "Player not found"}</div>
        </div>
      </main>
    );
  }
  return (
    <main>
      <header className="header">
        <div className="container">
          <h1>Player Profile</h1>
        </div>
      </header>

      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            <Image
              src={player.profileIcon || "/placeholder.svg"}
              alt={player.name}
              width={80}
              height={80}
            />
            <div className="profile-level">{player.level || 30}</div>
          </div>
          <div className="profile-info">
            <div className="profile-name">
              <h2>{player.name}</h2>
              <span className="profile-tag">{player.tag || "#0000"}</span>
            </div>
            <div className="profile-rank">
              Ladder Rank {player.rank || 0} ({player.topPercent || 0}% of top)
            </div>
            <div className="profile-actions">
              <button
                className="btn btn-primary"
                onClick={handleUpdateMatch}
                disabled={updating}
              >
                {updating ? "Đang tạo trận..." : "Update"}
              </button>
              <button className="btn btn-secondary">Tier Graph</button>
            </div>
            {updateError && (
              <div
                className="error-message"
                style={{ color: "red", marginTop: 8 }}
              >
                {updateError}
              </div>
            )}
            <div className="last-updated">
              Last updated: {player.lastUpdated || "Now"}
            </div>
          </div>
        </div>{" "}
        <div className="nav-tabs">
          <div
            className={`nav-tab ${activeTab === "summary" ? "active" : ""}`}
            onClick={() => setActiveTab("summary")}
          >
            Summary
          </div>
          <div
            className={`nav-tab ${activeTab === "champions" ? "active" : ""}`}
            onClick={() => setActiveTab("champions")}
          >
            Champions
          </div>
          <div
            className={`nav-tab ${activeTab === "mastery" ? "active" : ""}`}
            onClick={() => setActiveTab("mastery")}
          >
            Mastery
          </div>
          <div
            className={`nav-tab ${activeTab === "live-game" ? "active" : ""}`}
            onClick={() => setActiveTab("live-game")}
          >
            Live Game
          </div>
          <div
            className={`nav-tab ${
              activeTab === "teamfight-tactics" ? "active" : ""
            }`}
            onClick={() => setActiveTab("teamfight-tactics")}
          >
            Teamfight Tactics
          </div>
        </div>
        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="rank-card">
              <div className="rank-header">
                <h3 className="rank-title">Ranked Solo/Duo</h3>
                <div>ⓘ</div>
              </div>
              <div className="rank-info">
                <Image
                  src={player.tierIcon || "/placeholder.svg?height=64&width=64"}
                  alt="Rank Emblem"
                  width={64}
                  height={64}
                  className="rank-emblem"
                />
                <div className="rank-details">
                  <div className="rank-tier">{player.tier || "Unranked"}</div>
                  <div className="rank-lp">{player.currentElo || 1000} ELO</div>
                  <div className="rank-winrate">
                    Win rate{" "}
                    {player.winRate ||
                      Math.round(
                        (player.wins / (player.wins + player.losses || 1)) * 100
                      )}
                    %
                  </div>
                </div>
              </div>
              <div className="rank-history">
                <div className="rank-history-item">
                  <div className="rank-season">Season</div>
                  <div className="rank-tier-col">Tier</div>
                  <div className="rank-lp-col">ELO</div>
                </div>
                {Object.entries(player.seasonStats || {}).map(
                  ([season, stats]: [string, any], index) => (
                    <div className="rank-history-item" key={index}>
                      <div className="rank-season">{season}</div>
                      <div className="rank-tier-col">
                        <span
                          className={`tier-icon ${
                            stats.tier?.toLowerCase() || "challenger"
                          }`}
                        ></span>
                        {stats.tier || "Challenger"}
                      </div>
                      <div className="rank-lp-col">{stats.elo || 1000}</div>
                    </div>
                  )
                )}
                <div className="view-more">
                  View all season tiers
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>{" "}
          <div className="profile-main">
            <div className="match-history">
              {playerMatches.length > 0 ? (
                playerMatches.map((match: any, index: number) => {
                  // Find the player in the match
                  const playerTeam = match.teams.blue.players.find(
                    (p: any) =>
                      p.playerId._id?.toString() === params.id ||
                      p.playerId?.toString() === params.id
                  )
                    ? "blue"
                    : "red";
                  const opponent = playerTeam === "blue" ? "red" : "blue";
                  const playerInfo = match.teams[playerTeam].players.find(
                    (p: any) =>
                      p.playerId._id?.toString() === params.id ||
                      p.playerId?.toString() === params.id
                  );
                  const matchResult =
                    match.winnerTeamColor === playerTeam ? "victory" : "defeat";
                  const matchDate = new Date(match.matchDate);
                  const timeAgo = getTimeAgo(matchDate);

                  // Access populated player data if available
                  const playerDetails =
                    playerInfo?.playerId &&
                    typeof playerInfo.playerId !== "string"
                      ? playerInfo.playerId
                      : null;

                  // Default values for missing data
                  const playerPosition = playerInfo?.position || "Mid";
                  const eloChange = playerInfo?.eloChange || 0;
                  const eloBefore = playerInfo?.eloBefore || 1000;
                  const performanceStats = playerInfo?.performanceStats || {
                    kills: 0,
                    deaths: 0,
                    assists: 0,
                  };

                  return (
                    <div key={match._id} className="match-item">
                      <div className={`match-header ${matchResult}`}>
                        <div className="match-type">
                          <div className="match-queue">
                            {match.isRandom ? "Random Teams" : "Custom Teams"}
                          </div>
                          <div className="match-time">{timeAgo}</div>
                        </div>
                        <div className="match-result">
                          <div className={`match-result-text ${matchResult}`}>
                            {matchResult === "victory" ? "Victory" : "Defeat"}
                          </div>
                          <div className="match-duration">
                            {formatDuration(match.duration)}
                          </div>
                        </div>
                      </div>

                      <div
                        className="match-overview"
                        onClick={() => toggleMatchDetails(match._id)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="champion-played">
                          <Image
                            src={
                              playerInfo?.championImage ||
                              "https://ddragon.leagueoflegends.com/cdn/8.24.1/img/champion/Yasuo.png"
                            }
                            alt={playerDetails?.name || playerPosition}
                            width={48}
                            height={48}
                            className="champion-img"
                          />
                          <div className="champion-level">{playerPosition}</div>
                        </div>
                        <div className="summoner-spells">
                          {(
                            playerInfo?.spells || [
                              "https://wiki.leagueoflegends.com/en-us/images/Teleport_HD.png",
                              "https://wiki.leagueoflegends.com/en-us/images/Flash_HD.png",
                            ]
                          ).map((spell: string, idx: number) => (
                            <Image
                              key={idx}
                              src={spell}
                              alt="Spell"
                              width={22}
                              height={22}
                              className="spell-img"
                            />
                          ))}
                        </div>
                        <div className="runes">
                          {(
                            playerInfo?.runes || [
                              "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/a/a0/Rune_Conqueror.png/",
                              "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/3/3e/Rune_Domination.png/",
                            ]
                          ).map((rune: string, idx: number) => (
                            <Image
                              key={idx}
                              src={rune}
                              alt="Rune"
                              width={22}
                              height={22}
                              className="rune-img"
                            />
                          ))}
                        </div>
                        <div className="kda-container">
                          <div className="kda-numbers">
                            {performanceStats?.kills} /{" "}
                            {performanceStats.deaths} /{" "}
                            {performanceStats.assists}
                          </div>
                          <div className="kda-ratio">
                            {calculateKda(
                              performanceStats.kills,
                              performanceStats.deaths,
                              performanceStats.assists
                            )}{" "}
                            KDA
                          </div>
                        </div>
                        <div className="match-stats">
                          <div className="stat-label">
                            ELO Change:{" "}
                            {eloChange > 0 ? "+" + eloChange : eloChange}
                          </div>
                          <div className="stat-value">
                            Position: {playerPosition}
                          </div>
                          <div className="stat-value">
                            CS {performanceStats.cs || 0} (
                            {(
                              (performanceStats.cs || 0) /
                              (match.duration / 60)
                            ).toFixed(1)}
                            )
                          </div>
                          <div className="stat-value">ELO: {eloBefore}</div>
                        </div>
                        <div className="items-built">
                          {(playerInfo?.items || Array(6).fill(null)).map(
                            (item: string | null, idx: number) =>
                              item ? (
                                <Image
                                  key={idx}
                                  src={item}
                                  alt="Item"
                                  width={22}
                                  height={22}
                                  className="item-img"
                                />
                              ) : (
                                <div
                                  key={idx}
                                  style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: 4,
                                    backgroundColor: "#f0f2f5",
                                  }}
                                ></div>
                              )
                          )}
                        </div>{" "}
                        <div className="match-players">
                          <div className="team-players">
                            {match.teams.blue.players
                              .slice(0, 2)
                              .map((player: any, idx: number) => {
                                const playerDetails =
                                  player.playerId &&
                                  typeof player.playerId !== "string"
                                    ? player.playerId
                                    : null;
                                return (
                                  <div
                                    key={idx}
                                    className="player-icon"
                                    title={playerDetails?.name || "Player"}
                                  >
                                    <Image
                                      src={
                                        playerDetails?.profileIcon ||
                                        "/placeholder.svg?height=20&width=20"
                                      }
                                      alt={playerDetails?.name || "Player"}
                                      width={20}
                                      height={20}
                                      className="player-champion"
                                    />
                                  </div>
                                );
                              })}
                          </div>
                          <div className="team-players">
                            {match.teams.red.players
                              .slice(0, 2)
                              .map((player: any, idx: number) => {
                                const playerDetails =
                                  player.playerId &&
                                  typeof player.playerId !== "string"
                                    ? player.playerId
                                    : null;
                                return (
                                  <div
                                    key={idx}
                                    className="player-icon"
                                    title={playerDetails?.name || "Player"}
                                  >
                                    <Image
                                      src={
                                        playerDetails?.profileIcon ||
                                        "/placeholder.svg?height=20&width=20"
                                      }
                                      alt={playerDetails?.name || "Player"}
                                      width={20}
                                      height={20}
                                      className="player-champion"
                                    />
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </div>

                      <div className="match-actions">
                        <button
                          className={`btn-match-detail ${expandedMatch === match._id ? "active" : ""}`}
                          onClick={() => toggleMatchDetails(match._id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline
                              points={expandedMatch === match._id ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}
                            ></polyline>
                          </svg>
                        </button>
                      </div>

                      {expandedMatch === match._id && (
                        <div
                          className={`match-detail ${
                            expandedMatch === match._id ? "active" : ""
                          }`}
                        >
                          <div className="match-tabs">
                            <div
                              className={`match-tab ${
                                activeMatchTab === "overview" ? "active" : ""
                              }`}
                              onClick={() => setActiveMatchTab("overview")}
                            >
                              Overview
                            </div>
                            <div
                              className={`match-tab ${
                                activeMatchTab === "op-score" ? "active" : ""
                              }`}
                              onClick={() => setActiveMatchTab("op-score")}
                            >
                              Performance
                            </div>
                            <div
                              className={`match-tab ${
                                activeMatchTab === "team-analysis"
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() => setActiveMatchTab("team-analysis")}
                            >
                              Team analysis
                            </div>
                          </div>

                          <div className="team-header">
                            <div
                              className={`team-title ${
                                match.winnerTeamColor === "blue"
                                  ? "victory"
                                  : "defeat"
                              }`}
                            >
                              {match.winnerTeamColor === "blue"
                                ? "Victory"
                                : "Defeat"}{" "}
                              (Blue Team)
                            </div>
                            <div className="team-stats">
                              <div className="team-stat">Position</div>
                              <div className="team-stat">KDA</div>
                              <div className="team-stat">ELO Change</div>
                              <div className="team-stat">ELO Before</div>
                            </div>
                          </div>

                          {match.teams.blue.players.map(
                            (player: any, idx: number) => {
                              // Access populated player data if available
                              const playerDetails =
                                player.playerId &&
                                typeof player.playerId !== "string"
                                  ? player.playerId
                                  : null;

                              return (
                                <div key={idx} className="player-row">
                                  <div className="player-champion-col">
                                    <Image
                                      src={
                                        playerDetails?.profileIcon ||
                                        playerDetails?.avatar ||
                                        `https://avatar.iran.liara.run/public/${
                                          Math.floor(Math.random() * 40) + 1
                                        }.png`
                                      }
                                      alt="Position"
                                      width={32}
                                      height={32}
                                      className="player-champion-img"
                                    />
                                    <div>
                                      <div className="player-name-col">
                                        {playerDetails?.name || "Player"}
                                      </div>
                                      <div className="player-tier-col">
                                        {player.position}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="player-score-col">
                                    <div className="score-value">
                                      {player.position}
                                    </div>
                                  </div>
                                  <div className="player-kda-col">
                                    <div className="kda-detail">
                                      {player.performanceStats?.kills || 0}/
                                      {player.performanceStats?.deaths || 0}/
                                      {player.performanceStats?.assists || 0}
                                    </div>
                                    <div>
                                      {calculateKda(
                                        player.performanceStats?.kills || 0,
                                        player.performanceStats?.deaths || 0,
                                        player.performanceStats?.assists || 0
                                      )}
                                    </div>
                                  </div>
                                  <div className="player-damage-col">
                                    <div className="damage-value">
                                      {player.eloChange > 0
                                        ? "+" + player.eloChange
                                        : player.eloChange}
                                    </div>
                                  </div>
                                  <div className="player-wards-col">
                                    <div className="wards-value">
                                      {player.eloBefore}
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          )}

                          <div className="team-summary">
                            <div className="team-stat-row">
                              <div className="team-stat-label">Average ELO</div>
                              <div className="team-stat-bar">
                                <div
                                  className="team-stat-fill blue"
                                  style={{
                                    width: `${
                                      (match.teams.blue.averageElo /
                                        (match.teams.blue.averageElo +
                                          match.teams.red.averageElo)) *
                                      100
                                    }%`,
                                  }}
                                >
                                  {match.teams.blue.averageElo.toFixed(0)}
                                </div>
                                <div
                                  className="team-stat-fill red"
                                  style={{
                                    width: `${
                                      (match.teams.red.averageElo /
                                        (match.teams.blue.averageElo +
                                          match.teams.red.averageElo)) *
                                      100
                                    }%`,
                                  }}
                                >
                                  {match.teams.red.averageElo.toFixed(0)}
                                </div>
                              </div>
                            </div>
                            <div className="team-stat-row">
                              <div className="team-stat-label">
                                Expected Win Rate
                              </div>
                              <div className="team-stat-bar">
                                <div
                                  className="team-stat-fill blue"
                                  style={{
                                    width: `${
                                      match.teams.blue.expectedWinRate * 100
                                    }%`,
                                  }}
                                >
                                  {(
                                    match.teams.blue.expectedWinRate * 100
                                  ).toFixed(0)}
                                  %
                                </div>
                                <div
                                  className="team-stat-fill red"
                                  style={{
                                    width: `${
                                      match.teams.red.expectedWinRate * 100
                                    }%`,
                                  }}
                                >
                                  {(
                                    match.teams.red.expectedWinRate * 100
                                  ).toFixed(0)}
                                  %
                                </div>
                              </div>
                            </div>
                          </div>

                          <div
                            className="team-header"
                            style={{ marginTop: "24px" }}
                          >
                            <div
                              className={`team-title ${
                                match.winnerTeamColor === "red"
                                  ? "victory"
                                  : "defeat"
                              }`}
                            >
                              {match.winnerTeamColor === "red"
                                ? "Victory"
                                : "Defeat"}{" "}
                              (Red Team)
                            </div>
                            <div className="team-stats">
                              <div className="team-stat">Position</div>
                              <div className="team-stat">KDA</div>
                              <div className="team-stat">ELO Change</div>
                              <div className="team-stat">ELO Before</div>
                            </div>
                          </div>

                          {match.teams.red.players.map(
                            (player: any, idx: number) => {
                              // Access populated player data if available
                              const playerDetails =
                                player.playerId &&
                                typeof player.playerId !== "string"
                                  ? player.playerId
                                  : null;

                              return (
                                <div key={idx} className="player-row">
                                  <div className="player-champion-col">
                                    <Image
                                      src={
                                        playerDetails?.profileIcon ||
                                        playerDetails?.avatar ||
                                        `https://avatar.iran.liara.run/public/${
                                          Math.floor(Math.random() * 40) + 1
                                        }.png`
                                      }
                                      alt="Position"
                                      width={32}
                                      height={32}
                                      className="player-champion-img"
                                    />
                                    <div>
                                      <div className="player-name-col">
                                        {playerDetails?.name || "Player"}
                                      </div>
                                      <div className="player-tier-col">
                                        {player.position}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="player-score-col">
                                    <div className="score-value">
                                      {player.position}
                                    </div>
                                  </div>
                                  <div className="player-kda-col">
                                    <div className="kda-detail">
                                      {player.performanceStats?.kills || 0}/
                                      {player.performanceStats?.deaths || 0}/
                                      {player.performanceStats?.assists || 0}
                                    </div>
                                    <div>
                                      {calculateKda(
                                        player.performanceStats?.kills || 0,
                                        player.performanceStats?.deaths || 0,
                                        player.performanceStats?.assists || 0
                                      )}
                                    </div>
                                  </div>
                                  <div className="player-damage-col">
                                    <div className="damage-value">
                                      {player.eloChange > 0
                                        ? "+" + player.eloChange
                                        : player.eloChange}
                                    </div>
                                  </div>
                                  <div className="player-wards-col">
                                    <div className="wards-value">
                                      {player.eloBefore}
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="no-matches">
                  No matches found for this player
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
