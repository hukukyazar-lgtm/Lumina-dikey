import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { WordChallenge, WordLength, Language, ButtonStructure, ThemePalette } from '../types';
import { turkishWordList, englishWordList } from './wordList';

// Prefer a specific env var for Gemini API keys; keep a fallback for backwards compatibility.
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

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
export const generateButtonStructureFromPrompt = async (description: string): Promise<ButtonStructure> => {
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

// NEW function to generate a UI theme from a text description
export const generateThemeFromPrompt = async (description: string): Promise<ThemePalette> => {
    try {
        const metaPrompt = `You are an expert UI/UX and theme designer. Your task is to interpret a user's description of a UI theme and generate a complete color palette and style configuration for a web application. The user's description is "${description}". Respond with a JSON object that strictly adheres to the provided schema. Ensure the color palette is cohesive, aesthetically pleasing, and maintains good contrast for readability.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: metaPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        '--brand-bg-gradient-start': { type: Type.STRING, description: 'Start color of the main background gradient (hex or rgba).' },
                        '--brand-bg-gradient-end': { type: Type.STRING, description: 'End color of the main background gradient (hex or rgba).' },
                        '--brand-primary': { type: Type.STRING, description: 'Primary container background color, often semi-transparent (rgba).' },
                        '--brand-secondary': { type: Type.STRING, description: 'Secondary container background color, often semi-transparent and lighter/darker than primary (rgba).' },
                        '--brand-light': { type: Type.STRING, description: 'The primary color for text and light UI elements (hex).' },
                        '--brand-accent': { type: Type.STRING, description: 'The primary accent color, used for important interactive elements, highlights, and warnings (hex).' },
                        '--brand-accent-secondary': { type: Type.STRING, description: 'A secondary accent color that contrasts well with the primary accent (hex).' },
                        '--brand-warning': { type: Type.STRING, description: 'A color used for warnings or time-running-out indicators (hex).' },
                        '--brand-correct': { type: Type.STRING, description: 'A color used to indicate a correct answer or success (hex).' },
                        '--brand-tertiary': { type: Type.STRING, description: 'A lighter shade of the primary accent color.' },
                        '--brand-quaternary': { type: Type.STRING, description: 'A lighter shade of the secondary accent color.' },
                        '--brand-accent-shadow': { type: Type.STRING, description: 'A darker shade of the primary accent color, used for shadows.' },
                        '--brand-accent-secondary-shadow': { type: Type.STRING, description: 'A darker shade of the secondary accent color, used for shadows.' },
                        '--brand-warning-shadow': { type: Type.STRING, description: 'A darker shade of the warning color, used for shadows.' },
                        '--brand-correct-shadow': { type: Type.STRING, description: 'A darker shade of the correct color, used for shadows.' },
                        '--shadow-color-strong': { type: Type.STRING, description: 'A general-purpose dark, semi-transparent color for strong inner shadows (rgba).' },
                        '--bevel-shadow-dark': { type: Type.STRING, description: 'A dark, subtle color for creating a 3D bevel effect (rgba).' },
                        '--bevel-shadow-light': { type: Type.STRING, description: 'A light, subtle color for creating a 3D bevel effect (rgba).' },
                        '--brand-accent-secondary-glow': { type: Type.STRING, description: 'A semi-transparent version of the secondary accent color for creating glow effects (rgba).' },
                        '--brand-accent-glow': { type: Type.STRING, description: 'A semi-transparent version of the primary accent color for creating glow effects (rgba).' },
                        '--brand-warning-glow': { type: Type.STRING, description: 'A semi-transparent version of the warning color for creating glow effects (rgba).' },
                        '--background-image-override': { type: Type.STRING, description: 'Optional. A complex CSS background-image value (e.g., multiple radial-gradients) to override the default linear gradient. Use "none" if not applicable.' },
                        '--cube-face-bg': { type: Type.STRING, description: 'Background color/gradient for the faces of the 3D letter cubes.' },
                        '--cube-face-border': { type: Type.STRING, description: 'Border color for the 3D letter cubes.' },
                        '--cube-face-text-color': { type: Type.STRING, description: 'Text color for the 3D letter cubes.' },
                        '--cube-face-text-shadow': { type: Type.STRING, description: 'Text shadow for the 3D letter cubes to enhance readability.' },
                        '--cube-face-extra-animation': { type: Type.STRING, description: 'Optional. A CSS animation name for extra effects on cube faces. Use "none" if not applicable.' }
                    },
                },
            },
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Error generating theme with Gemini:", error);
        throw new Error("Theme generation failed.");
    }
};