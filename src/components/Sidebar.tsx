import React from 'react';
import { Frame, StoryboardConfig } from '../types';
import { generateJSX } from '../utils/jsxGenerator';
import { Download, Film, Trash2 } from 'lucide-react';

interface SidebarProps {
  frames: Frame[];
  config: StoryboardConfig;
  onConfigChange: (config: StoryboardConfig) => void;
  onCleanFrames: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ frames, config, onConfigChange, onCleanFrames }) => {
  const handleDownloadJSX = () => {
    const code = generateJSX(frames, config);
    const blob = new Blob([code], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(config.projectName || 'storyboard').toLowerCase().replace(/\s+/g, '_')}.jsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCleanClick = () => {
    if (window.confirm('¿Deseas vaciar todos los fotogramas del guión?')) {
      onCleanFrames();
    }
  };

  return (
    <aside className="w-80 bg-[#f3f5f0] border-r border-[#cbd0c4] flex flex-col justify-between h-screen">
      <div className="p-4 space-y-4 overflow-y-auto">
        <div className="flex items-center gap-2.5 border-b border-[#cbd0c4] pb-3">
          <Film className="h-6 w-6 text-[#2a5e35]" />
          <div>
            <h1 className="font-extrabold text-sm text-[#1a2d1d] tracking-tight">Storyboard Studio</h1>
            <p className="text-[10px] text-[#5a6b5c] font-medium">Exportador ExtendScript Illustrator</p>
          </div>
        </div>

        <div className="bg-white border border-[#cbd0c4] rounded-xl p-3.5 space-y-3 shadow-3xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#1a2d1d]">
            <span>Estado del Proyecto</span>
            <span className="bg-acidlime text-[#1a2d1d] px-2 py-0.5 rounded font-mono text-[10px]">
              {frames.length} PLANOS
            </span>
          </div>

          <div className="pt-0.5">
            <button
              id="btn-download-jsx-card"
              onClick={handleDownloadJSX}
              disabled={frames.length === 0}
              className="w-full py-2 px-3 rounded-lg font-black text-[10px] uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-all bg-[#ccff00] hover:bg-neutral-900 hover:text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-3xs"
            >
              <Download className="h-4 w-4 shrink-0" />
              Descargar Script (.jsx)
            </button>
          </div>
        </div>

        <div className="bg-white border border-[#cbd0c4] rounded-xl p-3.5 space-y-2.5 shadow-3xs text-xs">
          <label className="font-bold text-[10px] uppercase text-[#5a6b5c] tracking-wider block">
            Nombre del Proyecto
          </label>
          <input
            type="text"
            value={config.projectName}
            onChange={(e) => onConfigChange({ ...config, projectName: e.target.value })}
            placeholder="Ej: Spot Publicitario Primavera"
            className="w-full border border-[#cbd0c4] rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#2a5e35]"
          />
        </div>

        <div className="bg-white border border-[#cbd0c4] rounded-xl p-3.5 space-y-2.5 shadow-3xs text-xs">
          <label className="font-bold text-[10px] uppercase text-[#5a6b5c] tracking-wider block">
            Autor / Director
          </label>
          <input
            type="text"
            value={config.author}
            onChange={(e) => onConfigChange({ ...config, author: e.target.value })}
            placeholder="Ej: María López"
            className="w-full border border-[#cbd0c4] rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#2a5e35]"
          />
        </div>
      </div>

      <footer className="p-2.5 flex flex-col items-center gap-1.5 border-t border-[#cbd0c4] select-none bg-[#f3f5f0]">
        {frames.length > 0 && (
          <button
            onClick={handleCleanClick}
            className="text-[9px] font-bold uppercase tracking-wider text-[#5a6b5c] hover:text-red-600 transition-colors inline-flex items-center gap-1 cursor-pointer py-0.5 px-2 rounded hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
            Limpiar guión
          </button>
        )}
        <p className="text-[9px] text-[#5a6b5c]/70 font-semibold uppercase tracking-tight">
          ExtendScript Export Engine &copy; 2026
        </p>
      </footer>
    </aside>
  );
};
