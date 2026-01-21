# Developer Discussions & Technical Exploration

This directory tracks the technical side of the project: the constraints we face, the libraries we explore, the trade-offs we weigh, and the final technical decisions we make.

## Core Philosophical Pillars
1. **Performance at Scale**: Every decision must be validated against a 100,000+ record dataset.
2. **Minimalism**: Avoid heavy third-party dependencies unless strictly necessary.
3. **Consistency**: Shared structures between Client and Server to reduce cognitive load.

## Technical Decision Log
1. [Effective Metadata Fetching](./01-metadata-fetching-strategies.md) - Why we chose On-Demand vs. Bulk.
2. [Input Type Resolution](./02-input-type-resolution.md) - How we choose between Input/Select/Combobox.
3. [Editor Expansion Registry](./03-editor-expansion-registry.md) - Handling TextAreas and Creatable logic.
4. [Multi-Value Tag Editor](./04-multi-value-tag-editor.md) - Engineering the chip-based array editor.
5. [Optimistic UI & Error Handling](./05-optimistic-ui-and-error-handling.md) - Managing the edit lifecycle and rollbacks.
