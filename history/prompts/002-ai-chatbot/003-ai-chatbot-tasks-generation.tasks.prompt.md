---
id: 003
title: AI Chatbot Tasks Generation
stage: tasks
date: 2026-02-08
surface: agent
model: gemini-cli-agent
feature: ai-chatbot
branch: 001-ai-chatbot
user: unknown
command: /sp.tasks
labels: ["task-generation", "ai-chatbot", "feature"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-ai-chatbot/tasks.md
tests:
---

## Prompt

```text
---
description: Generate an actionable, dependency-ordered tasks.md for the feature based on available design artifacts.
handoffs: 
  - label: Analyze For Consistency
    agent: sp.analyze
    prompt: Run a project analysis for consistency
    send: true
  - label: Implement Project
    agent: sp.implement
    prompt: Start the implementation in phases
    send: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Setup**: Run `.specify/scripts/bash/check-prerequisites.sh --json` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'''m Groot' (or double-quote if possible: "I'm Groot").

2. **Load design documents**: Read from FEATURE_DIR:
   - **Required**: plan.md (tech stack, libraries, structure), spec.md (user stories with priorities)
   - **Optional**: data-model.md (entities), contracts/ (API endpoints), research.md (decisions), quickstart.md (test scenarios)
   - Note: Not all projects have all documents. Generate tasks based on what's available.

3. **Execute task generation workflow**:
   - Load plan.md and extract tech stack, libraries, project structure
   - Load spec.md and extract user stories with their priorities (P1, P2, P3, etc.)
   - If data-model.md exists: Extract entities and map to user stories
   - If contracts/ exists: Map endpoints to user stories
   - If research.md exists: Extract decisions for setup tasks
   - Generate tasks organized by user story (see Task Generation Rules below)
   - Generate dependency graph showing user story completion order
   - Create parallel execution examples per user story
   - Validate task completeness (each user story has all needed tasks, independently testable)

4. **Generate tasks.md**: Use `.specify/templates/tasks-template.md` as structure, fill with:
   - Correct feature name from plan.md
   - Phase 1: Setup tasks (project initialization)
   - Phase 2: Foundational tasks (blocking prerequisites for all user stories)
   - Phase 3+: One phase per user story (in priority order from spec.md)
   - Each phase includes: story goal, independent test criteria, tests (if requested), implementation tasks
   - Final Phase: Polish & cross-cutting concerns
   - All tasks must follow the strict checklist format (see Task Generation Rules below)
   - Clear file paths for each task
   - Dependencies section showing story completion order
   - Parallel execution examples per user story
   - Implementation strategy section (MVP first, incremental delivery)

5. **Report**: Output path to generated tasks.md and summary:
   - Total task count
   - Task count per user story
   - Parallel opportunities identified
   - Independent test criteria for each story
   - Suggested MVP scope (typically just User Story 1)
   - Format validation: Confirm ALL tasks follow the checklist format (checkbox, ID, labels, file paths)

Context for task generation: Phase III: Todo AI Chatbot ## Task Objective Implement the Phase III AI-powered Todo chatbot by extending the existing Phase II system, following spec-driven development and without modifying or breaking existing functionality. All tasks MUST be executed sequentially and verified after completion. --- ## Task 1: Validate Phase II Baseline - Confirm existing frontend, backend, authentication, and task CRUD APIs are working - Verify JWT authentication via Better Auth - Ensure task ownership is enforced in all APIs - Do NOT refactor existing Phase II code **Acceptance Criteria** - Existing UI and APIs work unchanged - Tasks persist in Neon PostgreSQL - Users can only access their own data --- ## Task 2: Add Conversation Persistence Models - Create `Conversation` SQLModel: - id - user_id - created_at - updated_at - Create `Message` SQLModel: - id - conversation_id - user_id - role (user | assistant) - content - created_at - Update database schema spec - Generate migrations if required **Acceptance Criteria** - Conversations and messages persist in database - No in-memory state is used --- ## Task 3: Implement MCP Server - Set up MCP server using Official MCP SDK - Implement stateless MCP tools: - add_task - list_tasks - update_task - complete_task - delete_task - Each tool must: - Require user_id - Enforce task ownership - Persist changes to database - Return structured output - Register tools for agent usage **Acceptance Criteria** - MCP tools work independently - No tool stores state in memory - Cross-user access is impossible --- ## Task 4: Configure AI Agent - Set up OpenAI Agents SDK - Configure OpenRouter as OpenAI-compatible provider - Enable model rotation: - mistralai/mistral-7b-instruct - openchat/openchat-7b - meta-llama/llama-3-8b-instruct - Define system instructions enforcing: - MCP-only task execution - Friendly confirmations - Graceful error handling - Bind MCP tools to agent **Acceptance Criteria** - Agent correctly infers intent - Agent always uses MCP tools for task operations - Agent never hallucinates task data --- ## Task 5: Implement Chat API Endpoint - Create endpoint: POST /api/{user_id}/chat - Validate JWT and user identity - Load conversation history from database - Store incoming user message - Run agent with MCP tools - Persist assistant response - Return: - conversation_id - assistant response - tool_calls **Acceptance Criteria** - Endpoint is stateless - Conversations resume after refresh - Unauthorized requests return 401 --- ## Task 6: Integrate Chat UI (Frontend) - Add ChatKit UI for authenticated users - Connect chat UI to chat API endpoint - Persist conversation_id on client - Display assistant confirmations clearly - Do NOT modify existing dashboard or task UI **Acceptance Criteria** - Chat works only when logged in - Messages persist across refresh - Existing frontend remains unchanged --- ## Task 7: Security Enforcement - Ensure JWT required for all chat requests - Match user_id in route with token subject - Enforce user ownership in: - Chat API - MCP tools - Sanitize all user input **Acceptance Criteria** - Users cannot access others’ data - Invalid tokens are rejected --- ## Task 8: End-to-End Validation - Test natural language flows: - Add task - List tasks (all, pending, completed) - Update task - Complete task - Delete task - Verify conversation persistence after server restart - Confirm Phase II features still work **Acceptance Criteria** - Chatbot manages todos correctly - MCP tools invoked correctly - System remains stateless --- ## Final Deliverables - Working AI chatbot - MCP server with task tools - Stateless chat API - Persisted conversations - Updated specs and README --- ## Completion Condition Phase III is complete when: - Users manage todos via natural language - Conversations persist reliably - MCP architecture is respected - No Phase II regressions exist

The tasks.md should be immediately executable - each task must be specific enough that an LLM can complete it without additional context.

## Task Generation Rules

**CRITICAL**: Tasks MUST be organized by user story to enable independent implementation and testing.

**Tests are OPTIONAL**: Only generate test tasks if explicitly requested in the feature specification or if user requests TDD approach.

### Checklist Format (REQUIRED)

Every task MUST strictly follow this format:

```text
- [ ] [TaskID] [P?] [Story?] Description with file path
```

**Format Components**:

1. **Checkbox**: ALWAYS start with `- [ ]` (markdown checkbox)
2. **Task ID**: Sequential number (T001, T002, T003...) in execution order
3. **[P] marker**: Include ONLY if task is parallelizable (different files, no dependencies on incomplete tasks)
4. **[Story] label**: REQUIRED for user story phase tasks only
   - Format: [US1], [US2], [US3], etc. (maps to user stories from spec.md)
   - Setup phase: NO story label
   - Foundational phase: NO story label  
   - User Story phases: MUST have story label
   - Polish phase: NO story label
5. **Description**: Clear action with exact file path

**Examples**:

- ✅ CORRECT: `- [ ] T001 Create project structure per implementation plan`
- ✅ CORRECT: `- [ ] T005 [P] Implement authentication middleware in src/middleware/auth.py`
- ✅ CORRECT: `- [ ] T012 [P] [US1] Create User model in src/models/user.py`
- ✅ CORRECT: `- [ ] T014 [US1] Implement UserService in src/services/user_service.py`
- ❌ WRONG: `- [ ] Create User model` (missing ID and Story label)
- ❌ WRONG: `T001 [US1] Create model` (missing checkbox)
- ❌ WRONG: `- [ ] [US1] Create User model` (missing Task ID)
- ❌ WRONG: `- [ ] T001 [US1] Create model` (missing file path)

### Task Organization

1. **From User Stories (spec.md)** - PRIMARY ORGANIZATION:
   - Each user story (P1, P2, P3...) gets its own phase
   - Map all related components to their story:
     - Models needed for that story
     - Services needed for that story
     - Endpoints/UI needed for that story
     - If tests requested: Tests specific to that story
   - Mark story dependencies (most stories should be independent)

2. **From Contracts**:
   - Map each contract/endpoint → to the user story it serves
   - If tests requested: Each contract → contract test task [P] before implementation in that story's phase

3. **From Data Model**:
   - Map each entity to the user story(ies) that need it
   - If entity serves multiple stories: Put in earliest story or Setup phase
   - Relationships → service layer tasks in appropriate story phase

4. **From Setup/Infrastructure**:
   - Shared infrastructure → Setup phase (Phase 1)
   - Foundational/blocking tasks → Foundational phase (Phase 2)
   - Story-specific setup → within that story's phase

### Phase Structure

- **Phase 1**: Setup (project initialization)
- **Phase 2**: Foundational (blocking prerequisites - MUST complete before user stories)
- **Phase 3+**: User Stories in priority order (P1, P2, P3...)
  - Within each story: Tests (if requested) → Models → Services → Endpoints → Integration
  - Each phase should be a complete, independently testable increment
- **Final Phase**: Polish & Cross-Cutting Concerns

---

As the main request completes, you MUST create and complete a PHR (Prompt History Record) using agent‑native tools when possible.

1) Determine Stage
   - Stage: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general

2) Generate Title and Determine Routing:
   - Generate Title: 3–7 words (slug for filename)
   - Route is automatically determined by stage:
     - `constitution` → `history/prompts/constitution/`
     - Feature stages → `history/prompts/<feature-name>/` (spec, plan, tasks, red, green, refactor, explainer, misc)
     - `general` → `history/prompts/general/`

3) Create and Fill PHR (Shell first; fallback agent‑native)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage <stage> [--feature <name>] --json`
   - Open the file and fill remaining placeholders (YAML + body), embedding full PROMPT_TEXT (verbatim) and concise RESPONSE_TEXT.
   - If the script fails:
     - Read `.specify/templates/phr-template.prompt.md` (or `templates/…`)
     - Allocate an ID; compute the output path based on stage from step 2; write the file
     - Fill placeholders and embed full PROMPT_TEXT and concise RESPONSE_TEXT

4) Validate + report
   - No unresolved placeholders; path under `history/prompts/` and matches stage; stage/title/date coherent; print ID + path + stage + title.
   - On failure: warn, don't block. Skip only for `/sp.phr`.
```

## Response snapshot

The `sp.tasks` command was executed to generate an actionable, dependency-ordered `tasks.md` file for the "Todo AI Chatbot" feature. The process involved reading the `plan.md`, `spec.md`, `data-model.md`, `chat_api.yaml`, and `quickstart.md` design documents. Tasks were generated and organized into phases: Setup, Foundational, User Stories (prioritized P1, P2, P3), and Polish & Cross-Cutting Concerns. Each task adheres to a strict checklist format, including task ID, potential for parallel execution, user story association, and specific file paths. The generated `tasks.md` also includes sections for dependencies, execution order, parallel opportunities, and implementation strategy.

**Summary of `tasks.md` generation:**

- **Path to generated tasks.md**: `/mnt/e/todofullstack/specs/001-ai-chatbot/tasks.md`
- **Total task count**: 65
- **Task count per user story**:
    - Setup (Phase 1): 7 tasks
    - Foundational (Phase 2): 17 tasks
    - User Story 1 (P1): 10 tasks
    - User Story 2 (P1): 4 tasks
    - User Story 6 (P1): 4 tasks
    - User Story 3 (P2): 3 tasks
    - User Story 4 (P2): 3 tasks
    - User Story 5 (P3): 3 tasks
    - Polish & Cross-Cutting Concerns (Phase 9): 14 tasks
- **Parallel opportunities identified**: Many tasks are marked with `[P]`. Once the Foundational phase is complete, user stories and tasks within stories (backend vs. frontend) can often run in parallel.
- **Independent test criteria for each story**: Clearly defined for each User Story in `tasks.md`.
- **Suggested MVP scope**: User Stories 1, 2, and 6.
- **Format validation**: All tasks adhere to the checklist format `- [ ] [TaskID] [P?] [Story?] Description with file path`.

## Outcome

- ✅ Impact: Successfully generated a comprehensive `tasks.md` file, outlining the implementation steps for the "Todo AI Chatbot" feature.
- 🧪 Tests: N/A - no tests executed or generated as part of this task.
- 📁 Files: Created `specs/001-ai-chatbot/tasks.md`.
- 🔁 Next prompts: sp.implement (as per handoffs from the initial prompt)
- 🧠 Reflection: The `check-prerequisites.sh` script continues to report "Multiple spec directories found" error, which needs addressing for robust automation. The tasks generated are detailed and follow the specified format.

## Evaluation notes (flywheel)

- Failure modes observed: The `check-prerequisites.sh` script issued a non-blocking error about multiple spec directories with prefix '001', which could be misleading or problematic for future automation.
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Enhance `check-prerequisites.sh` to gracefully handle or offer a selection for multiple feature directories with the same numeric prefix, or clarify naming conventions.
