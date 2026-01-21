# Dev Discussion 01: Metadata Fetching Strategies

## The Problem
Our table needs to provide unique values (facets) for dropdowns across 100,000 records. We need to decide how to deliver this metadata to the client.

## Constraints
- **Data Volume**: 100k records.
- **Network Bandwidth**: Do not want to bloat the main `JSON` response.
- **latency**: The user expects a "snappy" edit experience.

---

## Exploration & Trade-offs

### Option 1: The "Fat Payload" (Bundling)
Include all possible dropdown options in the initial `/api/users` response.
- **Pros**: Zero latency during editing.
- **Cons**: Dramatically increases response size. If 10 columns have 200 unique values each, we are sending 2,000 extra strings on every pagination request.
- **Decision**: **Rejected** due to inefficiency.

### Option 2: Pure On-Demand (No Cache)
Fetch the options every time a user clicks "Edit."
- **Pros**: Perfectly lean initial load.
- **Cons**: 150ms-300ms delay every time a user enters a cell. Feels "stuttery" for high-frequency users.
- **Decision**: **Rejected** due to UX friction.

### Option 3: Lazy-Load with Session Cache (The Winner)
Fetch options the *first* time they are needed, then store them in a local cache (Context/State).
- **Pros**: Fast initial load. Instant interaction for subsequent edits in the same column.
- **Cons**: Complexity in managing a "Facet Cache" state.
- **Decision**: **Accepted**. It provides the best balance of speed and scalability.

---

## Final Technical Decision
**Implementation**: Dedicated `/api/facets/:field` endpoint.
**Why**: 
1. The server can pre-compute these facets on startup (O(1) lookup).
2. The client fetches only what it needs, when it needs it.
3. It allows us to implement "Strict" and "Suggestive" modes easily by checking the presence and content of the facet data.
