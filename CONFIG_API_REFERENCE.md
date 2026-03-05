# SmartTrip Configuration API - Quick Reference

## 🚀 Quick Start

### Frontend - Fetch Cities
```javascript
import { useConfig } from '@/hooks/useConfig';

function MyComponent() {
  const { cities, loading, error } = useConfig('cities');
  
  if (loading) return <p>Loading...</p>;
  
  return (
    <select>
      {cities.map(c => <option key={c._id}>{c.name}</option>)}
    </select>
  );
}
```

### Backend - Validate Input
```javascript
import { validateVendorInput } from '../middleware/validationMiddleware.js';

router.post('/register', protect, validateVendorInput, registerVendor);
// Input automatically validated against ConfigCity, ConfigProvince, etc.
```

## 📋 All Config Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/config/cities` | GET | Fetch all cities | None |
| `/api/config/cities/:id` | PUT | Update city | Admin |
| `/api/config/cities/:id` | DELETE | Deactivate city | Admin |
| `/api/config/provinces` | GET | Fetch provinces | None |
| `/api/config/services` | GET | Fetch services | None |
| `/api/config/destinations` | GET | Fetch destinations | None |
| `/api/config/banks` | GET | Fetch banks | None |
| `/api/config/preferences` | GET | Fetch all preferences | None |
| `/api/config/preferences/:category` | GET | Fetch by category | None |
| `/api/config/workflows` | GET | Fetch trip workflows | None |

**Admin POST/PUT/DELETE endpoints:** Replace GET with POST/PUT/DELETE (requires admin token)

## 🎯 Configuration by Type

### Cities (16 total)
```javascript
{ name: "Kandy", province: "Central", region: "Hill Country", ... }
```

### Destinations (12 total)
```javascript
{ name: "Kandy", tag: "Cultural", emoji: "🛕", defaultDays: 3, defaultPrice: 45000, ... }
```

### Services (9 total)
```javascript
{ name: "Accommodation (Hotels/Guest Houses)", category: "accommodation", ... }
```

### Preferences (38 total)
**Categories:**
- `travelStyle` - 5 options: adventure, family, luxury, budget, relaxation
- `accommodationType` - 6 options: hotel, villa, resort, boutique, guesthouse, airbnb
- `mealPlan` - 4 options: breakfast, half-board, full-board, all-inclusive
- `activityInterest` - 6 options: hiking, wildlife, photography, snorkeling, spa, sunset-cruise
- `travelInterest` - 6 options: nature, adventure, cultural, beach, food, relaxation
- `language` - 3 options: english, sinhala, tamil
- `dietaryRestriction` - 5 options: vegetarian, vegan, halal, kosher, gluten-free
- `accessibility` - 4 options: wheelchair, mobility, hearing, visual

### Banks (10 total)
```javascript
{ name: "Bank of Ceylon", code: "BOC", country: "Sri Lanka" }
```

### Workflow Steps (4 total)
```javascript
[
  { step: 1, name: "Booking Submitted", order: 1, status: "completed" },
  { step: 2, name: "Vendor Approval", order: 2, status: "pending" },
  { step: 3, name: "Confirmed", order: 3, status: "pending" },
  { step: 4, name: "Trip Completed", order: 4, status: "pending" }
]
```

## 🔍 Example Requests

### Fetch All Cities
```bash
curl http://localhost:5001/api/config/cities
```

### Fetch Travel Styles
```bash
curl http://localhost:5001/api/config/preferences/travelStyle
```

### Register Vendor (with validation)
```bash
curl -X POST http://localhost:5001/api/vendors/register \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "My Hotel",
    "businessType": "Hotel/Guest House",
    "city": "Kandy",
    "province": "Central",
    "bankName": "Commercial Bank",
    "services": ["Accommodation (Hotels/Guest Houses)"]
  }'
```

### Admin: Add New City
```bash
curl -X POST http://localhost:5001/api/config/cities \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arugam Bay",
    "province": "Eastern",
    "region": "Beach",
    "description": "Premier beach destination"
  }'
```

## ✅ Validation Rules

### Vendor Registration
- `businessType` must be one of allowed values
- `city` must exist in ConfigCity
- `province` must exist in ConfigProvince
- `bankName` must exist in ConfigBank
- Each service in `services[]` must exist in ConfigService

### User Preferences
- `mealPlan` must be valid enum
- `travelStyle` must be valid enum
- Each in `accommodationType[]` must exist in preferences
- Each in `activityInterests[]` must exist in preferences
- Each in `dietaryRestrictions[]` must exist in preferences

### Trip Creation
- `destination` must exist in ConfigDestination

## 📊 Data Stats

| Type | Count | Records |
|------|-------|---------|
| Provinces | 9 | 9 |
| Cities | 16 | 16 |
| Services | 9 | 9 |
| Destinations | 12 | 12 |
| Preferences | 8 categories | 38 |
| Banks | 10 | 10 |
| Workflows | 4 | 4 |
| **TOTAL** | - | **98** |

## 🔒 Permission Levels

### Public (No Auth)
- GET /api/config/cities
- GET /api/config/destinations
- GET /api/config/services
- GET /api/config/preferences
- GET /api/config/banks
- GET /api/config/workflows

### Protected User (Logged In)
- POST /api/trips (with validation)
- PUT /api/auth/profile (with preference validation)

### Admin Only
- POST /api/config/cities
- PUT /api/config/cities/:id
- DELETE /api/config/cities/:id
- (Same for all other config types)

## 🐛 Common Issues

### Issue: "City not found in configuration"
**Solution:** Use exact city name from ConfigCity collection
```javascript
// WRONG
{ city: "kandy" }

// CORRECT
{ city: "Kandy" }
```

### Issue: Invalid travelStyle
**Solution:** Use exact values from preferences travelStyle category
```javascript
// WRONG
{ travelStyle: "Adventure Premium" }

// CORRECT
{ travelStyle: "adventure" }
```

### Issue: Service validation fails
**Solution:** Use exact service name from ConfigService
```javascript
// Check service name
GET /api/config/services
// Returns: { name: "Accommodation (Hotels/Guest Houses)" }

// Use exact name
{ services: ["Accommodation (Hotels/Guest Houses)"] }
```

## 📚 Further Reading

- **Full Documentation:** See `IMPLEMENTATION_GUIDE.md`
- **Audit Report:** See `AUDIT_REPORT.md`
- **Model Definitions:** Check `backend/src/models/Config*.js`
- **Validation Logic:** Check `backend/src/middleware/validationMiddleware.js`

## 🎓 Learning Path

1. **Start here:** Understand the problem in `AUDIT_REPORT.md`
2. **Explore:** Check config endpoints in `/api/config`
3. **Implement:** Use `useConfig` hook in frontend components
4. **Add validation:** Apply middleware to new routes
5. **Manage:** Use admin endpoints to update config

---

**Last Updated:** March 2, 2026  
**Status:** ✅ Production Ready

