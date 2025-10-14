// 🤖 ML CROSS-REFERENCE ENGINE - V2.0 UPGRADE
// Automated victim-perpetrator linking using fuzzy string matching and ML
const stringSimilarity = require('string-similarity');
const FuzzySet = require('fuzzyset');
const natural = require('natural');
const { MongoClient } = require('mongodb');

class MLCrossReferenceEngine {
  constructor(options = {}) {
    this.confidenceThreshold = options.confidenceThreshold || 0.75;
    this.debug = options.debug || false;
    this.mongoUri = options.mongoUri || 'mongodb+srv://pinochito1747:pinochito1747@free-cluster.svjei3w.mongodb.net/';
    this.dbName = options.dbName || 'neko-defense-system';
  }

  /**
   * Automatically link victims to perpetrators based on testimony text
   * @param {Array<Object>} victims - Array of victim documents
   * @param {Array<Object>} perpetrators - Array of perpetrator documents
   * @returns {Promise<Array<Object>>} Array of cross-reference links
   */
  async autoLinkVictimsToPerpetrators(victims, perpetrators) {
    console.log(`🤖 [ML CrossRef] Auto-linking ${victims.length} victims to ${perpetrators.length} perpetrators...`);

    const links = [];

    for (const victim of victims) {
      if (!victim.testimonyText || victim.testimonyText.trim().length === 0) {
        if (this.debug) console.log(`⚠️ [ML CrossRef] Victim ${victim.fullName} has no testimony text, skipping`);
        continue;
      }

      console.log(`🔍 [ML CrossRef] Analyzing testimony of ${victim.fullName}...`);

      // Extract perpetrator mentions from testimony
      const mentionedNames = this.extractPerpetratorMentions(victim.testimonyText);

      if (this.debug) {
        console.log(`   Found ${mentionedNames.length} potential perpetrator mentions:`);
        mentionedNames.forEach(m => console.log(`     - "${m.name}" (${m.source})`));
      }

      // Match each mention to actual perpetrators
      for (const mention of mentionedNames) {
        const matches = this.fuzzyMatchPerpetrator(mention.name, perpetrators);

        for (const match of matches) {
          if (match.confidence >= this.confidenceThreshold) {
            links.push({
              victimId: victim._id || victim.id,
              victimName: victim.fullName,
              perpetratorId: match.perpetrator._id || match.perpetrator.id,
              perpetratorName: match.perpetrator.fullName,
              mentionedAs: mention.name,
              matchConfidence: match.confidence,
              matchMethod: match.method,
              relationshipType: this.determineRelationshipType(mention, match),
              evidenceContext: this.extractContext(victim.testimonyText, mention.position, 200),
              metadata: {
                createdAt: new Date(),
                createdBy: 'ML_CROSS_REFERENCE_ENGINE_V2',
                source: mention.source
              }
            });

            console.log(`   ✅ Linked to ${match.perpetrator.fullName} (${Math.round(match.confidence * 100)}% confidence)`);
          }
        }
      }
    }

    console.log(`✅ [ML CrossRef] Generated ${links.length} cross-reference links, desu!`);
    return links;
  }

