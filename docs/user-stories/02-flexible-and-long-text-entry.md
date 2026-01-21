# User Story 02: Flexible Entry & Multi-Line Editing

## 1. The User Stories

### Story A: The "New Option" Creator
> "As a manager, I often need to add new tags or departments on the fly. I find it disruptive to have to leave my table view to 'register' a new value before I can use it in a dropdown. I want to type it and have the system 'learn' it immediately."

### Story B: The "Insight" (Long-Text) Collector
> "When editing employee performance notes or bios, I need more than a single line. I need a space that respects line breaks and allows me to see my full thought while I type, without distorting the table's clean rows."

---

## 2. Research & Recommended Approaches

### The "Creatable" Searchable Select
When a user types a search query that has zero matches in the facet list:
- **Baseline**: "No results found." (Frustrating).
- **Professional Solution**: A "Creatable" state. The UI shows: *" 'X' not found. Add as new option?"*
- **The Verdict**: Best suited for **Suggestive** fields where data grows organically.

### The "Portal" Text Area
For fields marked as `inputType: 'textarea'`:
- **Approach 1: Expandable Row**: The row gets taller as you type. (Bad: Jumps the table layout).
- **Approach 2: Modal**: Opens a full screen popup. (Bad: Too many clicks).
- **Recommended Approach: The Pop-over**: A floating `textarea` element that "portals" out of the cell. It uses an absolute position to float over the table without moving any rows.

---

## 3. Final Recommendation: The "Contextual Pop-over"

### Decision: Creative Dropdowns
We will support a `creatable` property. If enabled, the system will allow "Saving" a value even if it's missing from the facet cache.

### Decision: The "Overlay" Editor
For long text, we will implement a floating editor that:
1. Opens on double-click.
2. Expands to a 300px x 150px box.
3. Uses `Ctrl+Enter` as the "Super-Save" shortcut to distinguish from "New Line."
