#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  srcDir: path.join(__dirname, '../src'),
  localesDir: path.join(__dirname, '../public/locales'),
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'es'],
  fileExtensions: ['.ts', '.tsx', '.js', '.jsx'],
  translationFileName: 'translation.json',
  deprecatedPrefix: '__DEPRECATED__'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Recursively get all files with specified extensions
function getAllFiles(dir, extensions = []) {
  let files = [];

  try {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files = files.concat(getAllFiles(fullPath, extensions));
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    log(`Error reading directory ${dir}: ${error.message}`, 'red');
  }

  return files;
}

// Extract i18n keys from file content
function extractI18nKeys(content) {
  const keys = new Set();

  // Regex patterns to match different t() usage patterns
  const patterns = [
    // t('key') or t("key")
    /\bt\(\s*['"`]([^'"`\)]+)['"`]\s*\)/g,
    // t('key', { ... }) or t("key", { ... })
    /\bt\(\s*['"`]([^'"`\)]+)['"`]\s*,/g,
    // Handle template strings with interpolation
    /\bt\(\s*`([^`\)]+)`\s*[\),]/g
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const key = match[1].trim();
      if (key && !key.includes('${') && !key.includes('{{')) {
        keys.add(key);
      }
    }
  }

  return Array.from(keys);
}

// Scan all source files for i18n keys
function scanSourceFiles() {
  log('Scanning source files for i18n keys...', 'blue');

  const files = getAllFiles(CONFIG.srcDir, CONFIG.fileExtensions);
  const usedKeys = new Set();
  const keyUsageMap = new Map(); // Track which files use which keys

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const keys = extractI18nKeys(content);

      keys.forEach(key => {
        usedKeys.add(key);
        if (!keyUsageMap.has(key)) {
          keyUsageMap.set(key, []);
        }
        keyUsageMap.get(key).push(path.relative(CONFIG.srcDir, file));
      });

      if (keys.length > 0) {
        log(`  ${path.relative(CONFIG.srcDir, file)}: ${keys.length} keys`, 'cyan');
      }
    } catch (error) {
      log(`Error reading file ${file}: ${error.message}`, 'red');
    }
  }

  log(`Found ${usedKeys.size} unique i18n keys in ${files.length} files`, 'green');
  return { usedKeys: Array.from(usedKeys), keyUsageMap };
}

// Load translation file
function loadTranslationFile(language) {
  const filePath = path.join(CONFIG.localesDir, language, CONFIG.translationFileName);

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    log(`Error loading translation file for ${language}: ${error.message}`, 'red');
    return {};
  }
}

// Save translation file
function saveTranslationFile(language, translations) {
  const filePath = path.join(CONFIG.localesDir, language, CONFIG.translationFileName);

  try {
    const content = JSON.stringify(translations, null, 2);
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    log(`Error saving translation file for ${language}: ${error.message}`, 'red');
    return false;
  }
}

// Flatten nested object keys
function flattenKeys(obj, prefix = '') {
  const keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

// Build nested object from flat key
function setNestedValue(obj, key, value) {
  const parts = key.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
}

// Get nested value from object
function getNestedValue(obj, key) {
  const parts = key.split('.');
  let current = obj;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }

  return current;
}

// Check if key is deprecated
function isDeprecatedKey(key) {
  return key.startsWith(CONFIG.deprecatedPrefix);
}

// Mark key as deprecated
function markAsDeprecated(key) {
  if (isDeprecatedKey(key)) {
    return key;
  }
  return `${CONFIG.deprecatedPrefix}${key}`;
}

// Analyze translations
function analyzeTranslations(usedKeys, keyUsageMap) {
  log('\nAnalyzing translations...', 'blue');

  const results = {
    languages: {},
    summary: {
      totalUsedKeys: usedKeys.length,
      missingKeys: [],
      unusedKeys: [],
      deprecatedKeys: []
    }
  };

  for (const language of CONFIG.supportedLanguages) {
    log(`\nAnalyzing ${language} translations...`, 'yellow');

    const translations = loadTranslationFile(language);
    const translationKeys = flattenKeys(translations);
    const nonDeprecatedKeys = translationKeys.filter(key => !isDeprecatedKey(key));

    // Find missing keys (used in code but not in translations)
    const missingKeys = usedKeys.filter(key => !nonDeprecatedKeys.includes(key));

    // Find unused keys (in translations but not used in code)
    const unusedKeys = nonDeprecatedKeys.filter(key => !usedKeys.includes(key));

    // Find already deprecated keys
    const deprecatedKeys = translationKeys.filter(key => isDeprecatedKey(key));

    results.languages[language] = {
      translationKeys,
      nonDeprecatedKeys,
      missingKeys,
      unusedKeys,
      deprecatedKeys,
      translations
    };

    // Update summary (use default language as reference)
    if (language === CONFIG.defaultLanguage) {
      results.summary.missingKeys = missingKeys;
      results.summary.unusedKeys = unusedKeys;
      results.summary.deprecatedKeys = deprecatedKeys;
    }

    // Log results for this language
    log(`  Total keys in ${language}: ${translationKeys.length}`, 'cyan');
    log(`  Non-deprecated keys: ${nonDeprecatedKeys.length}`, 'cyan');
    log(`  Missing keys: ${missingKeys.length}`, missingKeys.length > 0 ? 'red' : 'green');
    log(`  Unused keys: ${unusedKeys.length}`, unusedKeys.length > 0 ? 'yellow' : 'green');
    log(`  Already deprecated: ${deprecatedKeys.length}`, 'magenta');
  }

  return results;
}

// Generate detailed report
function generateReport(results, keyUsageMap) {
  log('\n' + '='.repeat(60), 'bright');
  log('I18N ANALYSIS REPORT', 'bright');
  log('='.repeat(60), 'bright');

  const { summary, languages } = results;
  const defaultLang = languages[CONFIG.defaultLanguage];

  // Summary
  log('\nSUMMARY:', 'bright');
  log(`Total keys used in code: ${summary.totalUsedKeys}`, 'cyan');
  log(`Missing keys: ${summary.missingKeys.length}`, summary.missingKeys.length > 0 ? 'red' : 'green');
  log(`Unused keys: ${summary.unusedKeys.length}`, summary.unusedKeys.length > 0 ? 'yellow' : 'green');
  log(`Deprecated keys: ${summary.deprecatedKeys.length}`, 'magenta');

  // Missing keys
  if (summary.missingKeys.length > 0) {
    log('\nMISSING KEYS (used in code but not in translations):', 'red');
    summary.missingKeys.forEach(key => {
      const files = keyUsageMap.get(key) || [];
      log(`  ❌ ${key}`, 'red');
      files.forEach(file => log(`     Used in: ${file}`, 'cyan'));
    });
  }

  // Unused keys
  if (summary.unusedKeys.length > 0) {
    log('\nUNUSED KEYS (in translations but not used in code):', 'yellow');
    summary.unusedKeys.forEach(key => {
      const value = getNestedValue(defaultLang.translations, key);
      log(`  ⚠️  ${key}: "${value}"`, 'yellow');
    });
  }

  // Deprecated keys
  if (summary.deprecatedKeys.length > 0) {
    log('\nDEPRECATED KEYS:', 'magenta');
    summary.deprecatedKeys.forEach(key => {
      const value = getNestedValue(defaultLang.translations, key);
      log(`  🗑️  ${key}: "${value}"`, 'magenta');
    });
  }

  // Language-specific analysis
  log('\nLANGUAGE-SPECIFIC ANALYSIS:', 'bright');
  for (const [language, data] of Object.entries(languages)) {
    log(`\n${language.toUpperCase()}:`, 'bright');
    log(`  Total keys: ${data.translationKeys.length}`, 'cyan');
    log(`  Active keys: ${data.nonDeprecatedKeys.length}`, 'cyan');
    log(`  Missing: ${data.missingKeys.length}`, data.missingKeys.length > 0 ? 'red' : 'green');
    log(`  Unused: ${data.unusedKeys.length}`, data.unusedKeys.length > 0 ? 'yellow' : 'green');
    log(`  Deprecated: ${data.deprecatedKeys.length}`, 'magenta');
  }
}

// Update translation files
function updateTranslationFiles(results, options = {}) {
  const { markUnusedAsDeprecated = false, addMissingKeys = false } = options;

  if (!markUnusedAsDeprecated && !addMissingKeys) {
    return;
  }

  log('\nUpdating translation files...', 'blue');

  for (const [language, data] of Object.entries(results.languages)) {
    let updated = false;
    const translations = { ...data.translations };

    // Mark unused keys as deprecated
    if (markUnusedAsDeprecated && data.unusedKeys.length > 0) {
      log(`\nMarking ${data.unusedKeys.length} unused keys as deprecated in ${language}...`, 'yellow');

      for (const key of data.unusedKeys) {
        const value = getNestedValue(translations, key);
        const deprecatedKey = markAsDeprecated(key);

        // Add deprecated key
        setNestedValue(translations, deprecatedKey, value);

        // Remove original key
        const parts = key.split('.');
        let current = translations;
        for (let i = 0; i < parts.length - 1; i++) {
          current = current[parts[i]];
        }
        delete current[parts[parts.length - 1]];

        log(`  Deprecated: ${key} -> ${deprecatedKey}`, 'magenta');
        updated = true;
      }
    }

    // Add missing keys (only for default language)
    if (addMissingKeys && language === CONFIG.defaultLanguage && data.missingKeys.length > 0) {
      log(`\nAdding ${data.missingKeys.length} missing keys to ${language}...`, 'green');

      for (const key of data.missingKeys) {
        const placeholder = `TODO: Add translation for '${key}'`;
        setNestedValue(translations, key, placeholder);
        log(`  Added: ${key} = "${placeholder}"`, 'green');
        updated = true;
      }
    }

    // Save updated translations
    if (updated) {
      if (saveTranslationFile(language, translations)) {
        log(`Successfully updated ${language} translation file`, 'green');
      }
    }
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const options = {
    markUnusedAsDeprecated: args.includes('--mark-deprecated'),
    addMissingKeys: args.includes('--add-missing'),
    help: args.includes('--help') || args.includes('-h')
  };

  if (options.help) {
    log('I18N Key Checker', 'bright');
    log('Usage: npm run check-i18n [options]', 'cyan');
    log('\nOptions:', 'bright');
    log('  --mark-deprecated  Mark unused keys as deprecated', 'cyan');
    log('  --add-missing      Add missing keys to default language file', 'cyan');
    log('  --help, -h         Show this help message', 'cyan');
    log('\nExamples:', 'bright');
    log('  npm run check-i18n                                    # Check only', 'cyan');
    log('  npm run check-i18n -- --mark-deprecated               # Mark unused as deprecated', 'cyan');
    log('  npm run check-i18n -- --add-missing                   # Add missing keys', 'cyan');
    log('  npm run check-i18n -- --mark-deprecated --add-missing # Both operations', 'cyan');
    return;
  }

  log('Starting i18n key analysis...', 'bright');
  log(`Source directory: ${CONFIG.srcDir}`, 'cyan');
  log(`Locales directory: ${CONFIG.localesDir}`, 'cyan');
  log(`Supported languages: ${CONFIG.supportedLanguages.join(', ')}`, 'cyan');

  // Scan source files
  const { usedKeys, keyUsageMap } = scanSourceFiles();

  if (usedKeys.length === 0) {
    log('No i18n keys found in source files.', 'yellow');
    return;
  }

  // Analyze translations
  const results = analyzeTranslations(usedKeys, keyUsageMap);

  // Generate report
  generateReport(results, keyUsageMap);

  // Update translation files if requested
  updateTranslationFiles(results, options);

  // Exit with appropriate code
  const hasIssues = results.summary.missingKeys.length > 0 || results.summary.unusedKeys.length > 0;

  if (hasIssues) {
    log('\n⚠️  Issues found! Please review the report above.', 'yellow');
    if (!options.markUnusedAsDeprecated && !options.addMissingKeys) {
      log('Use --mark-deprecated and/or --add-missing to automatically fix issues.', 'cyan');
    }
  } else {
    log('\n✅ All i18n keys are properly used and defined!', 'green');
  }

  log('', 'reset');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  scanSourceFiles,
  analyzeTranslations,
  updateTranslationFiles,
  CONFIG
};
