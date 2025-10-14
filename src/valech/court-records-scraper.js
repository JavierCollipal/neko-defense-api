// ⚖️ COURT RECORDS SCRAPER - V2.0 UPGRADE
// Real-time monitoring of Chilean judiciary for DINA-related cases
const axios = require('axios');
const cheerio = require('cheerio');
const { MongoClient } = require('mongodb');

class CourtRecordsScraper {
  constructor(options = {}) {
    this.baseURL = 'https://www.pjud.cl';
    this.jurisprudenceDB = 'http://basejurisprudencial.poderjudicial.cl';
    this.mongoUri = options.mongoUri || 'mongodb+srv://pinochito1747:pinochito1747@free-cluster.svjei3w.mongodb.net/';
    this.dbName = options.dbName || 'neko-defense-system';
    this.checkInterval = options.checkInterval || 24 * 60 * 60 * 1000; // 24 hours
    this.debug = options.debug || false;
  }

  /**
   * Search for DINA-related cases in judiciary database
   * @returns {Promise<Array>} Array of case results
   */
  async searchDINACases() {
    console.log('🔍 [Court Scraper] Searching for DINA-related cases...');

    const keywords = [
      'DINA',
      'Manuel Contreras',
      'Miguel Krassnoff',
      'Osvaldo Romo',
      'Ingrid Olderöck',
      'crímenes de lesa humanidad',
      'tortura',
      'desaparición forzada',
      'Dirección de Inteligencia Nacional'
    ];

    const cases = [];

    try {
      for (const keyword of keywords) {
        console.log(`   Searching for "${keyword}"...`);

        // Note: This is a simplified example
        // Real implementation would need to handle the actual judiciary website structure
        const searchResults = await this.performSearch(keyword);
        cases.push(...searchResults);

        // Rate limiting - be respectful to the server
        await this.sleep(2000);
      }

      // Deduplicate by case ID
      const unique = this.deduplicateCases(cases);

      console.log(`✅ [Court Scraper] Found ${unique.length} unique cases, desu!`);
      return unique;
    } catch (error) {
      console.error('❌ [Court Scraper] Search failed:', error.message);
      throw error;
    }
  }

  /**
   * Perform search query (placeholder - actual implementation depends on website structure)
   * @param {string} keyword - Search keyword
   * @returns {Promise<Array>} Search results
   */
  async performSearch(keyword) {
    // IMPORTANT: This is a simplified placeholder
    // Real implementation would require:
    // 1. Analyzing the actual website structure
    // 2. Handling pagination
    // 3. Extracting case metadata
    // 4. Potentially using Puppeteer for JavaScript-rendered content

    console.log(`   ⚠️ [Court Scraper] Note: This is a placeholder implementation`);
    console.log(`      Real scraping requires analyzing actual judiciary website`);

    // Return empty array for now - implement once we analyze the real site
    return [];
  }

  /**
   * Get details for a specific case
   * @param {string} caseId - Case identifier
   * @returns {Promise<Object>} Case details
   */
  async getCaseDetails(caseId) {
    console.log(`📄 [Court Scraper] Fetching details for case: ${caseId}`);

    try {
      // Placeholder - would fetch actual case details from judiciary site
      const caseDetails = {
        caseId,
        fetchedAt: new Date(),
        // ... actual case data would go here
      };

      return caseDetails;
    } catch (error) {
      console.error(`❌ [Court Scraper] Failed to fetch case ${caseId}:`, error.message);
      throw error;
    }
  }

  /**
   * Monitor for new DINA sentences/developments
   * @returns {Promise<Array>} New developments since last check
   */
  async monitorNewSentences() {
    console.log('🔍 [Court Scraper] Checking for new DINA sentences...');

    try {
      // Get last monitoring date from MongoDB
      const lastCheck = await this.getLastMonitoringDate();
      console.log(`   Last check: ${lastCheck.toISOString()}`);

      // Search for cases updated since last check
      const newCases = await this.searchCasesSince(lastCheck);

      if (newCases.length > 0) {
        console.log(`🚨 [Court Scraper] Found ${newCases.length} new developments!`);

        // Save to MongoDB
        await this.saveNewDevelopments(newCases);

        // Update last monitoring date
        await this.updateLastMonitoringDate();
      } else {
        console.log('   No new developments found');
      }

      return newCases;
    } catch (error) {
      console.error('❌ [Court Scraper] Monitoring failed:', error.message);
      throw error;
    }
  }

