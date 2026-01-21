# Dev Discussion 04: Engineering the Multi-Value Editor

## The Problem
Handling arrays (e.g., `["React", "Node"]`) in a table cell requires a different data-flow than single strings. We need to handle serialization, de-serialization, and "Deduplication" during the edit process.

## Technical Exploration & Decisions

### 1. Data Serialization
- **The Input**: The API provides a JSON array.
- **The Internal State**: The editor should hold an array of objects `{ label, value }`.
- **The Output**: On commit, the editor must return a clean array of strings to the `onSave` handler.

### 2. Handling the "Faceted Search" for Arrays
- **Challenge**: Should the dropdown show items that are *already* selected?
- **Decision**: **No.** The search results should filter out any value that is already in the "Active" chips list to prevent accidental duplicates.

### 3. Delimiter Logic
- **Constraint**: Power users often copy-paste lists of items.
- **Decision**: The editor will listen for `paste` events and the `Comma` key. If a user pastes "React, Node, CSS", the editor will automatically split them by the comma and create three separate chips.

### 4. Layout Constraints in the Table Row
- **Challenge**: 10 chips can be much taller than a single table row (35px).
- **Decision**: 
    - **View Mode**: Show only the first 2-3 chips + a "+N more" indicator (Current behavior).
    - **Edit Mode**: Use the **Portal/Pop-over** strategy discussed in Dev Discussion 03. The Tag Editor will "expand" downwards over other rows while editing, then collapse back into the row on save.

---

## Final Decision: The "Tag portal" Component
We will build a `TagEditor` component that:
1. Receives an array.
2. Uses the shared `fetchFacetOptions` logic to suggest existing items.
3. Automatically deduplicates and trims input.
4. Portals itself to avoid layout thrashing during multi-selection.
