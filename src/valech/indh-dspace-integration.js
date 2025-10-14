// 🌐 INDH DSPACE API INTEGRATION - V2.0 UPGRADE
// Automated PDF download from Chilean National Institute of Human Rights digital library
const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

class INDHDSpaceIngestion {
  constructor() {
    this.baseURL = 'https://bibliotecadigital.indh.cl/server/api';
    this.downloadDir = path.join(__dirname, '../../data/valech-pdfs');
    this.retryAttempts = 3;
    this.retryDelay = 2000;
  }

  /**
   * Search for Valech-related documents in INDH digital library
   * @returns {Promise<Array>} Array of document items
   */
  async searchValechDocuments() {
    console.log('🔍 [INDH] Searching for Valech documents in digital library...');

    try {
      const query = {
        query: 'Valech OR "Comisión Nacional sobre Prisión Política y Tortura" OR "Informe Valech"',
        filters: [
          'dateIssued:[2004 TO 2011]',
          'subject:Derechos Humanos OR subject:Tortura'
        ],
        sort: 'dc.date.issued_dt desc',
        page: 0,
        size: 100
      };

      const response = await this.fetchWithRetry(`${this.baseURL}/discover/search/objects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
      });

      const results = await response.json();
      const items = results._embedded?.searchResult?._embedded?.objects || [];

      console.log(`✅ [INDH] Found ${items.length} Valech documents, desu!`);
      return items;
    } catch (error) {
      console.error('❌ [INDH] Search failed:', error.message);
      throw error;
    }
  }

  /**
   * Download PDF file from INDH for a specific item
   * @param {string} itemId - DSpace item UUID
   * @returns {Promise<Object>} Download result with file path
   */
  async downloadValechPDF(itemId) {
    console.log(`📥 [INDH] Downloading PDF for item: ${itemId}`);

    try {
      // Get item metadata
      const itemResponse = await this.fetchWithRetry(`${this.baseURL}/core/items/${itemId}`);
      const item = await itemResponse.json();

      // Get bitstreams (attached files)
      const bitstreamsResponse = await this.fetchWithRetry(
        `${this.baseURL}/core/items/${itemId}/bitstreams`
      );
      const bitstreamsData = await bitstreamsResponse.json();
      const bitstreams = bitstreamsData._embedded?.bitstreams || [];

      // Find PDF files
      const pdfBitstreams = bitstreams.filter(b =>
        b.name.toLowerCase().endsWith('.pdf') &&
        b.mimeType === 'application/pdf'
      );

      if (pdfBitstreams.length === 0) {
        console.log('⚠️ [INDH] No PDF files found for this item');
        return { success: false, reason: 'NO_PDF_FOUND' };
      }

      // Download each PDF
      const downloads = [];
      for (const bitstream of pdfBitstreams) {
        const downloadResult = await this.downloadBitstream(bitstream, itemId);
        downloads.push(downloadResult);
      }

      console.log(`✅ [INDH] Downloaded ${downloads.length} PDF(s) successfully, nyaa~!`);
      return {
        success: true,
        itemId,
        itemTitle: item.name,
        files: downloads
      };
    } catch (error) {
      console.error(`❌ [INDH] Download failed for item ${itemId}:`, error.message);
      throw error;
    }
  }

  /**
   * Download a specific bitstream (file)
   * @param {Object} bitstream - Bitstream metadata
   * @param {string} itemId - Parent item ID
   * @returns {Promise<Object>} Download result
   */
  async downloadBitstream(bitstream, itemId) {
    console.log(`📄 [INDH] Downloading: ${bitstream.name}`);

    try {
      // Ensure download directory exists
      await fs.mkdir(this.downloadDir, { recursive: true });

      // Download content
      const contentURL = `${this.baseURL}/core/bitstreams/${bitstream.uuid}/content`;
      const response = await this.fetchWithRetry(contentURL);
      const buffer = await response.buffer();

      // Save to file
      const filename = `${itemId}_${bitstream.name}`;
      const filepath = path.join(this.downloadDir, filename);
      await fs.writeFile(filepath, buffer);

      const stats = await fs.stat(filepath);

      console.log(`✅ [INDH] Saved: ${filename} (${this.formatBytes(stats.size)})`);

      return {
        filename,
        filepath,
        size: stats.size,
        bitstreamId: bitstream.uuid,
        checksum: bitstream.checkSum?.value
      };
    } catch (error) {
      console.error(`❌ [INDH] Bitstream download failed:`, error.message);
      throw error;
    }
  }

  /**
   * Fetch with retry logic for network resilience
   * @param {string} url - URL to fetch
   * @param {Object} options - Fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async fetchWithRetry(url, options = {}) {
    let lastError;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        lastError = error;
        console.log(`⚠️ [INDH] Attempt ${attempt}/${this.retryAttempts} failed: ${error.message}`);

        if (attempt < this.retryAttempts) {
          console.log(`⏳ [INDH] Retrying in ${this.retryDelay / 1000}s...`);
          await this.sleep(this.retryDelay);
        }
      }
    }

    throw new Error(`Failed after ${this.retryAttempts} attempts: ${lastError.message}`);
  }

  /**
   * Download all Valech PDFs from INDH
   * @returns {Promise<Object>} Download summary
   */
  async downloadAllValechPDFs() {
    console.log('🚀 [INDH] Starting full Valech PDF download, desu!');

    try {
      // Search for all Valech documents
      const documents = await this.searchValechDocuments();

      const results = {
        total: documents.length,
        successful: 0,
        failed: 0,
        downloads: []
      };

      // Download each document
      for (const doc of documents) {
        const item = doc._embedded?.indexableObject;
        if (!item || !item.uuid) continue;

        try {
          const downloadResult = await this.downloadValechPDF(item.uuid);
          if (downloadResult.success) {
            results.successful++;
            results.downloads.push(downloadResult);
          } else {
            results.failed++;
          }

          // Rate limiting - be nice to the server
          await this.sleep(1000);
        } catch (error) {
          console.error(`❌ [INDH] Failed to download item ${item.uuid}:`, error.message);
          results.failed++;
        }
      }

      console.log(`\n✅ [INDH] Download complete, nyaa~!`);
      console.log(`   Total documents: ${results.total}`);
      console.log(`   Successful: ${results.successful}`);
      console.log(`   Failed: ${results.failed}`);

      return results;
    } catch (error) {
      console.error('❌ [INDH] Full download failed:', error.message);
      throw error;
    }
  }

  /**
   * Get metadata for all Valech documents (without downloading PDFs)
   * @returns {Promise<Array>} Array of document metadata
   */
  async getValechMetadata() {
    console.log('📊 [INDH] Fetching Valech document metadata...');

    const documents = await this.searchValechDocuments();
    const metadata = [];

    for (const doc of documents) {
      const item = doc._embedded?.indexableObject;
      if (!item) continue;

      metadata.push({
        id: item.uuid,
        title: item.name,
        handle: item.handle,
        metadata: item.metadata,
        dateIssued: item.metadata?.['dc.date.issued']?.[0]?.value,
        description: item.metadata?.['dc.description.abstract']?.[0]?.value,
        subjects: item.metadata?.['dc.subject']?.map(s => s.value) || []
      });
    }

    console.log(`✅ [INDH] Retrieved metadata for ${metadata.length} documents, desu!`);
    return metadata;
  }

  // Utility functions
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// Export for use in other modules
module.exports = INDHDSpaceIngestion;

// Command-line execution
if (require.main === module) {
  (async () => {
    console.log('🐾 INDH DSpace Integration - Valech PDF Downloader ✨\n');

    const ingestion = new INDHDSpaceIngestion();

    try {
      // First, get metadata to see what's available
      console.log('📊 Fetching metadata first...\n');
      const metadata = await ingestion.getValechMetadata();

      console.log('\n📋 Available Valech Documents:');
      metadata.slice(0, 5).forEach((doc, i) => {
        console.log(`\n${i + 1}. ${doc.title}`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Date: ${doc.dateIssued || 'N/A'}`);
        console.log(`   Subjects: ${doc.subjects.join(', ') || 'N/A'}`);
      });

      if (metadata.length > 5) {
        console.log(`\n... and ${metadata.length - 5} more documents`);
      }

      // Uncomment to download all PDFs (WARNING: May be many files!)
      // console.log('\n📥 Starting PDF download...\n');
      // const results = await ingestion.downloadAllValechPDFs();
      // console.log('\n✅ Download results:', results);

      console.log('\n💖 INDH integration test complete, nyaa~! ✨');
    } catch (error) {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    }
  })();
}
