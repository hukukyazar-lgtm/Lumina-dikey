// FIX: Added Modality and Type to imports for new features.
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { turkishWordList, englishWordList } from './wordList';
// FIX: Added ThemePalette to imports for new features.
import type { Language, WordLength, ThemePalette } from '../types';

// NOTE: It is assumed that process.env.API_KEY is available in the execution environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * Fetches a word challenge from Gemini, with a fallback to local lists.
 * This version prioritizes dynamic content generation from the AI, fulfilling the
 * application's core design of having AI-generated puzzles.
 */
export const fetchWordChallenge = async (
  wordLength: WordLength,
  language: Language,
  usedWords: Set<string>
): Promise<{ correctWord: string; incorrectWords: string[] }> => {
  const langName = language === 'tr' ? 'Turkish' : 'English';
  const usedWordsList = Array.from(usedWords).slice(-50).join(', '); // Limit to last 50 to keep prompt size reasonable

  const systemInstruction = `You are a word game assistant. Generate a word challenge for a word guessing game. The user will provide a word length, a language, and a list of recently used words.
You must return a JSON object containing a "correctWord" and an array of three "incorrectWords".
- The "correctWord" must be exactly ${wordLength} letters long and in ${langName}.
- The "incorrectWords" must also be exactly ${wordLength} letters long and in ${langName}.
- The "incorrectWords" must be very similar to the "correctWord" (e.g., differ by one letter, be a common misspelling, or sound similar). They should be plausible distractors.
- None of the words (correct or incorrect) should be from the provided list of used words if possible.
- All words must be common and appropriate for a general audience.
- Do not include any markdown or commentary outside of the JSON object.`;

  const prompt = `Generate a word challenge. Language: ${langName}, Word Length: ${wordLength}, Used Words: [${usedWordsList}]`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            correctWord: { type: Type.STRING },
            incorrectWords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['correctWord', 'incorrectWords'],
        },
      },
    });

    const result = JSON.parse(response.text.trim());

    if (result.correctWord && result.correctWord.length === wordLength && result.incorrectWords && result.incorrectWords.length > 0) {
      return {
        correctWord: result.correctWord.toUpperCase(),
        incorrectWords: result.incorrectWords.map((w: string) => w.toUpperCase()),
      };
    } else {
      throw new Error("Invalid format from Gemini");
    }
  } catch (error) {
    console.error("Gemini fetch failed, falling back to local list.", error);
    // Fallback to the original implementation if Gemini fails
    const wordList = language === 'tr' ? turkishWordList : englishWordList;
    const possibleSets = wordList[wordLength];

    if (!possibleSets) {
        throw new Error(`No word list available for length ${wordLength} in ${language}`);
    }

    let availableSets = possibleSets.filter(wordSet => !usedWords.has(wordSet[0]));
    
    if (availableSets.length === 0) {
        const wordsOfLength = new Set(possibleSets.map(set => set[0]));
        usedWords.forEach(word => {
            if (wordsOfLength.has(word)) {
                usedWords.delete(word);
            }
        });
        availableSets = possibleSets;
    }
    
    const selectedSet = availableSets[Math.floor(Math.random() * availableSets.length)];
    const correctWord = selectedSet[0];
    const incorrectWords = selectedSet.slice(1);

    return { correctWord, incorrectWords };
  }
};

// --- START DESIGN STUDIO FUNCTIONS ---
// FIX: Added missing Gemini service functions for the Design Studio feature.

/**
 * Generates an image from a text prompt.
 * @param prompt The text prompt.
 * @param aspectRatio The desired aspect ratio for the generated image.
 * @returns A promise that resolves with the base64 data URL of the generated image.
 */
export const generateImageFromPrompt = async (prompt: string, aspectRatio: '1:1' | '9:16' | '16:9' | '4:3' | '3:4'): Promise<string> => {
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: aspectRatio,
    },
  });

  const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
  return `data:image/jpeg;base64,${base64ImageBytes}`;
};

/**
 * Edits an existing image based on a text prompt.
 * @param prompt The text prompt describing the edit.
 * @param imageDataBase64 The base64-encoded data of the source image.
 * @param mimeType The MIME type of the source image.
 * @returns A promise that resolves with the base64 data URL of the edited image.
 */
export const editImage = async (prompt: string, imageDataBase64: string, mimeType: string): Promise<string> => {
    const imagePart = {
        inlineData: {
            data: imageDataBase64,
            mimeType: mimeType,
        },
    };
    const textPart = {
        text: prompt,
    };
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }
    throw new Error("No image generated");
};

/**
 * Generates a text description for an image.
 * @param imageDataBase64 The base64-encoded data of the image.
 * @param mimeType The MIME type of the image.
 * @returns A promise that resolves with a descriptive string.
 */
export const describeImage = async (imageDataBase64: string, mimeType: string): Promise<string> => {
  const imagePart = {
    inlineData: {
      mimeType,
      data: imageDataBase64,
    },
  };
  const textPart = {
    text: "Describe this image in detail for a text-to-image prompt."
  };
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
  });
  return response.text;
};

