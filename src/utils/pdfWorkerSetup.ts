import * as pdfjsLib from 'pdfjs-dist';
// Import worker with Vite's ?url for offline bundled support
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure offline worker globally
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;
}

export { pdfjsLib };

export interface PdfDocumentSource {
  url?: string;
  data?: ArrayBuffer | Uint8Array;
  cMapUrl?: string;
  cMapPacked?: boolean;
  standardFontDataUrl?: string;
}

export async function loadPdfDocument(source: string | ArrayBuffer | Uint8Array, password?: string) {
  const loadingTask = pdfjsLib.getDocument({
    ...(typeof source === 'string' ? { url: source } : { data: source }),
    cMapUrl: '/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: '/standard_fonts/',
    password: password || undefined,
  });

  return await loadingTask.promise;
}
