import { GoogleGenAI, Modality, Type } from "@google/genai";
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
                const imageMimeType = part.inlineData.mimeType;
                return `data:${imageMimeType};base64,${base64ImageBytes}`;
            }
        }

        throw new Error("No image was generated in the response.");

    } catch (error) {
        console.error("Error editing image with Gemini:", error);
        throw new Error("Image editing failed.");
    }
};

// NEW function to generate a detailed prompt from a simple idea
export const generateDetailedPrompt = async (
    simpleIdea: string,
    style: string,
    mood: string,
    language: Language
): Promise<string> => {
    try {
        const metaPrompt = `You are a creative assistant and an expert prompt engineer for generative AI text-to-image models.
Your task is to take a user's simple idea and expand it into a rich, detailed, and artistic prompt.
The generated prompt should be a single, coherent paragraph.
Do not use markdown or special formatting.
The final prompt should be in ${language === 'tr' ? 'Turkish' : 'English'}.

User's Idea: "${simpleIdea}"
Art Style: ${style}
Mood: ${mood}

Generate the detailed prompt now.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: metaPrompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating detailed prompt with Gemini:", error);
        throw new Error("Prompt generation failed.");
    }
};


// NEW function to generate button structure from a text description
export const generateButtonStructureFromPrompt = async (description: string): Promise<any> => {
    try {
        const metaPrompt = `You are a UI design assistant. Your task is to interpret a user's description of a button style and map it to a set of specific design parameters. The user's description is "${description}". Respond with a JSON object that strictly adheres to the provided schema.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: metaPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        borderRadius: {
                            type: Type.INTEGER,
                            description: 'Button corner roundness in pixels. 0 for sharp, 50 for fully rounded.',
                        },
                        shadowDepth: {
                            type: Type.INTEGER,
                            description: 'The perceived depth of the button shadow in pixels. 0 for flat, 10 for very deep.',
                        },
                        highlightIntensity: {
                            type: Type.NUMBER,
                            description: 'The intensity of the top-down light reflection. 0 for no highlight, 1 for a very strong highlight.',
                        },
                        surface: {
                            type: Type.STRING,
                            description: 'The surface material of the button. Must be one of: "matte", "glossy", or "metallic".',
                        },
                    },
                    required: ["borderRadius", "shadowDepth", "highlightIntensity", "surface"],
                },
            },
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Error generating button structure with Gemini:", error);
        throw new Error("Button structure generation failed.");
    }
};
