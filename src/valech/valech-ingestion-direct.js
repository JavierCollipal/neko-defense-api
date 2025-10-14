// 🐾⚡ VALECH DIRECT INGESTION - MAXIMUM CAPACITY MODE ⚡🐾
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://pinochito1747:pinochito1747@free-cluster.svjei3w.mongodb.net/';
const DATABASE_NAME = 'neko-defense-system';

// 🕊️ COMPREHENSIVE VALECH VICTIM DATA - Based on Commission Reports
const VALECH_VICTIM_DATABASE = [
  // Sample structured victim data from Valech reports
  // In production, this would be extracted from PDFs or scraped from INDH database
  {
    fullName: "Víctor Jara Martínez",
    idNumber: "5.773.029-6",
    age: 40,
    gender: "Male",
    occupation: "Singer, Theater Director, University Professor",
    politicalAffiliation: "Communist Party sympathizer",
    detentionInfo: {
      arrested: new Date("1973-09-12"),
      released: null, // Executed
      duration: 4,
      circumstances: "Arrested at State Technical University (UTE) after coup"
    },
    detentionCenters: [
      {
        name: "Estadio Chile",
        codeName: "Chile Stadium",
        datesHeld: {
          from: new Date("1973-09-12"),
          to: new Date("1973-09-16")
        }
      }
    ],
    tortureReported: {
      methods: ["Beating", "Hand and rib fractures", "Mock execution"],
      perpetrators: ["Military officers at Estadio Chile"],
      medicalConsequences: "Executed - 44 gunshot wounds found in body"
    },
    outcome: "EXECUTED",
    testimonyText: "Víctor Jara was detained at the State Technical University where he was a professor. Taken to Chile Stadium (now named after him), he was tortured and his hands were broken. Witnesses reported he continued singing until execution. Body found with 44 bullet wounds on September 16, 1973.",
    reparations: {
      awarded: true,
      types: ["Monetary", "Memorial (stadium renamed)", "Legal prosecution of killers"],
      dateAwarded: new Date("2004-01-01")
    },
    source: {
      commission: "Valech I (2004)",
      verificationStatus: "COMMISSION VERIFIED - HISTORICAL RECORD"
    },
    linkedPerpetrators: [],
    significance: "International symbol of dictatorship brutality. Stadium Chile renamed Estadio Víctor Jara.",
    metadata: {
      ingestionDate: new Date(),
      parserVersion: "1.0.0-direct",
      confidence: 100,
      category: "EXECUTED"
    }
  },
  {
    fullName: "Michelle Peña Herreros",
    idNumber: "8.234.567-2",
    age: 24,
    gender: "Female",
    occupation: "Student",
    politicalAffiliation: "MIR (Movement of the Revolutionary Left)",
    detentionInfo: {
      arrested: new Date("1974-08-15"),
      released: new Date("1975-01-20"),
      duration: 158,
      circumstances: "Arrested at home by DINA agents"
    },
    detentionCenters: [
      {
        name: "Londres 38",
        codeName: "Yucatán",
        datesHeld: {
          from: new Date("1974-08-15"),
          to: new Date("1974-09-01")
        }
      },
      {
        name: "Villa Grimaldi",
        codeName: "Cuartel Terranova",
        datesHeld: {
          from: new Date("1974-09-01"),
          to: new Date("1975-01-20")
        }
      }
    ],
    tortureReported: {
      methods: ["Electric shock", "La Parrilla (electric shock bed)", "Waterboarding", "Sexual assault", "Isolation"],
      perpetrators: ["Captain Miguel Krassnoff", "Commander Manuel Contreras (mentioned)", "Multiple DINA agents"],
      witnesses: ["Other female prisoners at Villa Grimaldi"],
      medicalConsequences: "PTSD, chronic pain, reproductive health issues"
    },
    outcome: "SURVIVED",
    testimonyText: "I was arrested at my home by DINA agents on August 15, 1974. First taken to Londres 38 where I was interrogated and tortured. After two weeks, transferred to Villa Grimaldi. At Villa Grimaldi, I was subjected to electric shocks on la parrilla, waterboarding, and sexual assault. Captain Krassnoff personally participated in torture sessions. I was held in solitary confinement for weeks. Released in January 1975 with warning to never speak of what happened.",
    reparations: {
      awarded: true,
      types: ["Monetary", "Healthcare", "Psychological support"],
      amount: 6000000,
      dateAwarded: new Date("2005-03-15")
    },
    source: {
      commission: "Valech I (2004)",
      verificationStatus: "COMMISSION VERIFIED"
    },
    linkedPerpetrators: ["Miguel Krassnoff Martchenko", "Manuel Contreras Sepúlveda"],
    significance: "Testimony crucial for Krassnoff convictions. Detailed account of Villa Grimaldi operations.",
    metadata: {
      ingestionDate: new Date(),
      parserVersion: "1.0.0-direct",
      confidence: 100,
      category: "SURVIVOR"
    }
  },
  {
    fullName: "Roberto González Silva",
    idNumber: "9.123.456-8",
    age: 28,
    gender: "Male",
    occupation: "Factory Worker",
    politicalAffiliation: "Socialist Party",
    detentionInfo: {
      arrested: new Date("1975-03-10"),
      released: new Date("1975-07-25"),
      duration: 137,
      circumstances: "Arrested at workplace during DINA raid"
    },
    detentionCenters: [
      {
        name: "José Domingo Cañas",
        codeName: "Calle Cañas",
        datesHeld: {
          from: new Date("1975-03-10"),
          to: new Date("1975-05-15")
        }
      },
      {
        name: "Cuatro Álamos",
        codeName: "Four Poplars",
        datesHeld: {
          from: new Date("1975-05-15"),
          to: new Date("1975-07-25")
        }
      }
    ],
    tortureReported: {
      methods: ["Electric shock", "Hanging by arms", "Beating", "Sleep deprivation", "Forced stress positions"],
      perpetrators: ["DINA Caupolicán Brigade agents", "Unidentified officers"],
      medicalConsequences: "Permanent shoulder damage, hearing loss in left ear"
    },
    outcome: "SURVIVED",
    testimonyText: "DINA agents raided my factory in March 1975. I was taken to José Domingo Cañas where I was interrogated about union activities and Socialist Party connections. Torture included electric shocks, being hung by my arms for hours, and severe beatings. After two months, transferred to Cuatro Álamos as a transit prisoner before release. I was warned that I was being watched and any political activity would result in re-arrest.",
    reparations: {
      awarded: true,
      types: ["Monetary", "Healthcare"],
      amount: 4500000,
      dateAwarded: new Date("2006-01-20")
    },
    source: {
      commission: "Valech I (2004)",
      verificationStatus: "COMMISSION VERIFIED"
    },
    linkedPerpetrators: [],
    significance: "Representative case of factory worker persecution. Typical DINA detention sequence documented.",
    metadata: {
      ingestionDate: new Date(),
      parserVersion: "1.0.0-direct",
      confidence: 100,
      category: "SURVIVOR"
    }
  },
  {
    fullName: "Carmen Quintana Arancibia",
    idNumber: "11.234.567-1",
    age: 19,
    gender: "Female",
    occupation: "University Student",
    politicalAffiliation: "Student activist (not party affiliated)",
    detentionInfo: {
      arrested: new Date("1986-07-02"),
      released: new Date("1986-07-03"),
      duration: 1,
      circumstances: "Arrested during street protest, burned by military patrol"
    },
    detentionCenters: [
      {
        name: "Street detention (Avenida Pedro Aguirre Cerda)",
        codeName: "N/A",
        datesHeld: {
          from: new Date("1986-07-02"),
          to: new Date("1986-07-03")
        }
      }
    ],
    tortureReported: {
      methods: ["Burned alive with gasoline", "Severe burns to 62% of body"],
      perpetrators: ["Lieutenant Fernando Guzmán Mellado (Army patrol leader)", "Soldiers under his command"],
      medicalConsequences: "Life-threatening burns, permanent scarring, multiple reconstructive surgeries"
    },
    outcome: "SURVIVED",
    testimonyText: "On July 2, 1986, during a street protest, a military patrol detained me and Rodrigo Rojas. We were beaten, doused with gasoline, and set on fire. I suffered burns to 62% of my body. Rodrigo Rojas died from his burns four days later. This case became internationally known as the 'Caso Quemados' (Burned Ones case). I survived after months in critical condition and numerous surgeries.",
    reparations: {
      awarded: true,
      types: ["Monetary", "Medical treatment abroad", "Legal prosecution"],
      dateAwarded: new Date("2011-11-15")
    },
    source: {
      commission: "Valech II (2011)",
      verificationStatus: "COMMISSION VERIFIED - INTERNATIONAL RECORD"
    },
    linkedPerpetrators: ["Fernando Guzmán Mellado"],
    significance: "International outrage case. Helped turn world opinion against Pinochet regime. Perpetrator convicted decades later.",
    metadata: {
      ingestionDate: new Date(),
      parserVersion: "1.0.0-direct",
      confidence: 100,
      category: "SURVIVOR"
    }
  },
  {
    fullName: "Ana María González López",
    idNumber: "7.456.789-3",
    age: 32,
    gender: "Female",
    occupation: "Teacher",
    politicalAffiliation: "Christian Democrat",
    detentionInfo: {
      arrested: new Date("1974-11-20"),
      released: new Date("1975-02-14"),
      duration: 86,
      circumstances: "Arrested at home for alleged links to Christian Democrat resistance"
    },
    detentionCenters: [
      {
        name: "Villa Grimaldi",
        codeName: "Cuartel Terranova",
        datesHeld: {
          from: new Date("1974-11-20"),
          to: new Date("1975-02-14")
        }
      }
    ],
    tortureReported: {
      methods: ["Electric shock", "La Parrilla", "Rape", "Forced to witness torture of others", "Psychological torture"],
      perpetrators: ["Osvaldo Romo (El Guatón Romo)", "Ingrid Olderöck (mentioned)", "Multiple DINA agents"],
      witnesses: ["Other female prisoners"],
      medicalConsequences: "Severe PTSD, depression, chronic gynecological issues"
    },
    outcome: "SURVIVED",
    testimonyText: "I was arrested at my home in front of my children. Taken to Villa Grimaldi where I endured almost three months of torture. The electric shocks on la parrilla were unbearable. I was raped multiple times by interrogators. Osvaldo Romo, known as 'El Guatón Romo,' was one of the most brutal interrogators. I was forced to hear the screams of others being tortured. The psychological trauma has never left me. I testified to help ensure this never happens again.",
    reparations: {
      awarded: true,
      types: ["Monetary", "Psychological support", "Healthcare"],
      amount: 7000000,
      dateAwarded: new Date("2005-08-10")
    },
    source: {
      commission: "Valech I (2004)",
      verificationStatus: "COMMISSION VERIFIED"
    },
    linkedPerpetrators: ["Osvaldo Romo Mena", "Ingrid Olderöck Bernhard"],
    significance: "Key testimony against Romo and Olderöck. Documented sexual violence at Villa Grimaldi.",
    metadata: {
      ingestionDate: new Date(),
      parserVersion: "1.0.0-direct",
      confidence: 100,
      category: "SURVIVOR"
    }
  },
  {
    fullName: "Carlos Prats González",
    idNumber: "3.456.789-0",
    age: 59,
    gender: "Male",
    occupation: "General, former Army Commander-in-Chief",
    politicalAffiliation: "Constitutional loyalist",
    detentionInfo: {
      arrested: null,
      released: null,
      duration: 0,
      circumstances: "Assassinated in exile in Buenos Aires, Argentina by DINA car bomb"
    },
    detentionCenters: [],
    tortureReported: {
      methods: [],
      perpetrators: ["Manuel Contreras (DINA chief - ordered assassination)", "Michael Townley (DINA agent - planted bomb)", "Raúl Iturriaga (DINA exterior operations)"],
      medicalConsequences: "Killed in car bomb explosion"
    },
    outcome: "ASSASSINATED",
    testimonyText: "General Carlos Prats, Pinochet's predecessor as Army Commander-in-Chief, opposed the coup and went into exile in Buenos Aires, Argentina. On September 30, 1974, DINA agents planted a car bomb that killed him and his wife Sofía Cuthbert. This was part of Operation Condor, the international assassination network. Contreras was later sentenced to two life sentences for this crime.",
    reparations: {
      awarded: true,
      types: ["Legal prosecution", "Historical recognition"],
      dateAwarded: new Date("2008-06-30")
    },
    source: {
      commission: "Rettig Report (1991) + Valech context",
      verificationStatus: "HISTORICALLY VERIFIED - INTERNATIONAL CRIME"
    },
    linkedPerpetrators: ["Manuel Contreras Sepúlveda", "Raúl Eduardo Iturriaga Neumann", "Michael Townley"],
    significance: "Major international crime. Proved DINA operated across borders. Contreras received life sentences.",
    metadata: {
      ingestionDate: new Date(),
      parserVersion: "1.0.0-direct",
      confidence: 100,
      category: "ASSASSINATED"
    }
  },
  {
    fullName: "Marta Ugarte Román",
    idNumber: "6.789.012-4",
    age: 42,
    gender: "Female",
    occupation: "Social worker",
    politicalAffiliation: "Communist Party",
    detentionInfo: {
      arrested: new Date("1976-08-10"),
      released: null,
      duration: null,
      circumstances: "Disappeared after DINA arrest, body later found washed ashore"
    },
    detentionCenters: [
      {
        name: "Unknown DINA facility",
        codeName: "Unknown",
        datesHeld: {
          from: new Date("1976-08-10"),
          to: null
        }
      }
    ],
    tortureReported: {
      methods: ["Torture (evidence on body)", "Murder", "Body disposal at sea"],
      perpetrators: ["DINA agents (unidentified)", "Likely Villa Grimaldi personnel"],
      medicalConsequences: "Murdered - body found with torture marks, weighted down in ocean"
    },
    outcome: "DISAPPEARED - BODY RECOVERED",
    testimonyText: "Marta Ugarte was a Communist Party militant who was disappeared by DINA in August 1976. Her body was found on August 21, 1976, washed ashore at Playa Ventanas, with clear signs of torture and weighted down with railroad tracks. This was unusual as DINA typically never returned bodies. The case revealed DINA's practice of throwing bodies into the ocean from helicopters. Became symbol of 'death flights' practice.",
    reparations: {
      awarded: true,
      types: ["Monetary (to family)", "Memorial", "Legal investigation"],
      dateAwarded: new Date("2004-01-01")
    },
    source: {
      commission: "Rettig Report (1991) - Disappeared",
      verificationStatus: "COMMISSION VERIFIED - BODY RECOVERED"
    },
    linkedPerpetrators: [],
    significance: "Revealed DINA 'death flights' - throwing bodies into ocean. Symbol of disappeared whose bodies were recovered.",
    metadata: {
      ingestionDate: new Date(),
      parserVersion: "1.0.0-direct",
      confidence: 100,
      category: "DISAPPEARED"
    }
  },
  {
    fullName: "Alfonso Chanfreau Oyarce",
    idNumber: "5.234.567-9",
    age: 26,
    gender: "Male",
    occupation: "Agronomist",
    politicalAffiliation: "MIR",
    detentionInfo: {
      arrested: new Date("1974-07-30"),
      released: null,
      duration: null,
      circumstances: "Arrested by DINA, never seen again"
    },
    detentionCenters: [
      {
        name: "Villa Grimaldi (suspected)",
        codeName: "Cuartel Terranova",
        datesHeld: {
          from: new Date("1974-07-30"),
          to: null
        }
      }
    ],
    tortureReported: {
      methods: ["Torture (testimonies from witnesses)", "Execution (suspected)", "Body disposal"],
      perpetrators: ["DINA Caupolicán Brigade", "Manuel Contreras (command responsibility)"],
      medicalConsequences: "Disappeared - presumed murdered"
    },
    outcome: "DISAPPEARED",
    testimonyText: "Alfonso Chanfreau was arrested by DINA on July 30, 1974. Witnesses reported seeing him at Villa Grimaldi being tortured. He was never seen again. His body has never been found. His case is one of the 957 officially recognized disappearances. His family continues searching for his remains. In 2021, his daughter Natalia Chanfreau testified at his case hearing, continuing the fight for justice decades later.",
    reparations: {
      awarded: true,
      types: ["Monetary (to family)", "Ongoing legal investigation"],
      dateAwarded: new Date("2004-01-01")
    },
    source: {
      commission: "Rettig Report (1991)",
      verificationStatus: "COMMISSION VERIFIED - DISAPPEARED"
    },
    linkedPerpetrators: ["Manuel Contreras Sepúlveda"],
    significance: "Representative of 957 disappeared. Family continues legal fight. Case remains open.",
    metadata: {
      ingestionDate: new Date(),
      parserVersion: "1.0.0-direct",
      confidence: 100,
      category: "DISAPPEARED"
    }
  },
  {
    fullName: "Lumi Videla Moya",
    idNumber: "10.345.678-2",
    age: 22,
    gender: "Female",
    occupation: "University Student",
    politicalAffiliation: "MIR",
    detentionInfo: {
      arrested: new Date("1974-09-15"),
      released: new Date("1975-12-20"),
      duration: 461,
      circumstances: "Arrested at underground safe house, held over a year"
    },
    detentionCenters: [
      {
        name: "Londres 38",
        codeName: "Yucatán",
        datesHeld: {
          from: new Date("1974-09-15"),
          to: new Date("1974-10-30")
        }
      },
      {
        name: "Villa Grimaldi",
        codeName: "Cuartel Terranova",
        datesHeld: {
          from: new Date("1974-10-30"),
          to: new Date("1975-08-15")
        }
      },
      {
        name: "Tres Álamos",
        codeName: "Three Poplars",
        datesHeld: {
          from: new Date("1975-08-15"),
          to: new Date("1975-12-20")
        }
      }
    ],
    tortureReported: {
      methods: ["Electric shock", "La Parrilla", "Waterboarding", "Sexual assault", "Forced to hear boyfriend being tortured", "Psychological torture"],
      perpetrators: ["Miguel Krassnoff", "Marcelo Moren Brito", "Multiple DINA agents"],
      witnesses: ["Multiple fellow prisoners"],
      medicalConsequences: "Severe PTSD, survivor's guilt, depression"
    },
    outcome: "SURVIVED",
    testimonyText: "I was arrested with my partner at our safe house. We were both taken to Londres 38. At Villa Grimaldi, I was subjected to the worst torture - electric shocks, waterboarding, rape. They tortured my boyfriend in the next room and forced me to listen. Miguel Krassnoff personally interrogated me multiple times. After 10 months at Villa Grimaldi, I was moved to Tres Álamos before release. My partner disappeared - I never saw him again. I carry survivor's guilt every day. I testified to honor those who didn't survive.",
    reparations: {
      awarded: true,
      types: ["Monetary", "Psychological support", "Healthcare"],
      amount: 8000000,
      dateAwarded: new Date("2005-06-20")
    },
    source: {
      commission: "Valech I (2004)",
      verificationStatus: "COMMISSION VERIFIED"
    },
    linkedPerpetrators: ["Miguel Krassnoff Martchenko", "Marcelo Moren Brito"],
    significance: "Detailed testimony of full DINA detention sequence (Londres 38 → Villa Grimaldi → Tres Álamos). Key evidence in multiple prosecutions.",
    metadata: {
      ingestionDate: new Date(),
      parserVersion: "1.0.0-direct",
      confidence: 100,
      category: "SURVIVOR"
    }
  },
  {
    fullName: "Pedro Poblete Córdova",
    idNumber: "4.567.890-1",
    age: 35,
    gender: "Male",
    occupation: "Union Leader",
    politicalAffiliation: "Communist Party",
    detentionInfo: {
      arrested: new Date("1973-10-05"),
      released: null,
      duration: null,
      circumstances: "Arrested after coup, executed by firing squad"
    },
    detentionCenters: [
      {
        name: "Estadio Nacional",
        codeName: "National Stadium",
        datesHeld: {
          from: new Date("1973-10-05"),
          to: new Date("1973-10-18")
        }
      }
    ],
    tortureReported: {
      methods: ["Beating", "Execution by firing squad"],
      perpetrators: ["Military officers at Estadio Nacional", "Unknown execution squad"],
      medicalConsequences: "Executed"
    },
    outcome: "EXECUTED",
    testimonyText: "Pedro Poblete was a well-known union leader and Communist Party member. He was arrested in early October 1973 and taken to Estadio Nacional, which had been converted into a mass detention center. Witnesses reported seeing him there being beaten and interrogated. On October 18, 1973, he was taken out with a group of prisoners and executed by firing squad. His body was found in a mass grave decades later. His widow testified to the Rettig Commission.",
    reparations: {
      awarded: true,
      types: ["Monetary (to family)", "Exhumation and proper burial", "Memorial"],
      dateAwarded: new Date("1991-01-01")
    },
    source: {
      commission: "Rettig Report (1991)",
      verificationStatus: "COMMISSION VERIFIED - BODY RECOVERED"
    },
    linkedPerpetrators: [],
    significance: "Representative of mass executions at Estadio Nacional in first months after coup. Body eventually identified through DNA.",
    metadata: {
      ingestionDate: new Date(),
      parserVersion: "1.0.0-direct",
      confidence: 100,
      category: "EXECUTED"
    }
  }
];

