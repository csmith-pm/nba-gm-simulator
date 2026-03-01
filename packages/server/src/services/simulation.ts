import {
  POSITIONS,
  PICKS_PER_TEAM,
  SERIES_WINS_NEEDED,
  MAX_SERIES_GAMES,
  HOME_COURT_PATTERN,
  BASE_TEAM_SCORE,
  SCORE_VARIANCE_STDDEV,
  HOME_COURT_BONUS,
  POSITION_FIT_PENALTY,
  type Position,
  type GamePlayerStats,
  type GameLog,
  type SeriesGame,
} from '@nba-gm/shared';

interface TeamPlayer {
  playerId: number;
  playerName: string;
  assignedPosition: Position;
  primaryPosition: Position | null;
  stats: {
    ppg: number;
    rpg: number;
    apg: number;
    spg: number;
    bpg: number;
    fgPct: number;
    ftPct: number;
    threePct: number;
    minutesPg: number;
  };
}

// Box-Muller transform for normal distribution
function normalRandom(mean: number, stddev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stddev;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getPositionFit(primaryPos: Position | null, assignedPos: Position): number {
  if (!primaryPos) return 0.05; // Unknown position gets a small penalty
  return POSITION_FIT_PENALTY[primaryPos]?.[assignedPos] ?? 0.05;
}

function calculateTeamRatings(team: TeamPlayer[]) {
  let offense = 0;
  let defense = 0;

  for (const player of team) {
    const fit = 1 - getPositionFit(player.primaryPosition, player.assignedPosition);

    // Offense: weighted by PPG, APG, shooting percentages
    const playerOffense =
      player.stats.ppg * 1.0 +
      player.stats.apg * 1.5 +
      player.stats.fgPct * 15 +
      player.stats.threePct * 10 +
      player.stats.ftPct * 5;

    // Defense: weighted by RPG, SPG, BPG
    const playerDefense =
      player.stats.rpg * 1.2 +
      player.stats.spg * 3.0 +
      player.stats.bpg * 3.0;

    offense += playerOffense * fit;
    defense += playerDefense * fit;
  }

  return { offense, defense };
}

function simulatePlayerGameStats(player: TeamPlayer, teamScoreRatio: number): GamePlayerStats {
  // Scale individual stats proportional to career averages and team performance
  const scale = clamp(normalRandom(teamScoreRatio, 0.15), 0.5, 1.8);

  const minutes = clamp(Math.round(normalRandom(player.stats.minutesPg, 4)), 12, 42);
  const minuteScale = minutes / Math.max(player.stats.minutesPg, 1);

  const points = Math.max(0, Math.round(player.stats.ppg * scale * minuteScale));
  const rebounds = Math.max(0, Math.round(player.stats.rpg * scale * minuteScale));
  const assists = Math.max(0, Math.round(player.stats.apg * scale * minuteScale));
  const steals = Math.max(0, Math.round(player.stats.spg * scale * minuteScale));
  const blocks = Math.max(0, Math.round(player.stats.bpg * scale * minuteScale));

  // Estimate shot attempts from points
  const fgAttempted = Math.max(1, Math.round(points / clamp(player.stats.fgPct * 2 + 0.2, 0.6, 1.4)));
  const fgMade = Math.min(fgAttempted, Math.round(fgAttempted * clamp(normalRandom(player.stats.fgPct, 0.08), 0.1, 0.85)));
  const threeAttempted = Math.max(0, Math.round(fgAttempted * 0.35));
  const threeMade = Math.min(threeAttempted, Math.round(threeAttempted * clamp(normalRandom(player.stats.threePct, 0.1), 0, 0.7)));
  const ftAttempted = Math.max(0, Math.round(points * 0.25));
  const ftMade = Math.min(ftAttempted, Math.round(ftAttempted * clamp(normalRandom(player.stats.ftPct, 0.08), 0.2, 1.0)));

  return {
    playerId: player.playerId,
    playerName: player.playerName,
    position: player.assignedPosition,
    points,
    rebounds,
    assists,
    steals,
    blocks,
    fgMade,
    fgAttempted,
    threeMade,
    threeAttempted,
    ftMade,
    ftAttempted,
    minutes,
  };
}

function simulateGame(
  team1: TeamPlayer[],
  team2: TeamPlayer[],
  homeTeam: 1 | 2,
): { team1Score: number; team2Score: number; gameLog: GameLog } {
  const team1Ratings = calculateTeamRatings(team1);
  const team2Ratings = calculateTeamRatings(team2);

  // Expected score differential
  const offenseDiff = (team1Ratings.offense - team2Ratings.offense) * 0.15;
  const defenseDiff = (team1Ratings.defense - team2Ratings.defense) * 0.12;

  const homeBonus = homeTeam === 1 ? HOME_COURT_BONUS : -HOME_COURT_BONUS;

  const expectedDiff = offenseDiff + defenseDiff + homeBonus;

  const team1Score = Math.round(clamp(
    normalRandom(BASE_TEAM_SCORE + expectedDiff / 2, SCORE_VARIANCE_STDDEV),
    75, 140
  ));
  const team2Score = Math.round(clamp(
    normalRandom(BASE_TEAM_SCORE - expectedDiff / 2, SCORE_VARIANCE_STDDEV),
    75, 140
  ));

  // Avoid ties — give edge to home team
  const finalTeam1Score = team1Score === team2Score ? team1Score + (homeTeam === 1 ? 1 : -1) : team1Score;
  const finalTeam2Score = team1Score === team2Score ? team2Score + (homeTeam === 2 ? 1 : -1) : team2Score;

  // Generate individual stats
  const team1Ratio = finalTeam1Score / BASE_TEAM_SCORE;
  const team2Ratio = finalTeam2Score / BASE_TEAM_SCORE;

  const gameLog: GameLog = {
    team1Players: team1.map(p => simulatePlayerGameStats(p, team1Ratio)),
    team2Players: team2.map(p => simulatePlayerGameStats(p, team2Ratio)),
  };

  return { team1Score: finalTeam1Score, team2Score: finalTeam2Score, gameLog };
}

export function simulateSeries(
  team1: TeamPlayer[],
  team2: TeamPlayer[],
  team1UserId: number,
  team2UserId: number,
): { games: Omit<SeriesGame, 'seriesId'>[]; winnerUserId: number } {
  const games: Omit<SeriesGame, 'seriesId'>[] = [];
  let team1Wins = 0;
  let team2Wins = 0;

  for (let gameNum = 0; gameNum < MAX_SERIES_GAMES; gameNum++) {
    if (team1Wins >= SERIES_WINS_NEEDED || team2Wins >= SERIES_WINS_NEEDED) break;

    const homeTeam = HOME_COURT_PATTERN[gameNum];
    const result = simulateGame(team1, team2, homeTeam);

    const winnerUserId = result.team1Score > result.team2Score ? team1UserId : team2UserId;
    if (result.team1Score > result.team2Score) team1Wins++;
    else team2Wins++;

    games.push({
      gameNumber: gameNum + 1,
      team1Score: result.team1Score,
      team2Score: result.team2Score,
      winnerUserId,
      gameLog: result.gameLog,
    });
  }

  return {
    games,
    winnerUserId: team1Wins >= SERIES_WINS_NEEDED ? team1UserId : team2UserId,
  };
}

export type { TeamPlayer };
