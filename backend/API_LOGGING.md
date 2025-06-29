# Alpha Vantage API Logging Documentation

This document describes the enhanced logging capabilities for debugging Alpha Vantage API interactions in the stock tracker backend.

## Overview

The stock API client now includes comprehensive logging features that can be enabled via environment variables to help debug API issues, rate limiting, and response parsing problems.

## Environment Variables

### Core Logging Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `ENABLE_API_REQUEST_LOGGING` | `false` | Enables detailed logging of all API requests to Alpha Vantage |
| `ENABLE_API_RESPONSE_LOGGING` | `false` | Enables detailed logging of all API responses from Alpha Vantage |
| `RUST_LOG` | `info` | Controls overall application log level (trace, debug, info, warn, error) |

### API Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `ALPHA_VANTAGE_API_KEY` | `demo` | Your Alpha Vantage API key |
| `DATABASE_URL` | `sqlite:stocks.db` | Database connection string |
| `JWT_SECRET` | `secret` | JWT signing secret |

## Logging Levels

### Request Logging (`ENABLE_API_REQUEST_LOGGING=true`)

When enabled, logs include:
- Full request URL with parameters
- HTTP method
- Alpha Vantage function being called
- Symbol/parameters being requested
- Response status code
- Response headers (debug level)

Example output:
```
=== API REQUEST ===
URL: https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=demo
Method: GET
Function: GLOBAL_QUOTE
Symbol: AAPL
==================
```

### Response Logging (`ENABLE_API_RESPONSE_LOGGING=true`)

When enabled, logs include:
- Full API response body
- Response status code
- For large responses, shows first 1000 characters and last 500 characters
- Raw response data for debugging parsing issues

Example output:
```
=== API RESPONSE ===
Symbol: AAPL
Status: 200
Response body: {"Global Quote": {"01. symbol": "AAPL", "02. open": "150.00", ...}}
===================
```

## Quick Start

### 1. Basic Debugging

To enable basic request logging only:
```bash
export ENABLE_API_REQUEST_LOGGING=true
cargo run
```

### 2. Full Debug Mode

To enable complete logging (requests + responses):
```bash
export ENABLE_API_REQUEST_LOGGING=true
export ENABLE_API_RESPONSE_LOGGING=true
export RUST_LOG=debug
cargo run
```

### 3. Using the Debug Test Script

The project includes a comprehensive test script:
```bash
./test_api_debug.sh
```

This script will:
- Enable full logging
- Test various API endpoints
- Guide you through different scenarios
- Show you exactly what's being logged

## Common Issues and Solutions

### 1. Rate Limiting

**Symptoms:** API returns rate limit messages
**Logs to look for:**
```
API rate limit reached for AAPL (1M)
```

**Solution:** 
- Upgrade to paid Alpha Vantage plan
- Implement request throttling
- Use caching more aggressively

### 2. API Key Issues

**Symptoms:** "demo purposes only" or authentication errors
**Logs to look for:**
```
Demo API key limitation for AAPL (1M)
```

**Solution:**
- Set proper `ALPHA_VANTAGE_API_KEY` environment variable
- Verify API key is active and has required permissions

### 3. Parsing Errors

**Symptoms:** JSON parsing failures
**Logs to look for:**
```
Failed to parse JSON for symbol AAPL: missing field
Raw response that failed to parse: {"Error Message": "Invalid API call"}
```

**Solution:**
- Check if symbol exists
- Verify API response format hasn't changed
- Check for API error messages in response

### 4. Network Issues

**Symptoms:** Request timeouts or connection errors
**Logs to look for:**
```
Request failed for symbol AAPL: connection timeout
```

**Solution:**
- Check internet connectivity
- Verify Alpha Vantage service status
- Consider increasing request timeout

## Log Analysis Tips

### Finding Specific Requests

Search logs for specific symbols or functions:
```bash
grep "Symbol: AAPL" logs/app.log
grep "Function: GLOBAL_QUOTE" logs/app.log
```

### Monitoring Rate Limits

Watch for rate limit patterns:
```bash
grep -i "rate limit" logs/app.log
```

### Debugging Cache Issues

Monitor cache hit/miss patterns:
```bash
grep "cached" logs/app.log
```

## Production Considerations

### Performance Impact

- **Request logging:** Minimal performance impact
- **Response logging:** Can be verbose for large responses, use with caution in production

### Log Storage

- Response logging can generate large log files
- Consider log rotation and retention policies
- Monitor disk space usage

### Security

- Logs may contain API keys in URLs
- Ensure logs are properly secured
- Consider masking sensitive data in production

## Environment File Example

Create a `.env` file with your configuration:
```bash
# Core API
ALPHA_VANTAGE_API_KEY=your_real_api_key_here
DATABASE_URL=sqlite:stocks.db
JWT_SECRET=your_secure_jwt_secret

# Debug logging (disable in production)
ENABLE_API_REQUEST_LOGGING=true
ENABLE_API_RESPONSE_LOGGING=false
RUST_LOG=info,stock_tracker_backend=debug
```

## Troubleshooting Checklist

When debugging API issues:

1. ✅ Enable request logging to see what's being sent
2. ✅ Check API key configuration
3. ✅ Verify symbol format and validity
4. ✅ Enable response logging to see raw API responses
5. ✅ Check for rate limiting messages
6. ✅ Monitor cache hit/miss patterns
7. ✅ Verify network connectivity
8. ✅ Check Alpha Vantage service status

## Support

If you continue to experience issues:
1. Collect logs with full debugging enabled
2. Note the specific symbols and timeframes causing issues
3. Check the API response format against Alpha Vantage documentation
4. Consider the API plan limitations and usage quotas