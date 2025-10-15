// 🐾📊 Check ALL collection counts
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://pinochito1747:pinochito1747@free-cluster.svjei3w.mongodb.net/';
const dbName = 'neko-defense-system';

async function checkAll() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    console.log('📊 FULL DATABASE STATISTICS, NYAA~!\n');
    console.log('════════════════════════════════════════════════════════════════');

    const collections = [
      'threat-actors',
      'case-patterns',
      'hunt-conversations',
      'honeypot-triggers',
      'evidence-packages',
      'session-logs',
      'system-stats'
    ];

    for (const coll of collections) {
      const count = await db.collection(coll).countDocuments();
      console.log(`${coll.padEnd(25)} : ${count} documents`);
    }

    console.log('════════════════════════════════════════════════════════════════');

    // Show latest entries
    console.log('\n📚 LATEST CASE PATTERNS:');
    const latestPatterns = await db.collection('case-patterns')
      .find()
      .sort({ timestamp: -1 })
      .limit(5)
      .toArray();

    latestPatterns.forEach((p, i) => {
      console.log(`${i + 1}. ${p.title} (${p.category})`);
    });

    console.log('\n🔍 LATEST HUNT CONVERSATIONS:');
    const latestHunts = await db.collection('hunt-conversations')
      .find()
      .sort({ date: -1 })
      .limit(5)
      .toArray();

    latestHunts.forEach((h, i) => {
      console.log(`${i + 1}. ${h.sessionId} - ${h.category}`);
    });

    console.log('\n💖 CHECK COMPLETE, DESU~!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkAll();
