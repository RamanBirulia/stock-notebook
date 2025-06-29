# I18N Key Checker

A comprehensive tool for managing internationalization keys in the frontenjsx` files
- ✅ **Smart key extraction**: Detects various `t()d application. This script helps maintain clean and organized translation files` usage patterns
- ✅ **Multi by identifying unused keys, missing translations, and automatically-language support**: Supports multiple translation files
- ✅ **Automatic fixing**: Can mark unused keys as deprecated and add missing keys
- ✅ ** organizing deprecated content.

## Features

- **Key Usage Analysis**: Scans all TypeScript/ReactDetailed reporting**: Color-coded console output with file references
- ✅ **Neste files to find which i18n keys are actually used
- **Missingd key support**: Handles nested JSON structures
- Key Detection**: Identifies keys used in code but missing from translation files
- **Unused Key Management ✅ **Safe deprecation**: Preserves unuse**: Finds translation keys that are nod keys with `__DEPRECATED__` prefix longer used in the codebase
- **Automatic

## Usage

### Available Scripts

```bash
# Deprecation**: Marks unused keys as deprecated with a configurable prefix
- **Multi-language Support**: Works with multiple translation files (English, Spanish, etc Check i18n keys without making changes
npm run check-i18n

# Mark unused keys as deprecated AND.)
- **Detailed Reporting**: Provides add missing keys
npm run check-i18n:fix

# Only mark unused keys as deprecated
npm run check-i18n:deprecated

# Only ad comprehensive reports with file-by-file usage trackingd missing keys to default language
npm run check-i18n:missing
```

### Comman
- **Automatic Fixes**: Can automatically add missing keys and mark unused ones as deprecated

## Installation

The script is already included in the project and configured Line Options

```bash
# Show help
npm run check-i18n -- --help

# Mark unused keys as deprecated
npm run check-id in `package.json`. No additional installation is required.18n -- --mark-deprecated

# Add missing keys to

## Usage

### Basic Commands

```bash
# default language file
npm run check-i18n -- -- Check i18n keys (read-only analysisadd-missing

# Both operations
npm run check-i18n -- --mark-deprecated --add-)
npm run check-i18nmissing
```

## Configuration

The script configuration

# Show help
npm run check-i18n -- --help

# Mark unused keys as deprecated
npm run check-i18n:deprecated

# Ad is located at the top of `scripts/check-i18d missing keys to default language file
npm run check-n.js`:

```javascript
const CONFIGi18n:missing

# Both mark deprecated and add missing keys
npm run check-i18n:fix
```

### Command Options

- `--mark-deprecated`: Moves unused keys to deprecated sections = {
  srcDir: path.join(__dirname, with `__DEPRECATED__` prefix
- `--ad '../src'),
  localesDir: path.joind-missing`: Adds placeholder entries for missing keys in(__dirname, '../public/locales'), the default language file
- `--help`,
  defaultLanguage: 'en', `-h`: Shows usage instructions

### Examples

```bash
  supportedLanguages: ['en', 'es'],
  fileExtensions: ['.ts', '.tsx', '.js', '.jsx'],
  translationFileName: 'translation.json',
# Analyze current state without making changes
npm run check
  deprecatedPrefix: '__DEPRECATED__'
};
```

### Configuration Options

- **srcDir**: Directory to scan for source files
- **localesDir**: Directory containing translation files
- **defaultLanguage**: Primary language for adding missing keys
- **supportedLanguages**:-i18n

# Fix all issues automatically
npm run check-i18n:fix

# Only mark unused keys as deprecated
npm run check-i18n -- Array of supported language codes
- **fileExtensions**: File --mark-deprecated

# Only add missing keys
npm types to scan for i18n usage
- **translation run check-i18n -- --add-FileName**: Name of translation files
- **deprecatedPrefix**: Prefix for marking deprecated keys

## Howmissing

# Combine both operations
npm run check-i18n -- --mark-deprecated --add-missing
```

## How It Works

### It Works

### 1. Source Code Scanning

The script 1. Source Code Scanning

The script recurs scans all TypeScript/React files and extracts iively scans all `.ts` and `.tsx18n keys using regex patterns that match:` files in the `src` directory, looking for:

```javascript
// Standard usage
t('key.

- `t('key')` - Basic translation callsname')
t("key.name")
- `t("key")` - Double-quoted keys

// With parameters
t('key.name', { param:
- `t('key', { ... })` - Translation 'value' })

// Template strings ( calls with interpolation parameters
- Template literals with translationsbasic)
t(`key.name`)

### 2. Translation File Analysis

Loads
```