  /**
   * Search for cases updated since a specific date
   * @param {Date} sinceDate - Date to search from
   * @returns {Promise<Array>} Updated cases
   */
  async searchCasesSince(sinceDate) {
    console.log(`🔍 [Court Scraper] Searching for cases since ${sinceDate.toISOString()}`);

    // Placeholder - would implement date-filtered search
    // This requires understanding the judiciary website's search functionality
    return [];
  }

  /**
   * Deduplicate cases by ID
   * @param {Array} cases - Array of case objects
   * @returns {Array} Deduplicated cases
   */
  deduplicateCases(cases) {
    const seen = new Set();
    const unique = [];

    for (const caseObj of cases) {
      const id = caseObj.caseId || caseObj.id;
      if (!seen.has(id)) {
        unique.push(caseObj);
        seen.add(id);
      }
    }

    return unique;
  }

  /**
   * Get last monitoring date from MongoDB
   * @returns {Promise<Date>} Last monitoring date
   */
  async getLastMonitoringDate() {
    const client = new MongoClient(this.mongoUri);

    try {
      await client.connect();
      const db = client.db(this.dbName);
      const collection = db.collection('court_monitoring_metadata');

      const metadata = await collection.findOne({ _id: 'last_monitoring' });

      if (metadata && metadata.lastCheck) {
        return new Date(metadata.lastCheck);
      }

      // Default to 30 days ago if never checked
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return thirtyDaysAgo;
    } finally {
      await client.close();
    }
  }

