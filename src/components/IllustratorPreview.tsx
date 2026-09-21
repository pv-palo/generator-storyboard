import React from 'react';
import { Frame } from '../types';

interface IllustratorPreviewProps {
  frame?: Frame;
}

function truncate(text: string, max: number): string {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + '…';
}

export const IllustratorPreview: React.FC<IllustratorPreviewProps> = ({ frame }) => {
  const number = frame?.number ?? 1;
  const badgeLabel = `PLANO ${number < 10 ? '0' + number : number}`;
  const descText = frame?.text
    ? truncate(frame.text, 34)
    : 'Descripción del plano...';
  const linkText = frame?.link ? truncate(`Ref: ${frame.link}`, 30) : null;

  const W = 300;
  const H = 200;
  const bgH = Math.round((1080 / 1280) * H);
  const panelH = H - bgH;
  const panelY = bgH;

  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${W} ${H + 16}`}
        className="w-full h-auto rounded-md border border-[#cbd0c4]"
        role="img"
        aria-label="Vista previa de la mesa de trabajo en Illustrator"
      >
        <text x={2} y={10} fontSize="8" fill="#8a9488" fontFamily="monospace">
          {`Fotograma ${number < 10 ? '0' + number : number}`}
        </text>

        <g transform="translate(0, 16)">
          <rect x={0} y={0} width={W} height={bgH} fill="#141414" />
          <circle cx={W - 34} cy={bgH / 2 - 10} r="10" fill="#2a2a2a" />
          <path
            d={`M 0 ${bgH} L ${W * 0.3} ${bgH - 34} L ${W * 0.55} ${bgH - 12} L ${W * 0.8} ${bgH - 40} L ${W} ${bgH - 18} L ${W} ${bgH} Z`}
            fill="#1e1e1e"
          />

          <rect x={0} y={panelY} width={W} height={panelH} fill="#f5f7f4" />

          <rect x={10} y={panelY + 6} width={50} height={16} rx="4" fill="#ccff00" />
          <text
            x={35}
            y={panelY + 17}
            fontSize="7"
            fontWeight="bold"
            fill="#141414"
            textAnchor="middle"
            fontFamily="monospace"
          >
            {badgeLabel}
          </text>

          <text x={68} y={panelY + 15} fontSize="7.5" fill="#1e2320">
            {descText}
          </text>

          {linkText && (
            <text x={68} y={panelY + 25} fontSize="6" fill="#5a6b5c" fontStyle="italic">
              {linkText}
            </text>
          )}
        </g>
      </svg>

      <ul className="space-y-1 text-[9px] text-[#5a6b5c] leading-tight">
        <li className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-sm bg-[#141414] shrink-0" />
          Fondo de la escena, 1920×1080 px
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-sm bg-acidlime shrink-0" />
          Número de plano (capa "Información de Escena")
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-sm bg-[#f5f7f4] border border-[#cbd0c4] shrink-0" />
          Panel con descripción y enlace de referencia
        </li>
      </ul>
    </div>
  );
};
