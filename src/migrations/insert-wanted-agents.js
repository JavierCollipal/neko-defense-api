// 🐾⚖️ NEKO DEFENSE - DINA Wanted Agents Migration Script ⚖️🐾
// Inserts hardcoded wanted agents data into MongoDB Atlas
// Run with: node src/migrations/insert-wanted-agents.js

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neko-defense';

// 🎯 COMPREHENSIVE DINA AGENTS DATABASE - From DinaDocumentation.js
const dinaAgentsDatabase = [
  {
    fullName: "Manuel Contreras Sepúlveda",
    codename: "Mamo",
    alias: "El Mamo",
    role: "DINA Commander & Chief",
    rank: "Brigadier General",
    organization: ["DINA (1973-1977)"],
    status: "DECEASED - CONVICTED",
    researchCapability: "Strategic intelligence, torture coordination, international operations, CIA liaison",
    workCapability: "Full command authority over all DINA operations, cross-border assassination planning, Operation Condor coordination",
    legalStatus: {
      convicted: true,
      currentStatus: "Died in prison August 7, 2015 (age 86)",
      sentences: "59 unappealable sentences totaling 529 years",
      prisonLocation: "Died at Military Hospital (was at Punta Peuco)"
    },
    crimesAccused: [
      "Commander of DINA",
      "Kidnapping",
      "Forced Disappearance",
      "Assassination (Letelier-Moffitt, Carlos Prats)",
      "Torture",
      "Crimes Against Humanity",
      "International Terrorism"
    ],
    notableOperations: [
      "Letelier-Moffitt Assassination (USA, 1976) - 7 years prison",
      "General Carlos Prats Assassination (Argentina, 1974) - 2 LIFE SENTENCES",
      "Operation Colombo",
      "Villa Grimaldi torture operations"
    ],
    verificationStatus: "HISTORICALLY VERIFIED",
    significance: "One of most convicted agents in Latin American history. Worked for CIA and received payments.",
    tags: ["DINA Chief", "International Crimes", "CIA Connection", "CONVICTED", "DECEASED"]
  },
  {
    fullName: "Adriana Rivas Araya",
    codename: "La Chani",
    alias: "La Chani",
    role: "DINA Agent - Lautaro Brigade Secretary",
    organization: ["DINA - Lautaro Brigade (1973-1977)"],
    status: "⚠️ AT LARGE - FIGHTING EXTRADITION",
    researchCapability: "Intelligence documentation, detainee records management, Contreras' personal secretary access to classified operations",
    workCapability: "Administrative control of Lautaro Brigade operations, coordination of kidnappings, victim processing and documentation",
    legalStatus: {
      convicted: false,
      currentStatus: "IMPRISONED IN AUSTRALIA since 2019 - Fighting Extradition",
      charges: "7 counts aggravated kidnapping (Reynalda Pereira, Fernando Navarro, Lincoyán Berríos, Horacio Cepeda, Juan Fernando Ortiz, Héctor Véliz, Víctor Díaz)",
      extraditionStatus: "Australian Federal Court rejected appeal July 2025. Next High Court hearing March 2025.",
      prisonLocation: "Sydney, Australia"
    },
    crimesAccused: [
      "Aggravated Kidnapping (7 counts)",
      "Complicity in Forced Disappearances",
      "Torture assistance"
    ],
    timeline: [
      "1973-1977: Worked as Contreras' personal secretary",
      "2010: Released on bail in Chile, fled to Australia",
      "2019: Arrested in Australia on extradition request",
      "2025: Fighting extradition in Australian courts"
    ],
    verificationStatus: "ACTIVE CASE",
    significance: "Most prominent DINA agent currently evading Chilean justice. May be 'dozens more DINA agents in Australia who lied on original migration applications.'",
    tags: ["AT LARGE", "EXTRADITION CASE", "UNPROSECUTED", "AUSTRALIA", "HIGH PRIORITY"]
  },
  {
    fullName: "Miguel Krassnoff Martchenko",
    codename: "Vlado",
    alias: "El Ruso (The Russian)",
    role: "DINA Operations Officer - Caupolicán Brigade",
    rank: "Captain (DINA)",
    organization: ["DINA", "Chilean Army"],
    status: "CONVICTED - IMPRISONED",
    researchCapability: "Torture techniques specialist, interrogation methods, forced disappearance logistics, Villa Grimaldi operations",
    workCapability: "Field operations commander, torture execution, kidnapping operations, death squad coordination, Operation Colombo implementation",
    legalStatus: {
      convicted: true,
      currentStatus: "SERVING SENTENCE",
      sentences: "1,047+ years in prison (convicted in 25+ cases)",
      prisonLocation: "Penal Punta Peuco, Chile",
      recentConvictions: "February 2024: Additional 20 years for Operation Colombo (total now 1,047 years)"
    },
    crimesAccused: [
      "Kidnapping (20+ counts)",
      "Forced Disappearance",
      "Torture",
      "Murder",
      "Crimes Against Humanity"
    ],
    notableOperations: [
      "Operation Colombo",
      "Villa Grimaldi torture operations",
      "Múltiple forced disappearances"
    ],
    verificationStatus: "CONVICTED",
    significance: "One of the most convicted DINA torturers. Known for sadistic torture methods.",
    tags: ["CONVICTED", "IMPRISONED", "1000+ YEARS", "TORTURER"]
  },
  {
    fullName: "Raúl Eduardo Iturriaga Neumann",
    codename: "Guatón",
    alias: "El Guatón",
    role: "DINA Deputy Director - Exterior Operations",
    rank: "Lieutenant Colonel",
    organization: ["DINA", "Chilean Army"],
    status: "CONVICTED - IMPRISONED",
    researchCapability: "International intelligence networks, Operation Condor coordination, foreign assassination planning, European connections",
    workCapability: "External operations command, cross-border assassination execution, diplomatic cover operations, multinational coordination with Argentine/Uruguayan services",
    legalStatus: {
      convicted: true,
      currentStatus: "SERVING SENTENCE",
      sentences: "200+ years in prison",
      prisonLocation: "Penal Punta Peuco, Chile",
      specialNotes: "Was fugitive 2007-2007 (captured after months)"
    },
    crimesAccused: [
      "General Carlos Prats Assassination (Argentina, 1974)",
      "Bernardo Leighton Attempted Assassination (Rome, Italy, 1975) - Italian courts convicted IN ABSENTIA 18 years",
      "Kidnapping",
      "Murder",
      "Crimes Against Humanity"
    ],
    notableOperations: [
      "Operation Condor coordinator",
      "International assassination operations",
      "Cross-border state terrorism"
    ],
    verificationStatus: "CONVICTED",
    significance: "Key figure in DINA's international operations. Italian warrant outstanding.",
    tags: ["CONVICTED", "IMPRISONED", "OPERATION CONDOR", "INTERNATIONAL CRIMES"]
  },
  {
    fullName: "Pedro Octavio Espinoza Bravo",
    codename: "Pedro",
    alias: "El Pedro",
    role: "DINA Second-in-Command",
    rank: "Brigadier General",
    organization: ["DINA", "Chilean Army"],
    status: "CONVICTED - IMPRISONED",
    researchCapability: "Strategic operations planning, DINA infrastructure management, international assassination coordination, Villa Grimaldi oversight",
    workCapability: "Deputy commander authority, operational planning for Letelier assassination, Carmelo Soria murder coordination, direct reporting to Contreras",
    legalStatus: {
      convicted: true,
      currentStatus: "SERVING SENTENCE (as of January 2025)",
      sentences: "200+ years in prison",
      prisonLocation: "Penal Punta Peuco, Chile",
      recentConvictions: "August 2023: 15 years for Carmelo Soria murder"
    },
    crimesAccused: [
      "Letelier-Moffitt Assassination (USA, 1976)",
      "Carmelo Soria murder (Spanish diplomat, 1976)",
      "Kidnapping",
      "Murder",
      "Crimes Against Humanity"
    ],
    notableOperations: [
      "Second-in-command to Contreras",
      "Letelier assassination operation",
      "Villa Grimaldi operations"
    ],
    verificationStatus: "CONVICTED",
    significance: "First military officer imprisoned at Punta Peuco. Contreras' right-hand man.",
    tags: ["CONVICTED", "IMPRISONED", "SECOND-IN-COMMAND", "LETELIER CASE"]
  },
  {
    fullName: "Marcelo Moren Brito",
    codename: "El Ronco",
    alias: "El Ronco (The Hoarse One)",
    role: "Villa Grimaldi Commander - Caupolicán Brigade Chief",
    rank: "Major",
    organization: ["DINA", "Chilean Army", "Caravan of Death"],
    status: "DECEASED - CONVICTED",
    researchCapability: "Mass torture facility management, psychological torture methods, execution protocols, Caravan of Death operations",
    workCapability: "Villa Grimaldi command (4,500+ detainees processed), torture center operations, mass execution coordination, 240+ deaths at single facility",
    legalStatus: {
      convicted: true,
      currentStatus: "Died September 11, 2015 (age 80) at Hospital Militar",
      sentences: "300+ years in prison",
      prisonLocation: "Died in hospital (was at Punta Peuco)"
    },
    crimesAccused: [
      "Commander of Villa Grimaldi torture center",
      "Torture of thousands",
      "Forced Disappearance",
      "Murder (75+ in Caravan of Death)",
      "Crimes Against Humanity"
    ],
    notableOperations: [
      "Villa Grimaldi chief (1974-1978) - 4,500 detainees, 240+ killed",
      "Caravan of Death (1973) - 75+ executions including Víctor Jara",
      "Operation Colombo"
    ],
    verificationStatus: "CONVICTED",
    significance: "One of most sanguinary DINA members. Villa Grimaldi under his command was worst torture center.",
    tags: ["CONVICTED", "DECEASED", "VILLA GRIMALDI COMMANDER", "CARAVAN OF DEATH"]
  },
  {
    fullName: "Osvaldo Romo Mena",
    codename: "Guatón Romo",
    alias: "El Guatón Romo (Fat Romo)",
    role: "DINA Interrogator & Torturer",
    organization: ["DINA (1973-1990)"],
    status: "DECEASED - CONVICTED",
    researchCapability: "Extreme interrogation techniques, psychological torture, forced disappearance logistics, informant identification",
    workCapability: "100+ forced disappearances, direct torture execution, brutal interrogations, Villa Grimaldi operations, Londres 38 work",
    legalStatus: {
      convicted: true,
      currentStatus: "Died July 4, 2007",
      sentences: "Life imprisonment (several suspended by Supreme Court)",
      prisonLocation: "Died (was imprisoned)"
    },
    crimesAccused: [
      "Forced Disappearance (100+ people)",
      "Torture",
      "Interrogation through torture",
      "Murder"
    ],
    verificationStatus: "CONVICTED",
    significance: "Known for extreme brutality in interrogations. Involved in over 100 disappearances.",
    tags: ["CONVICTED", "DECEASED", "TORTURER", "100+ VICTIMS"]
  },
  {
    fullName: "Ingrid Olderöck Bernhard",
    codename: "La Mujer de los Perros",
    alias: "La Mujer de los Perros (The Dog Woman)",
    role: "DINA Torture Specialist - Venda Sexy Commander",
    rank: "Major (Carabineros)",
    organization: ["DINA", "Carabineros de Chile", "Women's School"],
    status: "⚠️ DECEASED - NEVER PROSECUTED",
    researchCapability: "Sexual torture methods, dog training for assault, psychological warfare, female torturer training, Venda Sexy operations",
    workCapability: "Venda Sexy command, 27+ forced disappearances from facility, trained 70 female torturers, specialized in sexual violence and animal-assisted torture",
    legalStatus: {
      convicted: false,
      currentStatus: "Died March 17, 2001 (age 58) from internal hemorrhage",
      prosecution: "NEVER SUBJECTED TO JUDICIAL PROCESS - DIED IN IMPUNITY",
      charges: "None (despite multiple accusations)"
    },
    crimesAccused: [
      "Commander of 'Venda Sexy' torture center",
      "Sexual torture (trained dogs to assault prisoners sexually)",
      "Forced Disappearance (27+ people from Venda Sexy)",
      "Training 70 women in torture methods",
      "Extreme sadistic torture"
    ],
    notableOperations: [
      "Created and commanded 'Venda Sexy' torture center",
      "Women's School - trained female torturers",
      "Specialized in sexual violence and psychological torture"
    ],
    verificationStatus: "VERIFIED - UNPUNISHED",
    significance: "⚠️ ONE OF WORST CASES OF IMPUNITY! Never prosecuted despite heinous crimes. Became known only after 1981 assassination attempt.",
    tags: ["NEVER PROSECUTED", "DECEASED", "IMPUNITY", "SEXUAL TORTURE", "VENDA SEXY", "⚠️ UNPUNISHED"]
  }
];

