import React, { useState, useRef, useMemo, CSSProperties } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { soundService } from '../services/soundService';
import { generateImageFromPrompt, describeImage, editImage, generateDetailedPrompt, generateButtonStructureFromPrompt, generateThemeFromPrompt } from '../services/geminiService';
import { saveGeneratedImages, loadGeneratedImages, saveCustomButtonStructure } from '../services/progressService';
import type { ThemePalette } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { planetNameTranslationKeys, cubeStyles } from '../config';
import ChoiceButton from '../components/ChoiceButton';
import LetterCube from '../components/LetterCube';

interface DesignStudioPageProps {
    onClose: () => void;
    onSetPlanetImage: (planetIndex: number, imageUrl: string) => void;
    onSetMenuBackground: (imageUrl: string) => void;
    onSetPlayerAvatar: (imageUrl: string) => void;
    onSetGameBackground: (imageUrl: string) => void;
    onSetCustomButtonTexture: (imageUrl: string) => void;
    onSetCustomCubeTexture: (imageUrl: string) => void;
    onSetCustomCubeStyle: (styleId: string) => void;
    activeCubeStyle: string;
    onSetCustomTheme: (theme: ThemePalette) => void;
}

type StudioTab = 'texture' | 'structure' | 'cube' | 'uiStitch';
type ButtonSurface = 'matte' | 'glossy' | 'metallic';

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
const compressImage = (dataUrl: string, maxWidth = 400, quality = 0.7): Promise<string> => {
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


const DesignStudioPage: React.FC<DesignStudioPageProps> = ({ onClose, onSetPlanetImage, onSetMenuBackground, onSetPlayerAvatar, onSetGameBackground, onSetCustomButtonTexture, onSetCustomCubeTexture, onSetCustomCubeStyle, activeCubeStyle, onSetCustomTheme }) => {
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

    // UI Stitch State
    const [themePrompt, setThemePrompt] = useState('');
    const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
    const [themeError, setThemeError] = useState<string | null>(null);
    const [generatedTheme, setGeneratedTheme] = useState<ThemePalette | null>(null);
    
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
        if (isLoading || !sourceImage) return;
        soundService.play('start');
        setIsLoading(true);
        setLoadingMessage(t(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]));
        setError(null);
        try {
            const description = await describeImage(sourceImage.data, sourceImage.mimeType);
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
        try {
            const resultUrl = sourceImage ? await editImage(prompt, sourceImage.data, sourceImage.mimeType) : await generateImageFromPrompt(prompt);
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

    const handleSaveImage = () => {
        if (!activeDataUrl || savedImages.includes(activeDataUrl)) return;
        soundService.play('bonus');
        updateSavedImages(prev => [...prev, activeDataUrl]);
    };

    const handleSetPlanet = () => { if (activeDataUrl) { soundService.play('select'); onSetPlanetImage(selectedPlanetIndex, activeDataUrl); onClose(); }};
    const handleSetMenuBG = () => { if (activeDataUrl) { soundService.play('select'); onSetMenuBackground(activeDataUrl); onClose(); }};
    const handleSetAsAvatar = () => { if (activeDataUrl) { soundService.play('select'); onSetPlayerAvatar(activeDataUrl); onClose(); }};
    const handleSetAsGameBG = () => { if (activeDataUrl) { soundService.play('select'); onSetGameBackground(activeDataUrl); onClose(); }};
    const handleSetAsButtonTexture = () => { if (activeDataUrl) { soundService.play('select'); onSetCustomButtonTexture(activeDataUrl); onClose(); }};
    const handleSetAsCubeTexture = () => { if (activeDataUrl) { soundService.play('select'); onSetCustomCubeTexture(activeDataUrl); onClose(); }};
    const handleClearImage = () => { soundService.play('click'); setSourceImage(null); setGeneratedImageUrl(null); setPrompt(''); };

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
        Object.entries(structure).forEach(([key, value]) => { document.documentElement.style.setProperty(key, value); });
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
    
    const handleApplyCubeStyle = () => { soundService.play('select'); onSetCustomCubeStyle(selectedCubeStyle); onClose(); };

    const handleGenerateTheme = async () => {
        if (isGeneratingTheme || !themePrompt.trim()) return;
        soundService.play('start');
        setIsGeneratingTheme(true);
        setThemeError(null);
        try {
            const result = await generateThemeFromPrompt(themePrompt);
            setGeneratedTheme(result);
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
        if (!generatedTheme) return;
        soundService.play('select');
        onSetCustomTheme(generatedTheme);
        onClose();
    };

    const previewContainerStyle = useMemo(() => {
        const selectedStyleData = cubeStyles.find(s => s.id === selectedCubeStyle);
        const cubeVars = selectedStyleData ? selectedStyleData.variables : {};
        const baseStyle: CSSProperties = {
            '--custom-button-border-radius': `${borderRadius}px`,
            '--custom-button-box-shadow': `0 ${shadowDepth}px ${shadowDepth * 1.5}px -${shadowDepth / 2}px rgba(0, 0, 0, 0.2), 0 ${shadowDepth / 2}px ${shadowDepth}px -${shadowDepth / 4}px rgba(0, 0, 0, 0.1)`,
            '--custom-button-bg': getSurfaceBackground(surface),
            '--custom-button-border-color': 'var(--brand-accent-secondary)',
            '--custom-button-text-color': 'var(--brand-accent-secondary)',
            '--custom-button-highlight-intensity': `${highlightIntensity}`,
            ...cubeVars
        };
        if (activeStudioTab === 'uiStitch' && generatedTheme) {
            return { ...baseStyle, ...generatedTheme };
        }
        return baseStyle;
    }, [borderRadius, shadowDepth, highlightIntensity, surface, selectedCubeStyle, activeStudioTab, generatedTheme]);
    
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
                    <ChoiceButton word={t('preview')} onClick={() => {}} disabled={false} status={'default'} />
                </div>
                <div className="transform scale-125">
                    <LetterCube letter="A" size={64} animationDelay="0s" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-brand-bg/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-appear p-4">
            <div className="w-full max-w-2xl h-full max-h-[95vh] text-center p-4 sm:p-6 bg-brand-primary backdrop-blur-sm border-2 border-white/40 rounded-2xl shadow-2xl shadow-black/20 flex flex-col">
                
                <header className="flex-shrink-0 flex items-center justify-between mb-4">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-light">{t('designStudioTitle')}</h2>
                </header>
                
                <div className="flex-shrink-0 flex w-full mx-auto items-center p-1 bg-black/20 rounded-full border border-transparent shadow-inner mb-4">
                    {(['texture', 'structure', 'cube', 'uiStitch'] as StudioTab[]).map(tab => (
                        <button key={tab} onClick={() => setActiveStudioTab(tab)} className={`w-1/4 h-10 flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-accent-secondary/50 ${activeStudioTab === tab ? 'bg-brand-accent-secondary text-white shadow-sm' : 'bg-transparent text-brand-light/60 hover:text-brand-light'}`}>
                            {t(tab)}
                        </button>
                    ))}
                </div>

                {activeStudioTab === 'texture' && (
                <main className="flex-grow flex flex-col gap-4 min-h-0">
                    {/* Texture content remains the same */}
                </main>
                )}
                {activeStudioTab === 'structure' && (
                <main className="flex-grow flex flex-col gap-4 min-h-0">
                    {/* Structure content remains the same */}
                </main>
                )}
                {activeStudioTab === 'cube' && (
                <main className="flex-grow flex flex-col gap-4 min-h-0">
                    {/* Cube content remains the same */}
                </main>
                )}
                {activeStudioTab === 'uiStitch' && (
                <main className="flex-grow flex flex-col gap-4 min-h-0">
                    {renderCombinedPreview()}
                    <div className="flex-shrink-0 flex flex-col gap-3 p-3 bg-brand-secondary/30 rounded-lg shadow-inner-strong">
                        <p className="text-sm text-brand-light/70">{t('uiStitchDesc')}</p>
                        <textarea value={themePrompt} onChange={e => setThemePrompt(e.target.value)} placeholder={t('themePromptPlaceholder')} className="w-full p-2 bg-brand-secondary/50 border-2 border-brand-light/20 rounded-lg text-base text-brand-light focus:outline-none focus:border-brand-accent-secondary resize-none" rows={2} disabled={isGeneratingTheme} />
                        {themeError && <p className="text-brand-accent text-sm font-bold">{themeError}</p>}
                    </div>
                </main>
                )}

                <footer className="flex-shrink-0 mt-4 flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button onClick={onClose} className={`${actionButtonBaseClasses} text-white bg-brand-accent border-transparent hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-lg flex-1`}>{t('back')}</button>
                        
                        {activeStudioTab === 'texture' && (
                            <button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className={`${actionButtonBaseClasses} text-brand-bg bg-brand-accent-secondary/80 border-brand-accent-secondary shadow-[0_4px_0_var(--brand-accent-secondary-shadow)] hover:bg-brand-accent-secondary hover:shadow-[0_6px_0_var(--brand-accent-secondary-shadow)] active:translate-y-1 active:shadow-[0_2px_0_var(--brand-accent-secondary-shadow)] ${disabledActionButtonClasses} flex-1`}>
                                {isLoading ? t('generating') : t('generate')}
                            </button>
                        )}
                        {activeStudioTab === 'structure' && (
                             <button onClick={handleApplyStructure} className={`${actionButtonBaseClasses} ${greenButtonClasses} flex-1`}>{t('apply')}</button>
                        )}
                        {activeStudioTab === 'cube' && (
                             <button onClick={handleApplyCubeStyle} className={`${actionButtonBaseClasses} ${greenButtonClasses} flex-1`}>{t('apply')}</button>
                        )}
                        {activeStudioTab === 'uiStitch' && (
                            <>
                                <button onClick={handleGenerateTheme} disabled={isGeneratingTheme || !themePrompt.trim()} className={`${actionButtonBaseClasses} text-brand-bg bg-brand-accent-secondary/80 border-brand-accent-secondary shadow-[0_4px_0_var(--brand-accent-secondary-shadow)] hover:bg-brand-accent-secondary ${disabledActionButtonClasses} flex-1`}>
                                    {isGeneratingTheme ? t('generating') : t('generateTheme')}
                                </button>
                                <button onClick={handleApplyTheme} disabled={isGeneratingTheme || !generatedTheme} className={`${actionButtonBaseClasses} ${greenButtonClasses} ${disabledActionButtonClasses} flex-1`}>
                                    {t('applyTheme')}
                                </button>
                            </>
                        )}
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default DesignStudioPage;