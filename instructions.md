# Thmanyah Backend Assessment — Implementation Plan

## Project goal

Build a backend with two parts, matching the assignment brief:

1. **CMS (internal)** — Editors create, update, and delete **programs** (visual content: podcasts, documentaries, etc.). Metadata: title, description, category, language, duration, publication date.
2. **Discovery (public)** — End users **browse and search** programs served from the same content store.

The solution should be **documented for frontend consumers**, **scalable in design**, and show **SOLID**, **low coupling**, and **clear module boundaries**.

---

## Scope note: programs vs episodes

The brief mentions **program episodes** (`حلقات برامج`). For a minimal pass, treat each **row as one listable unit** (e.g. one episode or one standalone program). If you want closer alignment with “show → episodes”, add a parent `Program` and child `Episode` entities later; the assignment does not require that depth for a first submission.

---

## Minimal architecture (beginner-friendly)

- One NestJS application (TypeScript), as preferred in the brief.
- One PostgreSQL database (fits relational metadata and search indexes).
- Three modules only:
  - `CmsModule` — writes.
  - `DiscoveryModule` — reads + search.
  - `ProgramsModule` — domain + persistence shared by both.

Avoid extra layers unless they clearly reduce coupling or improve testing.

---

## Project structure

```plaintext
src/
├── main.ts
├── app.module.ts
│
├── cms/
│   ├── cms.module.ts
│   ├── cms.controller.ts
│   ├── cms.service.ts
│   └── dto/
│
├── discovery/
│   ├── discovery.module.ts
│   ├── discovery.controller.ts
│   ├── discovery.service.ts
│   └── dto/
│
├── programs/
│   ├── programs.module.ts
│   ├── program.entity.ts
│   └── program.repository.ts
│
.env
```

---

## Program data model


| Field       | Type      | Notes                                                |
| ----------- | --------- | ---------------------------------------------------- |
| id          | UUID      | Primary key                                          |
| title       | string    |                                                      |
| description | text      |                                                      |
| category    | string    | Assignment: التصنيف                                  |
| language    | string    | e.g. `ar`, `en` — see Search strategy                |
| duration    | number    | Seconds or minutes; pick one and document in Swagger |
| publishDate | date      |                                                      |


Table name: `programs`.

**Future: multiple import sources** — The brief asks that the system **allow importing from several sources later**. You do not need full importers now; add hooks that keep the door open, for example:

- Nullable `source` (enum or string: `manual`, `youtube`, …) and `externalId` (string) on `programs`, **or**
- A short note in code/README that a dedicated `Import` / `Provider` boundary would sit beside `ProgramsModule` without merging write paths into Discovery.

---

## CMS endpoints (internal)

- `POST /cms/programs`
- `GET /cms/programs`
- `GET /cms/programs/:id`
- `PUT /cms/programs/:id` (or `PATCH` if you prefer partial updates — document the contract)
- `DELETE /cms/programs/:id`

CMS owns writes; Discovery must not mutate data.

---

## Discovery endpoints (public)

- `GET /programs` — list (pagination query params: `page`, `limit`, optional filters)
- `GET /programs/:id`
- `GET /programs/search?q=keyword` — or `GET /programs?search=…` if you prefer one list route; document clearly for frontend.

Discovery is **read-only**.

---

## Search strategy

Use **PostgreSQL full-text search** as a reasonable default (indexes, no extra cluster at MVP).

Example GIN index (adjust language config to match your content):

```sql
CREATE INDEX idx_programs_search
ON programs
USING GIN (to_tsvector('english', title || ' ' || description));
```

Example query:

```sql
SELECT *
FROM programs
WHERE to_tsvector('english', title || ' ' || description)
      @@ plainto_tsquery('english', $1);
```

**Arabic and mixed content:** If titles/descriptions are mostly Arabic, `'english'` is a weak fit. Options: use `simple` for language-agnostic tokenization, store a dedicated `search_vector` column maintained in application code or triggers, or plan **Elasticsearch / OpenSearch** as a stated upgrade (see below). Document the choice in Swagger and in your write-up.

---

## Design rules

- Controllers: HTTP only (status codes, DTOs, pipes).
- Services: business rules and orchestration.
- Repository (or TypeORM/Prisma data layer): SQL and mapping only.
- **CMS** and **Discovery** depend on **ProgramsModule**, not on each other.
- Stateless app instances (no in-memory authoritative state).
- DTO validation (`class-validator` / Zod, etc.).
- **OpenAPI (Swagger)** for all public and CMS routes the frontend will call.

---

## Scalability (10M users / hour — design intent)

The brief is about **architectural intent**, not proving that load in a demo.

- Stateless API → scale **horizontal** replicas (e.g. behind a load balancer on AWS).
- **Indexes** on list/filter/search fields; avoid N+1 queries.
- DB: read replicas for heavy read traffic; connection pooling.
- Later: **Redis** (cache hot lists / single program by id), **Elasticsearch** (better multilingual search), rate limiting at API gateway, CDN for any static assets.

Mention in your document what you would add first under real traffic.

---

## Required deliverable (from the assignment)

After implementation, write a **short document** (Markdown or PDF is fine) that covers:

1. How you designed the solution and why.
2. Main difficulties you hit.
3. Ideas for a **different or better** approach (e.g. episodes hierarchy, DynamoDB + OpenSearch, event-driven imports).

This is part of what evaluators grade; the code alone is not enough.

---

## What this implementation should demonstrate

- Clear NestJS module boundaries (CMS / Discovery / Programs).
- Low coupling: shared domain via ProgramsModule, not cross-importing CMS into Discovery.
- Search and schema choices you can justify.
- API documentation suitable for frontend developers.
- Awareness of scale and of **future multi-source imports**, even if not fully built.

