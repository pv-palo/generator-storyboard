import { Frame } from '../types';

/**
 * Parsea un guión en texto plano y extrae fotogramas numerados junto con
 * enlaces de referencia asociados.
 *
 * Reconoce encabezados como "Fotograma 1", "Plano 02", "Escena 3", "1.", etc.
 * y detecta URLs (http/https) en cualquier línea para asociarlas al
 * fotograma activo.
 */
export function parseRawScript(text: string): Frame[] {
  if (!text || text.trim().length === 0) return [];

  const lines = text.split('\n');
  const frames: Frame[] = [];
  let currentFrame: Partial<Frame> | null = null;
  let counter = 1;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Detectar patrones como "Fotograma 1", "Plano 02", "1.", etc.
    const headerMatch = line.match(/^(?:fotograma|plano|frame|escena)?\s*#?(\d+)[:.\-–]?\s*(.*)$/i);
    const urlMatch = line.match(/(https?:\/\/[^\s]+)/i);

    if (headerMatch && (!urlMatch || headerMatch.index! < urlMatch.index!)) {
      if (currentFrame && currentFrame.text !== undefined) {
        frames.push({
          number: currentFrame.number || counter++,
          text: currentFrame.text.trim(),
          link: currentFrame.link || ''
        });
      }
      const parsedNum = parseInt(headerMatch[1], 10);
      currentFrame = {
        number: isNaN(parsedNum) ? counter++ : parsedNum,
        text: headerMatch[2] || '',
        link: ''
      };
    } else if (urlMatch) {
      if (currentFrame) {
        currentFrame.link = urlMatch[1];
        const remaining = line.replace(urlMatch[1], '').trim();
        if (remaining) {
          currentFrame.text = currentFrame.text ? `${currentFrame.text} ${remaining}` : remaining;
        }
      } else {
        currentFrame = { number: counter++, text: '', link: urlMatch[1] };
      }
    } else {
      if (currentFrame) {
        currentFrame.text = currentFrame.text ? `${currentFrame.text}\n${line}` : line;
      } else {
        currentFrame = { number: counter++, text: line, link: '' };
      }
    }
  }

  if (currentFrame && (currentFrame.text || currentFrame.link)) {
    frames.push({
      number: currentFrame.number || counter++,
      text: (currentFrame.text || '').trim(),
      link: currentFrame.link || ''
    });
  }

  return frames;
}
