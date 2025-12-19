# Sports Arena Backend

Multi-microservice Spring Boot application with Keycloak authentication.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│          Frontend (React/Angular - Port 4200)       │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
    ┌─────────────┐         ┌──────────────┐
    │   Gateway   │         │ Auth Service │
    │  (8888)     │         │   (8083)     │
    └──────┬──────┘         └──────┬───────┘
           │                       │
    ┌──────┴──────────────┬────────┴──────┬─────────────┐
    ▼                     ▼                ▼             ▼
┌─────────┐          ┌────────────┐  ┌─────────┐  ┌──────────┐
│ Player  │          │   Field    │  │  Event  │  │Keycloak  │
│(8081)   │          │  (8084)    │  │ (8085)  │  │ (8080)   │
└────┬────┘          └──────┬─────┘  └────┬────┘  └──────────┘
     │                      │             │
     └──────────┬───────────┴─────────────┘
                ▼
           ┌─────────────┐
           │   MySQL     │
           │ (3306)      │
           └─────────────┘
```

## Services

| Service | Port | Purpose |
|---------|------|---------|
| **auth-service** | 8083 | User authentication with Keycloak, JWT token generation |
| **player-service** | 8081 | Player profiles, feedback management |
| **field-service** | 8084 | Sports field management |
| **event-service** | 8085 | Event creation and management |
| **notification-service** | 8086 | In-app notifications (player accepted, field reserved, internal alerts) |
| **reservation-service** | 8082 | Field reservations management |
| **discovery-service** | 8761 | Eureka service discovery |
| **api-gateway** | 8888 | API Gateway routing (optional) |
| **Keycloak** | 8080 | OAuth2/OIDC provider, user management |
| **MySQL** | 3306 | Database for service-specific data |

## Requirements

- **Java:** 17 or higher
- **Maven:** 3.6 or higher
- **MySQL:** 8.0 or higher
- **Keycloak:** 26.4.5
- **Spring Boot:** 3.5.7
- **Spring Cloud:** 2024.0.0

## Quick Start

### 2. Configure Keycloak

1. Go to http://localhost:8080/admin
2. Login with admin/admin
3. Create realm: `sports-arena`
4. Create users with roles:
   - owner1 / password / PLAYER role
   - owner2 / password / PLAYER role
5. Create client: `web-frontend` (public client)

### 3. Start Services

```bash
# Discovery Service
cd discovery
mvn clean spring-boot:run

# Auth Service
cd auth-service
mvn clean spring-boot:run

# Player Service
cd player-service
mvn clean spring-boot:run

# Field Service
cd field-service
mvn clean spring-boot:run

# Event Service
cd event-service
mvn clean spring-boot:run

# Notification Service
cd notification-service
mvn clean spring-boot:run
```

## API Usage

### Authentication

**Login:**
```bash
POST http://localhost:8083/auth/login
Content-Type: application/json

{
  "username": "owner1",
  "password": "120"
}

Response:
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### Player Service

**Get Current Player:**
```bash
GET http://localhost:8081/api/players/me
Authorization: Bearer <access_token>
```

**Get All Players:**
```bash
GET http://localhost:8081/api/players
Authorization: Bearer <access_token>
```

**Get Player by ID:**
```bash
GET http://localhost:8081/api/players/{id}
Authorization: Bearer <access_token>
```

**Update Player:**
```bash
PUT http://localhost:8081/api/players/{id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "nom": "Updated Name",
  "prenom": "Updated FirstName",
  "poste": "Goalkeeper",
  "bio": "Professional player"
}
```

**Add Feedback:**
```bash
POST http://localhost:8081/api/feedbacks/player/{playerId}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "content": "Great player!",
  "rating": 5
}
```

### Notification Service

**Get my notifications:**
```bash
GET http://localhost:8086/notifications
Authorization: Bearer <access_token>
```

**Mark notification as read:**
```bash
PUT http://localhost:8086/notifications/{notificationId}/read
Authorization: Bearer <access_token>
```

### Field Service

**Get Field Weather (External API):**
```bash
GET http://localhost:8084/fields/{id}/weather
Authorization: Bearer <access_token>
```
*Returns real-time weather data for the field location using Open-Meteo API.*