### 2. Translation File Analysis

- and analyzes translation files from `public/locales/{ Loads all translation files for supported languages
- Fllanguage}/translation.json`:

- Flattens nested JSONattens nested JSON structures into dot notation
- Separ structure (e.g., `nav.dashboarates active keys from deprecated keys

### 3.d`)
- Identifies deprecated keys (prefixed with `__DEPRECATED__`)
- Compares against used keys from source code

### 3 Comparison and Reporting

- **Missing. Issue Detection

- **Missing Keys**: Used in code but not in translation files
- **Unused Keys**: Present in translation files but not used in code
- **Deprecate Keys**: Used in code but not in translations
- **Unused Keys**: In translations but not used in code
- **Deprecated Keys**: Previously marked as deprecated

### 4. Automatic Fixesd Keys**: Previously unused keys marked with deprecated prefix

### 4

- **Mark as Deprecated**: Moves unused keys to `__DEPRECATED__` sections
- **Add Missing Keys**: Adds. Automatic Fixes

When enabled, the script can placeholder translations for missing keys

## Output Example

```
============================================================
I18N ANALYSIS REPORT
============================================================

SUMMARY:

- Add missing keys with placeholder text to the default language file
- Move unused keys to deprecated sections with `__DEPRECATED__` prefix
-:
Total keys used in code: 64
Missing keys: 0
Unused keys: 0
Deprecated keys: 141 Preserve the hierarchical structure of translation files

## Configuration

MISSING KEYS (used in code but not in

The script configuration is located at the top of `scripts translations):
  ❌ addP/check-i18n.js`:

```javascript
const CONFIG = {
  srcDir: path.join(__dirname,urchase.errors.symbolRequired
     Use '../src'),           // Source code directory
  localesDir: path.join(__dirname, '../public/locales'), //d in: pages/AddPurchase.tsx

UNUSED KEYS (in translations but not use Translation files
  defaultLanguage: 'en',d in code):
  ⚠️  nav                           // Primary language
  supportedLanguages: ['.portfolio: "Portfolio"
  ⚠️en', 'es'],                // All supported languages
  file  dashboard.totalSpent: "TotalExtensions: ['.ts', '.tsx', '.js', '.jsx'],  // File types to scan
  translationFileName Invested"

DEPRECATED KEYS:
  🗑️  __DEPRECATED__nav.portfolio: "Portfolio"
  🗑️  __DEPRECATED__dashboard.totalSp: 'translation.json',         // Translation file name
  deprecent: "Total Invested"

LANGUAGEatedPrefix: '__DEPRECATED__'               // Prefix-SPECIFIC ANALYSIS:

EN:
  Total keys: 205
  Active keys for deprecated keys
};
```

## Output Format

###: 64
  Missing: 0
  Unused: 0
  Deprecate Analysis Report

The script provides a detailed report includingd: 141

ES:
  Total keys: 179
  Active keys: 38
  Missing: 26
  Unuse:

- **Summary**: Total counts of used,d: 0
  Deprecated: 141 missing, unused, and deprecated keys
- **Missing Keys**: List of keys used in code but missing from translations
- **Unused Keys**: List of keys
```

## Best Practices

### 1. Regular Maintenance

Run the script regularly to keep translations clean:

```bash
# Weekly check
npm run check-i18n

# Before releases
npm run check- in translations but not used in code
- **Deprecated Keysi18n:fix
```

### 2**: List of previously deprecated keys
- **Language Analysis. Key Naming Conventions

Use consistent**: Per-language breakdown of key statistics
- **File, descriptive key names:

```javascript
// Goo Usage**: Which files use which keys

### Exampled
t('dashboard.stats.totalSpent') Output

```
============================================================
I18N
t('addPurchase.form.fields ANALYSIS REPORT
============================================================

SUMMARY:
Total.symbol')
t('errors.validation.required')

// keys used in code: 64
Missing keys: 0
Unused keys: 0 Avoid
t('text1')
t('msg
Deprecated keys: 141

LANGUAGE-SPECIFIC ANALYSIS')
t('label')
```

###:

EN:
  Total keys: 205
  Active keys: 64
  Missing: 0
  Unused: 3. Handling Deprecated Keys

- 0
  Deprecated: 141

ES:
  Total keys Deprecated keys are safe to remove after confir: 179
  Active keys: 38ming they're truly unused
- The script preserv
  Missing: 26
  Unused: 0
  Deprecated: 141

✅ Alles them with `__DEPRECATED__` prefix for i18n keys are properly used and defined! safety
- Review deprecated keys before major
```

## File Structure Impact

### Before Running releases

### 4. Missing Key Workflow Script

```json
{
  "nav": {
    "

When the script adds missing keys, it createsdashboard": "Dashboard",
    "portfolio": "Portfolio" placeholder text:

```json
{
  "  // This key is unused
  },
  "commonnewKey": "TODO: Add translation for": {
    "save": "Save" 'newKey'"
}
```

Replace  // This key is unused
  }
} these placeholders with proper translations.

## Integration
```

### After Running with `--mark-deprecated`

```json
{
  "nav": {
    "dashboard": "Dashboard"
  }, with CI/CD

Add to your CI pipeline
  "__DEPRECATED__nav": {
    "portfolio to ensure translation hygiene:

```yaml
# Example": "Portfolio"
  },
  "__ GitHub Actions step
- name: Check i18n keysDEPRECATED__common": {
    "save": "Save"
  }
}
```

## Best
  run: |
    cd frontend
    npm run check Practices

### Regular Maintenance

1. **Run-i18n
    # regularly**: Execute the script periodically during Fail if there are missing keys
    if npm run check-i18n 2>&1 | development
2. **Before releases**: Always grep -q "Missing keys: [ run before major releases to clean up translations
3. **After refactoring**: Run after significant code changes that^0]"; then
      echo "Missing i18n keys found!"
      exit 1 might affect i18n usage

### Workflow
    fi
```

