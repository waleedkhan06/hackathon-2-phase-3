---

description: "Actionable, dependency-ordered tasks for the Todo AI Chatbot feature."
---

# Tasks: Todo AI Chatbot

**Input**: Design documents from `/specs/001-ai-chatbot/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing. No explicit test tasks are generated as per the general rule, but independent test criteria are provided for each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/todo-app/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure validation.

- [x] T001 Validate existing frontend functionality.
- [x] T002 Validate existing backend functionality.
- [x] T003 Validate JWT authentication via Better Auth.
- [x] T004 Ensure task ownership is enforced in all existing APIs.
- [x] T005 Verify existing UI and APIs work unchanged.
- [x] T006 Verify tasks persist in Neon PostgreSQL.
- [x] T007 Confirm users can only access their own data.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.
**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Add Conversation Persistence Models

- [x] T008 [P] Create `Conversation` SQLModel in `backend/src/models/conversation.py` with `id`, `user_id`, `created_at`, `updated_at`.
- [x] T009 [P] Create `Message` SQLModel in `backend/src/models/message.py` with `id`, `conversation_id`, `user_id`, `role`, `content`, `created_at`.
- [x] T010 Update database schema specification to include `Conversation` and `Message` models in `specs/001-ai-chatbot/data-model.md`.
- [x] T011 Generate database migrations for `Conversation` and `Message` models (e.g., via Alembic in `backend/migrations/`).
- [x] T012 Apply database migrations.

### Implement MCP Server

- [x] T013 Set up MCP server using Official MCP SDK in `backend/src/services/mcp_service.py`.
- [x] T014 Implement stateless `add_task` MCP tool in `backend/src/mcp/tools.py` requiring `user_id`, enforcing ownership, persisting changes, and returning structured output.
- [x] T015 Implement stateless `list_tasks` MCP tool in `backend/src/mcp/tools.py` requiring `user_id`, enforcing ownership, persisting changes, and returning structured output.
- [x] T016 Implement stateless `update_task` MCP tool in `backend/src/mcp/tools.py` requiring `user_id`, enforcing ownership, persisting changes, and returning structured output.
- [x] T017 Implement stateless `complete_task` MCP tool in `backend/src/mcp/tools.py` requiring `user_id`, enforcing ownership, persisting changes, and returning structured output.
- [x] T018 Implement stateless `delete_task` MCP tool in `backend/src/mcp/tools.py` requiring `user_id`, enforcing ownership, persisting changes, and returning structured output.
- [x] T019 Register MCP tools for agent usage in `backend/src/mcp/registry.py`.

### Configure AI Agent

- [x] T020 Set up OpenAI Agents SDK in `backend/src/services/ai_agent_service.py`.
- [x] T021 Configure OpenRouter as OpenAI-compatible provider in `backend/src/config/ai_config.py`.
- [x] T022 Enable model rotation (mistralai/mistral-7b-instruct, openchat/openchat-7b, meta-llama/llama-3-8b-instruct) in `backend/src/config/ai_config.py`.
- [x] T023 Define system instructions for the AI agent enforcing MCP-only task execution, friendly confirmations, and graceful error handling in `backend/src/services/ai_agent_service.py`.
- [x] T024 Bind MCP tools to the AI agent in `backend/src/services/ai_agent_service.py`.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Create Tasks via Natural Language (Priority: P1) 🎯 MVP

**Goal**: Users can create new tasks by describing them in natural language to the AI assistant.
**Independent Test**: Can be fully tested by sending a natural language task creation request and verifying the task appears in the user's task list.

### Implementation for User Story 1

- [x] T025 [US1] Implement `POST /api/{user_id}/chat` endpoint in `backend/src/api/chat_routes.py` to handle incoming messages.
- [x] T026 [US1] Within `chat_routes.py`, validate JWT and derive user identity for the chat request.
- [x] T027 [US1] Store incoming user message in `backend/src/services/conversation_service.py`.
- [x] T028 [US1] Run AI agent with `add_task` MCP tool when user requests task creation.
- [x] T029 [US1] Persist assistant's response in `backend/src/services/conversation_service.py`.
- [x] T030 [US1] Return `conversation_id` and assistant's response.
- [x] T031 [US1] Add ChatKit UI component to `frontend/todo-app/components/chat/ChatWindow.tsx` for authenticated users.
- [x] T032 [US1] Connect chat UI to `POST /api/{user_id}/chat` endpoint in `frontend/todo-app/lib/api.ts`.
- [x] T033 [US1] Persist `conversation_id` on the client-side (e.g., in local storage or context) in `frontend/todo-app/hooks/use-chat.ts`.
- [x] T034 [US1] Display assistant responses and confirmations in `frontend/todo-app/components/chat/ChatWindow.tsx`.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - List Tasks via Natural Language (Priority: P1)

**Goal**: Users can ask the AI assistant to list their tasks in various ways (all tasks, pending tasks, completed tasks).
**Independent Test**: Can be fully tested by asking to list tasks and verifying the assistant returns the correct tasks.

### Implementation for User Story 2

- [x] T035 [US2] Modify `POST /api/{user_id}/chat` endpoint in `backend/src/api/chat_routes.py` to run AI agent with `list_tasks` MCP tool when user requests task listing.
- [x] T036 [US2] Ensure `list_tasks` MCP tool can handle filtering by status (all, pending, completed).
- [x] T037 [US2] Update `chat_routes.py` to return the list of tasks from the AI agent's response.
- [x] T038 [US2] Update ChatKit UI to display lists of tasks returned by the AI assistant in `frontend/todo-app/components/chat/ChatWindow.tsx`.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 6 - Resume Conversations Across Sessions (Priority: P1)

**Goal**: Users can continue conversations across different sessions and page refreshes. The chat history persists.
**Independent Test**: Can be fully tested by refreshing the page and verifying conversation history is preserved.

### Implementation for User Story 6

- [x] T039 [US6] Modify `POST /api/{user_id}/chat` endpoint in `backend/src/api/chat_routes.py` to load previous messages for the given `conversation_id` from the database.
- [x] T040 [US6] Ensure `conversation_id` is passed from the frontend to the backend to resume conversations.
- [x] T041 [US6] Update `frontend/todo-app/hooks/use-chat.ts` to load and display conversation history when initializing the chat UI.
- [x] T042 [US6] Verify conversation history is preserved across page refreshes and user logins.

**Checkpoint**: At this point, User Stories 1, 2, AND 6 should all work independently.

---

## Phase 6: User Story 3 - Update Tasks via Natural Language (Priority: P2)

**Goal**: Users can update existing task titles or descriptions through natural language commands.
**Independent Test**: Can be fully tested by updating a task and verifying the changes are saved.

### Implementation for User Story 3

- [x] T043 [US3] Modify `POST /api/{user_id}/chat` endpoint in `backend/src/api/chat_routes.py` to run AI agent with `update_task` MCP tool when user requests task update.
- [x] T044 [US3] Ensure `update_task` MCP tool can identify the task to update (e.g., by title or ID).
- [x] T045 [US3] Update ChatKit UI to clearly display confirmations of task updates in `frontend/todo-app/components/chat/ChatWindow.tsx`.

**Checkpoint**: User Stories 1, 2, 6, AND 3 should now be independently functional.

---

## Phase 7: User Story 4 - Mark Tasks as Complete via Natural Language (Priority: P2)

**Goal**: Users can mark tasks as complete through natural language commands.
**Independent Test**: Can be fully tested by marking a task complete and verifying its status changes.

### Implementation for User Story 4

- [x] T046 [US4] Modify `POST /api/{user_id}/chat` endpoint in `backend/src/api/chat_routes.py` to run AI agent with `complete_task` MCP tool when user requests to mark a task as complete.
- [x] T047 [US4] Ensure `complete_task` MCP tool can identify the task to mark complete.
- [x] T048 [US4] Update ChatKit UI to clearly display confirmations of task completion in `frontend/todo-app/components/chat/ChatWindow.tsx`.

**Checkpoint**: User Stories 1, 2, 6, 3, AND 4 should now be independently functional.

---

## Phase 8: User Story 5 - Delete Tasks via Natural Language (Priority: P3)

**Goal**: Users can delete tasks through natural language commands.
**Independent Test**: Can be fully tested by deleting a task and verifying it's removed.

### Implementation for User Story 5

- [x] T049 [US5] Modify `POST /api/{user_id}/chat` endpoint in `backend/src/api/chat_routes.py` to run AI agent with `delete_task` MCP tool when user requests task deletion.
- [x] T050 [US5] Ensure `delete_task` MCP tool can identify the task to delete.
- [x] T051 [US5] Update ChatKit UI to clearly display confirmations of task deletion in `frontend/todo-app/components/chat/ChatWindow.tsx`.

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and overall system quality.

### Security Enforcement

- [x] T052 Ensure JWT is required for all chat requests in `backend/src/api/chat_routes.py`.
- [x] T053 Match `user_id` in route with token subject for all chat requests in `backend/src/api/chat_routes.py`.
- [x] T054 Ensure MCP tools reject cross-user access (already covered in foundational tasks, but a final verification).
- [x] T055 Sanitize all user input in `backend/src/api/chat_routes.py` before processing by AI agent.

### End-to-End Validation

- [x] T056 Perform end-to-end testing of natural language flows: Add task.
- [x] T057 Perform end-to-end testing of natural language flows: List tasks (all, pending, completed).
- [x] T058 Perform end-to-end testing of natural language flows: Update task.
- [x] T059 Perform end-to-end testing of natural language flows: Complete task.
- [x] T060 Perform end-to-end testing of natural language flows: Delete task.
- [x] T061 Verify conversation persistence after server restart.
- [x] T062 Confirm Phase II features still work as expected (no regressions).
- [x] T063 Verify no state is stored in memory by the chat backend.

### Final Deliverables

- [x] T064 Update `specs/001-ai-chatbot/spec.md` with any final clarifications.
- [x] T065 Update `README.md` in root and `backend/` and `frontend/todo-app/` with instructions for running the chatbot.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phases 3-8)**: All depend on Foundational phase completion.
  - User stories can then proceed in parallel (if staffed).
  - Or sequentially in priority order (P1 → P2 → P3).
- **Polish (Phase 9)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories.
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories.
- **User Story 6 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories.
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories.
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories.
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories.

### Within Each User Story

- Models before services.
- Services before endpoints/UI integration.
- Core implementation before integration.
- Story complete before moving to next priority.

### Parallel Opportunities

- All tasks not explicitly depending on another within the same phase can be considered parallel.
- All tasks marked [P] can run in parallel.
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows).
- Within each user story, tasks related to different files (e.g., backend vs. frontend) can often run in parallel.

---

## Parallel Example: User Story 1

```bash
# Backend Tasks (can run in parallel with Frontend Tasks for US1)
Task: "T025 [US1] Implement POST /api/{user_id}/chat endpoint in backend/src/api/chat_routes.py..."
Task: "T026 [US1] Within chat_routes.py, validate JWT and derive user identity..."
Task: "T027 [US1] Store incoming user message in backend/src/services/conversation_service.py..."
Task: "T028 [US1] Run AI agent with add_task MCP tool when user requests task creation."
Task: "T029 [US1] Persist assistant's response in backend/src/services/conversation_service.py."
Task: "T030 [US1] Return conversation_id and assistant's response."

# Frontend Tasks (can run in parallel with Backend Tasks for US1)
Task: "T031 [US1] Add ChatKit UI component to frontend/todo-app/components/chat/ChatWindow.tsx..."
Task: "T032 [US1] Connect chat UI to POST /api/{user_id}/chat endpoint in frontend/todo-app/lib/api.ts."
Task: "T033 [US1] Persist conversation_id on the client-side (e.g., in local storage or context)..."
Task: "T034 [US1] Display assistant responses and confirmations in frontend/todo-app/components/chat/ChatWindow.tsx."
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 6 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. Complete Phase 4: User Story 2
5. Complete Phase 5: User Story 6
6. **STOP and VALIDATE**: Test User Stories 1, 2, and 6 independently.
7. Deploy/demo if ready.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 6 → Test independently → Deploy/Demo (MVP!)
5. Add User Story 3 → Test independently → Deploy/Demo
6. Add User Story 4 → Test independently → Deploy/Demo
7. Add User Story 5 → Test independently → Deploy/Demo
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Stories 1, 2, 6 (P1 stories)
   - Developer B: User Stories 3, 4 (P2 stories)
   - Developer C: User Story 5 (P3 story)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (if tests were generated)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