async function migrateWantedAgents() {
  console.log('🚀 [Migration] Starting DINA Wanted Agents migration, nyaa~!');
  console.log(`📦 [Migration] Will insert ${dinaAgentsDatabase.length} comprehensive agents`);

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ [Migration] Connected to MongoDB Atlas');

    const db = client.db();
    const collection = db.collection('dina_agents_comprehensive');

    // Check if data already exists
    const existingCount = await collection.countDocuments();
    console.log(`📊 [Migration] Found ${existingCount} existing documents`);

    if (existingCount > 0) {
      console.log('⚠️ [Migration] Collection already has data. Backing up and clearing...');

      // Backup existing data
      const backupCollection = db.collection('dina_agents_comprehensive_backup');
      const existingDocs = await collection.find({}).toArray();
      if (existingDocs.length > 0) {
        await backupCollection.insertMany(existingDocs);
        console.log(`✅ [Migration] Backed up ${existingDocs.length} documents`);
      }

      // Clear collection
      await collection.deleteMany({});
      console.log('✅ [Migration] Cleared collection for fresh insert');
    }

    // Insert agents with _id generation
    const agentsToInsert = dinaAgentsDatabase.map(agent => ({
      ...agent,
      id: agent.fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const result = await collection.insertMany(agentsToInsert);
    console.log(`✅ [Migration] Inserted ${result.insertedCount} wanted agents successfully!`);

    // Create indexes for faster queries
    await collection.createIndex({ fullName: 1 });
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ 'legalStatus.convicted': 1 });
    await collection.createIndex({ tags: 1 });
    console.log('✅ [Migration] Created indexes for optimized queries');

    // Display summary
    console.log('\n📊 [Migration] SUMMARY:');
    console.log(`   • Total agents inserted: ${result.insertedCount}`);
    console.log(`   • AT LARGE: ${agentsToInsert.filter(a => a.status.includes('AT LARGE')).length}`);
    console.log(`   • CONVICTED: ${agentsToInsert.filter(a => a.legalStatus.convicted).length}`);
    console.log(`   • NEVER PROSECUTED: ${agentsToInsert.filter(a => a.legalStatus.prosecution?.includes('NEVER')).length}`);
    console.log(`   • DECEASED: ${agentsToInsert.filter(a => a.status.includes('DECEASED')).length}`);

    console.log('\n✨ [Migration] Migration completed successfully, desu~! 🐾⚖️');

  } catch (error) {
    console.error('❌ [Migration] Error during migration:', error);
    throw error;
  } finally {
    await client.close();
    console.log('🔒 [Migration] MongoDB connection closed');
  }
}

// Run migration
migrateWantedAgents()
  .then(() => {
    console.log('🎯 [Migration] All done! You can now use the API endpoints.');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 [Migration] Failed:', error);
    process.exit(1);
  });
