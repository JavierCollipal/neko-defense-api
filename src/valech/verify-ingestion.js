// 🔍 VALECH DATA VERIFICATION SCRIPT
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://pinochito1747:pinochito1747@free-cluster.svjei3w.mongodb.net/';
const DATABASE_NAME = 'neko-defense-system';

async function verifyIngestion() {
  console.log('🔍 VERIFYING VALECH INGESTION, NYAA~!\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('valech_victims');

    // Count documents
    const count = await collection.countDocuments();
    console.log(`✅ Total victims in MongoDB: ${count}\n`);

    // Sample victim
    const sample = await collection.findOne({ fullName: 'Víctor Jara Martínez' });
    if (sample) {
      console.log('📄 SAMPLE RECORD: Víctor Jara Martínez');
      console.log(`   Age: ${sample.age}`);
      console.log(`   Outcome: ${sample.outcome}`);
      console.log(`   Significance: ${sample.significance}`);
      console.log(`   ✅ VERIFICATION COMPLETE!\n`);
    } else {
      console.log('⚠️  Sample record not found');
    }

    // Cross-reference check
    const withLinks = await collection.countDocuments({ linkedPerpetrators: { $ne: [] } });
    console.log(`🔗 Victims with perpetrator links: ${withLinks}`);

    // Categories
    const survived = await collection.countDocuments({ outcome: 'SURVIVED' });
    const executed = await collection.countDocuments({ outcome: 'EXECUTED' });
    const disappeared = await collection.countDocuments({ outcome: { $regex: 'DISAPPEARED' } });

    console.log(`\n📊 BREAKDOWN:`);
    console.log(`   Survived: ${survived}`);
    console.log(`   Executed: ${executed}`);
    console.log(`   Disappeared: ${disappeared}`);

    console.log('\n💾 DATA VERIFIED IN MONGODB, DESU~! ✅\n');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await client.close();
  }
}

verifyIngestion();
