// 🐾🔍 Check ALL databases and their collections
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://pinochito1747:pinochito1747@free-cluster.svjei3w.mongodb.net/';

async function checkDatabases() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('🔍 Checking all databases in cluster, nyaa~!\n');

    // List all databases
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();

    console.log('📦 AVAILABLE DATABASES:');
    console.log('════════════════════════════════════════════════════════════════');

    for (const dbInfo of dbs.databases) {
      console.log(`\n🗄️  ${dbInfo.name} (${(dbInfo.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);

      const db = client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();

      if (collections.length > 0) {
        console.log('   Collections:');
        for (const coll of collections) {
          const count = await db.collection(coll.name).countDocuments();
          console.log(`   - ${coll.name}: ${count} documents`);
        }
      } else {
        console.log('   (no collections)');
      }
    }

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('💖 DATABASE SCAN COMPLETE, DESU~!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkDatabases();
