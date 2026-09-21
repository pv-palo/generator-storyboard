import { Frame, StoryboardConfig } from '../types';

/**
 * Genera un script ExtendScript (.jsx) que Adobe Illustrator puede ejecutar
 * para construir automáticamente un storyboard: una mesa de trabajo de
 * 1920x1280 px por fotograma, dispuestas en cuadrícula y centradas en el
 * origen (0, 0).
 *
 * El script respeta los límites seguros de lienzo de Illustrator
 * (aprox. ±8191 pt desde el origen) para evitar el error 1200
 * "Artboard Out of Canvas" (AOoC), ajustando el número de columnas de forma
 * dinámica y avisando al usuario si el guión es demasiado grande para caber
 * dentro de esos límites.
 */
export function generateJSX(frames: Frame[], config: StoryboardConfig): string {
  const framesDataJS = frames.map(f => {
    const escapedText = JSON.stringify(f.text);
    const escapedLink = JSON.stringify(f.link);
    return `        { number: ${f.number}, text: ${escapedText}, link: ${escapedLink} }`;
  }).join(',\n');

  return `/**
* Storyboard Builder Script for Adobe Illustrator
* Generado automáticamente por Storyboard Studio
* Proyecto: ${config.projectName || 'Sin título'}
* Autor: ${config.author || 'Desconocido'}
* Fecha: ${config.date || new Date().toISOString().slice(0, 10)}
*/

(function() {
    try {
        app.coordinateSystem = CoordinateSystem.DOCUMENTCOORDINATESYSTEM;
    } catch(e) {}

    if (app.documents.length === 0) {
        var doc = app.documents.add(DocumentColorSpace.RGB, 1920, 1280);
    } else {
        var doc = app.activeDocument;
        var confirmUse = confirm("\\u00BFDeseas crear un nuevo documento para el Storyboard?\\n\\nSelecciona 'S\\u00ED' para crear un nuevo documento limpio de 1920x1280, o 'No' para aplicar los artboards en el documento actual.");
        if (confirmUse) {
            doc = app.documents.add(DocumentColorSpace.RGB, 1920, 1280);
        }
    }

    try {
        doc.rulerOrigin = [0, 0];
    } catch(e) {}

    var frames = [
${framesDataJS}
    ];

    if (frames.length === 0) {
        alert("No hay fotogramas para generar en el storyboard.");
        return;
    }

    // Creación o selección de capas
    function getOrCreateLayer(name) {
        for (var i = 0; i < doc.layers.length; i++) {
            if (doc.layers[i].name === name) return doc.layers[i];
        }
        var l = doc.layers.add();
        l.name = name;
        return l;
    }

    var bgLayer = getOrCreateLayer("Fondo Video");
    var uiLayer = getOrCreateLayer("Información de Escena");

    // Paleta de colores RGB
    var darkColor = new RGBColor();
    darkColor.red = 20; darkColor.green = 20; darkColor.blue = 20;

    var panelBgColor = new RGBColor();
    panelBgColor.red = 245; panelBgColor.green = 247; panelBgColor.blue = 244;

    var textColor = new RGBColor();
    textColor.red = 30; textColor.green = 35; textColor.blue = 30;

    var limeColor = new RGBColor();
    limeColor.red = 204; limeColor.green = 255; limeColor.blue = 0;

    var W = 1920;
    var H = 1280;
    var GAP = 80;

    // --- Límites seguros de lienzo de Illustrator ---
    // Illustrator soporta un lienzo de aprox. ±16383 pt desde el origen,
    // pero dejamos un margen de seguridad en ±8191 pt para evitar el
    // error 1200 (Artboard Out of Canvas) en cualquier condición.
    var SAFE_LIMIT = 8191;
    var maxColsByWidth = Math.max(1, Math.floor((2 * SAFE_LIMIT + GAP) / (W + GAP)));
    var maxRowsByHeight = Math.max(1, Math.floor((2 * SAFE_LIMIT + GAP) / (H + GAP)));

    var columns = 4;
    if (frames.length <= 3) {
        columns = frames.length;
    } else if (frames.length > 20 && frames.length <= 32) {
        columns = 5;
    } else if (frames.length > 32) {
        columns = 6;
    }

    // Nunca exceder el ancho seguro de lienzo
    columns = Math.min(columns, maxColsByWidth);

    // Si con estas columnas las filas exceden el alto seguro, añadir
    // columnas hasta encajar (sin sobrepasar el máximo por ancho)
    var totalRows = Math.ceil(frames.length / columns);
    while (totalRows > maxRowsByHeight && columns < maxColsByWidth) {
        columns++;
        totalRows = Math.ceil(frames.length / columns);
    }

    var canvasWarning = false;
    if (totalRows > maxRowsByHeight) {
        canvasWarning = true;
    }

    var totalCols = Math.min(columns, frames.length);
    totalRows = Math.ceil(frames.length / columns);
    var totalGridWidth = totalCols * W + (totalCols - 1) * GAP;
    var totalGridHeight = totalRows * H + (totalRows - 1) * GAP;

    // Centrado simétrico en origen (0, 0)
    var startX = Math.round(-totalGridWidth / 2);
    var startY = Math.round(totalGridHeight / 2);

    function padZero(n) {
        return (n < 10 ? "0" : "") + n;
    }

    function withinSafeBounds(rect) {
        // rect = [left, top, right, bottom]
        return Math.abs(rect[0]) <= SAFE_LIMIT && Math.abs(rect[1]) <= SAFE_LIMIT &&
               Math.abs(rect[2]) <= SAFE_LIMIT && Math.abs(rect[3]) <= SAFE_LIMIT;
    }

    var skippedFrames = [];

    for (var i = 0; i < frames.length; i++) {
        var frame = frames[i];
        var col = i % columns;
        var row = Math.floor(i / columns);

        var left = Math.round(startX + col * (W + GAP));
        var top = Math.round(startY - row * (H + GAP));
        var right = left + W;
        var bottom = top - H;
        var abRect = [left, top, right, bottom];

        if (!withinSafeBounds(abRect)) {
            skippedFrames.push(frame.number);
            continue;
        }

        var artboard;
        if (i === 0) {
            artboard = doc.artboards[0];
            try {
                artboard.artboardRect = abRect;
            } catch (e) {
                var cur = artboard.artboardRect;
                left = cur[0]; top = cur[1]; right = cur[2]; bottom = cur[3];
                abRect = cur;
            }
        } else {
            try {
                artboard = doc.artboards.add(abRect);
            } catch (e) {
                try {
                    var prevRect = doc.artboards[i - 1].artboardRect;
                    var fallbackRect = [prevRect[2] + GAP, prevRect[1], prevRect[2] + GAP + W, prevRect[3]];
                    if (!withinSafeBounds(fallbackRect)) {
                        skippedFrames.push(frame.number);
                        continue;
                    }
                    artboard = doc.artboards.add(fallbackRect);
                    left = fallbackRect[0]; top = fallbackRect[1]; right = fallbackRect[2]; bottom = fallbackRect[3];
                } catch (fallbackErr) {
                    alert("Aviso: No se pudo añadir el artboard " + (i + 1) + ": " + fallbackErr.message);
                    continue;
                }
            }
        }
        try {
            artboard.name = "Fotograma " + padZero(frame.number);
        } catch (e) {}

        // Fondo oscuro 16:9
        var bgRect = bgLayer.pathItems.rectangle(top, left, W, 1080);
        bgRect.fillColor = darkColor;
        bgRect.stroked = false;

        // Panel de información inferior
        var panelRect = uiLayer.pathItems.rectangle(top - 1080, left, W, 200);
        panelRect.fillColor = panelBgColor;
        panelRect.stroked = false;

        // Badge de número de fotograma
        var badge = uiLayer.pathItems.roundedRectangle(top - 1080 - 25, left + 40, 140, 48, 8, 8);
        badge.fillColor = limeColor;
        badge.stroked = false;

        var badgeText = uiLayer.textFrames.pointText([left + 58, top - 1080 - 58]);
        badgeText.contents = "PLANO " + padZero(frame.number);
        badgeText.textRange.characterAttributes.size = 20;
        badgeText.textRange.characterAttributes.fillColor = darkColor;

        // Texto descriptivo del plano
        var descText = uiLayer.textFrames.pointText([left + 210, top - 1080 - 50]);
        descText.contents = frame.text || "(Sin descripción de plano)";
        descText.textRange.characterAttributes.size = 22;
        descText.textRange.characterAttributes.fillColor = textColor;

        // Enlace de referencia
        if (frame.link && frame.link.length > 0) {
            var linkText = uiLayer.textFrames.pointText([left + 210, top - 1080 - 110]);
            linkText.contents = "Ref: " + frame.link;
            linkText.textRange.characterAttributes.size = 17;
            linkText.textRange.characterAttributes.fillColor = textColor;
        }
    }

    try {
        if (doc.views && doc.views.length > 0) {
            doc.views[0].centerPoint = [0, 0];
            doc.views[0].zoom = 0.25;
        }
    } catch(e) {}

    app.redraw();

    var createdCount = frames.length - skippedFrames.length;
    var message = "\\u00A1Storyboard generado con \\u00E9xito!\\nSe han creado " + createdCount + " mesas de trabajo.";

    if (canvasWarning || skippedFrames.length > 0) {
        message += "\\n\\nAviso: el gui\\u00F3n es muy extenso y algunas mesas de trabajo quedaban fuera del l\\u00EDmite seguro de lienzo de Illustrator (\\u00B1" + SAFE_LIMIT + " pt), por lo que se omitieron para evitar el error 1200 (AOoC).";
        if (skippedFrames.length > 0) {
            message += "\\nFotogramas omitidos: " + skippedFrames.join(", ") + ".";
        }
        message += "\\nSugerencia: divide el gui\\u00F3n en varias exportaciones m\\u00E1s peque\\u00F1as.";
    }

    alert(message);
})();
`;
}
