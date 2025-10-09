# Automatic Parking System

A complete web-based automatic parking system that uses QR code scanning to track vehicle entry and exit times. The system features real-time camera scanning, automatic fee calculation, and a comprehensive backend API.

## Features

- **Real-time QR Code Scanning**: Uses WebRTC camera access with jsQR library
- **Vehicle Registration**: Register vehicles with owner information
- **Entry/Exit Tracking**: Automatic detection of parking sessions
- **Fee Calculation**: Configurable hourly rates with grace periods
- **Debounced Scanning**: Prevents duplicate scans within 5 seconds
- **Manual Lookup**: Fallback for unreadable QR codes
- **Rate Limiting**: API protection against abuse
- **Responsive UI**: Works on desktop and mobile devices
- **SQLite Database**: Lightweight, file-based storage
- **Comprehensive Testing**: Unit and integration tests included

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, jsQR library
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **QR Scanning**: jsQR with WebRTC camera access
- **Testing**: Node.js built-in test runner

## Quick Start

### Prerequisites

- Node.js 18+ (with ES modules support)
- Modern web browser with camera support
- HTTPS connection (required for camera access)

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd parking-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the database:**
   ```bash
   npm run setup-db
   ```
   This creates `parking.db` with sample data including 3 test vehicles.

4. **Start the server:**
   ```bash
   npm start
   ```
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3001` (or `https://localhost:3001` for camera access)

### HTTPS Setup (Required for Camera)

For camera access, you need HTTPS. Use one of these options:

**Option 1: Local HTTPS with mkcert**
```bash
# Install mkcert
npm install -g mkcert

# Create local CA
mkcert -install

# Generate certificates
mkcert localhost 127.0.0.1 ::1

# Update server.js to use HTTPS (see HTTPS section below)
```

**Option 2: Use ngrok for testing**
```bash
# Install ngrok
npm install -g ngrok

# Start server
npm start

# In another terminal, expose with HTTPS
ngrok http 3001
```

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### 1. Scan QR Code
**POST** `/api/scan`

Process a QR code scan for vehicle entry/exit.

**Request Body:**
```json
{
  "qr": "550e8400-e29b-41d4-a716-446655440000"
}
```

Or JSON format:
```json
{
  "qr": "{\"vehicle_id\":\"550e8400-e29b-41d4-a716-446655440000\",\"nonce\":\"abc123\"}"
}
```

**Response (Entry):**
```json
{
  "action": "entry",
  "vehicle_id": "550e8400-e29b-41d4-a716-446655440000",
  "vehicle": {
    "plate": "ABC-123",
    "owner_name": "John Doe"
  },
  "parking_session": {
    "entry_time": "2023-12-07T10:30:00.000Z",
    "session_id": 1
  },
  "message": "Vehicle ABC-123 entered parking at 12/7/2023, 10:30:00 AM"
}
```

**Response (Exit):**
```json
{
  "action": "exit",
  "vehicle_id": "550e8400-e29b-41d4-a716-446655440000",
  "vehicle": {
    "plate": "ABC-123",
    "owner_name": "John Doe"
  },
  "parking_session": {
    "entry_time": "2023-12-07T10:30:00.000Z",
    "exit_time": "2023-12-07T12:45:00.000Z",
    "duration_minutes": 135,
    "fee_amount": 10.00
  },
  "message": "Vehicle ABC-123 exited. Duration: 135 minutes, Fee: $10.00"
}
```

#### 2. Register Vehicle
**POST** `/api/register-vehicle`

Register a new vehicle in the system.

**Request Body:**
```json
{
  "vehicle_id": "new-vehicle-001",
  "plate": "NEW-001",
  "owner_name": "Jane Smith",
  "phone": "+1234567890",
  "meta": {
    "color": "red",
    "type": "suv",
    "notes": "VIP customer"
  }
}
```

**Response:**
```json
{
  "message": "Vehicle registered successfully",
  "vehicle": {
    "id": 4,
    "vehicle_id": "new-vehicle-001",
    "plate": "NEW-001",
    "owner_name": "Jane Smith",
    "phone": "+1234567890",
    "meta": {
      "color": "red",
      "type": "suv",
      "notes": "VIP customer"
    }
  }
}
```

#### 3. Get Parking Logs
**GET** `/api/logs?vehicle_id=<vehicle_id>&limit=50&offset=0`

Retrieve parking logs for a specific vehicle.

**Response:**
```json
{
  "vehicle_id": "550e8400-e29b-41d4-a716-446655440000",
  "logs": [
    {
      "id": 1,
      "vehicle_id": "550e8400-e29b-41d4-a716-446655440000",
      "entry_time": "2023-12-07T10:30:00.000Z",
      "exit_time": "2023-12-07T12:45:00.000Z",
      "duration_minutes": 135,
      "fee_amount": 10.00,
      "status": "completed"
    }
  ],
  "count": 1
}
```

#### 4. List All Vehicles
**GET** `/api/vehicles`

Get all registered vehicles (admin endpoint).

#### 5. Get Configuration
**GET** `/api/config`

Get current parking configuration.

**Response:**
```json
{
  "config": {
    "hourly_rate": "5.00",
    "grace_period_minutes": "15",
    "max_daily_fee": "50.00"
  }
}
```

#### 6. Health Check
**GET** `/api/health`

Check server health status.

## Sample cURL Examples

### Test Vehicle Entry
```bash
curl -X POST http://localhost:3001/api/scan \
  -H "Content-Type: application/json" \
  -d '{"qr": "550e8400-e29b-41d4-a716-446655440000"}'
```

