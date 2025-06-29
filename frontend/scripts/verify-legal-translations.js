#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../public/locales');
const LANGUAGES = ['en', 'es', 'ru'];

function loadTranslations(lang) {
  const filePath = path.join(LOCALES_DIR, lang, 'translation.json');
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Translation file not found: ${filePath}`);
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`❌ Error parsing ${lang} translations:`, error.message);
    return null;
  }
}

function getNestedKeys(obj, prefix = '') {
  const keys = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys.push(...getNestedKeys(obj[key], newKey));
      } else {
        keys.push(newKey);
      }
    }
  }

  return keys;
}

function checkLegalTranslations() {
  console.log('🔍 Verifying legal translations completeness...\n');

  const translations = {};
  const allKeys = new Set();

  // Load all translations
  for (const lang of LANGUAGES) {
    translations[lang] = loadTranslations(lang);
    if (!translations[lang]) {
      return false;
    }

    // Get all keys from this language
    const keys = getNestedKeys(translations[lang]);
    keys.forEach(key => allKeys.add(key));
  }

  // Check for missing keys in each language
  let hasErrors = false;

  for (const lang of LANGUAGES) {
    console.log(`📋 Checking ${lang.toUpperCase()} translations:`);

    const langKeys = new Set(getNestedKeys(translations[lang]));
    const missingKeys = [];

    // Check for missing legal keys specifically
    const legalKeys = Array.from(allKeys).filter(key => key.startsWith('legal.'));

    for (const key of legalKeys) {
      if (!langKeys.has(key)) {
        missingKeys.push(key);
      }
    }

    if (missingKeys.length === 0) {
      console.log(`  ✅ All legal translations present (${legalKeys.length} keys)`);
    } else {
      console.log(`  ❌ Missing ${missingKeys.length} legal translation keys:`);
      missingKeys.forEach(key => console.log(`    - ${key}`));
      hasErrors = true;
    }

    // Check for specific legal content
    const requiredPaths = [
      'legal.privacyPolicy.content.commitmentText',
      'legal.privacyPolicy.content.accountInfo.items',
      'legal.privacyPolicy.content.portfolioData.items',
      'legal.privacyPolicy.content.dontCollect.items',
      'legal.termsOfService.content.agreementText',
      'legal.termsOfService.content.serviceDescription.educationalTool.title',
      'legal.termsOfService.content.userResponsibilities.accountSecurity.items',
      'legal.termsOfService.content.disclaimers.noFinancialAdvice.text',
    ];

    const missingContent = requiredPaths.filter(path => !langKeys.has(path));

    if (missingContent.length > 0) {
      console.log(`  ⚠️  Missing essential legal content:`);
      missingContent.forEach(path => console.log(`    - ${path}`));
      hasErrors = true;
    }

    console.log();
  }

  // Check for array completeness
  console.log('📊 Checking array translations consistency:');

  const arrayPaths = [
    'legal.privacyPolicy.content.accountInfo.items',
    'legal.privacyPolicy.content.portfolioData.items',
    'legal.privacyPolicy.content.dontCollect.items',
    'legal.termsOfService.content.userResponsibilities.accountSecurity.items',
    'legal.termsOfService.content.userResponsibilities.accurateInformation.items',
    'legal.termsOfService.content.userResponsibilities.appropriateUse.items',
  ];

  for (const arrayPath of arrayPaths) {
    const lengths = {};

    for (const lang of LANGUAGES) {
      const value = getNestedValue(translations[lang], arrayPath);
      if (Array.isArray(value)) {
        lengths[lang] = value.length;
      } else {
        lengths[lang] = 0;
      }
    }

    const uniqueLengths = new Set(Object.values(lengths));

    if (uniqueLengths.size === 1) {
      console.log(`  ✅ ${arrayPath}: ${Object.values(lengths)[0]} items in all languages`);
    } else {
      console.log(`  ❌ ${arrayPath}: Inconsistent array lengths`);
      for (const [lang, length] of Object.entries(lengths)) {
        console.log(`    - ${lang}: ${length} items`);
      }
      hasErrors = true;
    }
  }

  console.log();

  if (hasErrors) {
    console.log('❌ Translation verification failed! Please fix the missing translations.');
    return false;
  } else {
    console.log('✅ All legal translations are complete and consistent!');
    return true;
  }
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

// Run the verification
if (require.main === module) {
  const success = checkLegalTranslations();
  process.exit(success ? 0 : 1);
}

module.exports = { checkLegalTranslations };
