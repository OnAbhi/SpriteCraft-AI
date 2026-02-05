import React, { useEffect, useState, useRef } from 'react';
import { X, Play, Pause, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { AnimationState } from '../types';

interface AnimationPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  frames: string[];
  stateName: AnimationState | string;
}

const AnimationPreview: React.FC<AnimationPreviewProps> = ({ isOpen, onClose, frames, stateName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [fps, setFps] = useState(8);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen && isPlaying && frames.length > 0) {
      intervalRef.current = window.setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % frames.length);
      }, 1000 / fps);
    }

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [isOpen, isPlaying, frames, fps]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-850">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Play className="w-4 h-4 text-brand-500 fill-brand-500" />
            Preview: {stateName}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport */}
        <div className="aspect-square bg-[#1a1a1a] flex items-center justify-center relative border-b border-gray-800">
           {/* Transparency grid */}
           <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
               backgroundSize: '20px 20px',
             }} 
           />
           
           {frames.length > 0 ? (
             <img 
               src={frames[currentIndex]} 
               alt={`Frame ${currentIndex}`} 
               className="w-3/4 h-3/4 object-contain pixel-art z-10"
             />
           ) : (
             <span className="text-gray-500">No frames to play</span>
           )}
           
           <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-gray-300 font-mono">
             {currentIndex + 1} / {frames.length}
           </div>
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4 bg-gray-900">
          
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => {
                setIsPlaying(false);
                setCurrentIndex(prev => (prev - 1 + frames.length) % frames.length);
              }}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 bg-brand-600 hover:bg-brand-500 text-white rounded-full transition-colors shadow-lg shadow-brand-900/50"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>
            
            <button 
              onClick={() => {
                setIsPlaying(false);
                setCurrentIndex(prev => (prev + 1) % frames.length);
              }}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3 bg-gray-800 p-2 rounded-lg">
             <Settings className="w-4 h-4 text-gray-500" />
             <input 
               type="range" 
               min="1" 
               max="24" 
               value={fps} 
               onChange={(e) => setFps(parseInt(e.target.value))}
               className="flex-1 accent-brand-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
             />
             <span className="text-xs text-gray-400 font-mono w-12 text-right">{fps} FPS</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AnimationPreview;