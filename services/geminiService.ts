
import { GoogleGenAI, Modality } from "@google/genai";
import type { WordChallenge, WordLength, Language } from '../types';
import { turkishWordList, englishWordList } from './wordList';

const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

// Helper to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => 0.5 - Math.random());
};

// Fallback word challenges in case of an issue with word lists
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

// Helper function to get a word challenge from the static local lists
const getWordChallengeFromList = (wordLength: WordLength, language: Language, usedWords: Set<string>): WordChallenge => {
    console.log(`Using local list for ${language} words of length ${wordLength}`);
    const wordList = language === 'tr' ? turkishWordList : englishWordList;
    const fallbackWords = language === 'tr' ? fallbackWordsTR : fallbackWordsEN;
    
    const allWordGroups = wordList[wordLength];

    if (!allWordGroups || allWordGroups.length === 0) {
        return fallbackWords[wordLength];
    }

    let availableWordGroups = allWordGroups.filter(group => 
        !group.some(word => usedWords.has(word.toUpperCase()))
    );

    if (availableWordGroups.length === 0) {
        console.warn(`All words for length ${wordLength} have been used in this session. Re-using words.`);
        availableWordGroups = allWordGroups;
        usedWords.clear();
    }
    
    const randomIndex = Math.floor(Math.random() * availableWordGroups.length);
    const selectedGroup = availableWordGroups[randomIndex];

    if (selectedGroup.length < 4) {
        return fallbackWords[wordLength];
    }
    
    const shuffledGroup = shuffleArray(selectedGroup);

    const correctWord = shuffledGroup[0];
    const incorrectWords = shuffledGroup.slice(1, 4);

    return {
        correctWord: correctWord.toUpperCase(),
        incorrectWords: incorrectWords.map(w => w.toUpperCase())
    };
};

export const fetchWordChallenge = async (
    wordLength: WordLength, 
    language: Language, 
    usedWords: Set<string>
): Promise<WordChallenge> => {
    // Gemini API has been removed to improve performance.
    // The function now exclusively uses the local word list.
    // The async keyword is kept to maintain the function signature for dependent components.
    return getWordChallengeFromList(wordLength, language, usedWords);
};

export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              quality: 'HD', // Request a higher quality image
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        throw new Error("Image generation failed.");
    }
};

// NEW function to describe an image
export const describeImage = async (base64ImageData: string, mimeType: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: 'Describe this image for the purpose of creating a detailed text prompt to generate a similar image. Be descriptive and focus on visual elements.',
                    },
                ],
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error describing image with Gemini:", error);
        throw new Error("Image description failed.");
    }
};

// NEW function to edit an image based on a prompt
export const editImage = async (prompt: string, base64ImageData: string, mimeType: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        // The model can return multiple parts, find the image part.
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                const base64ImageBytes: string = part.inlineData.data;
                // Assuming jpeg, as it's a common output. The API response might specify the exact type.
                return `data:image/jpeg;base64,${base64ImageBytes}`;
            }
        }

        throw new Error("No image was generated in the response.");

    } catch (error) {
        console.error("Error editing image with Gemini:", error);
        throw new Error("Image editing failed.");
    }
};
