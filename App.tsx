import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import SpriteGrid from './components/SpriteGrid';
import SpriteSheetPreview from './components/SpriteSheetPreview';
import AnimationPreview from './components/AnimationPreview';
import { SpriteConfig, SpriteCategory, SpriteStyle, SpriteWeapon, GeneratedFrame, AnimationState } from './types';
import { generateBaseSprite, generateActionFrame } from './services/geminiService';
import { removeBackground, centerSprite } from './utils/imageUtils';
import { Layers } from 'lucide-react';

const App: React.FC = () => {
  const [config, setConfig] = useState<SpriteConfig>({
    category: SpriteCategory.Human,
    style: SpriteStyle.PixelArt16Bit,
    weapon: SpriteWeapon.None,
    description: 'A brave knight with silver armor and a red cape.'
  });

  const [frames, setFrames] = useState<GeneratedFrame[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [previewState, setPreviewState] = useState<{isOpen: boolean; state: AnimationState | null}>({isOpen: false, state: null});
  const [error, setError] = useState<string | null>(null);

  // Checks if we have a base idle sprite to reference
  const baseFrame = frames.find(f => f.state === AnimationState.Idle);

  const addFrame = (state: AnimationState, imageUrl: string) => {
    const newFrame: GeneratedFrame = {
      id: Math.random().toString(36).substr(2, 9),
      state,
      imageUrl,
      timestamp: Date.now()
    };
    setFrames(prev => [...prev, newFrame]);
  };

  const handleGenerateBase = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      // Clear previous if generating new base
      if (baseFrame) {
        if (!confirm("Generating a new base character will allow you to start fresh. The old frames will remain until you delete them. Continue?")) {
           setIsGenerating(false);
           return;
        }
      }

      const rawImage = await generateBaseSprite(config);
      const cleanImage = await removeBackground(rawImage);
      const centeredImage = await centerSprite(cleanImage);
      
      addFrame(AnimationState.Idle, centeredImage);
      
    } catch (err: any) {
      setError(err.message || "Failed to generate sprite");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAction = async (state: AnimationState) => {
    if (!baseFrame) return;
    setIsGenerating(true);
    setError(null);
    try {
      // Find the last frame for this state to use as previous context, or fallback to base
      const existingFrames = frames.filter(f => f.state === state).sort((a,b) => a.timestamp - b.timestamp);
      const prevFrame = existingFrames.length > 0 ? existingFrames[existingFrames.length - 1].imageUrl : undefined;

      const rawImage = await generateActionFrame(baseFrame.imageUrl, config, state, existingFrames.length + 1, existingFrames.length + 1, prevFrame);
      const cleanImage = await removeBackground(rawImage);
      const centeredImage = await centerSprite(cleanImage);
      addFrame(state, centeredImage);
    } catch (err: any) {
      setError(err.message || "Failed to generate animation frame");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSequence = async (state: AnimationState, count: number) => {
    if (!baseFrame) return;
    setIsGenerating(true);
    setError(null);

    try {
      // SEQUENTIAL GENERATION LOGIC
      // To ensure frame-to-frame consistency, we generate one frame, wait for it, 
      // and pass it as context for the next frame.
      
      // Get any existing frames for context
      let currentSequenceFrames = frames.filter(f => f.state === state).sort((a,b) => a.timestamp - b.timestamp);
      let lastFrameImage = currentSequenceFrames.length > 0 ? currentSequenceFrames[currentSequenceFrames.length - 1].imageUrl : undefined;
      let startIndex = currentSequenceFrames.length + 1;

      for (let i = 0; i < count; i++) {
        const index = startIndex + i;
        
        // Pass the base image for design, and the last generated frame for motion continuity
        const rawImage = await generateActionFrame(baseFrame.imageUrl, config, state, index, startIndex + count - 1, lastFrameImage);
        
        const cleanImage = await removeBackground(rawImage);
        const centeredImage = await centerSprite(cleanImage);
        
        addFrame(state, centeredImage);
        
        // Update context for next iteration
        lastFrameImage = centeredImage;
      }
      
    } catch (err: any) {
      setError(err.message || "Failed to generate sequence");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteFrame = (id: string) => {
    setFrames(prev => prev.filter(f => f.id !== id));
  };

  const handlePreview = (state: AnimationState) => {
    setPreviewState({ isOpen: true, state });
  };

  // Get frames for the preview modal
  const previewFrames = previewState.state 
    ? frames.filter(f => f.state === previewState.state).sort((a,b) => a.timestamp - b.timestamp).map(f => f.imageUrl)
    : [];

  // Get all image URLs for sheet generation
  const allFrameUrls = frames.map(f => f.imageUrl);

  return (
    <div className="flex h-screen w-screen bg-gray-950 text-gray-100 overflow-hidden">
      
      <Sidebar 
        config={config} 
        setConfig={setConfig} 
        onGenerateBase={handleGenerateBase}
        isGenerating={isGenerating}
        hasBase={!!baseFrame}
      />
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0 z-20">
          <h2 className="text-gray-400 text-sm font-medium">Workspace</h2>
          
          <div className="flex items-center gap-4">
             {error && <span className="text-red-400 text-xs">{error}</span>}
             
             <button 
               onClick={() => setIsSheetOpen(true)}
               disabled={frames.length === 0}
               className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 text-sm transition-colors disabled:opacity-50"
             >
               <Layers className="w-4 h-4" />
               View Sprite Sheet
             </button>
          </div>
        </header>

        <SpriteGrid 
          frames={frames} 
          onGenerateAction={handleGenerateAction} 
          onGenerateSequence={handleGenerateSequence}
          onDeleteFrame={handleDeleteFrame}
          onPreview={handlePreview}
          isGenerating={isGenerating}
          baseExists={!!baseFrame}
        />
        
        {/* Loading Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
             <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg shadow-2xl flex flex-col items-center gap-4">
               <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-brand-400 font-mono text-sm animate-pulse">Summoning pixels...</p>
               <p className="text-gray-500 text-xs">Generating sequentially for consistency...</p>
             </div>
          </div>
        )}
      </main>

      <SpriteSheetPreview 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
        frames={allFrameUrls}
      />

      <AnimationPreview 
        isOpen={previewState.isOpen}
        onClose={() => setPreviewState({ isOpen: false, state: null })}
        frames={previewFrames}
        stateName={previewState.state || ''}
      />
    </div>
  );
};

export default App;