# Open Egypt

Open-source digital infrastructure for Egypt.  
Built to make public-interest data accessible, structured, and usable.

The first release exposes a **Car Prices API** covering the Egyptian market.

---

## What This Project Provides

**Open Egypt** publishes normalized, queryable datasets through a public API, starting with car prices in Egypt.

It is designed for:
- Developers building consumer or analytics products
- Researchers and journalists
- Startups needing reliable baseline data
- Anyone tired of scraping the same sites repeatedly

The project is open-source and publicly accessible, with **rate limits enforced** to ensure fair use.

---

## Current Dataset: Car Prices

The API provides structured access to:

- Car brands
- Models
- Variants
- Year-based pricing
- Historical price entries
- English and Arabic names

Data is sourced from publicly available listings and normalized into a consistent schema.

---

## API Access

### Base Endpoints

- **Search/Prices:** `/functions/v1/get-car-prices`
- **Autocomplete:** `/functions/v1/autocomplete`

### Autocomplete API

Provides real-time suggestions for brands and models.

**Parameters:**
- `q`: Search query (minimum 1 character)
- `limit`: (Optional) Max number of results (default 10)

**Response:**
```json
{
  "suggestions": [
    {
      "type": "brand",
      "label": "BMW",
      "value": "bmw",
      "meta": { "logo": "..." }
    },
    {
      "type": "model",
      "label": "BMW X5",
      "value": "X5",
      "meta": { "brand": "BMW", "brand_slug": "bmw" }
    }
  ]
}
```

### Example Use Cases

- Compare prices across brands and years
- Build car search or comparison tools
- Analyze market price trends
- Power dashboards or internal tools

The API is public and does not require authentication.

Rate limits apply.

---

## Technical Overview (High-Level)

- **Database:** PostgreSQL (Supabase)
- **Execution:** Edge Functions
- **Infrastructure:** Edge-first, backend-less
- **Schema:** Strongly typed, normalized, versioned

All application logic runs at the edge or inside the database.

There are no traditional backend servers.

---

## Project Status

- Data ingestion: Complete (initial dataset)
- API: Live, early-stage
- Frontend: Pre-alpha
- Stability: Improving, expect iteration

Breaking changes may occur during early development.

---

## Usage Policy

- This project is **open-source**
- Read-only usage is permitted
- Automated scraping of the API is not allowed
- Abuse or excessive usage will be rate-limited or blocked

The goal is accessibility, not exploitation.

---

## Contributions

This repository is public for transparency.

External contributions are **not being accepted at this stage**.

This may change in the future once the architecture and data pipelines fully stabilize.

---

## License

MIT License.

Use responsibly.

---

## Why This Exists

Critical datasets should not require:
- Closed contracts
- Vendor lock-in
- Manual scraping
- Guesswork schemas

Open Egypt exists to quietly fix that.

More datasets will follow.