import React, { useEffect, useState } from 'react';
import { X, Download, Grid } from 'lucide-react';
import { generateSpriteSheet } from '../utils/imageUtils';

interface SpriteSheetPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  frames: string[];
}

const SpriteSheetPreview: React.FC<SpriteSheetPreviewProps> = ({ isOpen, onClose, frames }) => {
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [columns, setColumns] = useState(6);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && frames.length > 0) {
      setLoading(true);
      generateSpriteSheet(frames, columns)
        .then(url => {
          setSheetUrl(url);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to generate sheet", err);
          setLoading(false);
        });
    }
  }, [isOpen, frames, columns]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Grid className="w-5 h-5 text-brand-500" />
            Sprite Sheet Preview
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-8 bg-[#1a1a1a] flex items-center justify-center relative">
          {/* Transparency grid */}
           <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
               backgroundSize: '20px 20px',
               zIndex: 0
             }} 
           />
           
          {loading ? (
            <div className="text-brand-500 animate-pulse font-mono">Stitching sprites...</div>
          ) : (
            sheetUrl && <img src={sheetUrl} alt="Sprite Sheet" className="max-w-full shadow-lg border border-gray-700 z-10 pixel-art" />
          )}
        </div>

        <div className="p-4 bg-gray-900 border-t border-gray-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <label className="text-sm text-gray-400">Columns:</label>
             <input 
               type="number" 
               min="1" 
               max="20" 
               value={columns} 
               onChange={(e) => setColumns(parseInt(e.target.value) || 4)}
               className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 w-16 text-center focus:ring-1 focus:ring-brand-500 outline-none"
             />
             <span className="text-xs text-gray-500 ml-2">Total Frames: {frames.length}</span>
          </div>

          <a 
            href={sheetUrl || '#'} 
            download="sprite_sheet.png"
            className={`flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-md font-medium transition-colors ${!sheetUrl ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <Download className="w-4 h-4" />
            Download Sheet
          </a>
        </div>

      </div>
    </div>
  );
};

export default SpriteSheetPreview;