# Dev Discussion 05: Optimistic UI & Error Recovery

## The Problem
Network requests have latency (150ms-2s). We need to decide how the application state handles "In-Flight" data to ensure the UI feels fast but stays accurate.

---

## Technical Exploration & Decisions

### 1. Optimistic UI Strategy
- **Decision**: We will update the **Local Context State** before the API call finishes.
- **Why**: 100ms of "wait" feels broken to a fast typer. By updating locally first, the user can move to the next row immediately.

### 2. The "Rollback" Mechanism
- **Challenge**: What happens if the `PUT` request fails (e.g., 500 Server Error)?
- **Decision**:
    - The `onSave` handler will store a "Snapshot" of the previous value.
    - If the fetch fails, the handler will dispatch a `ROLLBACK` action to restore the original value.
    - The UI will trigger a "Shake" animation and highlight the cell in red.

### 3. Handling Concurrent Edits
- **Constraint**: User edits Row A, then immediately edits Row B.
- **Decision**: 
    - We will use an **Operation Queue** or a **State Map** that tracks the status of each `id:field` pair.
    - Example: `syncStatus: { "1-salary": "saving", "2-name": "error" }`.
    - This allows multiple cells to be in different stages of the lifecycle simultaneously.

### 4. Visualizing Errors
- **Decision**: Avoid Modals/Alerts for row-level errors. 
- **Method**: Use a **Cell-Level Inline Indicator**. A small "!" icon that, when hovered, shows the server's error message (e.g., "Salary must be greater than 0").

---

## Final Decision: The "Atomic Edit" Lifecycle
We will implement an edit lifecycle with 4 distinct phases:
1. `Edit`: Local state change.
2. `Commit`: Optimistic local update + trigger API.
3. `Settle`: API succeeds $\rightarrow$ clear "saving" flag.
4. `Rollback`: API fails $\rightarrow$ revert to snapshot + show error UI.
