

import { Difficulty, WordLength, Achievement, ShopItem } from './types';

export const difficultySettings: Record<Difficulty, { wordLength: WordLength, timer: number, baseAnimationDuration: number }> = {
  Novice: { wordLength: 5, timer: 22, baseAnimationDuration: 9 },
  Apprentice: { wordLength: 5, timer: 20, baseAnimationDuration: 8 },
  Adept: { wordLength: 6, timer: 18, baseAnimationDuration: 8 },
  Skilled: { wordLength: 6, timer: 16, baseAnimationDuration: 7 },
  Seasoned: { wordLength: 7, timer: 14, baseAnimationDuration: 7 },
  Veteran: { wordLength: 7, timer: 12, baseAnimationDuration: 6 },
  Master: { wordLength: 8, timer: 12, baseAnimationDuration: 6 },
  Grandmaster: { wordLength: 8, timer: 10, baseAnimationDuration: 5.5 },
  Legend: { wordLength: 8, timer: 9, baseAnimationDuration: 5 },
  Mythic: { wordLength: 8, timer: 8, baseAnimationDuration: 4.5 },
};

export const difficultyProgression: Difficulty[] = [
  'Novice', 'Apprentice', 'Adept', 'Skilled', 'Seasoned',
  'Veteran', 'Master', 'Grandmaster', 'Legend', 'Mythic'
];

export const difficultyPoints: Record<Difficulty, number> = {
  Novice: 1,
  Apprentice: 2,
  Adept: 3,
  Skilled: 4,
  Seasoned: 5,
  Veteran: 6,
  Master: 7,
  Grandmaster: 8,
  Legend: 9,
  Mythic: 10,
};

export const difficultyEmojis: Record<Difficulty, string> = {
    Novice: '😊',
    Apprentice: '🙂',
    Adept: '💪',
    Skilled: '😉',
    Seasoned: '🔥',
    Veteran: '😎',
    Master: '😈',
    Grandmaster: '🤯',
    Legend: '💀',
    Mythic: '💎'
};


export const MEMORY_GAME_INTERVAL = 5; // How many rounds until a memory game
export const ADVENTURE_GATEWAYS_PER_PLANET = 6; // How many gateways to complete a planet
export const LIFE_BONUS_INTERVAL = 10;
export const STARTING_LIVES = 3;
export const MAX_LIVES = 6;
export const ENDLESS_TIMER = 15;

// Unlock scores for different game modes based on endless high score
export const PRACTICE_MODE_UNLOCK_SCORE = 30;
export const DUEL_MODE_UNLOCK_SCORE = 60;
export const ADVENTURE_MODE_UNLOCK_SCORE = 120;

// NEW: Cube color palettes for randomization
export const cubeColorPalettes = [
  { // Default/Quantum Play
    '--cube-face-bg': 'rgba(26, 14, 42, 0.2)',
    '--cube-face-border': 'rgba(0, 240, 255, 0.2)',
    '--cube-face-text-color': '#00F0FF',
    '--cube-face-text-shadow': '0 0 8px #00F0FF',
  },
  { // Solar Flare (from theme)
    '--cube-face-bg': 'rgba(58, 28, 0, 0.2)',
    '--cube-face-border': 'rgba(255, 215, 0, 0.2)',
    '--cube-face-text-color': '#FFD700',
    '--cube-face-text-shadow': '0 0 8px #FFD700',
  },
  { // Deep Ocean (from theme)
    '--cube-face-bg': 'rgba(0, 34, 51, 0.2)',
    '--cube-face-border': 'rgba(0, 191, 255, 0.2)',
    '--cube-face-text-color': '#00BFFF',
    '--cube-face-text-shadow': '0 0 8px #00BFFF',
  },
  { // Emerald
    '--cube-face-bg': 'rgba(10, 60, 35, 0.25)',
    '--cube-face-border': 'rgba(80, 200, 120, 0.3)',
    '--cube-face-text-color': '#50C878',
    '--cube-face-text-shadow': '0 0 10px #50C878',
  },
  { // Ruby
    '--cube-face-bg': 'rgba(70, 0, 10, 0.25)',
    '--cube-face-border': 'rgba(224, 30, 65, 0.3)',
    '--cube-face-text-color': '#E01E41',
    '--cube-face-text-shadow': '0 0 10px #E01E41',
  },
  { // Amethyst
    '--cube-face-bg': 'rgba(50, 20, 80, 0.25)',
    '--cube-face-border': 'rgba(153, 102, 204, 0.3)',
    '--cube-face-text-color': '#9966CC',
    '--cube-face-text-shadow': '0 0 10px #9966CC',
  },
  { // Sapphire
    '--cube-face-bg': 'rgba(5, 25, 80, 0.25)',
    '--cube-face-border': 'rgba(15, 82, 186, 0.3)',
    '--cube-face-text-color': '#0F52BA',
    '--cube-face-text-shadow': '0 0 10px #0F52BA',
  },
  { // White Diamond
    '--cube-face-bg': 'rgba(200, 200, 210, 0.15)',
    '--cube-face-border': 'rgba(255, 255, 255, 0.3)',
    '--cube-face-text-color': '#FFFFFF',
    '--cube-face-text-shadow': '0 0 12px #FFFFFF',
  },
];

