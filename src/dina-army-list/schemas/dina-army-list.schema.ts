/**
 * DINA Army List Schema - 2008 Submission to Judge Alejandro Solís
 *
 * Comprehensive schema for 1097 DINA (Dirección de Inteligencia Nacional) agents
 * from Chile's dictatorship period (1973-1977)
 *
 * Data Sources:
 * - 2008 Chilean Army submission to Judge Alejandro Solís (1097 agents)
 * - León Gómez Araneda compilation (521 agents, 1973-1975)
 * - CIPER Chile investigation (827 agents DINA/CNI)
 * - Memoria Viva organizational records
 *
 * Generated with Claude Code (Neko-Arc + Mario + Noel + Glam + Hannibal + Tetora)
 */

import { Schema, model, Document } from 'mongoose';

/**
 * DINA Agent Interface
 */
export interface IDINAArmyListAgent extends Document {
  // Core Identification
  agent_id: string;                    // Unique identifier
  full_name: string;                   // Complete name
  rut?: string;                        // Chilean national ID (if available)

  // Military Information
  rank: string;                        // Military rank (Coronel, Teniente, etc.)
  branch?: string;                     // Army, Navy, Air Force, Carabineros
  service_number?: string;             // Military service number

  // DINA Organizational Structure
  category: 'DINA_State_Staff' | 'Regional_Command' | 'Brigade' | 'Department' | 'Enlisted' | 'Other';
  region?: string;                     // Chilean region (I-XII, Metropolitan)
  brigade?: string;                    // Mulchén, Caupolicán, Lautaro, etc.
  department?: string;                 // Exterior, Electrónica, etc.
  position?: string;                   // Specific role/position
  position_number?: number;            // Position in hierarchy

  // Service Period
  service_period_start?: Date;         // Start date in DINA
  service_period_end?: Date;           // End date in DINA
  service_period_text?: string;        // Text description (e.g., "1973-1975")

  // Legal Status
  legal_status?: 'convicted' | 'indicted' | 'investigated' | 'at_large' | 'deceased' | 'unprosecuted' | 'unknown';
  convictions?: Array<{
    case_name: string;
    verdict: string;
    sentence?: string;
    date: Date;
  }>;
  investigations?: Array<{
    case_name: string;
    status: string;
    judge?: string;
  }>;

  // Post-DINA Career
  post_dina_positions?: Array<{
    institution: string;              // PDI, Carabineros, Army, etc.
    rank: string;
    position: string;
    period_start?: Date;
    period_end?: Date;
  }>;

  // Operations and Crimes
  known_operations?: string[];         // Operations participated in
  alleged_crimes?: string[];           // Human rights violations
  victims_linked?: string[];           // Names of victims

  // Data Sources
  data_sources: Array<{
    source_name: string;                // "2008 Army List", "León Gómez Araneda", etc.
    confidence: 'confirmed' | 'probable' | 'alleged';
    extracted_date: Date;
  }>;

  // Additional Information
  aliases?: string[];                  // Known aliases
  photo_url?: string;                  // Photo if available
  biographical_notes?: string;         // Additional context

  // Metadata
  created_at: Date;
  updated_at: Date;
  created_by: string;                  // "neko-arc", "data-migration", etc.
  verification_status: 'verified' | 'pending' | 'disputed';
}

/**
 * MongoDB Schema
 */
const DINAArmyListAgentSchema = new Schema<IDINAArmyListAgent>({
  // Core Identification
  agent_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  full_name: {
    type: String,
    required: true,
    index: true,
  },
  rut: {
    type: String,
    sparse: true,
    index: true,
  },

  // Military Information
  rank: {
    type: String,
    required: true,
    index: true,
  },
  branch: String,
  service_number: String,

  // DINA Organizational Structure
  category: {
    type: String,
    required: true,
    enum: ['DINA_State_Staff', 'Regional_Command', 'Brigade', 'Department', 'Enlisted', 'Other'],
    index: true,
  },
  region: {
    type: String,
    index: true,
  },
  brigade: {
    type: String,
    index: true,
  },
  department: String,
  position: String,
  position_number: Number,

  // Service Period
  service_period_start: Date,
  service_period_end: Date,
  service_period_text: String,

  // Legal Status
  legal_status: {
    type: String,
    enum: ['convicted', 'indicted', 'investigated', 'at_large', 'deceased', 'unprosecuted', 'unknown'],
    default: 'unknown',
    index: true,
  },
  convictions: [{
    case_name: String,
    verdict: String,
    sentence: String,
    date: Date,
  }],
  investigations: [{
    case_name: String,
    status: String,
    judge: String,
  }],

  // Post-DINA Career
  post_dina_positions: [{
    institution: String,
    rank: String,
    position: String,
    period_start: Date,
    period_end: Date,
  }],

  // Operations and Crimes
  known_operations: [String],
  alleged_crimes: [String],
  victims_linked: [String],

  // Data Sources
  data_sources: {
    type: [{
      source_name: String,
      confidence: {
        type: String,
        enum: ['confirmed', 'probable', 'alleged'],
      },
      extracted_date: Date,
    }],
    required: true,
  },

  // Additional Information
  aliases: [String],
  photo_url: String,
  biographical_notes: String,

  // Metadata
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  created_by: {
    type: String,
    default: 'data-migration',
  },
  verification_status: {
    type: String,
    enum: ['verified', 'pending', 'disputed'],
    default: 'pending',
    index: true,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'dina_army_list_agents',
});

// Indexes for performance
DINAArmyListAgentSchema.index({ full_name: 'text', biographical_notes: 'text' });
DINAArmyListAgentSchema.index({ category: 1, region: 1 });
DINAArmyListAgentSchema.index({ legal_status: 1, verification_status: 1 });
DINAArmyListAgentSchema.index({ created_at: -1 });

/**
 * Export schema for NestJS MongooseModule
 */
export { DINAArmyListAgentSchema };

/**
 * Model
 */
export const DINAArmyListAgent = model<IDINAArmyListAgent>('DINAArmyListAgent', DINAArmyListAgentSchema);

/**
 * Helper function to generate agent_id
 */
export function generateAgentId(fullName: string, rank: string): string {
  const namePart = fullName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  const timestamp = Date.now().toString(36);
  return `dina-${namePart}-${timestamp}`.substring(0, 100);
}
