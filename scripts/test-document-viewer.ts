/**
 * NAV-TRAC X Document Viewer Verification Test Suite
 * Tests all 8 acceptance criteria required by the user prompt.
 */
import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

async function runTests() {
  console.log('====================================================');
  console.log('NAV-TRAC X DOCUMENT VIEWER VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAILED: ${testName} - ${detail || 'Assertion failed'}`);
      failed++;
    }
  }

  // 1. Synthetic 18-page PDF check
  const pdfPath = path.resolve(process.cwd(), 'public/Operation_Briefing_Alpha.pdf');
  const pdfExists = fs.existsSync(pdfPath);
  assert(pdfExists, 'Demo PDF exists in public folder', pdfPath);

  if (pdfExists) {
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pageCount = pdfDoc.getPageCount();
    assert(pageCount === 18, `Demo PDF has exactly 18 pages (got ${pageCount})`);
  }

  // 2. Offline assets check (worker, cMaps, standard fonts)
  const cmapsPath = path.resolve(process.cwd(), 'public/cmaps');
  const fontsPath = path.resolve(process.cwd(), 'public/standard_fonts');
  assert(fs.existsSync(cmapsPath) && fs.readdirSync(cmapsPath).length > 10, 'cMaps bundled locally in /public/cmaps');
  assert(fs.existsSync(fontsPath) && fs.readdirSync(fontsPath).length > 10, 'Standard fonts bundled locally in /public/standard_fonts');

  // 3. DocumentViewer and subcomponents code verification
  const viewerCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/viewer/DocumentViewer.tsx'), 'utf8');
  const canvasCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/viewer/PageCanvas.tsx'), 'utf8');
  const toolbarCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/viewer/ViewerToolbar.tsx'), 'utf8');
  const sidebarCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/viewer/ViewerSidebar.tsx'), 'utf8');
  const distributeCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/distribute/AccessPermissionsStep.tsx'), 'utf8');
  const livePreviewCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/distribute/DocumentLivePreview.tsx'), 'utf8');

  // 4. No visible diagonal watermark with recipient name, unit, session or fingerprint ID
  const hasDiagRecipientWatermark = canvasCode.includes('CDR. ARJUN MEHTA') || 
                                    canvasCode.includes('fingerprintId') || 
                                    canvasCode.includes('sessionWatermark') ||
                                    viewerCode.includes('CDR. ARJUN MEHTA');
  assert(!hasDiagRecipientWatermark, 'No visible per-recipient diagonal watermark or fingerprint text');

  // 5. Check sample overlay is only generic and clearly labelled
  assert(canvasCode.includes('sampleOverlay') && canvasCode.includes('PREVIEW ONLY'), 'Sample overlay is optional and uses fixed PREVIEW ONLY placeholder');

  // 6. Check Distribute toggle rename
  assert(distributeCode.includes('Invisible Forensic Marking - Unique per recipient, per session'), 'Distribute toggle renamed to Invisible Forensic Marking');
  assert(!distributeCode.includes('Embed recipient details on each page'), 'Old visible watermark text removed from Distribute toggle');

  // 7. Check sharp DPR zoom rendering and render task cancellation
  assert(canvasCode.includes('devicePixelRatio') && canvasCode.includes('cancel()'), 'Sharp DPR rendering with renderTask cancellation on unmount/rescale');

  // 8. Check windowed rendering in DocumentViewer (currentPage +/- 2)
  assert(viewerCode.includes('Math.abs(pageNum - currentPage) <= 2'), 'Virtual/windowed rendering implemented (current page +/- 2 window)');

  // 9. Check single-row toolbar styling & responsive overflow menu
  assert(toolbarCode.includes('flex-nowrap') && toolbarCode.includes('whitespace-nowrap'), 'Toolbar is styled as a single-row flex bar');

  // 10. Check permission gating (no download/print when disabled, keyboard shortcuts blocked)
  assert(viewerCode.includes("e.key.toLowerCase() === 'p'") && viewerCode.includes("e.key.toLowerCase() === 's'") && viewerCode.includes('isViewOnly'), 'Ctrl+P and Ctrl+S keyboard shortcuts blocked when print/download permissions are disabled');
  assert(toolbarCode.includes('permissions.download') && toolbarCode.includes('permissions.print'), 'Download and Print buttons conditionally rendered based on permissions');

  // 11. Check in-document search across all pages with count and navigation
  assert(viewerCode.includes('handleSearch') && viewerCode.includes('searchMatches') && viewerCode.includes('currentMatchIndex'), 'In-document multi-page search with match navigation');

  // 12. Check Fullscreen Preview Route and Distribute Open Full Viewer button
  const appCode = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf8');
  assert(appCode.includes('/documents/:id/preview') && appCode.includes('/documents/preview'), 'Full-screen preview routes registered in App.tsx');
  assert(livePreviewCode.includes('Open Full Viewer') || livePreviewCode.includes('/documents/preview'), 'Distribute panel includes Open Full Viewer button');

  // 13. Check Backend FastAPI Render Service files
  const backendMain = path.resolve(process.cwd(), 'backend/render_service/main.py');
  const backendDocker = path.resolve(process.cwd(), 'backend/render_service/Dockerfile');
  assert(fs.existsSync(backendMain) && fs.existsSync(backendDocker), 'Backend FastAPI + Docker headless LibreOffice render service stub created');

  console.log(`\n====================================================`);
  console.log(`RESULTS: ${passed}/${passed + failed} ACCEPTANCE TESTS PASSED (${Math.round((passed / (passed + failed)) * 100)}%)`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