**Get All Available Fields:**
```bash
GET http://localhost:8084/fields
Authorization: Bearer <access_token>
```

**Get Field by ID:**
```bash
GET http://localhost:8084/fields/{id}
Authorization: Bearer <access_token>
```

**Notify player accepted (called from event-service):**
```bash
POST http://localhost:8086/notifications/player-accepted
Authorization: Bearer <service_token>
Content-Type: application/json

{
  "eventId": 10,
  "eventTitle": "Sunday Match",
  "organizerKeycloakId": "organizer-keycloak-id",
  "organizerEmail": "owner@example.com",
  "playerKeycloakId": "player-keycloak-id",
  "playerEmail": "player@example.com",
  "message": "You have been added to Sunday Match!"
}
```

## Project Structure

```
backend/
├── auth-service/              # Authentication service
│   ├── src/main/java/com/iset/
│   │   ├── config/            # Security & Keycloak config
│   │   ├── controller/        # Auth endpoints
│   │   ├── service/           # Auth logic
│   │   └── dto/               # Data transfer objects
│   └── pom.xml
│
├── player-service/            # Player management
│   ├── src/main/java/com/iset/
│   │   ├── controller/        # Player endpoints
│   │   ├── service/           # Business logic
│   │   ├── entity/            # JPA entities
│   │   ├── repository/        # Data access
│   │   └── dto/               # DTOs
│   └── pom.xml
│
├── field-service/             # Field management
├── event-service/             # Event management
├── discovery/                 # Eureka discovery service
├── gateway/                   # API Gateway (optional)
└── README.md
```

## Database Schema

### Players Table
```sql
CREATE TABLE players (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  keycloak_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  nom VARCHAR(100),
  prenom VARCHAR(100),
  poste VARCHAR(50),
  photo LONGBLOB,
  tel VARCHAR(20),
  bio TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Security

- **User Authentication:** Keycloak (OAuth2/OIDC)
- **Token Type:** JWT (JSON Web Token)
- **Token Validation:** JwtDecoder with Keycloak JWK endpoint
- **Role-Based Access:** @PreAuthorize annotations on endpoints
- **CORS:** Configured for http://localhost:4200

## External API & Resilience

### 🌤️ Weather Integration (Feign Client)
Implemented in **`field-service`** to provide real-time weather forecasts.
- **External Provider:** [Open-Meteo API](https://open-meteo.com/)
- **Technology:** Spring Cloud OpenFeign
- **Implementation:** `WeatherClient` interface and `WeatherService` wrapper.

### 🛡️ Fault Tolerance (Circuit Breaker)
Implemented using **Resilience4j** to protect the system from external service outages.
- **Service Protected:** Weather API calls in `field-service`.
- **Fallback Logic:** Returns a safe default response (Temperature: 0.0, Status: N/A) if the external API is down.
- **Configuration:** Custom thresholds for failure rate and automatic recovery (Half-Open state) defined in `application.properties`.
![alt text](<weather soa.png>)
## Key Design Decisions

1. **Keycloak for Auth:** Users stored in Keycloak, not in backend database
2. **Service-Specific Data:** Each service has its own MySQL database
3. **User Linking:** Backend services link to Keycloak via `keycloak_id` field
4. **Auto-Create Profiles:** Player profile auto-created on first authenticated request
5. **JWT Claims:** Roles and user info embedded in JWT token
6. **Service Discovery:** Eureka for dynamic service registration

## Troubleshooting

### 401 Unauthorized
- Check if JWT token is valid
- Verify token in Authorization header format: `Bearer <token>`
- Ensure user has required roles in Keycloak

### 404 Not Found
- Verify correct context path (e.g., `/api` for player-service)
- Check endpoint URL format
- Ensure service is running on correct port

### 400 Bad Request
- Verify request body is valid JSON
- Check endpoint path conflicts (specific paths before generic paths)
- Ensure required fields are included

### 500 Internal Server Error
- Check service logs for stack trace
- Verify database connection
- Ensure Keycloak is accessible

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add feature description"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a pull request

