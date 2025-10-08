import React, { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { PlayerInventory, ShopCategory, ShopItem } from '../types';
import { shopItems } from '../config';
import { soundService } from '../services/soundService';
import MoneyDisplay from '../components/MoneyDisplay';

interface ShopPageProps {
    onClose: () => void;
    gameMoney: number;
    inventory: PlayerInventory;
    onPurchase: (itemId: string) => void;
    onEquip: (themeId: string) => void;
}

type ShopTab = ShopCategory;

const ShopPage: React.FC<ShopPageProps> = ({ onClose, gameMoney, inventory, onPurchase, onEquip }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<ShopTab>('power-ups');

    const renderItems = (category: ShopCategory) => {
        return shopItems
            .filter(item => item.category === category)
            .map((item, index) => {
                let currentLevel = 0;
                let price: number | 'max' = 0;
                let isOwned = false;

                if (item.category === 'upgrades' && Array.isArray(item.price)) {
                    currentLevel = inventory.upgrades[item.id] || 0;
                    price = currentLevel < item.price.length ? item.price[currentLevel] : 'max';
                } else if (typeof item.price === 'number') {
                    price = item.price;
                }
                
                if (item.category === 'cosmetics') {
                    isOwned = inventory.cosmetics.includes(item.id);
                }
                
                const canAfford = typeof price === 'number' && gameMoney >= price;
                const isEquipped = item.category === 'cosmetics' && inventory.activeTheme === item.id;

                return (
                    <div key={item.id} className="bg-brand-secondary/50 p-4 rounded-lg flex items-center gap-4 animate-appear" style={{animationDelay: `${index * 50}ms`}}>
                        <div className="text-4xl p-3 rounded-lg bg-brand-primary flex-shrink-0">{item.icon}</div>
                        <div className="flex-grow">
                            <h4 className="font-bold text-brand-light">{t(item.nameKey)}</h4>
                            <p className="text-sm text-brand-light/70">{t(item.descriptionKey)}</p>
                            {item.category === 'upgrades' && (
                                <p className="text-xs text-brand-accent-secondary font-bold mt-1">Level: {currentLevel}</p>
                            )}
                             {item.category === 'power-ups' && (
                                <p className="text-xs text-brand-light/60 font-bold mt-1">Owned: {inventory.consumables[item.id] || 0}</p>
                            )}
                        </div>
                        <div className="flex-shrink-0">
                           {item.category === 'cosmetics' ? (
                                isEquipped ? (
                                     <button disabled className="px-4 py-2 w-28 text-center rounded-lg bg-brand-accent-secondary/50 border border-brand-accent-secondary text-white font-bold cursor-default">{t('equipped')}</button>
                                ) : isOwned ? (
                                    <button onClick={() => onEquip(item.id)} className="px-4 py-2 w-28 text-center rounded-lg bg-brand-accent-secondary/80 border border-brand-accent-secondary text-white font-bold hover:bg-brand-accent-secondary">{t('equip')}</button>
                                ) : (
                                    <button onClick={() => onPurchase(item.id)} disabled={!canAfford} className={`px-4 py-2 w-28 text-center rounded-lg font-bold ${canAfford ? 'bg-brand-warning/80 border border-brand-warning text-black hover:bg-brand-warning' : 'bg-gray-600 border border-gray-500 text-white/50 cursor-not-allowed'}`}>
                                      {t('buy')} <span className="font-sans">☄️</span>{price}
                                    </button>
                                )
                           ) : price === 'max' ? (
                                <button disabled className="px-4 py-2 w-28 text-center rounded-lg bg-gray-600 border border-gray-500 text-white/50 font-bold cursor-default">{t('maxLevel')}</button>
                           ) : (
                               <button onClick={() => onPurchase(item.id)} disabled={!canAfford} className={`px-4 py-2 w-28 text-center rounded-lg font-bold ${canAfford ? 'bg-brand-warning/80 border border-brand-warning text-black hover:bg-brand-warning' : 'bg-gray-600 border border-gray-500 text-white/50 cursor-not-allowed'}`}>
                                    {t('buy')} <span className="font-sans">☄️</span>{price}
                                </button>
                           )}
                        </div>
                    </div>
                );
            });
    };

    return (
        <div className="fixed inset-0 bg-brand-bg/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-appear p-4">
            <div className="w-full max-w-2xl text-center p-4 sm:p-6 bg-brand-primary backdrop-blur-sm border-2 border-white/40 rounded-2xl shadow-2xl shadow-black/20 flex flex-col max-h-[95vh]">
                <header className="flex-shrink-0 flex items-center justify-between mb-4">
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-brand-light">{t('shopTitle')}</h2>
                    <MoneyDisplay money={gameMoney} />
                </header>
                
                <div className="relative flex-shrink-0 flex w-full max-w-md mx-auto items-center justify-center p-1 bg-black/20 rounded-full border border-transparent shadow-inner mb-4">
                    {(['power-ups', 'upgrades', 'cosmetics'] as ShopTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => { soundService.play('click'); setActiveTab(tab); }}
                            className={`w-1/3 h-10 flex items-center justify-center text-sm font-bold transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-accent-secondary/50 ${
                                activeTab === tab ? 'bg-brand-accent-secondary text-white shadow-sm' : 'bg-transparent text-brand-light/60 hover:text-brand-light'
                            }`}
                        >
                            {t(tab === 'power-ups' ? 'powerupsTab' : tab === 'upgrades' ? 'upgradesTab' : 'cosmeticsTab')}
                        </button>
                    ))}
                </div>

                <main className="flex-grow overflow-y-auto custom-scrollbar pr-2 py-2 space-y-3">
                    {renderItems(activeTab)}
                </main>

                <div className="flex-shrink-0 mt-6">
                    <button
                        onClick={onClose}
                        className="w-full max-w-xs text-center text-xl sm:text-2xl font-extrabold p-4 rounded-full transform transition-all duration-150 ease-in-out backdrop-blur-sm shadow-lg border text-white focus:outline-none bg-brand-accent border-transparent hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-lg"
                    >
                        {t('back')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShopPage;