# Stage 1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use $superpower-executing-plans to implement this plan task-by-task.

**Goal:** Build the internal web application foundation and durable vehicle, steel-pallet, and product master-data management.

**Architecture:** A Vinext/React working surface reads and writes master data through server routes backed by Cloudflare D1 and Drizzle. Shared validation functions define the domain rules and are tested with Node's built-in test runner.

**Tech Stack:** TypeScript, React 19, Vinext, Tailwind CSS, Drizzle ORM, Cloudflare D1, Node test runner.

---

### Task 1: Domain rules and schema

- [ ] Add failing tests for vehicle, pallet, product, and summary rules.
- [ ] Implement the minimal validation module and confirm tests pass.
- [ ] Define Drizzle tables and generate a D1 migration.

### Task 2: Master-data API

- [ ] Add vehicle, pallet, and product list/create/delete routes.
- [ ] Reuse domain validation at every write boundary.
- [ ] Return clear Korean validation and storage errors.

### Task 3: Office dashboard

- [ ] Replace the starter screen with a responsive logistics dashboard.
- [ ] Add overview cards and master-data tabs with create/delete flows.
- [ ] Provide explicit empty, loading, success, and error states.

### Task 4: Verification and handoff

- [ ] Run tests, lint, database generation, and production build.
- [ ] Preview the dashboard and inspect the primary interactions.
- [ ] Commit and push Stage 1 to GitHub, then stop before Stage 2.
