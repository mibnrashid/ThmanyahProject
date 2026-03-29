# Thmanyah Backend Assessment

## Project goal

This project implements a backend with two parts from the assignment brief:

1. **CMS (internal)** for creating, editing, and deleting programs.
2. **Discovery (public)** for listing and searching programs.

The implementation uses **NestJS + TypeScript + PostgreSQL**, with clear module boundaries and low coupling.

---

## Current architecture

The system is implemented as one NestJS app with three main modules:

- `CmsModule`: write-side endpoints and business logic.
- `DiscoveryModule`: read-side endpoints for public consumption.
- `ProgramsModule`: shared domain and persistence (`ProgramRepository` + `Program` entity).

Dependency direction is intentional:

- `CmsModule` -> `ProgramsModule`
- `DiscoveryModule` -> `ProgramsModule`
- `CmsModule` and `DiscoveryModule` do **not** depend on each other.

This keeps responsibilities separated and makes future changes easier.

---

## Request flow

End-to-end request flow in the current code:

1. HTTP request reaches a controller (`cms` or `discovery`).
2. Controller validates/parses request input (DTO + query/param parsing).
3. Service applies business rules and orchestration.
4. `ProgramRepository` executes database operations via TypeORM.
5. PostgreSQL returns data to the API response.

Global validation is enabled in `main.ts` through `ValidationPipe` with:

- `whitelist: true`
- `transform: true`
- `enableImplicitConversion: true`

Swagger documentation is available at:

- `GET /api`

---

## Project structure

```plaintext
src/
├── main.ts
├── app.module.ts
├── query-params.ts
│
├── cms/
│   ├── cms.module.ts
│   ├── cms.controller.ts
│   ├── cms.service.ts
│   └── dto/
│       ├── create-program.dto.ts
│       └── update-program.dto.ts
│
├── discovery/
│   ├── discovery.module.ts
│   ├── discovery.controller.ts
│   └── discovery.service.ts
│
└── programs/
    ├── programs.module.ts
    ├── program.entity.ts
    └── program.repository.ts
```

---

## Data model (implemented)

Table: `programs`


| Field         | Type         | Notes                                           |
| ------------- | ------------ | ----------------------------------------------- |
| `id`          | UUID         | Primary key (`@PrimaryGeneratedColumn('uuid')`) |
| `title`       | varchar(512) | Program title                                   |
| `description` | text         | Long description                                |
| `category`    | varchar(256) | Classification                                  |
| `language`    | varchar(32)  | Language code/label                             |
| `duration`    | int          | Duration in seconds                             |
| `publishDate` | date         | Publication date                                |
| `createdAt`   | timestamptz  | Auto-created timestamp                          |
| `updatedAt`   | timestamptz  | Auto-updated timestamp                          |


---

## API endpoints (implemented)

### CMS (internal, write-side)

- `POST /cms/programs` -> create program
- `GET /cms/programs` -> paginated list for editors
- `GET /cms/programs/:id` -> get one program by UUID
- `PATCH /cms/programs/:id` -> partial update
- `PUT /cms/programs/:id` -> mapped to same update handler (send only changed fields)
- `DELETE /cms/programs/:id` -> delete (returns `204 No Content`)

### Discovery (public, read-only)

- `GET /programs` -> paginated list with optional filters:
  - `page`
  - `limit`
  - `category`
  - `language`
- `GET /programs/:id` -> get one program by UUID
- `GET /programs/search?q=...` -> full-text search on title + description
  - returns `400` if `q` is missing/blank

---

## Pagination and input behavior

Shared query parsing is implemented in `query-params.ts`:

- Default `page = 1`
- Default `limit = 20`
- Maximum `limit = 100`

UUID path params are validated with `ParseUUIDPipe`.

Create/update payloads are validated using `class-validator` DTOs:

- `title`: string, max 512
- `description`: string
- `category`: string, max 256
- `language`: string, max 32
- `duration`: integer, minimum 0
- `publishDate`: ISO date string

`UpdateProgramDto` uses `PartialType(CreateProgramDto)`, so all fields are optional in updates.

---

## Search strategy (implemented)

Search is implemented with PostgreSQL full-text query in `ProgramRepository.searchFullText`:

- Uses `to_tsvector('simple', title || ' ' || description)`
- Matches with `plainto_tsquery('simple', :q)`
- Returns paginated results and total count

Why `simple`:

- Better neutral default for mixed-language content compared to `english`.

Future optimization options if scale/search relevance needs increase:

- dedicated search vector column + GIN index
- external search engine (OpenSearch/Elasticsearch)

---

## Environment variables and startup

Configuration is loaded from `.env` and `.env.local`.

Supported variables:

- `PORT` (default `3000`)
- `DB_HOST` (default `localhost`)
- `DB_PORT` (default `5432`)
- `DB_USERNAME` (default `postgres`)
- `DB_PASSWORD` (default `postgres`)
- `DB_DATABASE` (default `thmanyah`)
- `DB_SYNCHRONIZE` (default `false`)
- `DB_LOGGING` (default `false`)

Run commands:

```bash
npm install
npm run start:dev
```

Other scripts:

```bash
npm run build
npm run start
npm run start:prod
```

---

## Scalability notes

The current code is built with scalable boundaries in mind:

- stateless API design
- clear read/write separation by module responsibility
- repository layer centralized for query optimization
- paginated listing and constrained page size

Recommended next scaling steps for real high traffic:

1. Add indexes for list and search paths.
2. Add connection pooling/read replicas strategy.
3. Add caching (e.g., Redis) for hot reads.
4. Improve multilingual search ranking (OpenSearch/Elasticsearch if needed).
5. Add rate limiting at gateway/load balancer level.

---

## Future enhancement: multi-source import

The assignment asks for enabling imports from multiple sources in the future.
Current implementation keeps this possible by clean module boundaries.

A practical next step would be adding an `ImportModule` or provider adapters (e.g., YouTube, CMS feed) that write through `ProgramsModule`, while keeping Discovery read-only.