## Troubleshooting

### Common Integration

```bash
# Development workflow
npm run check-i18n              # Check current state
npm run check Issues

1. **Keys not detected**: Ensure you're-i18n:fix          # Fix issues automatically

# Pre-commit checks
npm run check-i18n              # Ensure no issues before committing
```

### Team Usage using standard `t()` function calls
2. **Dynamic keys**: The script can't detect dynamically generated keys
3. **Template strings**: Complex

- **Code Reviews**: Include i18n key template strings with variables may not be detected

### Debugging analysis in code review process
- **Documentation**: Keep

Enable debug mode by setting `NODE_ENV=development`:

```bash
NODE_ENV=development npm run check-i18n translation keys well-organized and documented
- **
```

### Manual Key Management

For dynamicConsistency**: Use consistent naming patterns for translation keys or complex keys, manually add them to translation files an

## Troubleshooting

### Common Issues

1. **Keys not detected**: 
   -d document why they appear unused.

## File Structure

```
fronten Ensure keys are string literals, not variables
   -d/
├── scripts/
│   ├── check-i18n.js      # Main script
│   └── README.md          # This Check that files have correct extensions (.ts, .tsx)

2. **Translation file errors**:
   - documentation
├── public/
│   └── locales/
│       ├── en/
│       │   └── translation.json Verify JSON syntax is valid
   - Check file
│       └── es/
│           └── translation.json
└── src/                   # Source files to scan
```

## Contributing

When adding new features permissions for write operations

3. **Missing translations**:
   - Run with `--add-missing` to create placeholder entries
   - to the script:

1. Update the configuration Manually translate placeholder text

### Error Messages

- options if needed
2. Add new regex patterns for different `t()` usage patterns
3. Update this `Error reading directory`: Check source directory exists an documentation
4. Test with various key patterns
5.d is readable
- `Error loading translation file`: Verify Ensure the script handles edge cases gracefully JSON syntax and file permissions
- `Error saving translation file`: Check write permissions on locale directories

## Integration with CI/CD

You can integrate the script into your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Check i18n keys
  run: |
    cd frontend
    npm run check-i18n
    # Fail if there are missing or unused keys
    if [ $? -ne 0 ]; then
      echo "i18n issues found. Please run 'npm run check-i18n:fix' locally."
      exit 1
    fi
```

## Advanced Usage

### Custom Key Patterns

The script supports various translation key patterns:

```typescript
// Supported patterns
t('simple.key')
t("double.quotes")
t('key.with.interpolation', { value: 'test' })
t(`template.literal.key`)

// Not supported (requires variables)
const key = 'dynamic.key';
t(key)  // This won't be detected
```

### Nested Key Structure

The script maintains nested JSON structure:

```json
{
  "dashboard": {
    "title": "Dashboard",
    "stats": {
      "total": "Total"
    }
  }
}
```

Keys are flattened for analysis: `dashboard.title`, `dashboard.stats.total`

## Contributing

To modify or extend the script:

1. Edit `scripts/check-i18n.js`
2. Test with `npm run check-i18n -- --help`
3. Update configuration as needed
4. Document changes in this README