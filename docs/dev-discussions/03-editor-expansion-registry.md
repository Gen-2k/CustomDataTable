# Dev Discussion 03: Expanding the Editor Schema

## The Problem
We need to handle diverse input requirements (Multi-line, Dynamic Generation) without complicating the current `EditableCell` logic.

## The "Editor Component" Registry
Rather than making `EditableCell` a giant file of `if/else` statements, we will move toward a **Registry Pattern**.

### Proposed Registry Structure
```javascript
const EDITORS = {
  text: <TextInput />,
  number: <NumberInput />,
  select: <SmartSelect />,
  textarea: <FloatingTextArea />, // The NEW addition
};
```

---

## Technical Constraints & Exploration

### 1. Implementation of "Creatable" logic
- **Challenge**: How to update the `facetCache` locally when a new value is added?
- **Decision**: When an `onSave` event returns a success from the server, the table will check if the new value exists in the `facetCache`. If not, it will **Optimistically Add** it.
- **Why**: This ensures that if you add "AI Lab" to Employee A, when you go to Employee B, "AI Lab" is already there in the dropdown.

### 2. Implementation of the Floating TextArea
- **Constraint**: The `overflow: hidden` on table cells usually cuts off anything that sticks out.
- **Decision**: We must use a **React Portal**. The TextArea will be rendered at the `body` level and positioned using `getBoundingClientRect()` of the table cell.
- **Shortcut Handling**:
  - `onKeyDown` listener will intercept `Enter`.
  - If `e.ctrlKey || e.metaKey` $\rightarrow$ trigger `commit()`.
  - Else $\rightarrow$ allow default (new line).

---

## Final Decision
We will extend the `column` configuration to support `inputType`. If `inputType: 'textarea'`, the `Smart Resolver` will completely swap the UI for the portal-based floating editor.
