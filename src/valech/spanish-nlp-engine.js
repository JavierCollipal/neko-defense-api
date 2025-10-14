// 🔬 SPANISH NLP ENGINE - V2.0 UPGRADE
// Advanced entity extraction for Spanish text with XLM-RoBERTa NER
const { pipeline } = require('@xenova/transformers');
const natural = require('natural');
const compromise = require('compromise');

class SpanishNLPEngine {
  constructor(options = {}) {
    this.nerModel = null;
    this.initialized = false;
    this.debug = options.debug || false;
  }

  /**
   * Initialize NER model (XLM-RoBERTa for Spanish)
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      console.log('✅ [NLP] Model already initialized');
      return;
    }

    console.log('🔬 [NLP] Initializing Spanish NER model (XLM-RoBERTa)...');
    console.log('⏳ [NLP] This may take a moment on first run (downloading model)...');

    try {
      this.nerModel = await pipeline('ner', 'Davlan/xlm-roberta-base-ner-hrl');
      this.initialized = true;
      console.log('✅ [NLP] Model initialized successfully, desu!');
    } catch (error) {
      console.error('❌ [NLP] Model initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Extract named entities from Spanish text
   * @param {string} text - Spanish text to analyze
   * @returns {Promise<Object>} Extracted entities
   */
  async extractEntities(text) {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log('🔍 [NLP] Extracting entities from text...');

    try {
      // Run NER model
      const entities = await this.nerModel(text);

      // Group entities by type
      const grouped = {
        persons: [],
        locations: [],
        organizations: [],
        dates: [],
        other: []
      };

      for (const entity of entities) {
        const cleanEntity = {
          text: entity.word,
          type: entity.entity,
          score: entity.score,
          index: entity.index
        };

        if (entity.entity.includes('PER')) {
          grouped.persons.push(cleanEntity);
        } else if (entity.entity.includes('LOC')) {
          grouped.locations.push(cleanEntity);
        } else if (entity.entity.includes('ORG')) {
          grouped.organizations.push(cleanEntity);
        } else if (entity.entity.includes('DATE')) {
          grouped.dates.push(cleanEntity);
        } else {
          grouped.other.push(cleanEntity);
        }
      }

      // Merge fragmented entities (B-PER, I-PER sequences)
      grouped.persons = this.mergeFragmentedEntities(grouped.persons);
      grouped.locations = this.mergeFragmentedEntities(grouped.locations);
      grouped.organizations = this.mergeFragmentedEntities(grouped.organizations);

      console.log(`✅ [NLP] Found ${grouped.persons.length} persons, ${grouped.locations.length} locations, ${grouped.organizations.length} organizations`);

      return grouped;
    } catch (error) {
      console.error('❌ [NLP] Entity extraction failed:', error.message);
      throw error;
    }
  }

  /**
   * Extract perpetrator names from victim testimony
   * @param {string} testimonyText - Spanish testimony text
   * @returns {Promise<Array>} Array of perpetrator mentions
   */
  async extractPerpetrators(testimonyText) {
    console.log('🔍 [NLP] Extracting perpetrator names from testimony...');

    // Common military ranks in Spanish
    const ranks = [
      'Capitán', 'Comandante', 'Teniente', 'Coronel', 'General',
      'Sargento', 'Mayor', 'Suboficial', 'Oficial', 'Brigadier'
    ];

    const perpetrators = [];

    // Pattern 1: Rank + Name
    const rankPattern = new RegExp(
      `(${ranks.join('|')})\\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)`,
      'g'
    );

    let match;
    while ((match = rankPattern.exec(testimonyText)) !== null) {
      perpetrators.push({
        fullMention: match[0],
        rank: match[1],
        name: match[2],
        type: 'MILITARY_WITH_RANK',
        position: match.index
      });
    }

    // Pattern 2: "Nicknamed" perpetrators (e.g., "el Guatón Romo")
    const nicknamePattern = /(?:el|la)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/g;
    while ((match = nicknamePattern.exec(testimonyText)) !== null) {
      perpetrators.push({
        fullMention: match[0],
        nickname: match[1],
        lastname: match[2],
        type: 'NICKNAMED',
        position: match.index
      });
    }

    // Pattern 3: NER extraction for additional persons
    const entities = await this.extractEntities(testimonyText);
    for (const person of entities.persons) {
      // Avoid duplicates
      if (!perpetrators.some(p => p.fullMention === person.text)) {
        perpetrators.push({
          fullMention: person.text,
          type: 'NER_PERSON',
          confidence: person.score,
          position: person.index
        });
      }
    }

    console.log(`✅ [NLP] Found ${perpetrators.length} perpetrator mentions, desu!`);
    return perpetrators;
  }