  /**
   * Extract perpetrator name mentions from testimony text
   * @param {string} testimonyText - Victim testimony text
   * @returns {Array<Object>} Extracted name mentions
   */
  extractPerpetratorMentions(testimonyText) {
    const mentions = [];

    // Pattern 1: Military ranks + names (high confidence)
    const ranks = [
      'Capitán', 'Comandante', 'Teniente', 'Coronel', 'General',
      'Sargento', 'Mayor', 'Suboficial', 'Oficial', 'Brigadier'
    ];

    const rankPattern = new RegExp(
      `(${ranks.join('|')})\\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)`,
      'g'
    );

    let match;
    while ((match = rankPattern.exec(testimonyText)) !== null) {
      mentions.push({
        name: match[2], // Just the name without rank
        fullMention: match[0],
        rank: match[1],
        source: 'MILITARY_RANK_PATTERN',
        position: match.index,
        confidence: 0.95
      });
    }

    // Pattern 2: "Nicknamed" perpetrators (e.g., "el Guatón Romo")
    const nicknamePattern = /(?:el|la)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/g;
    while ((match = nicknamePattern.exec(testimonyText)) !== null) {
      mentions.push({
        name: `${match[1]} ${match[2]}`, // Nickname + Lastname
        fullMention: match[0],
        source: 'NICKNAME_PATTERN',
        position: match.index,
        confidence: 0.90
      });
    }

    // Pattern 3: Capitalized full names (medium confidence)
    const fullNamePattern = /\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)\b/g;
    while ((match = fullNamePattern.exec(testimonyText)) !== null) {
      // Skip if already captured by rank pattern
      const alreadyCaptured = mentions.some(m => m.position === match.index);
      if (!alreadyCaptured) {
        mentions.push({
          name: match[0],
          fullMention: match[0],
          source: 'CAPITALIZED_NAME_PATTERN',
          position: match.index,
          confidence: 0.70
        });
      }
    }

    // Pattern 4: Explicit perpetrator references
    const explicitPattern = /(?:perpetrador|torturador|agente|interrogador|responsable)\s+(?:fue|era)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/gi;
    while ((match = explicitPattern.exec(testimonyText)) !== null) {
      mentions.push({
        name: match[1],
        fullMention: match[0],
        source: 'EXPLICIT_PERPETRATOR_REFERENCE',
        position: match.index,
        confidence: 0.98
      });
    }

