import React, { useState, useRef, useMemo, CSSProperties } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { soundService } from '../services/soundService';
import { generateImageFromPrompt, describeImage, editImage, analyzeImage, generateDetailedPrompt, generateButtonStructureFromPrompt, generateThemePaletteFromPrompt } from '../services/geminiService';
import { saveGeneratedImages, loadGeneratedImages, saveCustomButtonStructure, saveCustomTheme } from '../services/progressService';
import LoadingSpinner from '../components/LoadingSpinner';
import { planetNameTranslationKeys, cubeStyles } from '../config';
import ChoiceButton from '../components/ChoiceButton';
import LetterCube from '../components/LetterCube';
import type { ThemePalette, GameBackgrounds } from '../types';

interface DesignStudioPageProps {
    onClose: () => void;
    onSetPlanetImage: (planetIndex: number, imageUrl: string) => void;
    onSetMenuBackground: (imageUrl: string) => void;
    onSetPlayerAvatar: (imageUrl: string) => void;
    onSetGameBackground: (difficultyGroup: 'easy' | 'medium' | 'hard', imageUrl: string | null) => void;
    onSetCustomButtonTexture: (imageUrl: string) => void;
    onSetCustomCubeTexture: (imageUrl: string) => void;
    onSetCustomCubeStyle: (styleId: string) => void;
    activeCubeStyle: string;
    onSetCustomTheme: (theme: ThemePalette) => void;
    customGameBackgrounds: GameBackgrounds;
}

type StudioTab = 'texture' | 'structure' | 'cube' | 'theme';
type ButtonSurface = 'matte' | 'glossy' | 'metallic';
type AspectRatio = '1:1' | '9:16' | '16:9' | '4:3' | '3:4';

const loadingMessages: (keyof typeof import('../translations').translations.en)[] = [
    'loading_message_1',
    'loading_message_2',
    'loading_message_3',
    'loading_message_4',
    'loading_message_5',
];


// --- START NEW HELPERS ---
/**
 * Compresses an image from a data URL.
 * @param dataUrl The source image data URL.
 * @param maxWidth The maximum width/height of the output image.
 * @param quality The JPEG quality (0 to 1).
 * @returns A promise that resolves with the compressed JPEG data URL.
 */
const compressImage = (dataUrl: string, maxWidth = 1024, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }

            let { width, height } = img;

            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxWidth) {
                    width = Math.round((width * maxWidth) / height);
                    height = maxWidth;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = (e) => reject(e);
        img.src = dataUrl;
    });
};

/**
 * Splits a data URL into its base64 data and mimeType parts.
 * @param dataUrl The data URL to parse.
 * @returns An object containing the base64 data and mimeType.
 */
const dataUrlToParts = (dataUrl: string): { data: string; mimeType: string } => {
    const parts = dataUrl.split(',');
    const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const data = parts[1];
    return { data, mimeType };
};
// --- END NEW HELPERS ---


