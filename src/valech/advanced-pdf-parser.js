// 📄 ADVANCED PDF PARSER WITH OCR - V2.0 UPGRADE
// Extracts text from PDFs with intelligent fallback to OCR for scanned documents
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const { createCanvas } = require('canvas');
const fs = require('fs').promises;

class AdvancedPDFParser {
  constructor(options = {}) {
    this.ocrLanguages = options.ocrLanguages || ['spa', 'eng']; // Spanish + English
    this.confidenceThreshold = options.confidenceThreshold || 90;
    this.useOCRFallback = options.useOCRFallback !== false;
    this.debug = options.debug || false;
  }

  /**
   * Parse PDF with intelligent extraction method selection
   * @param {Buffer|string} pdfSource - PDF buffer or file path
   * @param {Object} options - Parsing options
   * @returns {Promise<Object>} Parsed text and metadata
   */
  async parsePDF(pdfSource, options = {}) {
    console.log('📄 [PDF Parser] Starting PDF analysis...');

    let pdfBuffer;
    if (typeof pdfSource === 'string') {
      pdfBuffer = await fs.readFile(pdfSource);
    } else {
      pdfBuffer = pdfSource;
    }

    try {
      // Phase 1: Try direct text extraction first (fast!)
      const directResult = await this.tryDirectExtraction(pdfBuffer);

      if (directResult.confidence >= this.confidenceThreshold) {
        console.log(`✅ [PDF Parser] Direct extraction successful (${directResult.confidence}% confidence)`);
        return {
          text: directResult.text,
          method: 'DIRECT_EXTRACTION',
          confidence: directResult.confidence,
          pages: directResult.pages,
          metadata: directResult.metadata
        };
      }

      // Phase 2: Fallback to OCR if direct extraction is poor quality
      if (this.useOCRFallback) {
        console.log(`⚠️ [PDF Parser] Direct extraction low quality (${directResult.confidence}%), using OCR...`);
        const ocrResult = await this.performOCR(pdfBuffer, this.ocrLanguages);

        return {
          text: ocrResult.text,
          method: 'OCR',
          confidence: ocrResult.confidence,
          pages: ocrResult.pages,
          metadata: directResult.metadata,
          ocrDetails: ocrResult.details
        };
      }

      // If OCR disabled, return direct extraction anyway
      console.log('⚠️ [PDF Parser] OCR disabled, returning direct extraction');
      return {
        text: directResult.text,
        method: 'DIRECT_EXTRACTION_FORCED',
        confidence: directResult.confidence,
        pages: directResult.pages,
        metadata: directResult.metadata
      };
    } catch (error) {
      console.error('❌ [PDF Parser] Parsing failed:', error.message);
      throw error;
    }
  }

  /**
   * Direct text extraction using pdf-parse
   * @param {Buffer} pdfBuffer - PDF file buffer
   * @returns {Promise<Object>} Extraction result with confidence score
   */
  async tryDirectExtraction(pdfBuffer) {
    console.log('🔍 [PDF Parser] Attempting direct text extraction...');

    try {
      const data = await pdfParse(pdfBuffer, {
        max: 0, // Parse all pages
        version: 'v2.0.550'
      });

      // Calculate confidence based on text quality indicators
      const confidence = this.assessTextQuality(data.text);

      return {
        text: data.text,
        confidence,
        pages: data.numpages,
        metadata: {
          info: data.info,
          pages: data.numpages,
          version: data.version
        }
      };
    } catch (error) {
      console.error('❌ [PDF Parser] Direct extraction failed:', error.message);
      return {
        text: '',
        confidence: 0,
        pages: 0,
        metadata: {}
      };
    }
  }

  /**
   * Perform OCR on PDF pages using Tesseract.js
   * @param {Buffer} pdfBuffer - PDF file buffer
   * @param {string|Array<string>} languages - OCR languages (e.g., 'spa', 'eng')
   * @returns {Promise<Object>} OCR result
   */
  async performOCR(pdfBuffer, languages = 'spa') {
    console.log(`🔍 [PDF Parser] Starting OCR with languages: ${Array.isArray(languages) ? languages.join('+') : languages}`);

    const langString = Array.isArray(languages) ? languages.join('+') : languages;

    try {
      // Load PDF with pdfjs
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(pdfBuffer),
        verbosity: 0
      });
      const pdfDoc = await loadingTask.promise;

      const numPages = pdfDoc.numPages;
      console.log(`📖 [PDF Parser] PDF has ${numPages} pages`);

      let fullText = '';
      const pageResults = [];
      let totalConfidence = 0;

      // Process each page
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        console.log(`📄 [PDF Parser] Processing page ${pageNum}/${numPages}...`);

        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale = better quality

        // Render page to canvas
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        // Convert canvas to image buffer
        const imageBuffer = canvas.toBuffer('image/png');

        // Perform OCR on page
        const { data } = await Tesseract.recognize(imageBuffer, langString, {
          logger: this.debug ? m => console.log(`   [Tesseract] ${m.status}: ${Math.round(m.progress * 100)}%`) : undefined
        });

        const pageText = data.text;
        const pageConfidence = data.confidence;

        fullText += pageText + '\n\n';
        pageResults.push({
          page: pageNum,
          text: pageText,
          confidence: pageConfidence,
          words: data.words.length
        });
        totalConfidence += pageConfidence;

