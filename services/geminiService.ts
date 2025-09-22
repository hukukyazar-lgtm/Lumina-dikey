import type { WordChallenge, WordLength, Language } from '../types';
import { turkishWordList, englishWordList } from './wordList';

// Helper to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => 0.5 - Math.random());
};

// Fallback word challenges in case of an issue with the list
const fallbackWordsTR: Record<WordLength, WordChallenge> = {
    5: { correctWord: "KALEM", incorrectWords: ["KELAM", "KADEM", "KEREM"] },
    6: { correctWord: "MERKEZ", incorrectWords: ["MENFEZ", "MELEZ", "MERTEK"] },
    7: { correctWord: "ŞİKAYET", incorrectWords: ["RİVAYET", "SİRAYET", "NİHAYET"] },
    8: { correctWord: "BELİRTME", incorrectWords: ["BELİRMEK", "BELİRTEÇ", "BELİRSİZ"] }
};

const fallbackWordsEN: Record<WordLength, WordChallenge> = {
    5: { correctWord: "TABLE", incorrectWords: ["CABLE", "FABLE", "STABLE"] },
    6: { correctWord: "CENTER", incorrectWords: ["CINDER", "CENSOR", "CENTRE"] },
    7: { correctWord: "QUALITY", incorrectWords: ["QUANTUM", "QUARTER", "QUARTET"] },
    8: { correctWord: "ABSOLUTE", incorrectWords: ["OBSOLETE", "OBSTACLE", "OBSTRUCT"] }
};

export const fetchWordChallenge = async (
    wordLength: WordLength, 
    language: Language, 
    usedWords: Set<string>
): Promise<WordChallenge> => {
    const wordList = language === 'tr' ? turkishWordList : englishWordList;
    const fallbackWords = language === 'tr' ? fallbackWordsTR : fallbackWordsEN;
    
    const allWordGroups = wordList[wordLength];

    // Ensure there are enough word groups to form a challenge
    if (!allWordGroups || allWordGroups.length === 0) {
        console.error(`No word groups of length ${wordLength} in the word list. Using fallback.`);
        return Promise.resolve(fallbackWords[wordLength]);
    }

    // Filter out groups that contain a word that has already been used as a correct answer.
    let availableWordGroups = allWordGroups.filter(group => 
        !group.some(word => usedWords.has(word.toUpperCase()))
    );

    // If all words have been used, reset the list for the current session to avoid crashing.
    if (availableWordGroups.length === 0) {
        console.warn(`All words for length ${wordLength} have been used in this session. Re-using words.`);
        availableWordGroups = allWordGroups;
        usedWords.clear(); // Clear the set to start over for this session
    }
    
    // Pick a random group of similar words from the available ones
    const randomIndex = Math.floor(Math.random() * availableWordGroups.length);
    const selectedGroup = availableWordGroups[randomIndex];

    // Ensure the group has enough words
    if (selectedGroup.length < 4) {
        console.error(`Word group at index ${randomIndex} for length ${wordLength} does not have enough words. Using fallback.`, selectedGroup);
        return Promise.resolve(fallbackWords[wordLength]);
    }
    
    // Shuffle the group to randomize the correct word
    const shuffledGroup = shuffleArray(selectedGroup);

    const correctWord = shuffledGroup[0];
    const incorrectWords = shuffledGroup.slice(1, 4);

    return Promise.resolve({
        correctWord: correctWord.toUpperCase(),
        incorrectWords: incorrectWords.map(w => w.toUpperCase())
    });
};