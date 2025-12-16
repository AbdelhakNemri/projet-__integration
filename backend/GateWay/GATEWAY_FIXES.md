# Gateway Configuration Fixes

## Issues Found and Fixed

### 1. ❌ Missing Booking Route
**Problem:** The `/bookings/**` endpoints were not configured in the gateway routes.

**Impact:** All booking API calls from the frontend would fail with 404 errors.

**Fix Applied:**
```properties
# BOOKING SERVICE (part of field-service)
spring.cloud.gateway.routes[4].id=booking-service
spring.cloud.gateway.routes[4].uri=lb://field-service
spring.cloud.gateway.routes[4].predicates[0]=Path=/bookings/**
spring.cloud.gateway.routes[4].filters[0]=StripPrefix=0
```

### 2. ⚠️ Player Service Route Configuration
**Problem:** Player service had incorrect path predicate syntax and wrong StripPrefix value.

**Before:**
```properties
spring.cloud.gateway.routes[1].predicates[0]=Path=/players/**|/feedbacks/**
spring.cloud.gateway.routes[1].filters[0]=StripPrefix=1
```

**After:**
```properties
spring.cloud.gateway.routes[1].predicates[0]=Path=/players/**,/feedbacks/**
spring.cloud.gateway.routes[1].filters[0]=StripPrefix=0
```

**Why:** 
- Changed `|` to `,` for multiple path patterns (correct Spring Cloud Gateway syntax)
- Changed `StripPrefix=1` to `StripPrefix=0` to preserve the full path

### 3. ✅ CORS Configuration
**Problem:** CORS filter was commented out, which could cause CORS errors from the Angular frontend.

**Fix Applied:**
- Enabled `CorsWebFilter` bean
- Used reactive `CorsWebFilter` (correct for Spring Cloud Gateway)
- Configured allowed origins: `http://localhost:4200`, `http://127.0.0.1:4200`
- Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Allowed credentials: true
- Max age: 3600 seconds

## Updated Route Configuration

### Complete Routes List:

| Route ID | Service | Path | Target Service | StripPrefix |
|----------|---------|------|----------------|-------------|
| auth-service | Auth | `/auth/**` | auth-service | 0 |
| player-service | Player | `/players/**`, `/feedbacks/**` | player-service | 0 |
| reservation1-service | Reservation | `/reservation/**` | reservation1-service | 1 |
| field-service | Field | `/fields/**` | field-service | 0 |
| **booking-service** | **Booking** | **`/bookings/**`** | **field-service** | **0** |
| event-service | Event | `/events/**` | event-service | 0 |

## How Requests Flow

### Example: Owner Dashboard Loading Bookings

```
Frontend Request:
GET http://localhost:4200/bookings/owner/stats

↓ (Angular HTTP call)

Gateway Request:
GET http://localhost:8888/bookings/owner/stats

↓ (Gateway routing - matches booking-service route)

Eureka Lookup:
Resolve "field-service" instance

↓ (Load balanced request)

Field Service:
GET http://field-service:8080/bookings/owner/stats

↓ (BookingController handles request)

Response:
{ pending: 5, confirmed: 12, completed: 45, cancelled: 3 }
```

## Testing the Gateway

### 1. Check Gateway is Running
```bash
# Gateway should be running on port 8888

```

### 2. Test Booking Endpoints
```bash
# Get owner stats (requires JWT token)
curl -X GET http://localhost:8888/bookings/owner/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get recent bookings
curl -X GET http://localhost:8888/bookings/owner/recent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Test Player Endpoints
```bash
# Get all players
curl http://localhost:8888/players

# Get player feedbacks
curl http://localhost:8888/feedbacks/player/1
```

### 4. Test CORS
```bash
# From browser console at http://localhost:4200
fetch('http://localhost:8888/fields')
  .then(r => r.json())
  .then(console.log)
```

## Restart Required

⚠️ **Important:** The gateway must be restarted for these changes to take effect.

```bash
# Stop the gateway if running
# Then restart:
cd "c:\Users\LENOVO\Desktop\proj integ\backend - Copie\GateWay"
mvn spring-boot:run
```

## Verification Checklist

After restarting the gateway:

- [ ] Gateway starts successfully on port 8888
- [ ] Eureka shows all services registered
- [ ] `/bookings/**` requests route to field-service
- [ ] `/players/**` and `/feedbacks/**` route to player-service
- [ ] CORS headers are present in responses
- [ ] Angular frontend can make API calls without CORS errors
- [ ] Owner Dashboard loads booking statistics
- [ ] Player Dashboard loads player data

## Common Issues

### Issue: 404 Not Found for /bookings
**Cause:** Gateway not restarted or field-service not registered with Eureka

**Solution:**
1. Restart gateway
2. Check Eureka dashboard (http://localhost:8761)
3. Ensure field-service is registered

### Issue: CORS errors in browser
**Cause:** CORS filter not loaded or wrong origin

**Solution:**
1. Check gateway logs for CORS filter bean creation
2. Verify frontend is running on http://localhost:4200
3. Clear browser cache

### Issue: 503 Service Unavailable
**Cause:** Target service (field-service) not running

**Solution:**
1. Start field-service
2. Wait for Eureka registration (30 seconds)
3. Retry request

## Files Modified

1. `GateWay/src/main/resources/application.properties`
   - Added booking route
   - Fixed player service route
   - Renumbered event service route

2. `GateWay/src/main/java/com/Server/GateWay/CorsConfig.java`
   - Enabled CorsWebFilter
   - Configured for reactive gateway

## Next Steps

1. **Restart the Gateway**
2. **Test booking endpoints** from Postman or Angular
3. **Verify CORS** works from browser
4. **Check Eureka** dashboard for service registration
