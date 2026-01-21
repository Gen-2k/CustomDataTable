# Dev Discussion 02: Input Type Resolution Strategies

## The Problem
We need a consistent and robust way to determine which UI component (Input, Select, Combobox) to render when a user enters "Edit Mode." We must avoid "forcing" a UI type that doesn't fit the data or the user's intent.

## Constraints
- **Data Integrity**: Some fields MUST be restricted to a list.
- **User Freedom**: Some fields should only suggest values but allow free-form text.
- **Empty States**: We must handle cases where a "Dynamic" list is currently empty.

---

## The Resolution Hierarchy (The "Smart Resolver")

Professional tables follow a priority-based resolution logic:

### 1. Hard-Coded Options (`column.options`)
- **Action**: Render a **Strict Select**.
- **Reason**: The developer has explicitly defined the source of truth.

### 2. Type-Inffered Inputs (`filterType`)
- **Boolean**: Render a **Toggle/Select**.
- **Number**: Render a **Numeric Input**.
- **Date**: Render a **Date Picker**.
- **Reason**: The data structure dictates the UI.

### 3. Dynamic Metadata (`dynamicOptions: true`)
This is where we handle the "Searchable" cases. We use a **Resolution Step-Down**:
- **Step A**: Fetch facets from the server.
- **Step B**: If facets are found $\rightarrow$ Render a **Combobox**.
- **Step C**: If no facets are found or if the field is "Suggestive" $\rightarrow$ Fall back to a **Text Input** with a "Datalist" (Helper menu).

---

## Key Technical Decisions

### Decision: Suggestive vs. Strict Mode
We will introduce an optional flag in the column config: `strict: true`.
- **If `strict: true`**: The Combobox prevents the user from committing a value that isn't in the list.
- **If `strict: false` (Default)**: The Combobox acts as a "Smart Suggestion" tool. The user can type anything, but we help them with autocompletion.

### Decision: The "Zero-Metadata" Fallback
If `dynamicOptions` is true but the server returns an empty array, the UI will **not** render an empty dropdown. It will automatically "Step-Down" to a standard Text Input. This ensures the table never feels "broken" to the user.

---

## Final Verdict: The "Polymorphic Editor"
We will implement an `EditableCell` that chooses its sub-component dynamically at the moment of `onStartEdit`. It will not be a static choice, but a **reactive** one based on the availability of metadata.
