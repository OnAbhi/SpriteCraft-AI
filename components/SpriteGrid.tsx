import React, { useState } from 'react';
import { AnimationState, GeneratedFrame } from '../types';
import { Download, Play, Plus, Trash2, ImagePlus, Zap, CirclePlay } from 'lucide-react';

interface SpriteGridProps {
  frames: GeneratedFrame[];
  onGenerateAction: (state: AnimationState) => void;
  onGenerateSequence: (state: AnimationState, count: number) => void;
  onDeleteFrame: (id: string) => void;
  onPreview: (state: AnimationState) => void;
  isGenerating: boolean;
  baseExists: boolean;
}

const SpriteGrid: React.FC<SpriteGridProps> = ({ 
  frames, 
  onGenerateAction,
  onGenerateSequence, 
  onDeleteFrame, 
  onPreview,
  isGenerating,
  baseExists
}) => {
  
  // Local state for frame counts per action
  const [frameCounts, setFrameCounts] = useState<Record<string, number>>({});

  // Group frames by state
  const framesByState = frames.reduce((acc, frame) => {
    if (!acc[frame.state]) acc[frame.state] = [];
    acc[frame.state].push(frame);
    return acc;
  }, {} as Record<AnimationState, GeneratedFrame[]>);

  const states = Object.values(AnimationState);

  const handleDownload = (dataUrl: string, name: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFrameCount = (state: AnimationState) => frameCounts[state] || 4;
  const setFrameCount = (state: AnimationState, val: number) => {
    setFrameCounts(prev => ({...prev, [state]: Math.max(1, Math.min(12, val))}));
  };

  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-gray-900">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {!baseExists && (
           <div className="flex flex-col items-center justify-center h-96 text-gray-500 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/50">
             <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
               <ImagePlus className="w-8 h-8 text-gray-600" />
             </div>
             <p className="text-lg font-medium">No character generated yet</p>
             <p className="text-sm">Use the sidebar to generate a base sprite.</p>
           </div>
        )}

        {baseExists && states.map(state => {
          const stateFrames = framesByState[state] || [];
          const sortedFrames = [...stateFrames].sort((a, b) => a.timestamp - b.timestamp);
          
          return (
            <div key={state} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800 pb-2 gap-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                    {state === AnimationState.Idle && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                    {state}
                    <span className="text-xs font-normal text-gray-500 ml-2">({stateFrames.length} frames)</span>
                    </h3>
                    
                    {stateFrames.length > 1 && (
                        <button 
                            onClick={() => onPreview(state)}
                            className="text-brand-500 hover:text-brand-400 transition-colors"
                            title="Preview Animation"
                        >
                            <CirclePlay className="w-5 h-5" />
                        </button>
                    )}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-gray-800 rounded-md border border-gray-700">
                    <span className="text-xs text-gray-400 px-2 border-r border-gray-700">Count</span>
                    <input 
                      type="number" 
                      min="1" 
                      max="12"
                      value={getFrameCount(state)}
                      onChange={(e) => setFrameCount(state, parseInt(e.target.value) || 4)}
                      className="w-12 bg-transparent text-white text-xs py-1.5 px-1 text-center focus:outline-none"
                    />
                  </div>
                  
                  <button
                    onClick={() => onGenerateSequence(state, getFrameCount(state))}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-brand-600 hover:bg-brand-500 text-white rounded border border-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:border-gray-700"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Generate Sequence
                  </button>

                  <button
                    onClick={() => onGenerateAction(state)}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-750 text-gray-300 rounded border border-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add 1
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {sortedFrames.map((frame, idx) => (
                  <div key={frame.id} className="group relative aspect-square bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-brand-500/50 transition-colors">
                    {/* Checkered background for transparency visualization */}
                    <div className="absolute inset-0 opacity-20" 
                         style={{ 
                           backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
                           backgroundSize: '20px 20px',
                           backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' 
                         }} 
                    />
                    
                    <img 
                      src={frame.imageUrl} 
                      alt={`${state} ${idx}`} 
                      className="absolute inset-0 w-full h-full object-contain p-2 pixel-art z-0"
                    />

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-10">
                      <button 
                        onClick={() => handleDownload(frame.imageUrl, `sprite_${state.toLowerCase()}_${idx}`)}
                        className="p-1.5 bg-gray-700 hover:bg-brand-600 text-white rounded-md transition-colors"
                        title="Download Frame"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteFrame(frame.id)}
                        className="p-1.5 bg-gray-700 hover:bg-red-600 text-white rounded-md transition-colors"
                        title="Delete Frame"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="absolute top-1 left-2 text-[10px] text-gray-400 font-mono opacity-50 group-hover:opacity-100">
                      #{idx + 1}
                    </div>
                  </div>
                ))}
                
                {stateFrames.length === 0 && (
                   <div className="aspect-square rounded-lg border-2 border-dashed border-gray-800 flex items-center justify-center text-gray-700 text-xs">
                     Empty
                   </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpriteGrid;