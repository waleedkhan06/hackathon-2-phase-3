---
id: 002
title: AI Chatbot Plan
stage: plan
date: 2026-02-08
surface: agent
model: gemini-cli-agent
feature: ai-chatbot
branch: 001-ai-chatbot
user: unknown
command: /sp.plan
labels: ["planning", "ai-chatbot", "feature"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-ai-chatbot/plan.md
  - specs/001-ai-chatbot/data-model.md
  - specs/001-ai-chatbot/contracts/chat_api.yaml
  - specs/001-ai-chatbot/quickstart.md
tests:
---

## Prompt

```text
---
description: Execute the implementation planning workflow using the plan template to generate design artifacts.
handoffs: 
  - label: Create Tasks
    agent: sp.tasks
    prompt: Break the plan into tasks
    send: true
  - label: Create Checklist
    agent: sp.checklist
    prompt: Create a checklist for the following domain...
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Setup**: Run `.specify/scripts/bash/setup-plan.sh --json` from repo root and parse JSON for FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'''m Groot' (or double-quote if possible: "I'm Groot").

2. **Load context**: Read FEATURE_SPEC and `.specify/memory/constitution.md`. Load IMPL_PLAN template (already copied).

3. **Execute plan workflow**: Follow the structure in IMPL_PLAN template to:
   - Fill Technical Context (mark unknowns as "NEEDS CLARIFICATION")
   - Fill Constitution Check section from constitution
   - Evaluate gates (ERROR if violations unjustified)
   - Phase 0: Generate research.md (resolve all NEEDS CLARIFICATION)
   - Phase 1: Generate data-model.md, contracts/, quickstart.md
   - Phase 1: Update agent context by running the agent script
   - Re-evaluate Constitution Check post-design

4. **Stop and report**: Command ends after Phase 2 planning. Report branch, IMPL_PLAN path, and generated artifacts.

## Phases

### Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```text
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

### Phase 1: Design & Contracts

**Prerequisites:** `research.md` complete

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Agent context update**:
   - Run `.specify/scripts/bash/update-agent-context.sh gemini`
   - These scripts detect which AI agent is in use
   - Update the appropriate agent-specific context file
   - Add only new technology from current plan
   - Preserve manual additions between markers

**Output**: data-model.md, /contracts/*, quickstart.md, agent-specific file

## Key rules

- Use absolute paths
- ERROR on gate failures or unresolved clarifications

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


/sp.plan # sp.plan — Phase III: Todo AI Chatbot

## Planning Objective
Define a clear, step-by-step implementation plan to add an AI-powered chatbot to the existing Todo full-stack application, without modifying or breaking Phase II functionality.

The plan MUST follow spec-driven development and be executable entirely by agentic tools.

---

## High-Level Phases

1. Specification Alignment
2. Database Extension
3. MCP Server Implementation
4. AI Agent Integration
5. Chat API Implementation
6. Frontend Chat UI Integration
7. Security & Validation
8. Testing & Verification

---

## Phase 1: Specification Alignment

**Goal:** Ensure all Phase III specs are complete and consistent.

Steps:
- Review existing Phase II specs
- Create new specs for:
  - AI agent behavior
  - MCP tool definitions
  - Chat API contract
  - Conversation persistence
- Ensure specs reference existing task CRUD behavior
- Confirm no breaking changes to current APIs

Deliverables:
- Updated `/specs/features/chatbot.md`
- Updated `/specs/api/chat.md`
- Updated `/specs/mcp/tools.md`

---

## Phase 2: Database Extension

**Goal:** Persist conversation state without server memory.

Steps:
- Add `Conversation` model
- Add `Message` model
- Link conversations to users
- Ensure messages store role and content
- Create migrations (if required)

Deliverables:
- Database schema spec update
- SQLModel models
- Migration scripts

---

## Phase 3: MCP Server Implementation

**Goal:** Expose task operations as stateless MCP tools.

Steps:
- Set up MCP server using Official MCP SDK
- Implement tools:
  - add_task
  - list_tasks
  - update_task
  - complete_task
  - delete_task
- Ensure tools:
  - Use database for all state
  - Enforce user ownership
  - Return structured responses
- Register tools for agent use

Deliverables:
- MCP server module
- Tool registration
- Tool specs documentation

---

## Phase 4: AI Agent Integration

**Goal:** Enable natural language task management.

Steps:
- Configure OpenAI Agents SDK
- Set OpenRouter API configuration
- Implement agent with:
  - System instructions
  - Tool access via MCP
  - Error handling
- Configure model rotation to avoid token limits
- Ensure agent does not store state

Deliverables:
- Agent configuration
- Agent runner
- Tool binding logic

---

## Phase 5: Chat API Implementation

**Goal:** Create stateless chat endpoint.

Steps:
- Implement `POST /api/{user_id}/chat`
- Verify JWT and user identity
- Load conversation history from DB
- Store incoming user message
- Run agent with MCP tools
- Persist assistant response
- Return conversation_id and response

Deliverables:
- Chat route handler
- Request/response schemas
- Auth enforcement logic

---

## Phase 6: Frontend Chat UI Integration

**Goal:** Provide conversational UI without disrupting existing UI.

Steps:
- Integrate OpenAI ChatKit
- Restrict chat access to authenticated users
- Connect chat UI to chat API endpoint
- Persist conversation ID in client
- Display assistant responses and confirmations

Deliverables:
- Chat UI components
- API integration
- Authentication guards

---

## Phase 7: Security & Validation

**Goal:** Enforce user isolation and correctness.

Steps:
- Validate JWT on every chat request
- Match user_id in route with token
- Ensure MCP tools reject cross-user access
- Sanitize all user input
- Handle errors gracefully

Deliverables:
- Security checks
- Error handling logic

---

## Phase 8: Testing & Verification

**Goal:** Confirm full functionality and stability.

Steps:
- Test all natural language flows:
  - Create, list, update, complete, delete tasks
- Verify conversation persistence
- Test server restart recovery
- Ensure Phase II features still work
- Verify no state stored in memory

Deliverables:
- Verified working chatbot
- Final validation checklist
- Updated README

---

## Completion Criteria

The plan is successful when:
- Chatbot manages todos via natural language
- MCP tools are used for all task operations
- Conversations persist across sessions
- Server remains stateless
- Existing frontend/backend remain unchanged
```

## Response snapshot

The `sp.plan` command was executed to generate an implementation plan for the "Todo AI Chatbot" feature. The planning workflow involved reading the feature specification and project constitution (template), filling the `plan.md` template with technical context and project structure details, generating a `data-model.md` for new entities, defining an OpenAPI contract (`chat_api.yaml`) for the chat API, and creating a `quickstart.md` guide. Finally, the agent's context was updated to reflect the new technologies. The `constitution.md` being a template was noted as a point of clarification needed for gate evaluation.

## Outcome

- ✅ Impact: Successfully generated implementation plan and associated design artifacts.
- 🧪 Tests: N/A - no tests executed during planning phase.
- 📁 Files: Created/modified plan.md, data-model.md, chat_api.yaml, quickstart.md.
- 🔁 Next prompts: sp.tasks, sp.implement
- 🧠 Reflection: The constitution.md template needs to be filled for proper gate evaluation. The PHR script failed when using 'ai-chatbot' as feature name instead of '001-ai-chatbot'.

## Evaluation notes (flywheel)

- Failure modes observed: The `create-phr.sh` script failed to locate the feature directory when given "ai-chatbot" as the feature name, expecting "001-ai-chatbot". This indicates a need for clearer conventions or better parsing in the script for feature names.
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Improve `create-phr.sh` to handle feature names more flexibly, potentially by searching for partial matches or providing better error messages with suggestions.