  /**
   * Update last monitoring date in MongoDB
   * @returns {Promise<void>}
   */
  async updateLastMonitoringDate() {
    const client = new MongoClient(this.mongoUri);

    try {
      await client.connect();
      const db = client.db(this.dbName);
      const collection = db.collection('court_monitoring_metadata');

      await collection.updateOne(
        { _id: 'last_monitoring' },
        {
          $set: {
            lastCheck: new Date(),
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );

      console.log('✅ [Court Scraper] Updated last monitoring date');
    } finally {
      await client.close();
    }
  }

  /**
   * Save new court developments to MongoDB
   * @param {Array} developments - Array of new developments
   * @returns {Promise<void>}
   */
  async saveNewDevelopments(developments) {
    if (developments.length === 0) return;

    console.log(`💾 [Court Scraper] Saving ${developments.length} new developments...`);

    const client = new MongoClient(this.mongoUri);

    try {
      await client.connect();
      const db = client.db(this.dbName);
      const collection = db.collection('court_developments');

      // Add metadata
      const enriched = developments.map(dev => ({
        ...dev,
        discoveredAt: new Date(),
        source: 'COURT_SCRAPER_V2',
        processed: false
      }));

      const result = await collection.insertMany(enriched);

      console.log(`✅ [Court Scraper] Saved ${result.insertedCount} developments, desu!`);

      // Trigger alert for important cases
      await this.triggerAlertsForImportantCases(enriched);
    } finally {
      await client.close();
    }
  }

  /**
   * Trigger alerts for important case developments
   * @param {Array} cases - Array of case objects
   * @returns {Promise<void>}
   */
  async triggerAlertsForImportantCases(cases) {
    console.log('🚨 [Court Scraper] Checking for important case developments...');

    const importantKeywords = [
      'condenado',      // convicted
      'sentencia',      // sentence
      'cadena perpetua', // life sentence
      'años de prisión', // years in prison
      'nueva evidencia', // new evidence
      'apelación',      // appeal
      'absolución'      // acquittal
    ];

    for (const caseObj of cases) {
      const text = (caseObj.summary || caseObj.description || '').toLowerCase();

      for (const keyword of importantKeywords) {
        if (text.includes(keyword)) {
          console.log(`🚨 ALERT: Important development in case ${caseObj.caseId}: "${keyword}"`);

          // Save alert to MongoDB
          await this.saveAlert({
            caseId: caseObj.caseId,
            alertType: 'IMPORTANT_DEVELOPMENT',
            keyword,
            timestamp: new Date(),
            caseData: caseObj
          });
        }
      }
    }
  }

  /**
   * Save alert to MongoDB
   * @param {Object} alert - Alert object
   * @returns {Promise<void>}
   */
  async saveAlert(alert) {
    const client = new MongoClient(this.mongoUri);

    try {
      await client.connect();
      const db = client.db(this.dbName);
      const collection = db.collection('court_alerts');

      await collection.insertOne(alert);

      if (this.debug) {
        console.log(`   📢 Alert saved: ${alert.alertType} for case ${alert.caseId}`);
      }
    } finally {
      await client.close();
    }
  }

  /**
   * Get statistics on monitored cases
   * @returns {Promise<Object>} Statistics
   */
  async getMonitoringStats() {
    const client = new MongoClient(this.mongoUri);

    try {
      await client.connect();
      const db = client.db(this.dbName);

      const totalCases = await db.collection('court_developments').countDocuments();
      const totalAlerts = await db.collection('court_alerts').countDocuments();
      const lastCheck = await this.getLastMonitoringDate();

      const stats = {
        totalCasesMonitored: totalCases,
        totalAlerts,
        lastMonitoringCheck: lastCheck,
        nextCheckScheduled: new Date(lastCheck.getTime() + this.checkInterval)
      };

      console.log('📊 [Court Scraper] Monitoring Statistics:');
      console.log(`   Total cases monitored: ${stats.totalCasesMonitored}`);
      console.log(`   Total alerts: ${stats.totalAlerts}`);
      console.log(`   Last check: ${stats.lastMonitoringCheck.toISOString()}`);

      return stats;
    } finally {
      await client.close();
    }
  }

  /**
   * Update perpetrator record with new court information
   * @param {string} perpetratorName - Perpetrator full name
   * @param {Object} courtInfo - Court information to add
   * @returns {Promise<void>}
   */
  async updatePerpetratorCourtRecord(perpetratorName, courtInfo) {
    console.log(`📝 [Court Scraper] Updating court record for ${perpetratorName}`);

    const client = new MongoClient(this.mongoUri);

    try {
      await client.connect();
      const db = client.db(this.dbName);
      const collection = db.collection('dina_agents_comprehensive');

      const result = await collection.updateOne(
        { fullName: perpetratorName },
        {
          $push: {
            'legalStatus.courtDevelopments': {
              ...courtInfo,
              addedAt: new Date(),
              source: 'COURT_SCRAPER_V2'
            }
          },
          $set: {
            'legalStatus.lastUpdated': new Date()
          }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`✅ [Court Scraper] Updated ${perpetratorName} court record`);
      } else {
        console.log(`⚠️ [Court Scraper] Perpetrator ${perpetratorName} not found in database`);
      }
    } finally {
      await client.close();
    }
  }

  // Utility function
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Start continuous monitoring daemon
   * @returns {Promise<void>}
   */
  async startMonitoringDaemon() {
    console.log('🚀 [Court Scraper] Starting continuous monitoring daemon...');
    console.log(`   Check interval: ${this.checkInterval / 1000 / 60 / 60} hours`);

    while (true) {
      try {
        await this.monitorNewSentences();
      } catch (error) {
        console.error('❌ [Court Scraper] Monitoring cycle failed:', error.message);
      }

      console.log(`⏳ [Court Scraper] Sleeping for ${this.checkInterval / 1000 / 60 / 60} hours until next check...`);
      await this.sleep(this.checkInterval);
    }
  }
}

module.exports = CourtRecordsScraper;

// Command-line execution
if (require.main === module) {
  (async () => {
    console.log('🐾 Court Records Scraper - V2.0 Upgrade ✨\n');

    const scraper = new CourtRecordsScraper({
      checkInterval: 24 * 60 * 60 * 1000, // 24 hours
      debug: true
    });

    const command = process.argv[2] || 'stats';

    try {
      if (command === 'search') {
        console.log('🔍 Searching for DINA cases...\n');
        const cases = await scraper.searchDINACases();
        console.log(`\nFound ${cases.length} cases`);
      } else if (command === 'monitor') {
        console.log('🔍 Monitoring for new developments...\n');
        const newCases = await scraper.monitorNewSentences();
        console.log(`\nFound ${newCases.length} new developments`);
      } else if (command === 'daemon') {
        console.log('🚀 Starting monitoring daemon...\n');
        await scraper.startMonitoringDaemon();
      } else if (command === 'stats') {
        console.log('📊 Fetching monitoring statistics...\n');
        await scraper.getMonitoringStats();
      } else {
        console.log('Usage: node court-records-scraper.js [search|monitor|daemon|stats]');
        console.log('\nCommands:');
        console.log('  search  - Search for DINA-related cases');
        console.log('  monitor - Check for new developments');
        console.log('  daemon  - Start continuous monitoring');
        console.log('  stats   - Show monitoring statistics');
      }

      console.log('\n💖 Court scraper operation complete, nyaa~! ✨');
    } catch (error) {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    }
  })();
}
