# AI DayTrader Pro - Live Data Integration Runbook

## Environment Variables & Secrets

### Required Supabase Secrets
Configure these via Supabase Dashboard > Settings > Edge Functions:

- `FINNHUB_API_KEY` - Real-time stock data from Finnhub.io
- `OPENAI_API_KEY` - AI analysis and chat completions  
- `QUIVER_API_KEY` - Institutional trading data from QuiverQuant
- `POLYGON_API_KEY` - Alternative stock data source
- `STRIPE_SECRET_KEY` - Payment processing
- `STRIPE_WEBHOOK_SECRET` - Webhook signature verification
- `DISCORD_WEBHOOK_URL` - Alert notifications (optional)

### External API Setup

#### Finnhub.io
1. Sign up at https://finnhub.io/
2. Get free API key (60 calls/minute)
3. Add to Supabase secrets as `FINNHUB_API_KEY`

#### QuiverQuant
1. Sign up at https://api.quiverquant.com/
2. Get API key for institutional data
3. Add to Supabase secrets as `QUIVER_API_KEY`

#### OpenAI
1. Get API key from https://platform.openai.com/
2. Add to Supabase secrets as `OPENAI_API_KEY`

## Edge Function Endpoints

### 1. finnhub-data
**URL**: `POST /functions/v1/finnhub-data`

**Request**:
```json
{
  "symbol": "AAPL",
  "interval": "1s", 
  "range": {
    "from": "2025-09-22T14:00:00Z",
    "to": "2025-09-22T14:01:00Z"
  }
}
```

**Response**:
```json
{
  "symbol": "AAPL",
  "interval": "1s",
  "last_quote": {"p": 123.45, "v": 1000, "t": "2025-09-22T14:59:59Z"},
  "candles": [
    {"t":"2025-09-22T14:59:58Z","o":123.4,"h":123.5,"l":123.3,"c":123.45,"v":900}
  ],
  "source": "finnhub",
  "fallback_used": false
}
```

**Fallback Behavior**: If 1-second data hits rate limits, falls back to 1-minute resolution and sets `fallback_used: true`.

### 2. institutional
**URL**: `POST /functions/v1/institutional`

**Request**:
```json
{"symbol": "NVDA"}
```

**Response**:
```json
{
  "symbol":"NVDA",
  "sec_insider_trades":[
    {"filer":"CEO","type":"BUY","shares":10000,"price":120.5,"filed_at":"2025-09-20"}
  ],
  "hedge_fund_positions":[
    {"fund":"XYZ Capital","position_delta":250000,"reported_at":"2025-08-31"}
  ],
  "congressional_trades":[
    {"member":"Rep. Doe","type":"BUY","amount":"$50k-$100k","disclosed_at":"2025-09-15"}
  ],
  "source":["quiver","whalewisdom","sec"]
}
```

### 3. news
**URL**: `POST /functions/v1/news`

**Request**:
```json
{"symbol": "MSFT"}
```

**Response**:
```json
{
  "symbol":"MSFT",
  "items":[
    {
      "id":"news_123",
      "source":"FMP",
      "headline":"MSFT announces ...",
      "url":"https://...",
      "published_at":"2025-09-22T14:50:00Z",
      "tickers":["MSFT"],
      "summary":"...",
      "sentiment":0.32
    }
  ]
}
```

### 4. ai-analysis
**URL**: `POST /functions/v1/ai-analysis`

**Request**:
```json
{
  "mode": "news",
  "symbol": "MSFT", 
  "payload": {
    "headline": "MSFT raises guidance",
    "body": "Microsoft increased quarterly guidance...",
    "published_at": "2025-09-22T14:50:00Z"
  }
}
```

**Response**:
```json
{
  "symbol":"MSFT",
  "mode":"news",
  "summary":"2-3 sentence concise summary",
  "rationale":[
    "Key driver 1",
    "Risk/uncertainty", 
    "Likely near-term impact on price/volatility"
  ],
  "tags":["earnings","guidance","ai"],
  "confidence":0.68
}
```

### 5. alerts
**URL**: `POST /functions/v1/alerts`

**Request**:
```json
{
  "user_id": "<UUID>",
  "ticker": "TSLA",
  "condition": "price > 300 and volume_1m > 2x_avg",
  "notify": {"in_app": true, "discord": true}
}
```

**Response**:
```json
{"id":"<uuid>","status":"active"}
```

### 6. stripe-webhook
**URL**: `POST /functions/v1/stripe-webhook`

Handles Stripe subscription lifecycle events and updates user profiles.

## Error Handling

All functions log errors to `audit_logs` table with:
- `function_name`
- `error_message` 
- `request_id`
- `latency_ms`
- `upstream_status`

## Rate Limiting & Timeouts

- **Request timeout**: 6 seconds per upstream API call
- **Rate limiting**: Exponential backoff for 429/5xx errors
- **Retries**: Up to 3 attempts with increasing delays

## Testing Commands

```bash
# Set environment variables
export SUPABASE_URL="https://xijfxrfemhdnxwzggpcp.supabase.co"
export SERVICE_ROLE_KEY="your-service-role-key"

# Test finnhub-data
curl -s -X POST "$SUPABASE_URL/functions/v1/finnhub-data" \
 -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
 -H "Content-Type: application/json" \
 -d '{"symbol":"AAPL","interval":"1s","range":{"from":"2025-09-22T14:00:00Z","to":"2025-09-22T14:01:00Z"}}' | jq

# Test institutional
curl -s -X POST "$SUPABASE_URL/functions/v1/institutional" \
 -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
 -H "Content-Type: application/json" \
 -d '{"symbol":"NVDA"}' | jq

# Test news
curl -s -X POST "$SUPABASE_URL/functions/v1/news" \
 -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
 -H "Content-Type: application/json" \
 -d '{"symbol":"MSFT"}' | jq

# Test ai-analysis
curl -s -X POST "$SUPABASE_URL/functions/v1/ai-analysis" \
 -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
 -H "Content-Type: application/json" \
 -d '{"mode":"news","symbol":"MSFT","payload":{"headline":"MSFT raises guidance","body":"...","published_at":"2025-09-22T14:50:00Z"}}' | jq

# Test alerts (requires valid user_id UUID)
curl -s -X POST "$SUPABASE_URL/functions/v1/alerts" \
 -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
 -H "Content-Type: application/json" \
 -d '{"user_id":"<UUID>","ticker":"TSLA","condition":"price > 300 and volume_1m > 2x_avg","notify":{"in_app":true,"discord":true}}' | jq
```

## Database Tables

### audit_logs
Stores function execution logs and errors:
- `function_name` - Which edge function
- `error_message` - Error details  
- `request_id` - UUID for tracking
- `latency_ms` - Response time
- `upstream_status` - HTTP status from external APIs

### user_alerts
Stores user-created alerts:
- `user_id` - UUID of alert owner
- `ticker` - Stock symbol
- `condition` - Alert logic (natural language)
- `notify_in_app` - Boolean for in-app notifications
- `notify_discord` - Boolean for Discord webhooks

### news_cache
Caches news data to reduce API calls:
- `symbol` - Stock ticker
- `headline` - News headline
- `raw` - Full news data JSON

### institutional_trades
Caches institutional trading data:
- `symbol` - Stock ticker
- `source` - Data provider (quiver, sec, etc)
- `data` - Full institutional data JSON

## Security

- All functions use CORS headers allowing app origin only
- API keys stored as encrypted Supabase secrets
- RLS policies enforce user data isolation
- Input validation rejects malformed requests with 400 status