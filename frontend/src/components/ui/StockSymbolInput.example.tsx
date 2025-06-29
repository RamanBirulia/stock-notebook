import React, { useState } from 'react';
import StockSymbolInput from './StockSymbolInput';
import type { SymbolSuggestion } from '../../store/api/stockApi';

/**
 * Example usage of the StockSymbolInput component
 * This demonstrates the basic usage patterns and features
 */
const StockSymbolInputExample: React.FC = () => {
  const [basicValue, setBasicValue] = useState('');
  const [advancedValue, setAdvancedValue] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolSuggestion | null>(null);

  const handleSymbolSelect = (symbol: SymbolSuggestion) => {
    setSelectedSymbol(symbol);
    console.log('Selected symbol:', symbol);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">StockSymbolInput Examples</h1>

        {/* Basic Usage */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Basic Usage</h2>
          <StockSymbolInput
            label="Stock Symbol"
            value={basicValue}
            onChange={setBasicValue}
            placeholder="Start typing a stock symbol..."
          />
          <p className="text-sm text-gray-600">Current value: {basicValue}</p>
        </div>

        {/* Advanced Usage with Symbol Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Advanced Usage with Selection Handler</h2>
          <StockSymbolInput
            label="Stock Symbol with Selection"
            value={advancedValue}
            onChange={setAdvancedValue}
            onSymbolSelect={handleSymbolSelect}
            helperText="Type to search, then select from dropdown"
          />

          {selectedSymbol && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-semibold text-green-800 dark:text-green-200">Selected Symbol:</h3>
              <div className="mt-2 text-sm space-y-1">
                <p><strong>Symbol:</strong> {selectedSymbol.symbol}</p>
                <p><strong>Company:</strong> {selectedSymbol.name}</p>
                <p><strong>Exchange:</strong> {selectedSymbol.exchange}</p>
                <p><strong>Type:</strong> {selectedSymbol.asset_type}</p>
              </div>
            </div>
          )}
        </div>

        {/* Error State */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Error State</h2>
          <StockSymbolInput
            label="Stock Symbol with Error"
            value=""
            onChange={() => {}}
            error="Please enter a valid stock symbol"
          />
        </div>

        {/* Disabled State */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Disabled State</h2>
          <StockSymbolInput
            label="Disabled Stock Symbol Input"
            value="AAPL"
            onChange={() => {}}
            disabled
          />
        </div>

        {/* Filled Variant */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Filled Variant</h2>
          <StockSymbolInput
            label="Filled Style"
            value=""
            onChange={() => {}}
            variant="filled"
            helperText="This uses the filled variant style"
          />
        </div>

        {/* Form Integration Example */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Form Integration</h2>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <StockSymbolInput
              label="Stock Symbol"
              value={basicValue}
              onChange={setBasicValue}
              required
              helperText="Required field in a form"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockSymbolInputExample;