// NEW: Definitive cube styles library
export const cubeStyles = [
  {
    id: 'default',
    nameKey: 'default',
    descriptionKey: 'default',
    variables: {
      '--cube-face-bg': 'var(--brand-secondary)',
      '--cube-face-border': 'rgba(0, 240, 255, 0.2)',
      '--cube-face-text-color': 'var(--brand-accent-secondary)',
      '--cube-face-text-shadow': '0 0 8px var(--brand-accent-secondary)',
      '--cube-font-family': "'Orbitron', sans-serif",
      '--cube-face-extra-animation': 'none',
    }
  },
  {
    id: 'crystal',
    nameKey: 'cubeStyleCrystalName',
    descriptionKey: 'cubeStyleCrystalDesc',
    variables: {
      '--cube-face-bg': 'radial-gradient(circle, rgba(173, 216, 230, 0.3) 0%, rgba(26, 14, 42, 0.15) 70%)',
      '--cube-face-border': 'rgba(255, 255, 255, 0.4)',
      '--cube-face-text-color': '#FFFFFF',
      '--cube-face-text-shadow': '0 0 10px #FFFFFF, 0 0 20px #00F0FF',
      '--cube-font-family': "'Nunito', sans-serif",
      '--cube-face-extra-animation': 'none',
    }
  },
  {
    id: 'metal',
    nameKey: 'cubeStyleMetalName',
    descriptionKey: 'cubeStyleMetalDesc',
    variables: {
      '--cube-face-bg': 'linear-gradient(135deg, #555 0%, #333 100%)',
      '--cube-face-border': '#222',
      '--cube-face-text-color': '#E0E0E0',
      '--cube-face-text-shadow': '0 0 2px #000000',
      '--cube-font-family': "'Orbitron', sans-serif",
      '--cube-face-extra-animation': 'none',
    }
  },
  {
    id: 'wireframe',
    nameKey: 'cubeStyleWireframeName',
    descriptionKey: 'cubeStyleWireframeDesc',
    variables: {
      '--cube-face-bg': 'transparent',
      '--cube-face-border': 'var(--brand-accent-secondary)',
      '--cube-face-text-color': 'var(--brand-accent-secondary)',
      '--cube-face-text-shadow': '0 0 8px var(--brand-accent-secondary)',
      '--cube-font-family': "'Share Tech Mono', monospace",
      '--cube-face-extra-animation': 'none',
    }
  },
  {
    id: 'blueprint',
    nameKey: 'cubeStyleBlueprintName',
    descriptionKey: 'cubeStyleBlueprintDesc',
    variables: {
      '--cube-face-bg': 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px), radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px), #1d4ed8',
      '--cube-face-bg-size': '20px 20px, 20px 20px',
      '--cube-face-border': '#FFFFFF',
      '--cube-face-text-color': '#FFFFFF',
      '--cube-face-text-shadow': 'none',
      '--cube-font-family': "'Share Tech Mono', monospace",
      '--cube-face-extra-animation': 'none',
    }
  },
  {
    id: 'wood',
    nameKey: 'cubeStyleWoodName',
    descriptionKey: 'cubeStyleWoodDesc',
    variables: {
      '--cube-face-bg': 'linear-gradient(45deg, #8B4513, #A0522D)',
      '--cube-face-border': '#654321',
      '--cube-face-text-color': '#432109',
      '--cube-face-text-shadow': '1px 1px 1px #D2B48C',
      '--cube-font-family': "'Nunito', sans-serif",
      '--cube-face-extra-animation': 'none',
    }
  },
  {
    id: 'holographic',
    nameKey: 'cubeStyleHolographicName',
    descriptionKey: 'cubeStyleHolographicDesc',
    variables: {
      '--cube-face-bg': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%), repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(0, 240, 255, 0.1) 5px, rgba(0, 240, 255, 0.1) 10px)',
      '--cube-face-border': 'var(--brand-accent-secondary)',
      '--cube-face-text-color': 'var(--brand-quaternary)',
      '--cube-face-text-shadow': '0 0 12px var(--brand-accent-secondary)',
      '--cube-font-family': "'Share Tech Mono', monospace",
      '--cube-face-extra-animation': 'holo-shift 5s linear infinite',
    }
  }
];

