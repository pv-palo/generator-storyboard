import React, { useState } from 'react';
import { Frame } from '../types';
import { ChevronUp, ChevronDown, Trash2, Plus, ArrowRight } from 'lucide-react';
import { parseRawScript } from '../utils/parser';

interface ScriptParserProps {
  frames: Frame[];
  onFramesChange: (frames: Frame[]) => void;
}

export const ScriptParser: React.FC<ScriptParserProps> = ({ frames, onFramesChange }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'import'>('visual');
  const [rawText, setRawText] = useState('');

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newFrames = [...frames];
    const temp = newFrames[index];
    newFrames[index] = newFrames[index - 1];
    newFrames[index - 1] = temp;
    newFrames.forEach((f, idx) => { f.number = idx + 1; });
    onFramesChange(newFrames);
  };

  const handleMoveDown = (index: number) => {
    if (index === frames.length - 1) return;
    const newFrames = [...frames];
    const temp = newFrames[index];
    newFrames[index] = newFrames[index + 1];
    newFrames[index + 1] = temp;
    newFrames.forEach((f, idx) => { f.number = idx + 1; });
    onFramesChange(newFrames);
  };

  const handleDeleteFrame = (index: number) => {
    const newFrames = frames.filter((_, idx) => idx !== index);
    newFrames.forEach((f, idx) => { f.number = idx + 1; });
    onFramesChange(newFrames);
  };

  const updateFrameText = (index: number, text: string) => {
    const newFrames = [...frames];
    newFrames[index] = { ...newFrames[index], text };
    onFramesChange(newFrames);
  };

  const updateFrameLink = (index: number, link: string) => {
    const newFrames = [...frames];
    newFrames[index] = { ...newFrames[index], link };
    onFramesChange(newFrames);
  };

  const handleAddFrameAtEnd = () => {
    const nextNumber = frames.length + 1;
    onFramesChange([...frames, { number: nextNumber, text: '', link: '' }]);
  };

  const handleClean = () => {
    if (window.confirm('¿Deseas vaciar todos los fotogramas del guión?')) {
      onFramesChange([]);
    }
  };

  const handleImport = () => {
    const parsed = parseRawScript(rawText);
    if (parsed.length === 0) {
      window.alert('No se detectaron fotogramas en el texto pegado. Revisa el formato e inténtalo de nuevo.');
      return;
    }
    onFramesChange(parsed);
    setRawText('');
    setActiveTab('visual');
  };

  return (
    <div id="script-parser-container" className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#cbd0c4] select-none pb-0">
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`pb-3 text-xs font-extrabold uppercase tracking-widest border-b-[3px] transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'visual' ? 'border-acidlime text-[#1a2d1d]' : 'border-transparent text-[#5a6b5c] hover:text-[#1a2d1d]'
            }`}
          >
            Ventanas Visuales <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${activeTab === 'visual' ? 'bg-[#1a2d1d] text-acidlime' : 'bg-[#cbd0c4]/40 text-[#5a6b5c]'}`}>{frames.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`pb-3 text-xs font-extrabold uppercase tracking-widest border-b-[3px] transition-colors cursor-pointer ${
              activeTab === 'import' ? 'border-acidlime text-[#1a2d1d]' : 'border-transparent text-[#5a6b5c] hover:text-[#1a2d1d]'
            }`}
          >
            Importar Texto Plano
          </button>
        </div>

        {frames.length > 0 && (
          <button
            id="btn-clean-all"
            type="button"
            onClick={handleClean}
            title="Limpiar todos los fotogramas del guión"
            className="mb-2 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-neutral-600 hover:text-red-600 bg-white hover:bg-rose-50 border border-[#cbd0c4] hover:border-red-200 transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-3xs"
          >
            <Trash2 className="h-3.5 w-3.5 text-neutral-500 hover:text-red-500" />
            Limpiar guión
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {activeTab === 'visual' ? (
          <div className="space-y-3">
            {frames.length === 0 && (
              <div className="text-center py-14 border border-dashed border-[#cbd0c4] rounded-xl bg-white/60">
                <p className="text-xs font-bold text-[#5a6b5c] uppercase tracking-wider">Todavía no hay fotogramas</p>
                <p className="text-[11px] text-[#8a9488] mt-1">Añade uno manualmente o impórtalos desde texto plano.</p>
              </div>
            )}

            {frames.map((frame, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="w-8 shrink-0 flex flex-col items-center pt-3 select-none">
                  <span className="font-mono text-xs font-black text-[#1a2d1d] bg-acidlime h-7 w-7 rounded-lg flex items-center justify-center shadow-3xs border border-[#cbd0c4]/40">
                    {frame.number}
                  </span>
                </div>

                <div className="flex-1 bg-white border border-[#cbd0c4] rounded-xl p-3.5 space-y-3 shadow-3xs">
                  <div className="flex items-center justify-between border-b border-[#f0f3eb] pb-1.5">
                    <span className="text-[10px] font-bold text-[#5a6b5c] uppercase tracking-wider">
                      Plano {frame.number}
                    </span>
                    <div className="flex items-center gap-1">
                      <button 
                        type="button" 
                        onClick={() => handleMoveUp(index)} 
                        disabled={index === 0} 
                        className="p-1 text-[#5a6b5c] hover:text-[#1a2d1d] disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleMoveDown(index)} 
                        disabled={index === frames.length - 1} 
                        className="p-1 text-[#5a6b5c] hover:text-[#1a2d1d] disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <div className="w-px h-3.5 bg-[#cbd0c4]/60 mx-0.5" />
                      <button 
                        type="button" 
                        onClick={() => handleDeleteFrame(index)} 
                        className="p-1 text-[#5a6b5c] hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                    <div className="md:col-span-7 space-y-1">
                      <label className="text-[9px] uppercase font-bold text-[#5a6b5c] tracking-wider block">Descripción de Escena</label>
                      <textarea
                        value={frame.text}
                        onChange={(e) => updateFrameText(index, e.target.value)}
                        placeholder="Descripción del fotograma..."
                        rows={2}
                        className="w-full text-xs border border-[#cbd0c4] rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#2a5e35] bg-white text-neutral-800"
                      />
                    </div>
                    <div className="md:col-span-5 space-y-1">
                      <label className="text-[9px] uppercase font-bold text-[#5a6b5c] tracking-wider block">Enlace de Referencia</label>
                      <input
                        type="text"
                        value={frame.link || ''}
                        onChange={(e) => updateFrameLink(index, e.target.value)}
                        placeholder="https://ejemplo.com"
                        className="w-full text-xs border border-[#cbd0c4] rounded-lg py-2 px-2.5 focus:outline-none focus:ring-1 focus:ring-[#2a5e35] bg-white text-[#4d5b4e] font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex pl-12 pt-1.5 justify-center">
              <button
                type="button"
                onClick={handleAddFrameAtEnd}
                className="px-4 py-2.5 w-full bg-[#e4e9dd]/50 hover:bg-[#e4e9dd] text-[#2a5e35] font-bold text-[11px] uppercase tracking-wider rounded-xl border border-dashed border-[#cbd0c4] transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
              >
                <Plus className="h-4 w-4" />
                Añadir Nuevo Fotograma
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 bg-white p-4 rounded-xl border border-[#cbd0c4]">
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Pega aquí el guión en texto plano (ej: Fotograma 01: Escena en la calle... https://ejemplo.com/imagen.jpg)"
              rows={10}
              className="w-full text-xs border border-[#cbd0c4] rounded-lg p-3 font-mono focus:outline-none focus:ring-1 focus:ring-[#2a5e35]"
            />
            <button
              type="button"
              onClick={handleImport}
              disabled={rawText.trim().length === 0}
              className="px-4 py-2 bg-[#ccff00] text-neutral-900 font-extrabold text-xs uppercase tracking-wider rounded-lg inline-flex items-center gap-2 cursor-pointer shadow-3xs hover:bg-neutral-900 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Procesar e Importar <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
