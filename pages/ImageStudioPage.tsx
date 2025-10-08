import React, { useState, useRef, useMemo, CSSProperties } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { soundService } from '../services/soundService';
import { generateImageFromPrompt, describeImage, editImage } from '../services/geminiService';
import { saveGeneratedImages, loadGeneratedImages, saveCustomButtonStructure } from '../services/progressService';
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
    onSetCustomCubeStyle: (styleId: string) => void;
    activeCubeStyle: string;
}

type StudioTab = 'texture' | 'structure' | 'cube';
type ButtonSurface = 'matte' | 'glossy' | 'metallic';

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


const DesignStudioPage: React.FC<DesignStudioPageProps> = ({ onClose, onSetPlanetImage, onSetMenuBackground, onSetPlayerAvatar, onSetGameBackground, onSetCustomButtonTexture, onSetCustomCubeStyle, activeCubeStyle }) => {
    const { t } = useLanguage();
    const [activeStudioTab, setActiveStudioTab] = useState<StudioTab>('texture');
    
    // Texture State
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [sourceImage, setSourceImage] = useState<{ data: string; mimeType: string; url: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlanetIndex, setSelectedPlanetIndex] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [savedImages, setSavedImages] = useState<string[]>(loadGeneratedImages());
    
    // Structure State
    const [borderRadius, setBorderRadius] = useState(16); // px
    const [shadowDepth, setShadowDepth] = useState(4); // px
    const [highlightIntensity, setHighlightIntensity] = useState(0.5); // 0 to 1
    const [surface, setSurface] = useState<ButtonSurface>('glossy');

    // Cube State
    const [selectedCubeStyle, setSelectedCubeStyle] = useState<string>(activeCubeStyle);

    const updateSavedImages = (updater: React.SetStateAction<string[]>) => {
        setSavedImages(prev => {
            const newImages = typeof updater === 'function' ? updater(prev) : updater;
            saveGeneratedImages(newImages);
            return newImages;
        });
    };
    
    // This is the blob URL for efficient display in the current session
    const activeDisplayUrl = generatedImageUrl || sourceImage?.url;

    // This is the persistent base64 data URL for saving and applying
    const activeDataUrl = useMemo(() => {
        if (generatedImageUrl) {
            return generatedImageUrl;
        }
        if (sourceImage) {
            return `data:${sourceImage.mimeType};base64,${sourceImage.data}`;
        }
        return null;
    }, [generatedImageUrl, sourceImage]);


    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            soundService.play('click');
            setIsLoading(true);
            setError(null);
            try {
                // Step 1: Read file as a data URL to pass to the compressor
                const originalDataUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = error => reject(error);
                });
    
                // Step 2: Compress the image
                const compressedUrl = await compressImage(originalDataUrl);
                const { data, mimeType } = dataUrlToParts(compressedUrl);
    
                // Step 3: Update state with the compressed version
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
        setError(null);
        setGeneratedImageUrl(null);

        try {
            let resultUrl: string;
            if (sourceImage) {
                // Image editing workflow
                resultUrl = await editImage(prompt, sourceImage.data, sourceImage.mimeType);
            } else {
                // Text-to-image workflow
                resultUrl = await generateImageFromPrompt(prompt);
            }
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

    const handleSelectSavedImage = (imageUrl: string) => {
        soundService.play('click');
        setGeneratedImageUrl(imageUrl);
        setSourceImage(null);
        setPrompt('');
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
    
    const handleSetAsGameBG = () => {
        if (!activeDataUrl) return;
        soundService.play('select');
        onSetGameBackground(activeDataUrl);
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
    
    const handleApplyStyles = () => {
        soundService.play('select');
        // Apply and save button texture
        if (activeDataUrl) {
            onSetCustomButtonTexture(activeDataUrl);
        }
        
        // Apply and save button structure
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
        
        // Apply and save cube style
        onSetCustomCubeStyle(selectedCubeStyle);
        
        onClose();
    };
    
    const handleClearImage = () => {
        soundService.play('click');
        setSourceImage(null);
        setGeneratedImageUrl(null);
        setPrompt('');
    }

    // This object computes the CSS variable values from the slider states.
    // It's applied to a container around the preview button to override the global defaults.
    const previewContainerStyle: CSSProperties = useMemo(() => {
        const selectedStyleData = cubeStyles.find(s => s.id === selectedCubeStyle);
        const cubeVars = selectedStyleData ? selectedStyleData.variables : {};

        return {
            '--custom-button-border-radius': `${borderRadius}px`,
            '--custom-button-box-shadow': `0 ${shadowDepth}px ${shadowDepth * 1.5}px -${shadowDepth / 2}px rgba(0, 0, 0, 0.2), 0 ${shadowDepth / 2}px ${shadowDepth}px -${shadowDepth / 4}px rgba(0, 0, 0, 0.1)`,
            '--custom-button-bg': getSurfaceBackground(surface),
            '--custom-button-border-color': 'var(--brand-accent-secondary)',
            '--custom-button-text-color': 'var(--brand-accent-secondary)',
            '--custom-button-highlight-intensity': `${highlightIntensity}`,
            ...cubeVars
        };
    }, [borderRadius, shadowDepth, highlightIntensity, surface, selectedCubeStyle]);

    
    const actionButtonBaseClasses = "w-full text-center text-lg font-extrabold p-3 rounded-full transform transition-all duration-150 ease-in-out backdrop-blur-sm shadow-lg border focus:outline-none";
    const disabledActionButtonClasses = "disabled:bg-gray-600 disabled:border-gray-500 disabled:text-white/50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none";
    const greenButtonClasses = "text-brand-bg bg-brand-correct/80 border-brand-correct shadow-[0_4px_0_var(--brand-correct-shadow)] hover:bg-brand-correct hover:shadow-[0_6px_0_var(--brand-correct-shadow)] active:translate-y-1 active:shadow-[0_2px_0_var(--brand-correct-shadow)]";

    const renderCubeStyleSelector = () => (
         <main className="flex-grow flex flex-col gap-4 min-h-0">
            <div className="flex-grow p-4 bg-brand-secondary/30 rounded-lg shadow-inner-strong flex items-center justify-center" style={previewContainerStyle}>
                <div className="flex flex-col items-center gap-8" style={{ perspective: '1000px' }}>
                     <ChoiceButton
                        word={t('play')}
                        onClick={() => {}}
                        disabled={false}
                        status={'default'}
                    />
                    <div className="transform scale-125">
                        <LetterCube letter="A" size={64} animationDelay="0s" />
                    </div>
                </div>
            </div>
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
    );

    return (
        <div className="fixed inset-0 bg-brand-bg/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-appear p-4">
            <div className="w-full max-w-2xl h-full max-h-[95vh] text-center p-4 sm:p-6 bg-brand-primary backdrop-blur-sm border-2 border-white/40 rounded-2xl shadow-2xl shadow-black/20 flex flex-col">
                
                <header className="flex-shrink-0 flex items-center justify-between mb-4">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-light">{t('designStudioTitle')}</h2>
                </header>
                
                <div className="flex-shrink-0 flex w-full max-w-sm mx-auto items-center p-1 bg-black/20 rounded-full border border-transparent shadow-inner mb-4">
                    {(['texture', 'structure', 'cube'] as StudioTab[]).map(tab => (
                        <button key={tab} onClick={() => setActiveStudioTab(tab)} className={`w-1/3 h-10 flex items-center justify-center text-sm font-bold transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-accent-secondary/50 ${activeStudioTab === tab ? 'bg-brand-accent-secondary text-white shadow-sm' : 'bg-transparent text-brand-light/60 hover:text-brand-light'}`}>
                            {t(tab)}
                        </button>
                    ))}
                </div>


                {activeStudioTab === 'texture' ? (
                <main className="flex-grow flex flex-col gap-4 min-h-0">
                    {/* Prompt and Upload Section */}
                    <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2">
                        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={sourceImage ? t('editPromptPlaceholder') : t('promptPlaceholder')} className="w-full flex-grow p-3 bg-brand-secondary/50 border-2 border-brand-light/20 rounded-lg text-lg text-brand-light focus:outline-none focus:border-brand-accent-secondary focus:ring-2 focus:ring-brand-accent-secondary/50 resize-none custom-scrollbar" rows={3} disabled={isLoading}/>
                         <div className="flex flex-col gap-2">
                            <input type="file" accept="image/png, image/jpeg, image/webp" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className={`${actionButtonBaseClasses} text-white bg-brand-tertiary border-transparent`}>{t('uploadImage')}</button>
                            {sourceImage && ( <button onClick={handleDescribe} disabled={isLoading} className={`${actionButtonBaseClasses} text-brand-bg bg-brand-quaternary border-transparent`}>{t('describeImage')}</button>)}
                        </div>
                    </div>
                    
                    <div className="relative flex-grow bg-brand-secondary/30 rounded-lg shadow-inner-strong flex items-center justify-center overflow-hidden">
                        {isLoading && <LoadingSpinner />}
                        {error && !isLoading && ( <p className="text-brand-accent text-lg font-bold">{error}</p> )}
                        {activeDisplayUrl && !isLoading && ( <img src={activeDisplayUrl} alt={prompt || "User-generated or uploaded image"} className="w-full h-full object-contain animate-appear" /> )}
                        {!isLoading && !activeDisplayUrl && !error && ( <p className="text-brand-light/50">{t('designStudioDesc')}</p> )}
                        {sourceImage && !isLoading && ( <button onClick={handleClearImage} className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors z-10" title={t('clearImage')}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>)}
                        {activeDataUrl && !savedImages.includes(activeDataUrl) && !isLoading && (<button onClick={handleSaveImage} className="absolute top-2 left-2 px-3 py-1 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors z-10 flex items-center gap-1 text-sm" title={t('saveToGallery')}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1H5V4zM5 7h10v9a2 2 0 01-2 2H7a2 2 0 01-2-2V7z" /></svg>Save</button>)}
                    </div>

                    <div className="flex-shrink-0 h-28 bg-brand-secondary/30 p-2 rounded-lg shadow-inner-strong mt-2">
                        <h3 className="text-sm font-bold text-brand-light/70 mb-1 text-left px-1">{t('gallery')}</h3>
                        <div className="flex gap-2 h-20 overflow-x-auto custom-scrollbar pb-1">
                            {savedImages.length === 0 ? ( <div className="w-full flex items-center justify-center h-full"><p className="text-brand-light/50">Your saved images will appear here.</p></div>) : ( savedImages.map((imgUrl, index) => (
                                    <div key={index} className="relative h-full aspect-square flex-shrink-0 group">
                                        <img src={imgUrl} alt={`Saved image ${index + 1}`} className="w-full h-full object-cover rounded-md cursor-pointer border-2 border-transparent group-hover:border-brand-accent-secondary transition-colors" onClick={() => handleSelectSavedImage(imgUrl)}/>
                                        <button onClick={() => handleDeleteSavedImage(index)} className="absolute -top-1 -right-1 p-1 bg-brand-accent text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                                    </div>)))}
                        </div>
                    </div>
                </main>
                ) : activeStudioTab === 'structure' ? (
                <main className="flex-grow flex flex-col md:flex-row gap-4 min-h-0">
                    <div className="md:w-1/2 flex flex-col gap-4">
                        <div className="flex-grow p-4 bg-brand-secondary/30 rounded-lg shadow-inner-strong flex items-center justify-center" style={previewContainerStyle}>
                            <div className="w-48">
                                <ChoiceButton
                                    word={t('play')}
                                    onClick={() => {}}
                                    disabled={false}
                                    status={'default'}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="md:w-1/2 flex flex-col gap-3 p-4 bg-brand-secondary/30 rounded-lg shadow-inner-strong">
                        {/* Structure Controls */}
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
                ) : (
                    renderCubeStyleSelector()
                )}

                <footer className="flex-shrink-0 mt-4 flex flex-col gap-3">
                    {activeStudioTab === 'texture' && (
                    <>
                        <div className="flex items-stretch gap-2 bg-brand-secondary/30 p-2 rounded-lg">
                            <select value={selectedPlanetIndex} onChange={(e) => setSelectedPlanetIndex(Number(e.target.value))} disabled={!activeDataUrl || isLoading} className="bg-brand-secondary p-3 rounded-lg text-lg font-bold text-brand-light border-2 border-brand-light/20 focus:outline-none focus:border-brand-accent-secondary custom-scrollbar" aria-label={t('selectPlanet')}>
                                {planetNameTranslationKeys.map((key, index) => (
                                    <option key={index} value={index}>{t(key as any)}</option>
                                ))}
                            </select>
                            <button onClick={handleSetPlanet} disabled={!activeDataUrl || isLoading} className={`${actionButtonBaseClasses} ${greenButtonClasses} ${disabledActionButtonClasses} flex-grow`}>{t('setAsPlanetBackground')}</button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <button onClick={handleSetMenuBG} disabled={!activeDataUrl || isLoading} className={`${actionButtonBaseClasses} ${greenButtonClasses} ${disabledActionButtonClasses}`}>{t('setAsMenuBackground')}</button>
                            <button onClick={handleSetAsAvatar} disabled={!activeDataUrl || isLoading} className={`${actionButtonBaseClasses} ${greenButtonClasses} ${disabledActionButtonClasses}`}>{t('setAsAvatar')}</button>
                            <button onClick={handleSetAsGameBG} disabled={!activeDataUrl || isLoading} className={`${actionButtonBaseClasses} ${greenButtonClasses} ${disabledActionButtonClasses}`}>{t('setAsGameBackground')}</button>
                        </div>
                    </>
                    )}
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button onClick={onClose} className={`${actionButtonBaseClasses} text-white bg-brand-accent border-transparent hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-lg flex-1`}>{t('back')}</button>
                        {activeStudioTab === 'texture' ? (
                        <button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className={`${actionButtonBaseClasses} text-brand-bg bg-brand-accent-secondary/80 border-brand-accent-secondary shadow-[0_4px_0_var(--brand-accent-secondary-shadow)] hover:bg-brand-accent-secondary hover:shadow-[0_6px_0_var(--brand-accent-secondary-shadow)] active:translate-y-1 active:shadow-[0_2px_0_var(--brand-accent-secondary-shadow)] disabled:bg-gray-600 disabled:border-gray-500 disabled:text-white/50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none flex-1`}>
                            {isLoading ? t('generating') : t('generate')}
                        </button>
                        ) : (
                        <button onClick={handleApplyStyles} className={`${actionButtonBaseClasses} ${greenButtonClasses} flex-1`}>
                            {t('apply')}
                        </button>
                        )}

                    </div>
                </footer>
            </div>
        </div>
    );
};

export default DesignStudioPage;