// New structure for animations based on difficulty
const noviceAnimations = [
  'animate-spin-novice',
  'animate-spin-y-reverse', // Add variation early
  'animate-spin-slow-motion',
];

// Apprentice (5+ words): Introduce diagonal and corkscrew spins immediately.
const apprenticeAnimations = [
  ...noviceAnimations,
  'animate-spin-apprentice',
  'animate-spin-adept',
  'animate-spin-skilled',
  'animate-spin-diagonal-cw',
  'animate-spin-diagonal-ccw',
  'animate-spin-corkscrew',
];

// Adept (10+ words): Introduce tumbling and wobbles.
const adeptAnimations = [
  ...apprenticeAnimations,
  'animate-tumble-gentle-xy',
  'animate-tumble-master',
  'animate-spin-wobble-1',
  'animate-spin-x',
  'animate-spin-z-slow',
];

// Skilled (15+ words): More complex tumbles and unpredictable movement.
const skilledAnimations = [
  ...adeptAnimations,
  'animate-tumble-grandmaster',
  'animate-spin-drift',
  'animate-spin-pendulum-y',
  'animate-spin-corkscrew-reverse',
  'animate-spin-diagonal-cw-reverse',
];

// Seasoned (20+ words): Getting chaotic. Multi-axis tumbles.
const seasonedAnimations = [
  ...skilledAnimations,
  'animate-spin-seasoned',
  'animate-tumble-legend',
  'animate-tumble-mythic',
  'animate-spin-infinity',
  'animate-spin-wobble-2',
  'animate-tumble-xy-reverse',
];

// Veteran (25+ words): More reversed and complex moves
const veteranAnimations = [
  ...seasonedAnimations,
  'animate-tumble-yz-reverse',
  'animate-spin-interrupted-y',
  'animate-tumble-flip',
  'animate-tumble-unstable',
];

// Master (30+ words): Most complex single moves
const masterAnimations = [
  ...veteranAnimations,
  'animate-tumble-xz-reverse',
  'animate-spin-pendulum-x',
  'animate-spin-wind-up',
  'animate-spin-axis-shift',
  'animate-tumble-x-yz',
];

// Grandmaster (35+ words): Combining movements and speed
const grandmasterAnimations = [
  ...masterAnimations,
  'animate-pulse-and-spin-y',
  'animate-spin-barrel-roll-y',
  'animate-tumble-xyz-reverse',
  'animate-spin-off-axis',
];

// Legend (40+ words): Very unpredictable
const legendAnimations = [
  ...grandmasterAnimations,
  'animate-spin-swing-z',
  'animate-spin-flip-over',
  'animate-spin-jitter',
  'animate-tumble-xz-y',
  'animate-tumble-xy-z',
  'animate-spin-off-axis-2',
];

// Mythic (45+ words): Everything, including fast versions
const mythicAnimations = [
  ...legendAnimations,
  'animate-spin-fast',
  'animate-spin-y-fast',
  'animate-spin-x-fast',
  'animate-tumble-xyz-fast',
  'animate-spin-off-axis-3',
  'animate-spin-layered',
];


export const difficultyAnimations: Record<Difficulty, string[]> = {
  Novice: noviceAnimations,
  Apprentice: apprenticeAnimations,
  Adept: adeptAnimations,
  Skilled: skilledAnimations,
  Seasoned: seasonedAnimations,
  Veteran: veteranAnimations,
  Master: masterAnimations,
  Grandmaster: grandmasterAnimations,
  Legend: legendAnimations,
  Mythic: mythicAnimations,
};

