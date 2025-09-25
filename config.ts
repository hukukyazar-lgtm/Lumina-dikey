import { Difficulty, WordLength } from './types';

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
    Mythic: '🏆'
};


export const MEMORY_GAME_INTERVAL = 5;
export const LIFE_BONUS_INTERVAL = 10;
export const STARTING_LIVES = 3;
export const MAX_LIVES = 6;
export const ENDLESS_TIMER = 15;

export const MENU_BACKGROUND_URL = 'https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg?auto=compress&cs=tinysrgb&w=1920';

export const endlessAnimations: string[] = [
  'animate-spin-novice',
  'animate-spin-apprentice',
  'animate-spin-adept',
  'animate-spin-skilled',
  'animate-spin-seasoned',
  'animate-spin-veteran',
  'animate-tumble-master',
  'animate-tumble-grandmaster',
  'animate-tumble-legend',
  'animate-tumble-mythic',
  'animate-spin-y-reverse',
  'animate-spin-x-reverse',
  'animate-tumble-xy-reverse',
  'animate-tumble-yz-reverse',
  'animate-tumble-xz-reverse',
  'animate-tumble-xyz-reverse',
  'animate-spin-diagonal-cw-reverse',
  'animate-spin-diagonal-ccw-reverse',
  'animate-spin-corkscrew-reverse',
  'animate-spin-wobble-1',
  'animate-spin-wobble-2',
  'animate-spin-wobble-3',
  'animate-tumble-xy-z',
  'animate-tumble-x-yz',
  'animate-tumble-xz-y',
  'animate-spin-fast',
  'animate-spin-y-fast',
  'animate-spin-x-fast',
  'animate-tumble-xyz-fast',
  'animate-spin-off-axis',
  'animate-spin-pendulum-x',
  'animate-spin-pendulum-y',
  'animate-pulse-and-spin-y',
  'animate-spin-z-slow',
  'animate-spin-interrupted-y',
  'animate-spin-corkscrew-wide',
  'animate-spin-drift',
  'animate-tumble-flip',
  'animate-spin-infinity',
  'animate-spin-axis-shift',
  'animate-tumble-gentle-xy',
  'animate-spin-off-axis-2',
  'animate-spin-off-axis-3',
  'animate-spin-swing-z',
  'animate-spin-flip-over',
  'animate-spin-slow-motion',
  'animate-spin-jitter',
  'animate-spin-barrel-roll-y',
  'animate-tumble-unstable',
  'animate-spin-wind-up',
  'animate-spin-layered',
];

export const difficultyBackgrounds: Record<Difficulty, string[]> = {
  Novice: [
    'https://images.pexels.com/photos/1274260/pexels-photo-1274260.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/1938348/pexels-photo-1938348.jpeg?auto=compress&cs=tinysrgb&w=1920',
  ],
  Apprentice: [
    'https://images.pexels.com/photos/3994366/pexels-photo-3994366.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/73873/star-clusters-rosette-nebula-star-galaxies-73873.jpeg?auto=compress&cs=tinysrgb&w=1920',
  ],
  Adept: [
    'https://images.pexels.com/photos/110854/pexels-photo-110854.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/3554424/pexels-photo-3554424.jpeg?auto=compress&cs=tinysrgb&w=1920',
  ],
  Skilled: [
    'https://images.pexels.com/photos/956981/pexels-photo-956981.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/1257860/pexels-photo-1257860.jpeg?auto=compress&cs=tinysrgb&w=1920',
  ],
  Seasoned: [
    'https://images.pexels.com/photos/32237/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg?auto=compress&cs=tinysrgb&w=1920',
  ],
  Veteran: [
    'https://images.pexels.com/photos/220201/pexels-photo-220201.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/41951/solar-system-emergence-spitzer-space-telescope-telescope-41951.jpeg?auto=compress&cs=tinysrgb&w=1920',
  ],
  Master: [
    'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/39561/solar-flare-sun-eruption-energy-39561.jpeg?auto=compress&cs=tinysrgb&w=1920',
  ],
  Grandmaster: [
    'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/47367/full-moon-moon-bright-sky-47367.jpeg?auto=compress&cs=tinysrgb&w=1920',
  ],
  Legend: [
    'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=1920',
  ],
  Mythic: [
    'https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/1274260/pexels-photo-1274260.jpeg?auto=compress&cs=tinysrgb&w=1920',
  ],
};

// High-resolution, artistic/illustrative image URLs for planets
export const planetImageUrls: string[] = [
    // 1. Earth
    'https://storage.googleapis.com/luminaassets/D%C3%BCnya.jpg',
    // 2. Venus (Hot, cloudy)
    'https://storage.googleapis.com/luminaassets/Ven%C3%BCs.jpg',
    // 3. Mars (Red planet) - USER SPECIFIED
    'https://storage.googleapis.com/luminaassets/Mars.jpg',
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