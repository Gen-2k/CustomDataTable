# User Story 03: Multi-Value (Array) Editing

## 1. The User Story
**Scenario**: An HR manager is updating the "Skills" for a Software Engineer.
> "As a recruiter, when I edit the Skills field, I want to manage it as a collection of tags. I want to easily remove 'Java' and add 'React' and 'Go' by picking them from a list of our company's frequently used skills, or by typing a new one. I find editing a long comma-separated string prone to errors like double-spaces or typos."

---

## 2. Research & Recommended Approaches

### Approach A: The "Tokenized" Input (The Comma Wrapper)
- **Concept**: A standard text box that automatically turns words into "pills" or "chips" when you press Comma or Enter.
- **Pros**: Fast for power users who know exactly what they want to type.
- **Cons**: No discovery. If you aren't sure how "UI/UX" is spelled in the system, you might create a duplicate "UX/UI" tag.

### Approach B: The "Multi-Select Combobox" (The Gold Standard)
- **Concept**: A search box that shows a dropdown of existing values. When an item is selected, it appears as a "Chip" inside the input.
- **Pros**: 
    - **Discovery**: See all existing skills in the company.
    - **Clean Data**: Prevents duplicates and typos.
    - **Visual**: Easy to see the list of items at a glance.
- **Cons**: Requires more horizontal space in the cell.

### Approach C: The "Tag Manager" Pop-over
- **Concept**: Clicking the cell opens a small floating window with a search bar and a "cloud" of active tags.
- **Pros**: Best for very long lists of tags.
- **Cons**: Slower (extra click to open).

---

## 3. Final Recommendation: The "Multi-Select Tag Editor"

For a high-performance table, the **Multi-Select Tag Editor** (similar to Approach B) is the best fit.

### Key Features of the Solution:
1. **Pill-Based Visualization**: Active values are rendered as "Chips" with an "X" to remove.
2. **Search-to-Add**: The input acts as a search bar for global facets (Unique Skills).
3. **Keyboard Shortcuts**:
   - `Backspace`: Removes the last tag if the input is empty.
   - `Enter / Tab / Comma`: Commits the current typed word as a new tag.
4. **Optimistic Global Sync**: Just like cities, new skills added here are instantly available for suggestion in other rows.

### The Professional Verdict:
Managing arrays as **discrete tokens** instead of **raw strings** is the single best way to ensure data integrity in a large-scale system. It transforms a "Text" column into a "Categorical" column, enabling much more powerful filtering and reporting later on.