  /**
   * Extract torture methods from testimony text
   * @param {string} testimonyText - Spanish testimony text
   * @returns {Array<Object>} Identified torture methods
   */
  extractTortureMethods(testimonyText) {
    console.log('🔍 [NLP] Identifying torture methods...');

    // Dictionary of torture methods (Spanish keywords)
    const tortureMethods = {
      'Golpizas': ['golpe', 'golpiza', 'paliza', 'golpeado', 'golpearon'],
      'Electricidad': ['electricidad', 'corriente', 'eléctrico', 'descarga', 'picana'],
      'Asfixia': ['asfixia', 'ahogo', 'submarino', 'capucha', 'bolsa', 'ahogar'],
      'Violencia Sexual': ['violación', 'abuso sexual', 'desnudo', 'desnudar', 'violada', 'violado'],
      'Simulacro de Ejecución': ['fusilamiento', 'simulacro', 'ejecutar', 'amenaza de muerte'],
      'Tortura Psicológica': ['amenaza', 'intimidación', 'insulto', 'humillación'],
      'Aislamiento': ['incomunicación', 'aislamiento', 'celda', 'encierro'],
      'Posiciones Forzadas': ['colgado', 'parrilla', 'pau de arara', 'amarrado'],
      'Quemaduras': ['quemadura', 'quemar', 'cigarrillo', 'quemado', 'fuego']
    };

    const foundMethods = [];
    const lowerText = testimonyText.toLowerCase();

    for (const [method, keywords] of Object.entries(tortureMethods)) {
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\w*\\b`, 'gi');
        const matches = testimonyText.match(regex);

        if (matches) {
          foundMethods.push({
            method,
            keyword,
            occurrences: matches.length,
            examples: matches.slice(0, 3) // First 3 examples
          });
          break; // Found this method, no need to check other keywords
        }
      }
    }

    console.log(`✅ [NLP] Identified ${foundMethods.length} torture methods`);
    return foundMethods;
  }

  /**
   * Extract detention center mentions
   * @param {string} text - Text to analyze
   * @returns {Array<Object>} Detention center mentions
   */
  extractDetentionCenters(text) {
    console.log('🔍 [NLP] Extracting detention center mentions...');

    // Known detention centers and their variations
    const knownCenters = [
      {
        canonical: 'Villa Grimaldi',
        aliases: ['Villa Grimaldi', 'Cuartel Terranova', 'Terranova', 'La Grimaldi']
      },
      {
        canonical: 'Londres 38',
        aliases: ['Londres 38', 'Londres treinta y ocho', 'Yucatán']
      },
      {
        canonical: 'Estadio Nacional',
        aliases: ['Estadio Nacional', 'Nacional', 'Estadio']
      },
      {
        canonical: 'Estadio Chile',
        aliases: ['Estadio Chile', 'Víctor Jara', 'Estadio Víctor Jara']
      },
      {
        canonical: 'José Domingo Cañas',
        aliases: ['José Domingo Cañas', 'JD Cañas', 'Cañas']
      },
      {
        canonical: 'Tres Álamos',
        aliases: ['Tres Álamos', '3 Álamos', 'Tres Alamos']
      },
      {
        canonical: 'Cuatro Álamos',
        aliases: ['Cuatro Álamos', '4 Álamos', 'Cuatro Alamos']
      },
      {
        canonical: 'La Venda Sexy',
        aliases: ['Venda Sexy', 'La Venda', 'Discoteque']
      }
    ];

    const mentions = [];

    for (const center of knownCenters) {
      for (const alias of center.aliases) {
        const regex = new RegExp(`\\b${this.escapeRegex(alias)}\\b`, 'gi');
        const matches = [...text.matchAll(regex)];

        for (const match of matches) {
          mentions.push({
            canonicalName: center.canonical,
            matchedAlias: match[0],
            position: match.index
          });
        }
      }
    }

    // Deduplicate
    const unique = [];
    const seen = new Set();
    for (const mention of mentions) {
      const key = `${mention.canonicalName}-${mention.position}`;
      if (!seen.has(key)) {
        unique.push(mention);
        seen.add(key);
      }
    }

    console.log(`✅ [NLP] Found ${unique.length} detention center mentions`);
    return unique;
  }

  /**
   * Analyze sentiment of testimony (trauma indicators)
   * @param {string} testimonyText - Testimony text
   * @returns {Object} Sentiment analysis
   */
  analyzeSentiment(testimonyText) {
    console.log('🔍 [NLP] Analyzing testimony sentiment...');

    // Trauma indicator words
    const traumaIndicators = {
      fear: ['miedo', 'terror', 'pánico', 'aterrorizado', 'asustado'],
      pain: ['dolor', 'sufrimiento', 'agonía', 'tortura', 'padecimiento'],
      violence: ['golpe', 'sangre', 'herida', 'violencia', 'brutal'],
      psychological: ['pesadilla', 'trauma', 'recuerdo', 'flashback', 'angustia']
    };

    const lowerText = testimonyText.toLowerCase();
    const analysis = {
      traumaScore: 0,
      indicators: {}
    };

    for (const [category, words] of Object.entries(traumaIndicators)) {
      let count = 0;
      for (const word of words) {
        const regex = new RegExp(`\\b${word}\\w*\\b`, 'g');
        const matches = lowerText.match(regex);
        if (matches) count += matches.length;
      }
      analysis.indicators[category] = count;
      analysis.traumaScore += count;
    }

    console.log(`✅ [NLP] Trauma score: ${analysis.traumaScore}`);
    return analysis;
  }

  /**
   * Merge fragmented entities from NER (B-PER, I-PER sequences)
   * @param {Array} entities - Array of entity objects
   * @returns {Array} Merged entities
   */
  mergeFragmentedEntities(entities) {
    if (entities.length === 0) return [];

    const merged = [];
    let current = null;

    for (const entity of entities) {
      if (entity.type.startsWith('B-')) {
        // Beginning of new entity
        if (current) merged.push(current);
        current = { ...entity };
      } else if (entity.type.startsWith('I-') && current) {
        // Continuation of current entity
        current.text += ' ' + entity.text;
        current.score = (current.score + entity.score) / 2; // Average score
      } else {
        // Standalone entity
        if (current) merged.push(current);
        merged.push(entity);
        current = null;
      }
    }

    if (current) merged.push(current);
    return merged;
  }

  /**
   * Escape special regex characters
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Complete testimony analysis (all-in-one)
   * @param {string} testimonyText - Full testimony text
   * @returns {Promise<Object>} Complete analysis
   */
  async analyzeTestimony(testimonyText) {
    console.log('🔬 [NLP] Performing complete testimony analysis...');

    const analysis = {
      entities: await this.extractEntities(testimonyText),
      perpetrators: await this.extractPerpetrators(testimonyText),
      tortureMethods: this.extractTortureMethods(testimonyText),
      detentionCenters: this.extractDetentionCenters(testimonyText),
      sentiment: this.analyzeSentiment(testimonyText),
      metadata: {
        textLength: testimonyText.length,
        wordCount: testimonyText.split(/\s+/).length,
        analyzedAt: new Date().toISOString()
      }
    };

    console.log('✅ [NLP] Complete analysis finished, desu! 💖');
    return analysis;
  }
}

module.exports = SpanishNLPEngine;

// Command-line execution for testing
if (require.main === module) {
  (async () => {
    console.log('🐾 Spanish NLP Engine - Test Mode ✨\n');

    const nlp = new SpanishNLPEngine({ debug: true });

    // Sample testimony (excerpt from Víctor Jara case)
    const sampleTestimony = `
    Fui detenido el 12 de septiembre de 1973 en la Universidad Técnica del Estado.
    Me llevaron al Estadio Chile donde estuve detenido durante cuatro días.
    El Capitán Alvarado me interrogó y me golpearon brutalmente.
    Sufrí fracturas en las manos y las costillas debido a los golpes.
    Me amenazaron con fusilamiento y me aplicaron electricidad.
    Otros detenidos fueron torturados en Villa Grimaldi y Londres 38.
    El Comandante Contreras dirigía las operaciones de la DINA.
    `;

    console.log('📝 Sample Testimony:');
    console.log(sampleTestimony);
    console.log('\n🔬 Analyzing...\n');

    try {
      const analysis = await nlp.analyzeTestimony(sampleTestimony);

      console.log('\n📊 Analysis Results:\n');
      console.log('👥 Perpetrators:', analysis.perpetrators.length);
      analysis.perpetrators.forEach(p => {
        console.log(`   - ${p.fullMention} (${p.type})`);
      });

      console.log('\n🏢 Detention Centers:', analysis.detentionCenters.length);
      analysis.detentionCenters.forEach(c => {
        console.log(`   - ${c.canonicalName}`);
      });

      console.log('\n⚠️ Torture Methods:', analysis.tortureMethods.length);
      analysis.tortureMethods.forEach(m => {
        console.log(`   - ${m.method} (${m.occurrences} mentions)`);
      });

      console.log('\n💔 Trauma Score:', analysis.sentiment.traumaScore);
      console.log('   Indicators:', analysis.sentiment.indicators);

      console.log('\n✅ NLP test complete, nyaa~! 💖');
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  })();
}
