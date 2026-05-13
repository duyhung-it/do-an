# B2B eCommerce Backend

Spring Boot API scaffold for the B2B eCommerce platform.

## Run

```powershell
cd be
mvn spring-boot:run
```

If Maven reports `JAVA_HOME` is missing, install/configure JDK 21 and retry.

## Main Endpoints

- `GET /api/v1/health`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `GET /api/v1/auth/me`
- `GET /api/v1/categories`
- `GET /api/v1/products?page=1&pageSize=20&search=laptop`
- `GET /api/v1/suppliers?page=1&pageSize=20`

Seed login accounts:

- `buyer@example.com`
- `seller@example.com`
- `admin@example.com`

The current implementation uses in-memory data so the frontend can start replacing mock services with real HTTP calls.
