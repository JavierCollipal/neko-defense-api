// 🐾🌍 NEKO DEFENSE API - Translation Service with MongoDB Caching 🌍🐾
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Db, ObjectId } from 'mongodb';

// Import Google Translate (using dynamic import for ES module)
let translate: any;
import('@vitalets/google-translate-api').then((module) => {
  translate = module.default || module.translate;
});

/**
 * 🌐 Translation Service Configuration
 *
 * Supported Languages:
 * - en: English (default)
 * - es: Spanish (Español)
 * - zh: Chinese (中文)
 * - hi: Hindi (हिन्दी)
 * - ar: Arabic (العربية)
 */

export const SUPPORTED_LANGUAGES = ['en', 'es', 'zh', 'hi', 'ar'];
export const DEFAULT_LANGUAGE = 'en';

export interface TranslationContext {
  language: string;
  userId?: string;
}

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private readonly db: Db;

  constructor(@InjectConnection() private readonly connection: Connection) {
    this.db = this.connection.db; // Get native MongoDB Db from Mongoose connection
    this.logger.log('🌍 Translation service initialized, nyaa~!');
  }

  /**
   * 🎯 Translate a single text string
   */
  async translateText(
    text: string,
    targetLang: string,
    sourceLang = 'en',
  ): Promise<string> {
    try {
      // If target language is English or same as source, no translation needed
      if (targetLang === sourceLang || targetLang === 'en') {
        return text;
      }

      // Validate language support
      if (!SUPPORTED_LANGUAGES.includes(targetLang)) {
        this.logger.warn(
          `⚠️ Unsupported language: ${targetLang}, falling back to English`,
        );
        return text;
      }

      // Skip null/undefined/empty text
      if (!text || typeof text !== 'string') {
        return text;
      }

      // Wait for translate to be loaded
      while (!translate) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Perform translation
      const result = await translate(text, { from: sourceLang, to: targetLang });
      return result.text;
    } catch (error) {
      this.logger.error(`❌ Failed to translate text: ${error.message}`);
      return text; // Return original text on error
    }
  }

  /**
   * 🔄 Translate an array of strings
   */
  async translateArray(
    textArray: string[],
    targetLang: string,
    sourceLang = 'en',
  ): Promise<string[]> {
    if (!Array.isArray(textArray)) {
      return textArray;
    }

    const translations = await Promise.all(
      textArray.map((text) => this.translateText(text, targetLang, sourceLang)),
    );

    return translations;
  }

  /**
   * 🔄 Translate nested object fields
   */
  async translateObject(
    obj: any,
    targetLang: string,
  ): Promise<any> {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const translated: any = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        translated[key] = await this.translateText(value, targetLang);
      } else if (Array.isArray(value)) {
        translated[key] = await this.translateArray(value, targetLang);
      } else {
        translated[key] = value; // Keep non-string values as-is
      }
    }

    return translated;
  }

  /**
   * 📦 Translate specific fields in a MongoDB document
   */
  async translateDocument(
    document: any,
    targetLang: string,
    collectionName: string,
  ): Promise<any> {
    try {
      // If target language is English, return original document
      if (targetLang === 'en') {
        return document;
      }

      // Check if translations already exist for this language
      if (document.translations && document.translations[targetLang]) {
        this.logger.log(`✅ Using cached translation for ${targetLang}`);
        return this.applyTranslations(document, document.translations[targetLang]);
      }

      this.logger.log(`🌐 Translating document to ${targetLang}, nyaa~!`);

      // Define fields to translate based on collection type
      const translatableFields = this.getTranslatableFields(collectionName);

      // Create translations object
      const translations: any = {};

      // Translate each field
      for (const field of translatableFields) {
        const value = document[field];

        if (!value) continue;

        if (Array.isArray(value)) {
          // Translate arrays
          translations[field] = await this.translateArray(value, targetLang);
        } else if (typeof value === 'string') {
          // Translate strings
          translations[field] = await this.translateText(value, targetLang);
        } else if (typeof value === 'object') {
          // Translate nested objects (e.g., origin.country)
          translations[field] = await this.translateObject(value, targetLang);
        }
      }

      // Save translations to MongoDB
      await this.saveTranslations(
        collectionName,
        document._id,
        targetLang,
        translations,
      );

      // Apply translations to document
      return this.applyTranslations(document, translations);
    } catch (error) {
      this.logger.error(`❌ Failed to translate document: ${error.message}`);
      return document; // Return original document on error
    }
  }

  /**
   * 📚 Translate an array of documents
   */
  async translateDocuments(
    documents: any[],
    targetLang: string,
    collectionName: string,
  ): Promise<any[]> {
    if (!Array.isArray(documents) || documents.length === 0) {
      return documents;
    }

    this.logger.log(
      `🌐 Translating ${documents.length} ${collectionName} to ${targetLang}`,
    );

    // Translate documents in parallel for better performance
    const translatedDocs = await Promise.all(
      documents.map((doc) =>
        this.translateDocument(doc, targetLang, collectionName),
      ),
    );

    return translatedDocs;
  }

  /**
   * 🗂️ Get translatable fields based on collection name
   */
  private getTranslatableFields(collectionName: string): string[] {
    const fieldMappings: Record<string, string[]> = {
      threat_actors: [
        'name',
        'categories',
        'targets',
        'attack_vectors',
        'major_crimes',
        'origin',
        'position',
        'classification',
      ],
      dina_perpetrators: [
        'fullName',
        'position',
        'major_crimes',
        'significance',
        'rank',
        'organization',
      ],
      dina_torture_centers: [
        'name',
        'location',
        'description',
        'known_for',
      ],
      dina_international_crimes: [
        'crime',
        'description',
        'location',
        'victims',
      ],
    };

    return fieldMappings[collectionName] || [];
  }

  /**
   * 💾 Save translations to MongoDB
   */
  private async saveTranslations(
    collectionName: string,
    documentId: ObjectId,
    targetLang: string,
    translations: any,
  ): Promise<void> {
    try {
      await this.db.collection(collectionName).updateOne(
        { _id: documentId },
        {
          $set: {
            [`translations.${targetLang}`]: translations,
            [`translations.${targetLang}_updated_at`]: new Date(),
          },
        },
      );
      this.logger.log(`✅ Saved ${targetLang} translations to MongoDB, desu~!`);
    } catch (error) {
      this.logger.error(`❌ Failed to save translations: ${error.message}`);
    }
  }

  /**
   * 🎨 Apply translations to document
   */
  private applyTranslations(document: any, translations: any): any {
    const translated = { ...document };

    for (const [field, value] of Object.entries(translations)) {
      if (field.endsWith('_updated_at')) continue; // Skip metadata fields
      translated[field] = value;
    }

    return translated;
  }

  /**
   * 🔍 Get user language from GraphQL context or JWT payload
   */
  getUserLanguage(context: any): string {
    // Try to get from GraphQL context (req.user.language from JWT)
    const userLang =
      context?.req?.user?.language ||
      context?.req?.query?.lang ||
      context?.req?.headers?.['x-user-language'] ||
      context?.req?.headers?.['accept-language'];

    if (userLang) {
      const lang = userLang.split(',')[0].split('-')[0].toLowerCase();
      if (SUPPORTED_LANGUAGES.includes(lang)) {
        return lang;
      }
    }

    // Default to English
    return DEFAULT_LANGUAGE;
  }

  /**
   * 🌍 Validate language code
   */
  isValidLanguage(lang: string): boolean {
    return SUPPORTED_LANGUAGES.includes(lang);
  }
}