### Test Vehicle Exit (run again)
```bash
curl -X POST http://localhost:3001/api/scan \
  -H "Content-Type: application/json" \
  -d '{"qr": "550e8400-e29b-41d4-a716-446655440000"}'
```

### Register New Vehicle
```bash
curl -X POST http://localhost:3001/api/register-vehicle \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": "test-vehicle-123",
    "plate": "TEST-123",
    "owner_name": "Test User",
    "phone": "+1234567890",
    "meta": {"color": "blue", "type": "sedan"}
  }'
```

### Get Parking Logs
```bash
curl "http://localhost:3001/api/logs?vehicle_id=550e8400-e29b-41d4-a716-446655440000"
```

### List All Vehicles
```bash
curl http://localhost:3001/api/vehicles
```

## QR Code Format

The system supports two QR code formats:

### 1. Simple Vehicle ID
```
550e8400-e29b-41d4-a716-446655440000
```

### 2. JSON Format (with optional security)
```json
{
  "vehicle_id": "550e8400-e29b-41d4-a716-446655440000",
  "nonce": "random-string-123",
  "sig": "optional-hmac-signature"
}
```

## Sample Test Data

The system comes with 3 pre-registered vehicles for testing:

| Vehicle ID | Plate | Owner | QR Code |
|------------|-------|-------|---------|
| `550e8400-e29b-41d4-a716-446655440000` | ABC-123 | John Doe | Simple UUID |
| `6ba7b810-9dad-11d1-80b4-00c04fd430c8` | XYZ-789 | Jane Smith | UUID format |
| `simple-vehicle-001` | DEF-456 | Bob Johnson | Simple string |

## Fee Calculation

The parking fee is calculated using the following formula:

```javascript
function calculateParkingFee(durationMinutes, config) {
    const gracePeriod = parseInt(config.grace_period_minutes) || 15;
    const hourlyRate = parseFloat(config.hourly_rate) || 5.0;
    const maxDailyFee = parseFloat(config.max_daily_fee) || 50.0;
    
    if (durationMinutes <= gracePeriod) {
        return 0; // Free parking within grace period
    }
    
    // Calculate fee: ceil((duration - grace)/60) * hourly_rate
    const billableHours = Math.ceil((durationMinutes - gracePeriod) / 60);
    const fee = billableHours * hourlyRate;
    
    return Math.min(fee, maxDailyFee); // Cap at daily maximum
}
```

**Example:**
- Grace period: 15 minutes (free)
- Hourly rate: $5.00
- Duration: 75 minutes
- Billable time: 75 - 15 = 60 minutes = 1 hour
- Fee: 1 × $5.00 = $5.00

## Database Schema

### Tables

#### vehicles
```sql
CREATE TABLE vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id TEXT UNIQUE NOT NULL,
    plate TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    phone TEXT,
    meta TEXT, -- JSON metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### parking_logs
```sql
CREATE TABLE parking_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id TEXT NOT NULL,
    entry_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    exit_time DATETIME,
    duration_minutes INTEGER,
    fee_amount DECIMAL(10,2),
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
);
```

#### parking_config
```sql
CREATE TABLE parking_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key TEXT UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Testing

### Run Tests
```bash
npm test
```

The test suite includes:
- API endpoint testing
- Database operations
- Entry/exit flow integration
- Error handling
- Rate limiting
- QR code format validation

### Test Coverage
- ✅ Vehicle registration
- ✅ QR code scanning (entry/exit)
- ✅ Fee calculation
- ✅ Parking logs retrieval
- ✅ Error handling
- ✅ JSON and simple QR formats
- ✅ Complete parking session flow

## Security Features

1. **Rate Limiting**: 100 requests per 15 minutes, 30 scans per minute
2. **Input Validation**: All API inputs are validated
3. **SQL Injection Protection**: Parameterized queries
4. **HMAC Signature Verification**: Optional QR code signing
5. **CORS Protection**: Configurable cross-origin policies
6. **Error Handling**: No sensitive information in error messages

## Production Deployment

### Environment Variables
```bash
PORT=3001                    # Server port
DB_PATH=./parking.db        # Database file path
NODE_ENV=production         # Environment
HMAC_SECRET=your-secret-key # QR signature verification
```

### HTTPS Configuration

For production, modify `server.js` to use HTTPS:

```javascript
import https from 'https';
import fs from 'fs';

const options = {
    key: fs.readFileSync('path/to/private-key.pem'),
    cert: fs.readFileSync('path/to/certificate.pem')
};

https.createServer(options, app).listen(PORT, () => {
    console.log(`HTTPS Server running on port ${PORT}`);
});
```

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run setup-db
EXPOSE 3001
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t parking-system .
docker run -p 3001:3001 -v $(pwd)/parking.db:/app/parking.db parking-system
```

## Troubleshooting

### Camera Issues
- **Permission Denied**: Ensure HTTPS connection
- **No Camera Found**: Check browser permissions
- **Poor Scanning**: Ensure good lighting and steady camera

### Database Issues
- **Database Locked**: Check for multiple server instances
- **Setup Failed**: Ensure write permissions in directory

### API Issues
- **Rate Limited**: Wait for rate limit window to reset
- **404 Errors**: Check vehicle registration status
- **500 Errors**: Check server logs for detailed error messages

## Browser Compatibility

| Browser | Camera Support | QR Scanning | Notes |
|---------|---------------|-------------|-------|
| Chrome 70+ | ✅ | ✅ | Full support |
| Firefox 65+ | ✅ | ✅ | Full support |
| Safari 11+ | ✅ | ✅ | iOS requires HTTPS |
| Edge 79+ | ✅ | ✅ | Full support |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Run the test suite to verify setup
4. Check browser console for client-side errors
5. Check server logs for backend issues