        console.log(`✅ [PDF Parser] Page ${pageNum} complete (confidence: ${Math.round(pageConfidence)}%, ${data.words.length} words)`);
      }

      const avgConfidence = totalConfidence / numPages;

      console.log(`✅ [PDF Parser] OCR complete! Average confidence: ${Math.round(avgConfidence)}%, desu!`);

      return {
        text: fullText.trim(),
        confidence: Math.round(avgConfidence),
        pages: numPages,
        details: {
          pageResults,
          totalWords: pageResults.reduce((sum, p) => sum + p.words, 0),
          avgConfidencePerPage: avgConfidence
        }
      };
    } catch (error) {
      console.error('❌ [PDF Parser] OCR failed:', error.message);
      throw error;
    }
  }

  /**
   * Assess quality of extracted text to determine if OCR is needed
   * @param {string} text - Extracted text
   * @returns {number} Confidence score (0-100)
   */
  assessTextQuality(text) {
    if (!text || text.trim().length === 0) return 0;

    let score = 100;

    // Check for common OCR/extraction problems
    const wordCount = text.split(/\s+/).length;
    const charCount = text.length;

    // Too short = likely failed extraction
    if (charCount < 100) {
      score -= 50;
    } else if (charCount < 500) {
      score -= 20;
    }

    // Calculate gibberish ratio (non-letter characters)
    const letters = text.match(/[a-záéíóúñ]/gi) || [];
    const letterRatio = letters.length / charCount;

    if (letterRatio < 0.6) {
      score -= 30; // Lots of garbage characters
    }

    // Check for repeated gibberish patterns
    const gibberishPattern = /[^\s]{50,}/; // Very long words = likely corrupted
    if (gibberishPattern.test(text)) {
      score -= 20;
    }

    // Check average word length (Spanish avg ~5-6 chars)
    const avgWordLength = charCount / wordCount;
    if (avgWordLength < 2 || avgWordLength > 15) {
      score -= 15; // Unusual word length = corruption
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Parse multiple PDFs in batch
   * @param {Array<string>} pdfPaths - Array of PDF file paths
   * @param {Object} options - Parsing options
   * @returns {Promise<Array<Object>>} Array of parsing results
   */
  async parseBatch(pdfPaths, options = {}) {
    console.log(`📚 [PDF Parser] Starting batch processing of ${pdfPaths.length} PDFs...`);

    const results = [];

    for (let i = 0; i < pdfPaths.length; i++) {
      const pdfPath = pdfPaths[i];
      console.log(`\n📄 [PDF Parser] Processing ${i + 1}/${pdfPaths.length}: ${pdfPath}`);

      try {
        const result = await this.parsePDF(pdfPath, options);
        results.push({
          success: true,
          path: pdfPath,
          ...result
        });
      } catch (error) {
        console.error(`❌ [PDF Parser] Failed to parse ${pdfPath}:`, error.message);
        results.push({
          success: false,
          path: pdfPath,
          error: error.message
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    console.log(`\n✅ [PDF Parser] Batch complete: ${successful}/${pdfPaths.length} successful, nyaa~!`);

    return results;
  }

  /**
   * Extract text from specific pages only
   * @param {Buffer|string} pdfSource - PDF buffer or file path
   * @param {Array<number>} pageNumbers - Array of page numbers to extract
   * @returns {Promise<Object>} Extracted text from specified pages
   */
  async extractPages(pdfSource, pageNumbers) {
    console.log(`📄 [PDF Parser] Extracting specific pages: ${pageNumbers.join(', ')}`);

    let pdfBuffer;
    if (typeof pdfSource === 'string') {
      pdfBuffer = await fs.readFile(pdfSource);
    } else {
      pdfBuffer = pdfSource;
    }

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      verbosity: 0
    });
    const pdfDoc = await loadingTask.promise;

    const pageTexts = {};

    for (const pageNum of pageNumbers) {
      if (pageNum < 1 || pageNum > pdfDoc.numPages) {
        console.warn(`⚠️ [PDF Parser] Page ${pageNum} out of range (1-${pdfDoc.numPages})`);
        continue;
      }

      const page = await pdfDoc.getPage(pageNum);
      const content = await page.getTextContent();
      const text = content.items.map(item => item.str).join(' ');

      pageTexts[pageNum] = text;
    }

    console.log(`✅ [PDF Parser] Extracted ${Object.keys(pageTexts).length} pages, desu!`);
    return pageTexts;
  }
}

module.exports = AdvancedPDFParser;

// Command-line execution for testing
if (require.main === module) {
  (async () => {
    console.log('🐾 Advanced PDF Parser - Test Mode ✨\n');

    const parser = new AdvancedPDFParser({
      ocrLanguages: ['spa', 'eng'],
      confidenceThreshold: 90,
      useOCRFallback: true,
      debug: false
    });

    // Test with a sample PDF (update path to test)
    const testPDF = process.argv[2];

    if (!testPDF) {
      console.log('Usage: node advanced-pdf-parser.js <path-to-pdf>');
      console.log('\nExample:');
      console.log('  node advanced-pdf-parser.js ./data/valech-pdfs/sample.pdf');
      console.log('\n💖 No PDF provided - showing module info only, nyaa~!');
      process.exit(0);
    }

    try {
      const result = await parser.parsePDF(testPDF);

      console.log('\n📊 Parsing Results:');
      console.log(`   Method: ${result.method}`);
      console.log(`   Confidence: ${result.confidence}%`);
      console.log(`   Pages: ${result.pages}`);
      console.log(`   Text length: ${result.text.length} characters`);
      console.log(`\n📝 First 500 characters:\n`);
      console.log(result.text.substring(0, 500));
      console.log('...\n');

      console.log('✅ PDF parsing test complete, desu! 💖');
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  })();
}