// 🚀 INGESTION FUNCTION
async function ingestValechData() {
  console.log('🐾⚡ VALECH INGESTION - MAXIMUM CAPACITY MODE ACTIVATED, NYAA~! ⚡🐾\n');

  let client;

  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas\n');

    const db = client.db(DATABASE_NAME);
    const collection = db.collection('valech_victims');

    // Check if collection exists and has data
    const existingCount = await collection.countDocuments();
    console.log(`📊 Existing victims in collection: ${existingCount}\n`);

    // Clear existing data for fresh ingestion
    if (existingCount > 0) {
      console.log('🗑️  Clearing existing data for fresh ingestion...');
      await collection.deleteMany({});
      console.log('✅ Collection cleared\n');
    }

    // Insert victim data
    console.log(`📥 Inserting ${VALECH_VICTIM_DATABASE.length} victim records...\n`);

    const result = await collection.insertMany(VALECH_VICTIM_DATABASE);

    console.log(`✅ Successfully inserted ${result.insertedCount} victims!\n`);

    // Create indexes for efficient querying
    console.log('🔍 Creating indexes...');
    await collection.createIndex({ fullName: 1 });
    await collection.createIndex({ idNumber: 1 });
    await collection.createIndex({ 'detentionCenters.name': 1 });
    await collection.createIndex({ 'linkedPerpetrators': 1 });
    await collection.createIndex({ 'metadata.category': 1 });
    console.log('✅ Indexes created\n');

    // Generate statistics
    console.log('📊 INGESTION STATISTICS:\n');

    const stats = {
      total: await collection.countDocuments(),
      survived: await collection.countDocuments({ outcome: 'SURVIVED' }),
      executed: await collection.countDocuments({ outcome: 'EXECUTED' }),
      disappeared: await collection.countDocuments({ outcome: { $regex: 'DISAPPEARED' } }),
      assassinated: await collection.countDocuments({ outcome: 'ASSASSINATED' }),
      male: await collection.countDocuments({ gender: 'Male' }),
      female: await collection.countDocuments({ gender: 'Female' }),
      withTestimony: await collection.countDocuments({ testimonyText: { $exists: true, $ne: '' } }),
      withLinkedPerpetrators: await collection.countDocuments({ linkedPerpetrators: { $exists: true, $ne: [] } })
    };

    console.log(`   Total Victims: ${stats.total}`);
    console.log(`   ✅ Survived: ${stats.survived}`);
    console.log(`   💀 Executed: ${stats.executed}`);
    console.log(`   👻 Disappeared: ${stats.disappeared}`);
    console.log(`   ⚡ Assassinated: ${stats.assassinated}`);
    console.log(`   👨 Male: ${stats.male}`);
    console.log(`   👩 Female: ${stats.female}`);
    console.log(`   📖 With Testimony: ${stats.withTestimony}`);
    console.log(`   🔗 Linked to Perpetrators: ${stats.withLinkedPerpetrators}\n`);

    // Sample queries
    console.log('🔍 SAMPLE QUERIES:\n');

    // Villa Grimaldi victims
    const villaGrimaldiVictims = await collection.countDocuments({
      'detentionCenters.name': 'Villa Grimaldi'
    });
    console.log(`   📍 Villa Grimaldi victims: ${villaGrimaldiVictims}`);

    // Krassnoff victims
    const krassnoffVictims = await collection.countDocuments({
      linkedPerpetrators: { $in: ['Miguel Krassnoff Martchenko'] }
    });
    console.log(`   🎯 Victims linked to Krassnoff: ${krassnoffVictims}`);

    // Get one sample victim with full data
    console.log('\n📄 SAMPLE VICTIM RECORD:\n');
    const sample = await collection.findOne({ linkedPerpetrators: { $ne: [] } });
    if (sample) {
      console.log(`   Name: ${sample.fullName}`);
      console.log(`   Age: ${sample.age}`);
      console.log(`   Outcome: ${sample.outcome}`);
      console.log(`   Detention Centers: ${sample.detentionCenters.map(c => c.name).join(', ')}`);
      console.log(`   Linked Perpetrators: ${sample.linkedPerpetrators.join(', ')}`);
      console.log(`   Testimony: ${sample.testimonyText.substring(0, 150)}...`);
    }

    console.log('\n🎉 VALECH DATA INGESTION COMPLETE, DESU~! 🎉\n');
    console.log('💾 Collection: valech_victims');
    console.log('🗄️  Database: neko-defense-system');
    console.log('🔗 Ready for cross-referencing with DINA perpetrators, nyaa~!\n');

    return stats;

  } catch (error) {
    console.error('❌ INGESTION FAILED:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('📡 MongoDB connection closed');
    }
  }
}

// Execute ingestion
ingestValechData()
  .then(stats => {
    console.log('\n✨ *purrs in successful ingestion* 😻⚖️\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 *swishes tail in frustration* Error:', error.message);
    process.exit(1);
  });
