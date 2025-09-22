import type { HighScore, Difficulty } from '../types';

/**
 * Generates a simple SVG avatar as a Base64 data URI.
 * @param name The player's name.
 * @returns A string containing the data URI for the SVG avatar.
 */
const generateAvatar = (name: string): string => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const colors = ['#FF4D00', '#00C2B8', '#FFD700', '#9B59B6', '#3498DB', '#E74C3C', '#2ECC71', '#F1C40F'];
    const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const bgColor = colors[charCodeSum % colors.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="20" fill="${bgColor}" />
        <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="16" font-weight="bold" fill="#FFF">${initials}</text>
    </svg>`;
    try {
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    } catch (e) {
        // btoa might not be available in all environments (e.g. Node), but is fine for browsers.
        // Fallback for safety.
        console.error("btoa failed", e);
        return '';
    }
};

// Generates a date for "this month"
const thisMonthDate = () => new Date().toISOString();

// Generates a date from a previous month
const lastMonthDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString();
}

// Dummy global high scores to simulate a leaderboard for the main game mode
const MOCK_GLOBAL_SCORES: HighScore[] = [
    { name: 'Godslayer', score: 98540, level: 25, countryCode: 'KR', avatarUrl: generateAvatar('Godslayer'), date: lastMonthDate() },
    { name: 'Nightmare', score: 95120, level: 24, countryCode: 'CN', avatarUrl: generateAvatar('Nightmare'), date: thisMonthDate() },
    { name: 'TheUnseen', score: 92770, level: 22, countryCode: 'SE', avatarUrl: generateAvatar('TheUnseen'), date: lastMonthDate() },
    { name: 'Apex', score: 55430, level: 15, countryCode: 'JP', avatarUrl: generateAvatar('Apex'), date: thisMonthDate() },
    { name: 'Catalyst', score: 53210, level: 14, countryCode: 'US', avatarUrl: generateAvatar('Catalyst'), date: thisMonthDate() },
    { name: 'Infinity', score: 51990, level: 14, countryCode: 'DE', avatarUrl: generateAvatar('Infinity'), date: lastMonthDate() },
    { name: 'Zenith', score: 49870, level: 13, countryCode: 'GB', avatarUrl: generateAvatar('Zenith'), date: lastMonthDate() },
    { name: 'Oblivion', score: 48520, level: 12, countryCode: 'RU', avatarUrl: generateAvatar('Oblivion'), date: thisMonthDate() },
    { name: 'Vortex', score: 35820, level: 9, countryCode: 'DE', avatarUrl: generateAvatar('Vortex'), date: thisMonthDate() },
    { name: 'Wraith', score: 34110, level: 9, countryCode: 'GB', avatarUrl: generateAvatar('Wraith'), date: lastMonthDate() },
    { name: 'Quantum', score: 32780, level: 8, countryCode: 'US', avatarUrl: generateAvatar('Quantum'), date: lastMonthDate() },
    { name: 'Celeste', score: 31050, level: 8, countryCode: 'FR', avatarUrl: generateAvatar('Celeste'), date: thisMonthDate() },
];

const LOCAL_STORAGE_KEY = 'lumina-main-scores';

/**
 * Retrieves global high scores for the main game mode from the static list.
 * @returns An array of high score objects.
 */
export const getGlobalHighScores = (): HighScore[] => {
  return MOCK_GLOBAL_SCORES || [];
};

/**
 * Retrieves local high scores from localStorage for the main game mode.
 * @returns An array of high score objects.
 */
export const getLocalHighScores = (): HighScore[] => {
  try {
    const storedScores = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedScores) {
      const allScores: { mainGame?: HighScore[] } = JSON.parse(storedScores);
      return allScores.mainGame || [];
    }
  } catch (error) {
    console.error("Failed to retrieve local high scores:", error);
  }
  return [];
};


/**
 * Saves a new score to the main local leaderboard in localStorage.
 * @param name The player's name.
 * @param score The player's final score.
 * @param level The player's level at game over.
 */
export const saveLocalHighScore = (name: string, score: number, level: number): void => {
  if (score <= 0) return; // Don't save zero scores.

  try {
    const storedScores = localStorage.getItem(LOCAL_STORAGE_KEY);
    const allScores: { mainGame?: HighScore[] } = storedScores ? JSON.parse(storedScores) : {};

    // Get country code from browser locale for a more personalized experience.
    let userCountryCode = 'XX'; // A non-standard code as a fallback.
    const userLocale = navigator.language;
    if (userLocale && userLocale.includes('-')) {
        const countryCode = userLocale.split('-')[1];
        if (countryCode) {
            userCountryCode = countryCode.toUpperCase();
        }
    }
    
    const newScore: HighScore = { name, score, level, countryCode: userCountryCode, avatarUrl: generateAvatar(name), date: new Date().toISOString() };
    
    const gameScores = allScores.mainGame || [];

    // Add the new score and sort
    gameScores.push(newScore);
    gameScores.sort((a, b) => b.score - a.score);

    // Keep only the top 12 scores
    allScores.mainGame = gameScores.slice(0, 12);

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allScores));
    console.log(`Saved local score for ${name} (${score} in main game).`);

  } catch (error) {
    console.error("Failed to save local high score:", error);
  }
};