const DesignStudioPage: React.FC<DesignStudioPageProps> = ({ onClose, onSetPlanetImage, onSetMenuBackground, onSetPlayerAvatar, onSetGameBackground, onSetCustomButtonTexture, onSetCustomCubeTexture, onSetCustomCubeStyle, activeCubeStyle, onSetCustomTheme, customGameBackgrounds }) => {
    const { t, gameplayLanguage } = useLanguage();
    const [activeStudioTab, setActiveStudioTab] = useState<StudioTab>('texture');
    
    // Texture State
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [sourceImage, setSourceImage] = useState<{ data: string; mimeType: string; url: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlanetIndex, setSelectedPlanetIndex] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [savedImages, setSavedImages] = useState<string[]>(loadGeneratedImages());
    const [isPromptStudioOpen, setIsPromptStudioOpen] = useState(false);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);

    // Structure State
    const [borderRadius, setBorderRadius] = useState(16); // px
    const [shadowDepth, setShadowDepth] = useState(4); // px
    const [highlightIntensity, setHighlightIntensity] = useState(0.5); // 0 to 1
    const [surface, setSurface] = useState<ButtonSurface>('glossy');
    const [structurePrompt, setStructurePrompt] = useState('');
    const [isGeneratingStructure, setIsGeneratingStructure] = useState(false);
    const [structureError, setStructureError] = useState<string | null>(null);

    // Cube State
    const [selectedCubeStyle, setSelectedCubeStyle] = useState<string>(activeCubeStyle);
    
    // Theme State
    const [themePrompt, setThemePrompt] = useState('');
    const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
    const [themeError, setThemeError] = useState<string | null>(null);
    const [previewTheme, setPreviewTheme] = useState<ThemePalette | null>(null);

    // Prompt Studio State
    const [simpleIdea, setSimpleIdea] = useState('');
    const [artStyle, setArtStyle] = useState('photorealistic');
    const [mood, setMood] = useState('epic');
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    const [promptError, setPromptError] = useState<string | null>(null);

    const updateSavedImages = (updater: React.SetStateAction<string[]>) => {
        setSavedImages(prev => {
            const newImages = typeof updater === 'function' ? updater(prev) : updater;
            saveGeneratedImages(newImages);
            return newImages;
        });
    };
    
    const activeDisplayUrl = generatedImageUrl || sourceImage?.url;
    const activeDataUrl = useMemo(() => {
        if (generatedImageUrl) return generatedImageUrl;
        if (sourceImage) return `data:${sourceImage.mimeType};base64,${sourceImage.data}`;
        return null;
    }, [generatedImageUrl, sourceImage]);


    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            soundService.play('click');
            setIsLoading(true);
            setLoadingMessage(t(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]));
            setError(null);
            setAnalysisResult(null);
            try {
                const originalDataUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = error => reject(error);
                });
                const compressedUrl = await compressImage(originalDataUrl);
                const { data, mimeType } = dataUrlToParts(compressedUrl);
                setSourceImage({ data, mimeType, url: compressedUrl });
                setGeneratedImageUrl(null);
                setPrompt('');
            } catch (e) {
                console.error(e);
                setError('Failed to read image file.');
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    const handleDescribe = async () => {
        if (isLoading || !activeDataUrl) return;
        soundService.play('start');
        setIsLoading(true);
        setLoadingMessage(t(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]));
        setError(null);
        setAnalysisResult(null);
        try {
            const { data, mimeType } = dataUrlToParts(activeDataUrl);
            const description = await describeImage(data, mimeType);
            setPrompt(description);
            soundService.play('bonus');
        } catch (e) {
            console.error(e);
            setError(t('imageGenError'));
            soundService.play('gameOver');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (isLoading || !prompt.trim()) return;
        soundService.play('start');
        setIsLoading(true);
        setLoadingMessage(t(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]));
        setError(null);
        setGeneratedImageUrl(null);
        setAnalysisResult(null);
        try {
            const resultUrl = await generateImageFromPrompt(prompt, aspectRatio);
            const compressedUrl = await compressImage(resultUrl);
            setGeneratedImageUrl(compressedUrl);
            soundService.play('bonus');
        } catch (e) {
            console.error(e);
            setError(t('imageGenError'));
            soundService.play('gameOver');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = async () => {
        if (isLoading || !prompt.trim() || !activeDataUrl) return;
        soundService.play('start');
        setIsLoading(true);
        setLoadingMessage(t(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]));
        setError(null);
        setAnalysisResult(null);
        try {
            const { data, mimeType } = dataUrlToParts(activeDataUrl);
            const resultUrl = await editImage(prompt, data, mimeType);
            const compressedUrl = await compressImage(resultUrl);
            setSourceImage(null);
            setGeneratedImageUrl(compressedUrl);
            soundService.play('bonus');
        } catch (e) {
            console.error(e);
            setError(t('imageGenError'));
            soundService.play('gameOver');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (isLoading || !activeDataUrl || !prompt.trim()) return;
        soundService.play('start');
        setIsLoading(true);
        setLoadingMessage(t(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]));
        setError(null);
        setAnalysisResult(null);
        try {
            const { data, mimeType } = dataUrlToParts(activeDataUrl);
            const result = await analyzeImage(data, mimeType, prompt);
            setAnalysisResult(result);
            soundService.play('bonus');
        } catch (e) {
            console.error(e);
            setError(t('imageGenError'));
            soundService.play('gameOver');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveImage = () => {
        if (!activeDataUrl || savedImages.includes(activeDataUrl)) return;
        soundService.play('bonus');
        updateSavedImages(prev => [activeDataUrl, ...prev].slice(0, 10));
    };

    const handleSelectSavedImage = (imageUrl: string) => {
        soundService.play('click');
        setGeneratedImageUrl(imageUrl);
        setSourceImage(null);
        setPrompt('');
        setAnalysisResult(null);
    };

    const handleDeleteSavedImage = (indexToDelete: number) => {
        soundService.play('incorrect');
        updateSavedImages(prev => prev.filter((_, index) => index !== indexToDelete));
    };

    const handleSetPlanet = () => {
        if (!activeDataUrl) return;
        soundService.play('select');
        onSetPlanetImage(selectedPlanetIndex, activeDataUrl);
        onClose();
    };
    
    const handleSetMenuBG = () => {
        if (!activeDataUrl) return;
        soundService.play('select');
        onSetMenuBackground(activeDataUrl);
        onClose();
    };

    const handleSetAsAvatar = () => {
        if (!activeDataUrl) return;
        soundService.play('select');
        onSetPlayerAvatar(activeDataUrl);
        onClose();
    };
    
    const handleSetAsGameBG = (difficulty: 'easy' | 'medium' | 'hard') => {
        if (!activeDataUrl) return;
        soundService.play('select');
        onSetGameBackground(difficulty, activeDataUrl);
    };

    const handleClearGameBG = (difficulty: 'easy' | 'medium' | 'hard') => {
        soundService.play('click');
        onSetGameBackground(difficulty, null);
    };
    
    const handleSetAsButtonTexture = () => {
        if (!activeDataUrl) return;
        soundService.play('select');
        onSetCustomButtonTexture(activeDataUrl);
        onClose();
    };
    
    const handleSetAsCubeTexture = () => {
        if (!activeDataUrl) return;
        soundService.play('select');
        onSetCustomCubeTexture(activeDataUrl);
        onClose();
    };

    const getSurfaceBackground = (surf: ButtonSurface): string => {
        switch(surf) {
            case 'matte': return 'var(--brand-secondary)';
            case 'glossy': return 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%), var(--brand-secondary)';
            case 'metallic': return 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 30%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.2) 100%), var(--brand-secondary)';
            default: return 'var(--brand-secondary)';
        }
    };
    
    const handleApplyStructure = () => {
        soundService.play('select');
        const structure = {
            '--custom-button-border-radius': `${borderRadius}px`,
            '--custom-button-box-shadow': `0 ${shadowDepth}px ${shadowDepth * 1.5}px -${shadowDepth / 2}px rgba(0, 0, 0, 0.2), 0 ${shadowDepth / 2}px ${shadowDepth}px -${shadowDepth / 4}px rgba(0, 0, 0, 0.1)`,
            '--custom-button-bg': getSurfaceBackground(surface),
            '--custom-button-border-color': 'var(--brand-accent-secondary)',
            '--custom-button-text-color': 'var(--brand-accent-secondary)',
            '--custom-button-highlight-intensity': `${highlightIntensity}`
        };
        Object.entries(structure).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
        });
        saveCustomButtonStructure(structure);
        onClose();
    };

    const handleGenerateStructure = async () => {
        if (isGeneratingStructure || !structurePrompt.trim()) return;
        soundService.play('start');
        setIsGeneratingStructure(true);
        setStructureError(null);
        try {
            const result = await generateButtonStructureFromPrompt(structurePrompt);
            if (result.borderRadius !== undefined) setBorderRadius(result.borderRadius);
            if (result.shadowDepth !== undefined) setShadowDepth(result.shadowDepth);
            if (result.highlightIntensity !== undefined) setHighlightIntensity(result.highlightIntensity);
            if (result.surface !== undefined) setSurface(result.surface);
            soundService.play('bonus');
        } catch (e) {
            console.error(e);
            setStructureError(t('styleGenError'));
            soundService.play('gameOver');
        } finally {
            setIsGeneratingStructure(false);
        }
    };
    
    const handleApplyCubeStyle = () => {
        soundService.play('select');
        onSetCustomCubeStyle(selectedCubeStyle);
        onClose();
    };
    
    const handleClearImage = () => {
        soundService.play('click');
        setSourceImage(null);
        setGeneratedImageUrl(null);
        setPrompt('');
        setAnalysisResult(null);
    };

    const previewContainerStyle = useMemo(() => {
        const baseStyle = {
            '--custom-button-border-radius': `${borderRadius}px`,
            '--custom-button-box-shadow': `0 ${shadowDepth}px ${shadowDepth * 1.5}px -${shadowDepth / 2}px rgba(0, 0, 0, 0.2), 0 ${shadowDepth / 2}px ${shadowDepth}px -${shadowDepth / 4}px rgba(0, 0, 0, 0.1)`,
            '--custom-button-bg': getSurfaceBackground(surface),
            '--custom-button-border-color': 'var(--brand-accent-secondary)',
            '--custom-button-text-color': 'var(--brand-accent-secondary)',
            '--custom-button-highlight-intensity': `${highlightIntensity}`,
        };
        const selectedStyleData = cubeStyles.find(s => s.id === selectedCubeStyle);
        const cubeVars = selectedStyleData ? selectedStyleData.variables : {};

        return {
            ...baseStyle,
            ...cubeVars,
            ...(previewTheme || {})
        } as CSSProperties;
    }, [borderRadius, shadowDepth, highlightIntensity, surface, selectedCubeStyle, previewTheme]);

    
    const actionButtonBaseClasses = "w-full text-center text-lg font-extrabold p-3 rounded-full transform transition-all duration-150 ease-in-out backdrop-blur-sm shadow-lg border focus:outline-none";
    const disabledActionButtonClasses = "disabled:bg-gray-600 disabled:border-gray-500 disabled:text-white/50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none";
    const greenButtonClasses = "text-brand-bg bg-brand-correct/80 border-brand-correct shadow-[0_4px_0_var(--brand-correct-shadow)] hover:bg-brand-correct hover:shadow-[0_6px_0_var(--brand-correct-shadow)] active:translate-y-1 active:shadow-[0_2px_0_var(--brand-correct-shadow)]";

    const handleGenerateDetailedPrompt = async () => {
        if (isGeneratingPrompt || !simpleIdea.trim()) return;
        soundService.play('start');
        setIsGeneratingPrompt(true);
        setPromptError(null);
        try {
            const result = await generateDetailedPrompt(simpleIdea, artStyle, mood, gameplayLanguage);
            setPrompt(result);
            soundService.play('bonus');
            setIsPromptStudioOpen(false);
        } catch (e) {
            console.error(e);
            setPromptError(t('promptGenError'));
            soundService.play('gameOver');
        } finally {
            setIsGeneratingPrompt(false);
        }
    };
    
    const handleGenerateTheme = async () => {
        if (isGeneratingTheme || !themePrompt.trim()) return;
        soundService.play('start');
        setIsGeneratingTheme(true);
        setThemeError(null);
        try {
            const result = await generateThemePaletteFromPrompt(themePrompt);
            setPreviewTheme(result);
            soundService.play('bonus');
        } catch (e) {
            console.error(e);
            setThemeError(t('themeGenError'));
            soundService.play('gameOver');
        } finally {
            setIsGeneratingTheme(false);
        }
    };

    const handleApplyTheme = () => {
        if (!previewTheme) return;
        soundService.play('select');
        onSetCustomTheme(previewTheme);
        onClose();
    };

    const renderPromptStudio = () => (
        <div className="flex-shrink-0 flex flex-col gap-2 p-3 mt-2 bg-brand-secondary/30 rounded-lg">
            <p className="text-brand-light/70 text-sm">{t('promptEnhancerDesc')}</p>
            <div className="flex flex-col sm:flex-row gap-2">
                <input value={simpleIdea} onChange={e => setSimpleIdea(e.target.value)} placeholder={t('promptIdeaPlaceholder')} className="w-full flex-grow p-2 bg-brand-secondary/50 border-2 border-brand-light/20 rounded-lg text-base text-brand-light focus:outline-none focus:border-brand-accent-secondary" disabled={isGeneratingPrompt}/>
                <div className="grid grid-cols-2 gap-2">
                    <select value={artStyle} onChange={e => setArtStyle(e.target.value)} disabled={isGeneratingPrompt} className="bg-brand-secondary p-2 rounded-lg text-sm font-bold text-brand-light border-2 border-brand-light/20 focus:outline-none focus:border-brand-accent-secondary custom-scrollbar" aria-label={t('artStyle')}>
                        <option value="photorealistic">{t('style_photorealistic')}</option>
                        <option value="fantasy">{t('style_fantasy')}</option>
                        <option value="anime">{t('style_anime')}</option>
                        <option value="pixel">{t('style_pixel')}</option>
                        <option value="cyberpunk">{t('style_cyberpunk')}</option>
                    </select>
                     <select value={mood} onChange={e => setMood(e.target.value)} disabled={isGeneratingPrompt} className="bg-brand-secondary p-2 rounded-lg text-sm font-bold text-brand-light border-2 border-brand-light/20 focus:outline-none focus:border-brand-accent-secondary custom-scrollbar" aria-label={t('mood')}>
                        <option value="epic">{t('mood_epic')}</option>
                        <option value="dreamy">{t('mood_dreamy')}</option>
                        <option value="dark">{t('mood_dark')}</option>
                        <option value="joyful">{t('mood_joyful')}</option>
                        <option value="mysterious">{t('mood_mysterious')}</option>
                    </select>
                </div>
            </div>
            {promptError && <p className="text-brand-accent text-sm font-bold">{promptError}</p>}
            <button onClick={handleGenerateDetailedPrompt} disabled={isGeneratingPrompt || !simpleIdea.trim()} className={`${actionButtonBaseClasses} text-sm text-brand-bg bg-brand-accent-secondary/80 border-brand-accent-secondary shadow-[0_4px_0_var(--brand-accent-secondary-shadow)] hover:bg-brand-accent-secondary ${disabledActionButtonClasses}`}>
                {isGeneratingPrompt ? t('generating') : t('generateDetailedPrompt')}
            </button>
        </div>
    );

    const renderCombinedPreview = () => (
        <div className="flex-grow p-4 bg-brand-secondary/30 rounded-lg shadow-inner-strong flex items-center justify-center" style={previewContainerStyle}>
            <div className="flex flex-col items-center gap-8" style={{ perspective: '1000px' }}>
                <div className="w-48">
                    <ChoiceButton
                        word={t('preview')}
                        onClick={() => {}}
                        disabled={false}
                        status={'default'}
                        revealPercentage={100}
                        revealDirection="easy"
                    />
                </div>
                <div className="transform scale-125">
                    <LetterCube letter="A" size={64} animationDelay="0s" />
                </div>
            </div>
        </div>
    );
    
    const GameBackgroundManager = () => (
        <div className="flex-shrink-0 flex flex-col gap-2 p-2 bg-brand-secondary/30 rounded-lg">
            <h3 className="text-lg font-bold text-brand-light/80 text-left">Game Backgrounds (by Difficulty)</h3>
            {(['easy', 'medium', 'hard'] as const).map(difficulty => (
                <div key={difficulty} className="flex items-center gap-2 p-2 bg-brand-secondary/50 rounded-md">
                    <div className="w-16 h-10 bg-black/20 rounded overflow-hidden flex-shrink-0">
                        {customGameBackgrounds[difficulty] && <img src={customGameBackgrounds[difficulty]!} alt={`${difficulty} background preview`} className="w-full h-full object-cover" />}
                    </div>
                    <span className="flex-grow text-left font-bold text-brand-light/80 capitalize">{t(`difficulty${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}` as any)}</span>
                    <button onClick={() => handleClearGameBG(difficulty)} className="px-2 py-1 text-xs font-bold bg-brand-accent text-white rounded hover:bg-brand-accent/80" title="Clear">X</button>
                    <button onClick={() => handleSetAsGameBG(difficulty)} disabled={!activeDataUrl} className={`px-3 py-1 text-xs font-bold rounded ${!activeDataUrl ? 'bg-gray-500 text-gray-300' : 'bg-brand-correct text-black'}`}>Set</button>
                </div>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-brand-bg/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-appear p-4">
            <div className="w-full max-w-2xl h-full max-h-[95vh] text-center p-4 sm:p-6 bg-brand-primary backdrop-blur-sm border-2 border-white/40 rounded-2xl shadow-2xl shadow-black/20 flex flex-col">
                
                <header className="flex-shrink-0 flex items-center justify-between mb-4">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-light">{t('designStudioTitle')}</h2>
                </header>
                
                <div className="flex-shrink-0 flex w-full mx-auto items-center p-1 bg-black/20 rounded-full border border-transparent shadow-inner mb-4">
                    {(['texture', 'structure', 'cube', 'theme'] as StudioTab[]).map(tab => (
                        <button key={tab} onClick={() => setActiveStudioTab(tab)} className={`w-1/4 h-10 flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-accent-secondary/50 ${activeStudioTab === tab ? 'bg-brand-accent-secondary text-white shadow-sm' : 'bg-transparent text-brand-light/60 hover:text-brand-light'}`}>
                            {t(tab)}
                        </button>
                    ))}
                </div>

                {activeStudioTab === 'texture' ? (
                <main className="flex-grow flex flex-col gap-4 min-h-0">
                    <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2">
                        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={activeDisplayUrl ? "Ask a question or provide an edit instruction..." : t('promptPlaceholder')} className="w-full flex-grow p-3 bg-brand-secondary/50 border-2 border-brand-light/20 rounded-lg text-lg text-brand-light focus:outline-none focus:border-brand-accent-secondary focus:ring-2 focus:ring-brand-accent-secondary/50 resize-none custom-scrollbar" rows={2} disabled={isLoading}/>
                         <div className="flex flex-col gap-2">
                            <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className={`${actionButtonBaseClasses} text-sm text-white bg-brand-tertiary border-transparent`}>{t('uploadImage')}</button>
                            {activeDataUrl && ( 
                                <div className="flex gap-2">
                                    <button onClick={handleDescribe} disabled={isLoading} className={`${actionButtonBaseClasses} text-sm text-brand-bg bg-brand-quaternary border-transparent flex-1`}>{t('describeImage')}</button>
                                    <button onClick={handleAnalyze} disabled={isLoading || !prompt.trim()} className={`${actionButtonBaseClasses} text-sm text-brand-bg bg-brand-quaternary border-transparent flex-1 ${!prompt.trim() ? 'opacity-50' : ''}`}>Analyze</button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {!activeDisplayUrl && (
                        <div className="flex-shrink-0 flex items-center justify-center flex-wrap gap-2 p-2 bg-brand-secondary/30 rounded-lg">
                            <span className="text-sm font-bold text-brand-light/70 mr-2">Aspect Ratio:</span>
                            {(['1:1', '16:9', '9:16', '4:3', '3:4'] as const).map(ar => (
                                <button key={ar} onClick={() => setAspectRatio(ar)} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${aspectRatio === ar ? 'bg-brand-accent-secondary text-white' : 'bg-brand-secondary/50 text-brand-light/70'}`}>
                                    {ar}
                                </button>
                            ))}
                        </div>
                    )}

                    {isPromptStudioOpen && !activeDisplayUrl && renderPromptStudio()}
                    {!activeDisplayUrl && <button onClick={() => setIsPromptStudioOpen(p => !p)} className="flex-shrink-0 text-sm font-bold text-brand-accent-secondary hover:underline">{t('promptStudio')} {isPromptStudioOpen ? '[-]' : '[+]'}</button>}
                    
                    <div className="relative flex-grow bg-brand-secondary/30 rounded-lg shadow-inner-strong flex flex-col items-center justify-center overflow-hidden">
                        {isLoading && <div className="z-10 text-center"><LoadingSpinner /><p className="mt-20 text-lg font-bold text-brand-light">{loadingMessage}</p></div>}
                        {error && !isLoading && ( <p className="text-brand-accent text-lg font-bold">{error}</p> )}
                        {activeDisplayUrl && !isLoading && ( <img src={activeDisplayUrl} alt={prompt || "User-generated or uploaded image"} className="w-full h-full object-contain animate-appear" /> )}
                        {!isLoading && !activeDisplayUrl && !error && ( <p className="text-brand-light/50">{t('designStudioDesc')}</p> )}
                        {activeDisplayUrl && !isLoading && ( <button onClick={handleClearImage} className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors z-10" title={t('clearImage')}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>)}
                        {activeDataUrl && !savedImages.includes(activeDataUrl) && !isLoading && (<button onClick={handleSaveImage} className="absolute top-2 left-2 px-3 py-1 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors z-10 flex items-center gap-1 text-sm" title={t('saveToGallery')}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1H5V4zM5 7h10v9a2 2 0 01-2 2H7a2 2 0 01-2-2V7z" /></svg>Save</button>)}
                        {analysisResult && !isLoading && (
                            <div className="absolute bottom-0 left-0 right-0 max-h-1/3 bg-black/70 backdrop-blur-sm p-3 overflow-y-auto custom-scrollbar">
                                <p className="text-white text-sm text-left whitespace-pre-wrap">{analysisResult}</p>
                            </div>
                        )}
                    </div>
                </main>
                ) : activeStudioTab === 'structure' ? (
                <main className="flex-grow flex flex-col gap-4 min-h-0">
                    {renderCombinedPreview()}
                    <div className="flex-shrink-0 flex flex-col gap-3 p-3 bg-brand-secondary/30 rounded-lg shadow-inner-strong">
                        <textarea value={structurePrompt} onChange={e => setStructurePrompt(e.target.value)} placeholder={t('describeButtonStyle')} className="w-full p-2 bg-brand-secondary/50 border-2 border-brand-light/20 rounded-lg text-base text-brand-light focus:outline-none focus:border-brand-accent-secondary resize-none" rows={2} disabled={isGeneratingStructure} />
                        <button onClick={handleGenerateStructure} disabled={isGeneratingStructure || !structurePrompt.trim()} className={`${actionButtonBaseClasses} text-sm text-brand-bg bg-brand-accent-secondary/80 border-brand-accent-secondary shadow-[0_4px_0_var(--brand-accent-secondary-shadow)] hover:bg-brand-accent-secondary ${disabledActionButtonClasses}`}>
                            {isGeneratingStructure ? t('generatingStyle') : t('generateStyle')}
                        </button>
                        {structureError && <p className="text-brand-accent text-sm font-bold">{structureError}</p>}
                    </div>
                    <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-brand-secondary/30 rounded-lg shadow-inner-strong">
                        <div className="w-full">
                            <label className="text-sm font-bold text-brand-light/70">{t('borderRadius')} ({borderRadius}px)</label>
                            <input type="range" min="0" max="50" value={borderRadius} onChange={e => setBorderRadius(Number(e.target.value))} className="w-full h-2 rounded-lg appearance-none cursor-pointer custom-slider"/>
                        </div>
                         <div className="w-full">
                            <label className="text-sm font-bold text-brand-light/70">{t('shadowDepth')} ({shadowDepth}px)</label>
                            <input type="range" min="0" max="10" value={shadowDepth} onChange={e => setShadowDepth(Number(e.target.value))} className="w-full h-2 rounded-lg appearance-none cursor-pointer custom-slider"/>
                        </div>
                         <div className="w-full">
                            <label className="text-sm font-bold text-brand-light/70">{t('highlightIntensity')} ({(highlightIntensity * 100).toFixed(0)}%)</label>
                            <input type="range" min="0" max="1" step="0.05" value={highlightIntensity} onChange={e => setHighlightIntensity(Number(e.target.value))} className="w-full h-2 rounded-lg appearance-none cursor-pointer custom-slider"/>
                        </div>
                        <div className="w-full">
                             <label className="text-sm font-bold text-brand-light/70 mb-2 block">{t('surface')}</label>
                             <div className="flex gap-2">
                                {(['matte', 'glossy', 'metallic'] as ButtonSurface[]).map(s => (
                                    <button key={s} onClick={() => setSurface(s)} className={`flex-1 p-2 rounded-md text-sm font-bold transition-colors ${surface === s ? 'bg-brand-accent-secondary text-white' : 'bg-brand-secondary/50 text-brand-light/70'}`}>{t(s)}</button>
                                ))}
                             </div>
                        </div>
                    </div>
                </main>
                ) : activeStudioTab === 'cube' ? (
                <main className="flex-grow flex flex-col gap-4 min-h-0">
                    {renderCombinedPreview()}
                     <div className="flex-shrink-0">
                        <h3 className="text-lg font-bold text-brand-light/80 mb-2">{t('cubeStyle')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {cubeStyles.filter(s => s.id !== 'default').map(style => (
                                <button key={style.id} onClick={() => setSelectedCubeStyle(style.id)} className={`p-3 rounded-lg border-2 transition-all ${selectedCubeStyle === style.id ? 'border-brand-accent-secondary scale-105' : 'border-transparent bg-brand-secondary/50'}`}>
                                   <div className="w-full h-16 rounded-md mb-2 flex items-center justify-center text-4xl" style={style.variables as CSSProperties}>
                                        <span style={{fontFamily: style.variables['--cube-font-family'], color: style.variables['--cube-face-text-color'], textShadow: style.variables['--cube-face-text-shadow']}}>L</span>
                                   </div>
                                   <h4 className="font-bold text-brand-light">{t(style.nameKey as any)}</h4>
                                   <p className="text-xs text-brand-light/60">{t(style.descriptionKey as any)}</p>
                                </button>
                            ))}
                        </div>
                     </div>
                </main>
                ) : (
                <main className="flex-grow flex flex-col gap-4 min-h-0">
                    {renderCombinedPreview()}
                     <div className="flex-shrink-0 flex flex-col gap-3 p-3 bg-brand-secondary/30 rounded-lg shadow-inner-strong">
                        <textarea value={themePrompt} onChange={e => setThemePrompt(e.target.value)} placeholder={t('describeThemeStyle')} className="w-full p-2 bg-brand-secondary/50 border-2 border-brand-light/20 rounded-lg text-base text-brand-light focus:outline-none focus:border-brand-accent-secondary resize-none" rows={2} disabled={isGeneratingTheme} />
                        <button onClick={handleGenerateTheme} disabled={isGeneratingTheme || !themePrompt.trim()} className={`${actionButtonBaseClasses} text-sm text-brand-bg bg-brand-accent-secondary/80 border-brand-accent-secondary shadow-[0_4px_0_var(--brand-accent-secondary-shadow)] hover:bg-brand-accent-secondary ${disabledActionButtonClasses}`}>
                            {isGeneratingTheme ? t('generatingTheme') : t('generateTheme')}
                        </button>
                        {themeError && <p className="text-brand-accent text-sm font-bold">{themeError}</p>}
                    </div>
                </main>
                )}


                <footer className="flex-shrink-0 mt-4 flex flex-col gap-3">
                    {activeStudioTab === 'texture' && (
                    <>
                        <GameBackgroundManager />
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <button onClick={handleSetMenuBG} disabled={!activeDataUrl || isLoading} className={`${actionButtonBaseClasses} ${greenButtonClasses} ${disabledActionButtonClasses}`}>{t('setAsMenuBackground')}</button>
                            <button onClick={handleSetAsAvatar} disabled={!activeDataUrl || isLoading} className={`${actionButtonBaseClasses} ${greenButtonClasses} ${disabledActionButtonClasses}`}>{t('setAsAvatar')}</button>
                            <button onClick={handleSetAsButtonTexture} disabled={!activeDataUrl || isLoading} className={`${actionButtonBaseClasses} ${greenButtonClasses} ${disabledActionButtonClasses}`}>{t('setAsButtonStyle')}</button>
                            <button onClick={handleSetAsCubeTexture} disabled={!activeDataUrl || isLoading} className={`${actionButtonBaseClasses} ${greenButtonClasses} ${disabledActionButtonClasses}`}>{t('setAsCubeTexture')}</button>
                            <div className="flex items-stretch gap-2 bg-brand-secondary/30 p-1 rounded-lg col-span-2 sm:col-span-2">
                                <select value={selectedPlanetIndex} onChange={(e) => setSelectedPlanetIndex(Number(e.target.value))} disabled={!activeDataUrl || isLoading} className="bg-brand-secondary p-2 rounded-lg text-sm font-bold text-brand-light border-2 border-brand-light/20 focus:outline-none focus:border-brand-accent-secondary custom-scrollbar" aria-label={t('selectPlanet')}>
                                    {planetNameTranslationKeys.map((key, index) => ( <option key={index} value={index}>{t(key as any)}</option> ))}
                                </select>
                                <button onClick={handleSetPlanet} disabled={!activeDataUrl || isLoading} className={`${actionButtonBaseClasses} ${greenButtonClasses} ${disabledActionButtonClasses} flex-grow text-sm p-2`}>{t('setAsPlanetBackground')}</button>
                            </div>
                        </div>
                    </>
                    )}
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button onClick={onClose} className={`${actionButtonBaseClasses} text-white bg-brand-accent border-transparent hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-lg flex-1`}>{t('back')}</button>
                        
                        {activeStudioTab === 'texture' && (
                            <button onClick={activeDisplayUrl ? handleEdit : handleGenerate} disabled={isLoading || !prompt.trim()} className={`${actionButtonBaseClasses} text-brand-bg bg-brand-accent-secondary/80 border-brand-accent-secondary shadow-[0_4px_0_var(--brand-accent-secondary-shadow)] hover:bg-brand-accent-secondary hover:shadow-[0_6px_0_var(--brand-accent-secondary-shadow)] active:translate-y-1 active:shadow-[0_2px_0_var(--brand-accent-secondary-shadow)] ${disabledActionButtonClasses} flex-1`}>
                                {isLoading ? t('generating') : (activeDisplayUrl ? "Edit Image" : t('generate'))}
                            </button>
                        )}
                        {activeStudioTab === 'structure' && (
                             <button onClick={handleApplyStructure} className={`${actionButtonBaseClasses} ${greenButtonClasses} flex-1`}>
                                {t('applyStructure')}
                            </button>
                        )}
                        {activeStudioTab === 'cube' && (
                             <button onClick={handleApplyCubeStyle} className={`${actionButtonBaseClasses} ${greenButtonClasses} flex-1`}>
                                {t('applyCubeStyle')}
                            </button>
                        )}
                        {activeStudioTab === 'theme' && (
                            <button onClick={handleApplyTheme} disabled={!previewTheme} className={`${actionButtonBaseClasses} ${greenButtonClasses} flex-1 ${!previewTheme ? disabledActionButtonClasses : ''}`}>
                                {t('applyTheme')}
                            </button>
                        )}
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default DesignStudioPage;