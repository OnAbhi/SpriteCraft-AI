import React from 'react';
import { SpriteCategory, SpriteStyle, SpriteWeapon, SpriteConfig, AnimationState } from '../types';
import { Dices, Wand2, Download, Sword } from 'lucide-react';

interface SidebarProps {
  config: SpriteConfig;
  setConfig: React.Dispatch<React.SetStateAction<SpriteConfig>>;
  onGenerateBase: () => void;
  isGenerating: boolean;
  hasBase: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ config, setConfig, onGenerateBase, isGenerating, hasBase }) => {
  
  const handleRandomize = () => {
    const categories = Object.values(SpriteCategory);
    const styles = Object.values(SpriteStyle);
    const weapons = Object.values(SpriteWeapon);
    
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];
    
    // Adjectives for randomization
    const adjectives = ['cybernetic', 'cursed', 'divine', 'rusty', 'glowing', 'shadowy', 'armored', 'tiny', 'giant'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    
    setConfig({
      category: randomCategory,
      style: randomStyle,
      weapon: randomWeapon,
      description: `A ${adj} ${randomCategory.toLowerCase()} wearing distinctive gear.`
    });
  };

  return (
    <div className="w-full md:w-80 bg-gray-950 border-r border-gray-850 h-full flex flex-col p-6 overflow-y-auto shrink-0 z-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
          <Wand2 className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-cyan-400">
          SpriteCraft AI
        </h1>
      </div>

      <div className="space-y-6 flex-1">
        
        {/* Category */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</label>
          <select 
            value={config.category}
            onChange={(e) => setConfig({...config, category: e.target.value as SpriteCategory})}
            className="w-full bg-gray-850 border border-gray-750 text-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none transition-colors"
          >
            {Object.values(SpriteCategory).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Style */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Art Style</label>
          <select 
            value={config.style}
            onChange={(e) => setConfig({...config, style: e.target.value as SpriteStyle})}
            className="w-full bg-gray-850 border border-gray-750 text-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none transition-colors"
          >
            {Object.values(SpriteStyle).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Weapon */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            Weapon / Item
          </label>
          <div className="relative">
            <Sword className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select 
              value={config.weapon}
              onChange={(e) => setConfig({...config, weapon: e.target.value as SpriteWeapon})}
              className="w-full bg-gray-850 border border-gray-750 text-gray-200 rounded-md pl-9 pr-3 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none transition-colors"
            >
              {Object.values(SpriteWeapon).map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description & Traits</label>
          <textarea 
            value={config.description}
            onChange={(e) => setConfig({...config, description: e.target.value})}
            placeholder="e.g. Red armor, glowing eyes, wearing a heavy cloak..."
            className="w-full h-32 bg-gray-850 border border-gray-750 text-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none transition-colors resize-none text-sm"
          />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <button 
            onClick={handleRandomize}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-850 hover:bg-gray-800 text-gray-300 rounded-md transition-colors text-sm font-medium border border-gray-750"
          >
            <Dices className="w-4 h-4" />
            Random
          </button>
          
          <button 
            onClick={onGenerateBase}
            disabled={isGenerating}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-bold shadow-lg shadow-brand-900/20 ${
              isGenerating 
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
              : 'bg-brand-600 hover:bg-brand-500 text-white'
            }`}
          >
            {isGenerating ? 'Working...' : (hasBase ? 'New Base' : 'Generate')}
            {!isGenerating && <Wand2 className="w-4 h-4" />}
          </button>
        </div>
        
        {hasBase && (
          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800 text-sm text-gray-400 mt-6">
            <p>💡 Tip: Once the base sprite is generated, use the grid controls to generate animations based on it.</p>
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-gray-850 text-xs text-gray-500">
        Made by Abhishek Saini
      </div>
    </div>
  );
};

export default Sidebar;