    return mentions;
  }

  /**
   * Fuzzy match a mentioned name to actual perpetrator database
   * @param {string} mentionedName - Name mentioned in testimony
   * @param {Array<Object>} perpetrators - Array of perpetrator documents
   * @returns {Array<Object>} Matched perpetrators with confidence scores
   */
  fuzzyMatchPerpetrator(mentionedName, perpetrators) {
    const matches = [];

    for (const perp of perpetrators) {
      const confidence = this.calculateMatchConfidence(mentionedName, perp);

      if (confidence > 0) {
        matches.push({
          perpetrator: perp,
          confidence,
          method: confidence >= 0.95 ? 'EXACT_MATCH' :
                  confidence >= 0.85 ? 'HIGH_SIMILARITY' :
                  confidence >= 0.75 ? 'FUZZY_MATCH' : 'LOW_SIMILARITY'
        });
      }
    }

    // Sort by confidence descending
    matches.sort((a, b) => b.confidence - a.confidence);

    return matches;
  }

  /**
   * Calculate match confidence between mentioned name and perpetrator
   * @param {string} mentionedName - Name from testimony
   * @param {Object} perpetrator - Perpetrator document
   * @returns {number} Confidence score (0-1)
   */
  calculateMatchConfidence(mentionedName, perpetrator) {
    const perpFullName = perpetrator.fullName || '';
    const perpAliases = perpetrator.aliases || [];
    const perpNicknames = perpetrator.knownAs || [];

    let maxConfidence = 0;

    // 1. Exact match on full name
    if (this.normalize(mentionedName) === this.normalize(perpFullName)) {
      return 1.0;
    }

    // 2. Exact match on aliases
    for (const alias of perpAliases) {
      if (this.normalize(mentionedName) === this.normalize(alias)) {
        return 0.98;
      }
    }

    // 3. Exact match on nicknames
    for (const nickname of perpNicknames) {
      if (this.normalize(mentionedName) === this.normalize(nickname)) {
        return 0.95;
      }
    }

    // 4. Fuzzy string similarity on full name
    const fullNameSimilarity = stringSimilarity.compareTwoStrings(
      this.normalize(mentionedName),
      this.normalize(perpFullName)
    );
    maxConfidence = Math.max(maxConfidence, fullNameSimilarity);

    // 5. Last name matching (common in Spanish culture)
    const lastNameSimilarity = this.compareLastNames(mentionedName, perpFullName);
    maxConfidence = Math.max(maxConfidence, lastNameSimilarity * 0.85); // Weight slightly lower

    // 6. Levenshtein distance (edit distance)
    const levenshteinSim = this.levenshteinSimilarity(
      this.normalize(mentionedName),
      this.normalize(perpFullName)
    );
    maxConfidence = Math.max(maxConfidence, levenshteinSim);

    // 7. Token overlap (word-by-word matching)
    const tokenSim = this.tokenOverlapSimilarity(mentionedName, perpFullName);
    maxConfidence = Math.max(maxConfidence, tokenSim);

    return maxConfidence;
  }

  /**
   * Compare last names (important in Spanish naming conventions)
   * @param {string} name1 - First name
   * @param {string} name2 - Second name
   * @returns {number} Similarity score (0-1)
   */
  compareLastNames(name1, name2) {
    const tokens1 = this.normalize(name1).split(/\s+/);
    const tokens2 = this.normalize(name2).split(/\s+/);

    // Last name is typically the second-to-last token in Spanish names
    const lastName1 = tokens1.length >= 2 ? tokens1[tokens1.length - 2] : tokens1[tokens1.length - 1];
    const lastName2 = tokens2.length >= 2 ? tokens2[tokens2.length - 2] : tokens2[tokens2.length - 1];

    return stringSimilarity.compareTwoStrings(lastName1, lastName2);
  }

  /**
   * Levenshtein distance similarity
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity score (0-1)
   */
  levenshteinSimilarity(str1, str2) {
    const distance = natural.LevenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - (distance / maxLength);
  }

  /**
   * Token overlap similarity (word-by-word matching)
   * @param {string} name1 - First name
   * @param {string} name2 - Second name
   * @returns {number} Similarity score (0-1)
   */
  tokenOverlapSimilarity(name1, name2) {
    const tokens1 = new Set(this.normalize(name1).split(/\s+/));
    const tokens2 = new Set(this.normalize(name2).split(/\s+/));

    const intersection = new Set([...tokens1].filter(t => tokens2.has(t)));
    const union = new Set([...tokens1, ...tokens2]);

    return intersection.size / union.size;
  }

  /**
   * Normalize name for comparison (lowercase, remove accents, trim)
   * @param {string} name - Name to normalize
   * @returns {string} Normalized name
   */
  normalize(name) {
    return name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
      .trim();
  }

  /**
   * Determine relationship type based on mention context
   * @param {Object} mention - Mention object
   * @param {Object} match - Match object
   * @returns {string} Relationship type
   */
  determineRelationshipType(mention, match) {
    if (mention.source === 'EXPLICIT_PERPETRATOR_REFERENCE') {
      return 'VICTIM_EXPLICITLY_NAMED_PERPETRATOR';
    } else if (mention.source === 'MILITARY_RANK_PATTERN') {
      return 'VICTIM_NAMED_MILITARY_PERPETRATOR';
    } else if (mention.source === 'NICKNAME_PATTERN') {
      return 'VICTIM_NAMED_PERPETRATOR_BY_NICKNAME';
    } else {
      return 'VICTIM_MENTIONED_PERPETRATOR';
    }
  }

  /**
   * Extract context around a match position
   * @param {string} text - Full text
   * @param {number} position - Position of match
   * @param {number} contextLength - Characters before/after to extract
   * @returns {string} Context excerpt
   */
  extractContext(text, position, contextLength = 200) {
    const start = Math.max(0, position - contextLength);
    const end = Math.min(text.length, position + contextLength);
    let context = text.substring(start, end);

    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';

    return context.trim();
  }

  /**
   * Save cross-references to MongoDB
   * @param {Array<Object>} crossRefs - Array of cross-reference links
   * @returns {Promise<Object>} Save result
   */
  async saveCrossReferencesToDB(crossRefs) {
    console.log(`💾 [ML CrossRef] Saving ${crossRefs.length} cross-references to MongoDB...`);

    const client = new MongoClient(this.mongoUri);

    try {
      await client.connect();
      const db = client.db(this.dbName);
      const collection = db.collection('valech_cross_references_ml');

      // Insert all cross-references
      const result = await collection.insertMany(crossRefs);

      // Create indexes for efficient querying
      await collection.createIndex({ victimId: 1 });
      await collection.createIndex({ perpetratorId: 1 });
      await collection.createIndex({ matchConfidence: -1 });
      await collection.createIndex({ relationshipType: 1 });

      console.log(`✅ [ML CrossRef] Saved ${result.insertedCount} cross-references, desu!`);

      return {
        success: true,
        inserted: result.insertedCount,
        collection: 'valech_cross_references_ml'
      };
    } catch (error) {
      console.error('❌ [ML CrossRef] Save failed:', error.message);
      throw error;
    } finally {
      await client.close();
    }
  }

  /**
   * Get perpetrators from MongoDB
   * @returns {Promise<Array>} Array of perpetrator documents
   */
  async getPerpetratorFromDB() {
    const client = new MongoClient(this.mongoUri);

    try {
      await client.connect();
      const db = client.db(this.dbName);
      const collection = db.collection('dina_agents_comprehensive');

      const perpetrators = await collection.find({}).toArray();
      return perpetrators;
    } finally {
      await client.close();
    }
  }

  /**
   * Get victims from MongoDB
   * @returns {Promise<Array>} Array of victim documents
   */
  async getVictimsFromDB() {
    const client = new MongoClient(this.mongoUri);

    try {
      await client.connect();
      const db = client.db(this.dbName);
      const collection = db.collection('valech_victims');

      const victims = await collection.find({}).toArray();
      return victims;
    } finally {
      await client.close();
    }
  }

  /**
   * Run complete ML cross-referencing pipeline
   * @returns {Promise<Object>} Pipeline result
   */
  async runCompletePipeline() {
    console.log('🚀 [ML CrossRef] Starting complete ML cross-referencing pipeline, nyaa~!');

    try {
      // 1. Load victims and perpetrators from MongoDB
      console.log('📥 [ML CrossRef] Loading data from MongoDB...');
      const victims = await this.getVictimsFromDB();
      const perpetrators = await this.getPerpetratorFromDB();

      console.log(`   Loaded ${victims.length} victims and ${perpetrators.length} perpetrators`);

      // 2. Auto-link victims to perpetrators
      const crossRefs = await this.autoLinkVictimsToPerpetrators(victims, perpetrators);

      // 3. Save to MongoDB
      const saveResult = await this.saveCrossReferencesToDB(crossRefs);

      console.log('\n✅ [ML CrossRef] Pipeline complete! 💖');
      console.log(`   Cross-references generated: ${crossRefs.length}`);
      console.log(`   Saved to MongoDB: ${saveResult.inserted}`);

      return {
        success: true,
        crossReferences: crossRefs.length,
        saved: saveResult.inserted
      };
    } catch (error) {
      console.error('❌ [ML CrossRef] Pipeline failed:', error.message);
      throw error;
    }
  }
}

module.exports = MLCrossReferenceEngine;

// Command-line execution
if (require.main === module) {
  (async () => {
    console.log('🐾 ML Cross-Reference Engine - V2.0 Upgrade ✨\n');

    const engine = new MLCrossReferenceEngine({
      confidenceThreshold: 0.75,
      debug: true
    });

    try {
      const result = await engine.runCompletePipeline();

      console.log('\n📊 Final Results:');
      console.log(`   Success: ${result.success}`);
      console.log(`   Cross-references: ${result.crossReferences}`);
      console.log(`   Saved to DB: ${result.saved}`);

      console.log('\n💖 ML cross-referencing complete, nyaa~! ✨');
    } catch (error) {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    }
  })();
}
