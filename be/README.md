# CELLPHONES B2C Backend

Spring Boot API for the CELLPHONES B2C eCommerce platform.

## Run

```powershell
cd be
mvn spring-boot:run
```

If Maven reports `JAVA_HOME` is missing, install/configure JDK 21 and retry.

## PostgreSQL With Docker

```powershell
cd be
docker compose up -d postgres
docker compose ps
```

Connection details:

- Host: `localhost`
- Port: `5432`
- Database: `cellphones`
- User: `cellphones_user`
- Password: `cellphones_password`

Spring Boot uses the same values by default:

```properties
DB_URL=jdbc:postgresql://localhost:5432/cellphones
DB_USERNAME=cellphones_user
DB_PASSWORD=cellphones_password
```

Database schema changes are managed by Flyway migrations in:

```text
src/main/resources/db/migration
```

Stop PostgreSQL:

```powershell
docker compose down
```

Delete database volume:

```powershell
docker compose down -v
```

## Main Endpoints

- `GET /api/v1/health`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `GET /api/v1/auth/me`
- `GET /api/v1/categories`
- `GET /api/v1/categories/{id}`
- `GET /api/v1/categories/{slug}/by-slug`
- `POST /api/v1/admin/categories`
- `PATCH /api/v1/admin/categories/{id}`
- `DELETE /api/v1/admin/categories/{id}`
- `GET /api/v1/products?page=1&pageSize=20&search=iphone`
- `GET /api/v1/products/{id}`
- `GET /api/v1/products/{slug}/by-slug`
- `GET /api/v1/products/{id}/similar`
- `GET /api/v1/products/{id}/accessories`
- `GET /api/v1/products/featured`
- `GET /api/v1/products/hot`
- `GET /api/v1/products/new`
- `GET /api/v1/products/brands`
- `POST /api/v1/admin/products`
- `PATCH /api/v1/admin/products/{id}`
- `DELETE /api/v1/admin/products/{id}`
- `GET /api/v1/products/{productId}/variants`
- `POST /api/v1/admin/products/{productId}/variants`
- `PATCH /api/v1/admin/products/{productId}/variants/{id}`
- `DELETE /api/v1/admin/products/{productId}/variants/{id}`
- `GET /api/v1/products/{productId}/images`
- `POST /api/v1/admin/products/{productId}/images`
- `PATCH /api/v1/admin/products/{productId}/images/{id}`
- `DELETE /api/v1/admin/products/{productId}/images/{id}`

Catalog data is persisted in PostgreSQL through JPA repositories. Legacy mock endpoints are still available under
`/api/v1/mock/*` during the transition.
