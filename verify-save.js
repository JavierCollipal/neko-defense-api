// 🐾🔍 Quick verification of saved data
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://pinochito1747:pinochito1747@free-cluster.svjei3w.mongodb.net/';
const dbName = 'neko-defense-system';

async function verify() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    console.log('🔍 Verifying saved data, nyaa~!\n');

    // Check case patterns
    const casePatterns = await db.collection('case-patterns')
      .find({ title: { $in: ['GitHub Actions CI/CD Pipeline Verification', 'JWT Authentication with Admin User Setup (NestJS + GraphQL)'] } })
      .toArray();

    console.log(`✅ Case Patterns Found: ${casePatterns.length}`);
    casePatterns.forEach(p => console.log(`   - ${p.title}`));

    // Check hunt conversation
    const huntConv = await db.collection('hunt-conversations')
      .findOne({ sessionId: 'admin-auth-tv-demo-oct14-2025' });

    console.log(`\n✅ Hunt Conversation Found: ${huntConv ? 'YES' : 'NO'}`);
    if (huntConv) {
      console.log(`   - Session: ${huntConv.sessionId}`);
      console.log(`   - Category: ${huntConv.category}`);
      console.log(`   - Key Actions: ${huntConv.keyActions.length}`);
    }

    // Check session log
    const sessionLog = await db.collection('session-logs')
      .findOne({ sessionId: 'admin-auth-tv-demo-oct14-2025' });

    console.log(`\n✅ Session Log Found: ${sessionLog ? 'YES' : 'NO'}`);

    // Total counts
    const totalPatterns = await db.collection('case-patterns').countDocuments();
    const totalHunts = await db.collection('hunt-conversations').countDocuments();

    console.log(`\n📊 TOTALS:`);
    console.log(`   - Case Patterns: ${totalPatterns}`);
    console.log(`   - Hunt Conversations: ${totalHunts}`);

    console.log('\n💖 VERIFICATION COMPLETE, DESU~!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

verify();