// --- START PROFILE & ACHIEVEMENT CONFIG ---

export const avatars: { id: string; icon: string; unlock?: string }[] = [
    { id: 'default', icon: '🧑‍🚀' },
    { id: 'alien', icon: '👽', unlock: 'endless_100' },
    { id: 'robot', icon: '🤖', unlock: 'money_500' },
    { id: 'ghost', icon: '👻', unlock: 'endless_250' },
    { id: 'crown', icon: '👑', unlock: 'money_1000' },
];

export const achievements: Achievement[] = [
    {
        id: 'endless_50',
        titleKey: 'ach_endless_50_title',
        descriptionKey: 'ach_endless_50_desc',
        icon: '🚀',
        condition: (state) => state.endlessHighScore >= 50,
    },
    {
        id: 'endless_100',
        titleKey: 'ach_endless_100_title',
        descriptionKey: 'ach_endless_100_desc',
        icon: '⭐',
        condition: (state) => state.endlessHighScore >= 100,
    },
    {
        id: 'endless_250',
        titleKey: 'ach_endless_250_title',
        descriptionKey: 'ach_endless_250_desc',
        icon: '🌟',
        condition: (state) => state.endlessHighScore >= 250,
    },
    {
        id: 'money_500',
        titleKey: 'ach_money_500_title',
        descriptionKey: 'ach_money_500_desc',
        icon: '☄️',
        condition: (state) => state.gameMoney >= 500,
    },
    {
        id: 'money_1000',
        titleKey: 'ach_money_1000_title',
        descriptionKey: 'ach_money_1000_desc',
        icon: '💰',
        condition: (state) => state.gameMoney >= 1000,
    },
];


// --- END PROFILE & ACHIEVEMENT CONFIG ---

// --- START SHOP CONFIG ---

export const shopItems: ShopItem[] = [
    // Power-ups
    {
        id: 'extra-life',
        nameKey: 'item_extra_life_name',
        descriptionKey: 'item_extra_life_desc',
        category: 'power-ups',
        icon: '❤️',
        price: 250,
    },
    // Upgrades
    {
        id: 'score-multiplier',
        nameKey: 'item_score_multiplier_name',
        descriptionKey: 'item_score_multiplier_desc',
        category: 'upgrades',
        icon: '✨',
        price: [500, 1500, 3000], // Prices for level 1, 2, 3
    },
    // Cosmetics
    {
        id: 'theme-gold',
        nameKey: 'item_theme_gold_name',
        descriptionKey: 'item_theme_gold_desc',
        category: 'cosmetics',
        icon: '🌟',
        price: 1000,
    },
    {
        id: 'theme-holo',
        nameKey: 'item_theme_holo_name',
        descriptionKey: 'item_theme_holo_desc',
        category: 'cosmetics',
        icon: '💠',
        price: 1000,
    },
    {
        id: 'theme-solar-flare',
        nameKey: 'item_theme_solar_flare_name',
        descriptionKey: 'item_theme_solar_flare_desc',
        category: 'cosmetics',
        icon: '🔥',
        price: 1500,
    },
    {
        id: 'theme-deep-ocean',
        nameKey: 'item_theme_deep_ocean_name',
        descriptionKey: 'item_theme_deep_ocean_desc',
        category: 'cosmetics',
        icon: '🌊',
        price: 1500,
    },
];

// --- END SHOP CONFIG ---


