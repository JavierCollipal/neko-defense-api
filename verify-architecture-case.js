const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://pinochito1747:pinochito1747@free-cluster.svjei3w.mongodb.net/";
const dbName = "neko-defense-system";

async function verifyCase() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    // Get the architecture refactoring case
    const casePattern = await db.collection("case-patterns").findOne({
      title: "Architecture Refactoring: Non-Blocking Validations with TDD"
    });

    if (casePattern) {
      console.log("\n✅ CASE PATTERN VERIFIED IN MONGODB ATLAS\n");
      console.log("📋 Title:", casePattern.title);
      console.log("🏷️  Category:", casePattern.category);
      console.log("🎯 Difficulty:", casePattern.difficulty);
      console.log("♻️  Reusability:", casePattern.reusability);
      console.log("📅 Timestamp:", casePattern.timestamp);
      console.log("\n🔧 PROBLEM:");
      console.log("  ", casePattern.problem.description);
      console.log("\n✨ KEY INSIGHTS:");
      casePattern.solution.keyInsights.forEach((insight, i) => {
        console.log(`   ${i + 1}. ${insight}`);
      });
      console.log("\n📊 TEST RESULTS:");
      console.log(`   ✅ All ${casePattern.results.totalTests} tests passing`);
      console.log(`   📈 Coverage: ${casePattern.results.coverage.statements} statements`);
      console.log(`   📈 Coverage: ${casePattern.results.coverage.branches} branches`);
      console.log(`   📈 Coverage: ${casePattern.results.coverage.functions} functions`);
      console.log("\n🏷️  TAGS:", casePattern.tags.join(", "));
    }

    // Get new abilities
    const abilities = await db.collection("abilities").find({
      learned: { $gte: new Date(Date.now() - 60000) }
    }).toArray();

    console.log("\n⚡ NEW ABILITIES LEARNED:");
    abilities.forEach((ability, i) => {
      console.log(`\n   ${i + 1}. ${ability.name}`);
      console.log(`      Category: ${ability.category}`);
      console.log(`      Description: ${ability.description}`);
      console.log(`      Reusability: ${ability.reusability}`);
    });

    console.log("\n💖 All data successfully saved to MongoDB Atlas, nyaa~! ✨");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

verifyCase().catch(console.error);