/**
 * Analyzes an image with a text prompt.
 * @param imageDataBase64 The base64-encoded data of the image.
 * @param mimeType The MIME type of the image.
 * @param prompt The text prompt/question about the image.
 * @returns A promise that resolves with a text response from the model.
 */
export const analyzeImage = async (imageDataBase64: string, mimeType: string, prompt: string): Promise<string> => {
  const imagePart = {
    inlineData: {
      mimeType,
      data: imageDataBase64,
    },
  };
  const textPart = {
    text: prompt
  };
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
  });
  return response.text;
};

/**
 * Expands a simple idea into a detailed text-to-image prompt.
 * @param simpleIdea The user's simple idea.
 * @param artStyle The desired art style.
 * @param mood The desired mood.
 * @param language The output language.
 * @returns A promise that resolves with a detailed prompt string.
 */
export const generateDetailedPrompt = async (simpleIdea: string, artStyle: string, mood: string, language: Language): Promise<string> => {
    const langInstruction = language === 'tr' ? 'in Turkish' : 'in English';
    const systemInstruction = `You are a creative assistant that expands simple ideas into detailed, vivid, and artistic text-to-image prompts. The user will provide a simple idea, an art style, and a mood. Generate a single, concise paragraph (3-4 sentences) that describes the scene. Do not add any preamble or explanation. The output should be ${langInstruction}.`;

    const prompt = `Idea: "${simpleIdea}", Art Style: ${artStyle}, Mood: ${mood}`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
        },
    });
    return response.text.trim();
};

/**
 * Generates structured button style properties from a descriptive prompt.
 * @param prompt The text prompt describing the button style.
 * @returns A promise that resolves with an object of button style properties.
 */
export const generateButtonStructureFromPrompt = async (prompt: string): Promise<{
    borderRadius: number;
    shadowDepth: number;
    highlightIntensity: number;
    surface: 'matte' | 'glossy' | 'metallic';
}> => {
    const systemInstruction = "You are a UI design assistant. Analyze the user's prompt describing a button style and return a JSON object with corresponding values. 'borderRadius' should be between 0-50. 'shadowDepth' between 0-10. 'highlightIntensity' between 0-1. 'surface' must be one of 'matte', 'glossy', or 'metallic'. Do not include any markdown or commentary outside of the JSON object.";
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a style for this prompt: "${prompt}"`,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    borderRadius: { type: Type.INTEGER, description: 'Radius of button corners, 0-50.' },
                    shadowDepth: { type: Type.INTEGER, description: 'Depth of the button shadow, 0-10.' },
                    highlightIntensity: { type: Type.NUMBER, description: 'Intensity of the top highlight, 0-1.' },
                    surface: { type: Type.STRING, enum: ['matte', 'glossy', 'metallic'], description: 'Surface finish of the button.' },
                },
                required: ['borderRadius', 'shadowDepth', 'highlightIntensity', 'surface'],
            }
        },
    });

    return JSON.parse(response.text.trim());
};

/**
 * Generates a full theme color palette from a descriptive prompt.
 * @param prompt The text prompt describing the desired theme.
 * @returns A promise that resolves with a ThemePalette object.
 */
export const generateThemePaletteFromPrompt = async (prompt: string): Promise<ThemePalette> => {
    const systemInstruction = `You are a UI theme generator. Based on the user's prompt, create a vibrant and accessible color palette for a futuristic, space-themed game UI. Return a JSON object with CSS variable names as keys (e.g., '--brand-primary') and their corresponding color values (hex or rgba). The palette must include: '--brand-bg-gradient-start', '--brand-bg-gradient-end', '--brand-primary', '--brand-secondary', '--brand-light', '--brand-accent', '--brand-accent-secondary', '--brand-warning', '--brand-correct'. Ensure high contrast and readability. Do not include any markdown or commentary outside of the JSON object.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a theme palette for this prompt: "${prompt}"`,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    '--brand-bg-gradient-start': { type: Type.STRING },
                    '--brand-bg-gradient-end': { type: Type.STRING },
                    '--brand-primary': { type: Type.STRING },
                    '--brand-secondary': { type: Type.STRING },
                    '--brand-light': { type: Type.STRING },
                    '--brand-accent': { type: Type.STRING },
                    '--brand-accent-secondary': { type: Type.STRING },
                    '--brand-warning': { type: Type.STRING },
                    '--brand-correct': { type: Type.STRING },
                },
                required: ['--brand-bg-gradient-start', '--brand-bg-gradient-end', '--brand-primary', '--brand-secondary', '--brand-light', '--brand-accent', '--brand-accent-secondary', '--brand-warning', '--brand-correct'],
            }
        },
    });

    return JSON.parse(response.text.trim());
};

// --- END DESIGN STUDIO FUNCTIONS ---