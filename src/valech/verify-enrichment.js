// 🐾⚡ VERIFY VALECH ENRICHMENT ⚡🐾
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://pinochito1747:pinochito1747@free-cluster.svjei3w.mongodb.net/';
const DATABASE_NAME = 'neko-defense-system';

async function verifyEnrichment() {
  console.log('🔍 VERIFYING VALECH ENRICHMENT, NYAA~!\n');

  let client;

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas\n');

    const db = client.db(DATABASE_NAME);

    // Check case-patterns
    console.log('📚 Checking case-patterns collection...');
    const casePatterns = db.collection('case-patterns');
    const totalPatterns = await casePatterns.countDocuments();
    const valechPattern = await casePatterns.findOne({
      title: "Valech Historical Justice Database Enhancement"
    });
    console.log(`   Total patterns: ${totalPatterns}`);
    console.log(`   Valech pattern: ${valechPattern ? '✅ FOUND' : '❌ NOT FOUND'}`);
    if (valechPattern) {
      console.log(`   - Category: ${valechPattern.category}`);
      console.log(`   - Outcome: ${valechPattern.outcome}`);
      console.log(`   - Reusability: ${valechPattern.reusabilityScore}`);
    }
    console.log();

    // Check hunt-conversations
    console.log('🎯 Checking hunt-conversations collection...');
    const huntConversations = db.collection('hunt-conversations');
    const totalHunts = await huntConversations.countDocuments();
    const valechHunt = await huntConversations.findOne({
      sessionType: "historical-research"
    });
    console.log(`   Total hunts: ${totalHunts}`);
    console.log(`   Valech research session: ${valechHunt ? '✅ FOUND' : '❌ NOT FOUND'}`);
    if (valechHunt) {
      console.log(`   - Objective: ${valechHunt.objective}`);
      console.log(`   - Outcome: ${valechHunt.outcome}`);
      console.log(`   - Victims added: ${valechHunt.victimsAdded.length}`);
    }
    console.log();

    // Check valech_victims enrichment
    console.log('💎 Checking valech_victims enrichment...');
    const valechVictims = db.collection('valech_victims');
    const totalVictims = await valechVictims.countDocuments();
    const enrichedVictims = await valechVictims.countDocuments({
      "enrichment.sessionEnhanced": "oct16-2025-expansion"
    });
    const internationalVictims = await valechVictims.countDocuments({
      "enrichment.internationalSignificance": true
    });
    console.log(`   Total victims: ${totalVictims}`);
    console.log(`   Enriched this session: ${enrichedVictims}`);
    console.log(`   International significance: ${internationalVictims}`);
    console.log();

    // Sample enriched victim
    console.log('📄 Sample enriched victim:');
    const sample = await valechVictims.findOne({
      "enrichment.sessionEnhanced": "oct16-2025-expansion"
    });
    if (sample) {
      console.log(`   Name: ${sample.fullName}`);
      console.log(`   Session: ${sample.enrichment.sessionEnhanced}`);
      console.log(`   International: ${sample.enrichment.internationalSignificance}`);
      console.log(`   Added: ${sample.enrichment.addedDate}`);
    }
    console.log();

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ VERIFICATION COMPLETE!');
    console.log('═══════════════════════════════════════════════════════════\n');

    return {
      casePatternsTotal: totalPatterns,
      huntConversationsTotal: totalHunts,
      valechVictimsTotal: totalVictims,
      enrichedVictims,
      internationalVictims,
      allPresent: !!(valechPattern && valechHunt && sample)
    };

  } catch (error) {
    console.error('❌ VERIFICATION FAILED:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('📡 Connection closed\n');
    }
  }
}

verifyEnrichment()
  .then(result => {
    console.log('✨ *purrs in verification success* 😻');
    console.log(`\n🎯 All data present: ${result.allPresent ? 'YES ✅' : 'NO ❌'}\n`);
    process.exit(result.allPresent ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Error:', error.message);
    process.exit(1);
  });
