# User Story 04: Action Feedback & Persistence

## 1. The User Story
**Scenario**: Sarah is quickly updating salaries across 50 rows.
> "As a high-velocity user, I need to know *exactly* when my data is safe. I don't want to wait for a loading spinner on every cell, but I also don't want to wonder if a save failed. If something goes wrong, the system should catch me immediately and help me fix it without losing my work."

---

## 2. Research & Recommended Approaches

### The "Silent" Save (The Prototype Way)
- **Concept**: User types, hits enter, and the input disappears.
- **Pros**: Zero UI clutter.
- **Cons**: Zero confidence. The user has no idea if the server actually received the change. If the Wi-Fi dropped, the data is lost silently.

### The "Intrusive" Block (The Traditional Way)
- **Concept**: Every save triggers a full-screen loading overlay.
- **Pros**: 100% certainty.
- **Cons**: Total productivity killer. You can't edit Row 2 while Row 1 is saving.

### The "Fluent" Feedback (The Professional/Modern Way)
- **Concept**: **Optimistic UI with State Transitions.** 
- **States**:
    1. **Dirty**: The cell is changed but not yet sent.
    2. **Saving**: A subtle indicator (e.g., a slim progress bar at the top of the cell or the text turning gray).
    3. **Success**: A brief "Commit Flash" (subtle green background fade).
    4. **Error**: The cell turns red and offers a "Retry/Revert" tooltip.

---

## 3. Final Recommendation: The "Confident Cell" Architecture

For a premium enterprise experience, we recommend a **Non-Blocking Optimistic Feedback** system.

### Key Features:
1. **Optimistic Updates**: The UI updates immediately as if the save succeeded. This makes the app feel "instant."
2. **Subtle Sync Indicators**: A tiny "Sync" icon or a color shift in the cell text while the request is in flight.
3. **Graceful Error Recovery**: If the server rejects the change, the cell **vibrates** (shake animation), turns red, and stays in "Edit Mode" so the user can see their mistake and fix it.
4. **Global Persistence Bar**: If there are network issues, a subtle "Offline - 3 changes pending" bar appears at the bottom of the table.

### The Professional Verdict:
User confidence is built on **Transparency**. By showing the user the lifecycle of their data (Saving -> Saved) without stopping their work, we create a "Flow State" that is essential for power users.