// High-resolution, artistic/illustrative image URLs for planets
export const planetImageUrls: string[] = [
    // 1. Earth
    'https://storage.googleapis.com/lumina-assets/stylized-earth-tech-v4.jpg',
    // 2. Venus (Hot, cloudy)
    'https://storage.googleapis.com/luminaassets/Ven%C3%BCs.jpg',
    // 3. Mars (Red planet) - USER PROVIDED
    'https://storage.googleapis.com/lumina-assets/mars-high-detail-2048.jpg',
    // 4. Mercury (Rocky, cratered)
    'https://storage.googleapis.com/luminaassets/Merk%C3%BCr.jpg',
    // 5. Ceres (Icy asteroid)
    'https://storage.googleapis.com/luminaassets/Ceres.jpg',
    // 6. Jupiter (Great Red Spot, artistic)
    'https://storage.googleapis.com/luminaassets/J%C3%BCpiter.jpg',
    // 7. Saturn (Rings)
    'https://storage.googleapis.com/luminaassets/Sat%C3%BCrn.jpg',
    // 8. Uranus (Pale blue/green)
    'https://storage.googleapis.com/luminaassets/Uran%C3%BCs.jpg',
    // 9. Neptune (Deep blue)
    'https://storage.googleapis.com/luminaassets/Neptune.jpg',
    // 10. Pluto (Distant, icy)
    'https://storage.googleapis.com/luminaassets/Pluto.jpg',
    // 11. Haumea (Artistic representation, elliptical)
    'https://storage.googleapis.com/luminaassets/Haumea.jpg',
    // 12. Makemake (Artistic representation, reddish)
    'https://storage.googleapis.com/luminaassets/Makemake.jpg',
    // 13. Eris (Artistic representation, rocky)
    'https://storage.googleapis.com/luminaassets/Eris.jpg',
    // 14. Proxima Centauri b (Purple/red nebula planet)
    'https://storage.googleapis.com/luminaassets/Cantaruri.jpg',
    // 15. TRAPPIST-1 System (Multiple planets)
    'https://storage.googleapis.com/luminaassets/Trapiist.jpg',
    // 16. 55 Cancri e (Janssen) (Crystalline feel)
    'https://storage.googleapis.com/luminaassets/Cancri.jpg',
    // 17. 51 Pegasi b (Dimidium) (Hot Jupiter)
    'https://storage.googleapis.com/luminaassets/Pegasi.jpg',
    // 18. HD 189733b (Deep blue planet)
    'https://storage.googleapis.com/luminaassets/Pegasi.jpg',
    // 19. HD 209458 b (Osiris) (Atmospheric glow)
    'https://storage.googleapis.com/luminaassets/Osiris.jpg',
    // 20. Kepler-186f (Red-tinged nebula planet)
    'https://storage.googleapis.com/luminaassets/Kepler186.jpg',
    // 21. TrES-2b (Dark planet)
    'https://storage.googleapis.com/luminaassets/Blackplanet.jpg',
    // 22. Kepler-452b (Earth-like)
    'https://storage.googleapis.com/luminaassets/Kepler.jpg',
    // 23. PSR B1257+12 (Pulsar, abstract)
    'https://storage.googleapis.com/luminaassets/Psr.jpg',
    // 24. M51-ULS-1b (Whirlpool galaxy)
    'https://storage.googleapis.com/luminaassets/M51.jpg'
];

// Custom background sizes for each planet to ensure optimal cropping
export const planetBackgroundSizes: string[] = [
    '160%', // Earth (OK)
    '160%', // Venus (OK)
    '240%', // Mars - Adjusted for new, high-detail image
    '220%', // Mercury
    '250%', // Ceres
    '200%', // Jupiter
    '150%', // Saturn (to show rings)
    '200%', // Uranus
    '250%', // Neptune
    '250%', // Pluto
    '220%', // Haumea (wide image)
    '220%', // Makemake (wide image)
    '220%', // Eris (wide image)
    '200%', // Proxima Centauri b
    '110%', // TRAPPIST-1 System (shows multiple planets)
    '200%', // 55 Cancri e
    '200%', // 51 Pegasi b
    '160%', // HD 189733b (OK)
    '200%', // HD 209458 b (Osiris)
    '200%', // Kepler-186f
    '200%', // TrES-2b
    '160%', // Kepler-452b (OK)
    '140%', // PSR B1257+12 (abstract)
    '110%', // M51-ULS-1b (galaxy)
];

// Centralized list of translation keys for planet names for consistency
export const planetNameTranslationKeys: string[] = [
    'planet_earth_name', 'planet_venus_name', 'planet_mars_name', 'planet_mercury_name',
    'planet_ceres_name', 'planet_jupiter_name', 'planet_saturn_name', 'planet_uranus_name',
    'planet_neptune_name', 'planet_pluto_name', 'planet_haumea_name', 'planet_makemake_name',
    'planet_eris_name', 'planet_proxima_b_name', 'planet_trappist1_name',
    'planet_55_cancri_e_name', 'planet_51_pegasi_b_name', 'planet_hd_189733b_name',
    'planet_hd_209458b_name', 'planet_kepler_186f_name', 'planet_tres_2b_name',
    'planet_kepler_452b_name', 'planet_psr_b1257_name', 'planet_m51_uls_1b_name'
];