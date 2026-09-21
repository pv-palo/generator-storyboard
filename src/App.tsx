import { useState, useEffect } from 'react';
import { Frame, StoryboardConfig } from './types';
import { Sidebar } from './components/Sidebar';
import { ScriptParser } from './components/ScriptParser';

const DEFAULT_FRAMES: Frame[] = [
  { number: 1, text: 'Plano general de la ciudad al amanecer con neblina suave.', link: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82' },
  { number: 2, text: 'Corte a primer plano del protagonista encendiendo su ordenador.', link: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97' },
  { number: 3, text: 'Plano detalle del storyboard dibujándose en Adobe Illustrator.', link: 'https://images.unsplash.com/photo-1626785774573-4b799315345d' }
];

const DEFAULT_CONFIG: StoryboardConfig = {
  projectName: 'Storyboard Cinemático',
  author: 'Director',
  date: new Date().toISOString().slice(0, 10),
  aspectRatio: '16:9'
};

export function App() {
  const [frames, setFrames] = useState<Frame[]>(() => {
    try {
      const saved = localStorage.getItem('storyboard_frames');
      return saved ? JSON.parse(saved) : DEFAULT_FRAMES;
    } catch {
      return DEFAULT_FRAMES;
    }
  });

  const [config, setConfig] = useState<StoryboardConfig>(() => {
    try {
      const saved = localStorage.getItem('storyboard_config');
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('storyboard_frames', JSON.stringify(frames));
    } catch {
      /* almacenamiento no disponible: se ignora silenciosamente */
    }
  }, [frames]);

  useEffect(() => {
    try {
      localStorage.setItem('storyboard_config', JSON.stringify(config));
    } catch {
      /* almacenamiento no disponible: se ignora silenciosamente */
    }
  }, [config]);

  return (
    <div className="flex h-screen bg-[#f8faf7] text-neutral-900 font-sans overflow-hidden">
      <Sidebar
        frames={frames}
        config={config}
        onConfigChange={setConfig}
        onCleanFrames={() => setFrames([])}
      />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <ScriptParser frames={frames} onFramesChange={setFrames} />
        </div>
      </main>
    </div>
  );
}

export default App;
