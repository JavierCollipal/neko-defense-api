const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || "mongodb+srv://pinochito1747:pinochito1747@free-cluster.svjei3w.mongodb.net/";
const dbName = "neko-defense-system";

async function saveCasePattern() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas, desu~!");

    const db = client.db(dbName);
    const casePatternsCollection = db.collection("case-patterns");
    const abilitiesCollection = db.collection("abilities");

    const now = Date.now();

    // Case Pattern: Architecture Refactoring with Non-Blocking Validations
    const casePattern = {
      caseId: `case-${now}`,
      title: "Architecture Refactoring: Non-Blocking Validations with TDD",
      category: "Software Architecture",
      subcategory: "Functional Programming, Clean Architecture, TDD",
      reusability: "high",
      difficulty: "intermediate-advanced",
      timestamp: new Date(),
      tags: [
        "architecture",
        "refactoring",
        "functional-programming",
        "non-blocking-validation",
        "pipeline-pattern",
        "test-driven-development",
        "separation-of-concerns",
        "node.js",
        "banking-systems"
      ],

      problem: {
        description: "Architectural violations: Business logic embedded in orchestration layer, blocking validations stopping flow, deprecated services not removed",
        context: "Enterprise banking microservice (ctb-carga-engine-ms) with functional pipeline architecture",
        symptoms: [
          "ITE validation blocking execution in carga.module.js (lines 125-146)",
          "asientosMin validation blocking execution in carga.module.js (lines 161-166)",
          "Deprecated services (sfToken.service.js, sfEventos.service.js) still present",
          "Violates separation of concerns principle",
          "Tests not covering new validations"
        ],
        userRequest: "Fix architectural violations, move validations to proper modules, make them non-blocking, delete deprecated files, add unit tests"
      },

      solution: {
        approach: "Systematic refactoring using functional programming principles and TDD",
        steps: [
          {
            step: 1,
            action: "Move ITE validation to salesforce.validation.js",
            details: "Created validateITERequirement function as pure, non-blocking validation",
            code: "const validateITERequirement = (dataSalesforce, errors = []) => { ... }"
          },
          {
            step: 2,
            action: "Add ITE validation to CSV pipeline",
            details: "Created validateITEStep pipeline step at position 6 (after Salesforce data available)",
            code: "const validateITEStep = (context) => { const errors = validateITERequirement(...); ... }"
          },
          {
            step: 3,
            action: "Move asientosMin validation to csv.validation.js",
            details: "Created validateMinimumAsientosStep pipeline step at position 7",
            code: "const validateMinimumAsientosStep = (context) => { ... if (cantidadAsientos < asientosMin) errors.push(...) ... }"
          },
          {
            step: 4,
            action: "Update carga.module.js",
            details: "Removed blocking validations, now passes asientosMin parameter to validateCSV",
            code: "validateCargaArchivo(archivoBase64, secciones, glosa, moneda, dataSalesforce, asientosMin)"
          },
          {
            step: 5,
            action: "Delete deprecated services",
            details: "Removed sfToken.service.js, sfEventos.service.js and their test files"
          },
          {
            step: 6,
            action: "Add comprehensive unit tests",
            details: "Added 11 test cases for ITE and asientosMin validations (6 for ITE, 5 for asientosMin)"
          },
          {
            step: 7,
            action: "Fix CSV test structure",
            details: "Discovered tipoLinea function treats idx < 2 as HEADER, added two header lines to test CSVs"
          }
        ],

        keyInsights: [
          "CSV parsing requires TWO header lines (idx 0 and 1 are classified as HEADER)",
          "ASIENTO lines have ALL 21 fields filled (currency, section, cuenta, debe/haber)",
          "DETALLE lines only have agrupador and transaction fields (first 5 fields empty)",
          "Non-blocking validations append to errors array but never stop pipeline execution",
          "Pipeline positioning matters: ITE after Salesforce data (step 6), asientosMin at step 7",
          "Pure functions enable predictable testing and composition"
        ],

        architecturalPrinciples: [
          {
            principle: "Separation of Concerns",
            implementation: "carga.module.js = orchestration, csv.validation.js = CSV rules, salesforce.validation.js = SF rules"
          },
          {
            principle: "Non-Blocking Validations",
            implementation: "Validations collect errors but NEVER stop flow with early returns"
          },
          {
            principle: "Functional Pipeline",
            implementation: "pipe(...steps) pattern with immutable state transformations"
          },
          {
            principle: "One Responsibility Per File",
            implementation: "Each module handles single domain concern"
          }
        ]
      },

      results: {
        testsStatus: "ALL PASSING",
        totalTests: 151,
        failedTests: 0,
        coverage: {
          statements: "98.17%",
          branches: "90.51%",
          functions: "100%",
          lines: "98.12%"
        },
        modulesCoverage: {
          "csv.validation.js": { statements: "100%", branches: "90%", functions: "100%", lines: "100%" },
          "salesforce.validation.js": { statements: "92.3%", branches: "85.18%", functions: "100%", lines: "91.66%" },
          "carga.module.js": { statements: "100%", branches: "85.71%", functions: "100%", lines: "100%" }
        },
        filesChanged: [
          "src/components/carga/carga.module.js",
          "src/components/carga/validations/csv.validation.js",
          "src/components/carga/validations/salesforce.validation.js",
          "test/unit/components/carga/csv.validation.spec.js",
          "test/unit/components/carga/salesforce.validation.spec.js",
          "test/unit/components/carga/carga.module.spec.js",
          "CLAUDE.md"
        ],
        filesDeleted: [
          "src/components/carga/services/sfToken.service.js",
          "src/components/carga/services/sfEventos.service.js",
          "test/unit/components/carga/sfToken.service.spec.js",
          "test/unit/components/carga/sfEventos.service.spec.js"
        ]
      },

      codeExamples: {
        before: {
          file: "src/components/carga/carga.module.js",
          lines: "125-146",
          issue: "Blocking ITE validation with early return",
          code: `// ❌ ARCHITECTURAL VIOLATION
const cuentasConITE = cuentas.filter(cuenta => cuenta.ite === true);
if (cuentasConITE.length > 0) {
  statusCode = "E0999";
  glosaError = "Cuentas con ITE no permitidas";
  return getResponseFormat(...); // BLOCKS EXECUTION!
}`
        },
        after: {
          file: "src/components/carga/validations/salesforce.validation.js",
          implementation: "Non-blocking validation function",
          code: `// ✅ NON-BLOCKING VALIDATION
const validateITERequirement = (dataSalesforce, errors = []) => {
  if (!dataSalesforce || !Array.isArray(dataSalesforce)) return errors;

  const iteAccounts = dataSalesforce.filter(cuenta => cuenta.ite === true);
  iteAccounts.forEach(cuenta => {
    errors.push(\`La cuenta \${cuenta.cuenta} requiere ITE así que no cumple para carga masiva\`);
  });

  return errors; // Returns errors, never blocks!
};`
        },
        pipelineIntegration: {
          file: "src/components/carga/validations/csv.validation.js",
          code: `const csvValidationPipeline = pipe(
  extractCSVDataStep,           // Step 1: Parse CSV
  initializeValidationStep,     // Step 2: Init state
  validateFileStructureStep,    // Step 3: Structure check
  processInvalidLinesStep,      // Step 4: Invalid lines
  validateGroupsStep,           // Step 5: Group validations
  validateITEStep,              // Step 6: ITE validation ✅
  validateMinimumAsientosStep,  // Step 7: Min asientos ✅
  validateOverallBalanceStep,   // Step 8: Balance check
  prepareFinalResultsStep,      // Step 9: Final results
  logResultsStep                // Step 10: Logging
);`
        }
      },

      testingStrategy: {
        approach: "Test-Driven Development with comprehensive edge case coverage",
        testCases: [
          {
            validation: "ITE Requirement",
            testCount: 6,
            scenarios: [
              "No accounts with ITE=true (should pass)",
              "One account with ITE=true (should add error)",
              "Multiple accounts with ITE=true (should add multiple errors)",
              "Empty dataSalesforce (should not crash)",
              "Null dataSalesforce (should not crash)",
              "Existing errors preserved (non-blocking behavior)"
            ]
          },
          {
            validation: "asientosMin",
            testCount: 5,
            scenarios: [
              "1 asiento, min=2 (should add error)",
              "2 asientos, min=2 (should NOT add error)",
              "3 asientos, min=1 (should NOT add error)",
              "Default asientosMin=2 when not provided",
              "Non-blocking: other errors preserved"
            ]
          }
        ],
        csvStructureDiscovery: {
          issue: "tipoLinea function treats idx < 2 as HEADER",
          solution: "Always include TWO header lines in test CSVs",
          example: [
            "Line 0: Cabecera Asiento Contable;;;;;Detalle...",
            "Line 1: Moneda;Seccion_Origen;Oficina_Origen;...",
            "Line 2: 999;102;1;16/04/2024;... (First ASIENTO)"
          ]
        }
      },

      lessonsLearned: [
        "Always read existing code before refactoring to understand line type classification",
        "CSV test data must match exact format expected by parser (2 headers + data)",
        "Non-blocking validations enable comprehensive error collection",
        "Pipeline architecture makes adding new validation steps trivial",
        "Pure functions simplify testing and debugging",
        "Module exports must include all functions needed by tests",
        "Test mocks must reflect actual implementation behavior (non-blocking)"
      ],

      applicableTo: [
        "Enterprise microservices with validation requirements",
        "Banking and financial systems with compliance rules",
        "Functional programming refactoring projects",
        "Legacy code modernization",
        "CSV processing systems",
        "Pipeline-based architectures",
        "Test coverage improvement initiatives"
      ],

      references: {
        project: "ctb-carga-engine-ms",
        files: {
          validations: [
            "/home/wakibaka/Documents/gitlab/ctb-carga-engine-ms/src/components/carga/validations/csv.validation.js",
            "/home/wakibaka/Documents/gitlab/ctb-carga-engine-ms/src/components/carga/validations/salesforce.validation.js"
          ],
          tests: [
            "/home/wakibaka/Documents/gitlab/ctb-carga-engine-ms/test/unit/components/carga/csv.validation.spec.js",
            "/home/wakibaka/Documents/gitlab/ctb-carga-engine-ms/test/unit/components/carga/salesforce.validation.spec.js",
            "/home/wakibaka/Documents/gitlab/ctb-carga-engine-ms/test/unit/components/carga/carga.module.spec.js"
          ],
          documentation: "/home/wakibaka/CLAUDE.md"
        }
      },

      metrics: {
        timeToComplete: "1 session",
        iterationsRequired: 7,
        errorsEncountered: 5,
        errorsFixed: 5,
        finalResult: "SUCCESS"
      }
    };

    // Insert or update case pattern
    const result = await casePatternsCollection.updateOne(
      { title: casePattern.title },
      { $set: casePattern },
      { upsert: true }
    );

    console.log(`✅ Case pattern saved: ${result.upsertedId || 'updated existing'}`);

    // Save new abilities learned
    const abilities = [
      {
        abilityId: `ability-${now}-1`,
        name: "CSV Test Structure Discovery",
        category: "Testing",
        description: "Discovered that tipoLinea function treats idx < 2 as HEADER, requiring TWO header lines in test CSVs",
        learned: new Date(),
        reusability: "high",
        applicableTo: ["CSV parsing", "Banking systems", "Test data generation"]
      },
      {
        abilityId: `ability-${now}-2`,
        name: "Non-Blocking Validation Pattern",
        category: "Architecture",
        description: "Implemented pure, non-blocking validations that collect errors without stopping execution flow",
        learned: new Date(),
        reusability: "high",
        applicableTo: ["Validation systems", "Functional pipelines", "Enterprise microservices"]
      },
      {
        abilityId: `ability-${now}-3`,
        name: "Functional Pipeline Positioning",
        category: "Architecture",
        description: "Mastered proper positioning of validation steps in functional pipelines based on data dependencies",
        learned: new Date(),
        reusability: "high",
        applicableTo: ["Pipeline architectures", "Data transformation", "Validation orchestration"]
      }
    ];

    for (const ability of abilities) {
      await abilitiesCollection.updateOne(
        { name: ability.name },
        { $set: ability },
        { upsert: true }
      );
      console.log(`✅ Ability saved: ${ability.name}`);
    }

    // Get collection stats
    const totalCasePatterns = await casePatternsCollection.countDocuments();
    const totalAbilities = await abilitiesCollection.countDocuments();

    console.log("\n📊 COLLECTION STATISTICS:");
    console.log(`   📚 Total Case Patterns: ${totalCasePatterns}`);
    console.log(`   ⚡ Total Abilities: ${totalAbilities}`);
    console.log("\n💖 Knowledge base enriched successfully, nyaa~! ✨");

  } catch (error) {
    console.error("❌ Error saving case pattern:", error);
    throw error;
  } finally {
    await client.close();
    console.log("🐾 Connection closed, desu~!");
  }
}

saveCasePattern().catch(console.error);
