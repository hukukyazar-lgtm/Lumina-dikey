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
    'https://images.pexels.com/photos/4245826/pexels-photo-4245826.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/1769356/pexels-photo-1769356.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg?auto=compress&cs=tinysrgb&w=1920',
  ],
  Apprentice: [
    'https://images.pexels.com/photos/2246476/pexels-photo-2246476.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/507410/pexels-photo-507410.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/2115217/pexels-photo-2115217.jpeg?auto=compress&cs=tinysrgb&w=1920',
  ],
  Adept: [
    'https://images.pexels.com/photos/7234382/pexels-photo-7234382.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/2086361/pexels-photo-2086361.jpeg?auto=compress&cs=tinysrgb&w=1920',
  ],
  Skilled: [
    'https://images.pexels.com/photos/956999/pexels-photo-956999.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/370799/pexels-photo-370799.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/406152/pexels-photo-406152.jpeg?auto=compress&cs=tinysrgb&w=1920',
  ],
  Seasoned: [
    'https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/1577033/pexels-photo-1577033.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/1423600/pexels-photo-1423600.jpeg?auto=compress&cs=tinysrgb&w=1920',
  ],
  Veteran: [
    'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/735911/pexels-photo-735911.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/247599/pexels-photo-247599.jpeg?auto=compress&cs=tinysrgb&w=1920',
  ],
  Master: [
    'https://images.pexels.com/photos/47367/full-moon-moon-bright-sky-47367.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/1136575/pexels-photo-1136575.jpeg?auto=compress&cs=tinysrgb&w=1920',
  ],
  Grandmaster: [
    'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/39561/solar-flare-sun-eruption-energy-39561.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=1920',
  ],
  Legend: [
    'https://images.pexels.com/photos/1083822/pexels-photo-1083822.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/5474028/pexels-photo-5474028.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/5473955/pexels-photo-5473955.jpeg?auto=compress&cs=tinysrgb&w=1920',
  ],
  Mythic: [
    'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/129731/pexels-photo-129731.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/41951/solar-system-emergence-spitzer-space-telescope-telescope-41951.jpeg?auto=compress&cs=tinysrgb&w=1920',
  ],
};

// High-resolution, realistic image URLs for planets
export const planetImageUrls: string[] = [
    // 1. Earth
    'https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg',
    // 2. Venus
    'https://www.solarsystemscope.com/textures/download/2k_venus_surface.jpg',
    // 3. Mars
    'https://www.solarsystemscope.com/textures/download/2k_mars.jpg',
    // 4. Mercury
    'https://www.solarsystemscope.com/textures/download/2k_mercury.jpg',
    // 5. Ceres
    'https://www.solarsystemscope.com/textures/download/2k_ceres.jpg',
    // 6. Jupiter
    'https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg',
    // 7. Saturn
    'https://www.solarsystemscope.com/textures/download/2k_saturn.jpg',
    // 8. Uranus
    'https://images.pexels.com/photos/16287308/pexels-photo-16287308/free-photo-of-planet-uranus.jpeg?auto=compress&cs=tinysrgb&w=800',
    // 9. Neptune
    'https://images.pexels.com/photos/47367/full-moon-moon-bright-sky-47367.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop&h=800&w=800',
    // 10. Pluto
    'https://images.pexels.com/photos/16287303/pexels-photo-16287303/free-photo-of-planet-pluto.jpeg?auto=compress&cs=tinysrgb&w=800',
    // 11. Haumea (Artistic representation)
    'https://images.pexels.com/photos/11158145/pexels-photo-11158145.jpeg?auto=compress&cs=tinysrgb&w=800',
    // 12. Makemake (Artistic representation)
    'https://images.pexels.com/photos/11158156/pexels-photo-11158156.jpeg?auto=compress&cs=tinysrgb&w=800',
    // 13. Eris (Artistic representation)
    'https://images.pexels.com/photos/73910/mars-mars-rover-space-travel-robot-73910.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop&h=800&w=800',
    // 14. Proxima Centauri b (Artistic representation)
    'https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop&h=800&w=800',
    // 15. TRAPPIST-1 System (Artistic representation)
    'https://images.pexels.com/photos/2156/sky-earth-space-working.jpg?auto=compress&cs=tinysrgb&w=800',
    // 16. 55 Cancri e (Janssen) (Artistic representation)
    'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=800',
    // 17. 51 Pegasi b (Dimidium) (Artistic representation)
    'https://images.pexels.com/photos/220201/pexels-photo-220201.jpeg?auto=compress&cs=tinysrgb&w=800',
    // 18. HD 189733b (Artistic representation of a blue gas giant)
    'https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg?auto=compress&cs=tinysrgb&w=800&fit=crop&h=800&w=800',
    // 19. HD 209458 b (Osiris) (Artistic representation)
    'https://images.pexels.com/photos/1274260/pexels-photo-1274260.jpeg?auto=compress&cs=tinysrgb&w=800',
    // 20. Kepler-186f (Artistic representation of a red-hued planet)
    'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=800',
    // 21. TrES-2b (Artistic representation of a dark planet)
    'https://images.pexels.com/photos/1979069/pexels-photo-1979069.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop&h=800&w=800',
    // 22. Kepler-452b (Artistic representation)
    'https://images.pexels.com/photos/2159/sky-earth-space-planet.jpg?auto=compress&cs=tinysrgb&w=800',
    // 23. PSR B1257+12 (Pulsar - artistic representation)
    'https://images.pexels.com/photos/1257860/pexels-photo-1257860.jpeg?auto=compress&cs=tinysrgb&w=800',
    // 24. M51-ULS-1b (Galaxy M51 as a proxy)
    'https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg?auto=compress&cs=tinysrgb&w=800'
];
