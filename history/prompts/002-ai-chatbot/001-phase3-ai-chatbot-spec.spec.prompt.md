---
id: 001
title: phase3-ai-chatbot-spec
stage: spec
feature: ai-chatbot
date: 2026-02-08
surface: agent
model: claude-sonnet-4-5-20250929
branch: 001-ai-chatbot
user: claude
command: sp.specify
labels: [specification, ai-chatbot, todo-app, phase-iii]
links:
  spec: specs/001-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/001-ai-chatbot/spec.md
 - specs/001-ai-chatbot/checklists/requirements.md
tests:
 - null
---

## Prompt

```text
 Phase III: Todo AI Chatbot

## Goal
Add an AI-powered chatbot to the existing Todo full-stack application (Phase II) that allows authenticated users to manage their todos using natural language.

The existing frontend, backend, authentication, and task CRUD APIs MUST remain unchanged. This phase only EXTENDS the system.

---

## Functional Requirements

### Chatbot Capabilities
The AI assistant MUST allow users to:
- Create tasks
- List tasks (all, pending, completed)
- Update task title and/or description
- Mark tasks as complete
- Delete tasks
- Resume conversations across sessions

All actions MUST work through natural language commands.

---

## User Awareness
- The assistant MUST always know which user is logged in
- User identity MUST be derived from JWT (Better Auth)
- The assistant MUST only access tasks belonging to the authenticated user
- Responses SHOULD acknowledge the user context (e.g. "Your tasks", "You have 3 pending tasks")

---

## Architecture Constraints

### Backend
- Use FastAPI
- Add a stateless chat endpoint:
POST /api/{user_id}/chat

- Server MUST NOT store in-memory state
- Conversation history MUST be loaded from and saved to the database on every request

### AI Layer
- Use OpenAI Agents SDK for agent logic
- Use Official MCP SDK to expose task operations as tools
- The agent MUST interact with tasks ONLY via MCP tools

### MCP Tools (Mandatory)
The MCP server MUST expose:
- add_task
- list_tasks
- update_task
- complete_task
- delete_task

Tools MUST:
- Be stateless
- Enforce user ownership
- Persist all changes to the database

---

## Conversation Flow (Required)

For every chat request:
1. Verify JWT and user identity
2. Load conversation + messages from database
3. Store incoming user message
4. Run AI agent with MCP tools
5. Execute MCP tool calls if needed
6. Store assistant response
7. Return response, conversation_id, and tool calls

---

## Database Requirements

Add new models:
- Conversation (user_id, created_at, updated_at)
- Message (conversation_id, role, content, created_at)

Tasks table remains unchanged.

---

## Frontend Requirements

- Use OpenAI ChatKit UI
- Chat UI must be available only for authenticated users
- Chat messages must persist after refresh
- No changes to existing dashboard or task UI logic

---

## AI Provider Configuration

Use OpenRouter (OpenAI-compatible):

Environment variables:
- OPENAI_API_KEY=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
- OPENAI_BASE_URL=https://openrouter.ai/api/v1

Agent MUST rotate between these free models to avoid token limits:
- mistralai/mistral-7b-instruct
- openchat/openchat-7b
- meta-llama/llama-3-8b-instruct

---

## Behavioral Rules for Agent

- Always use MCP tools for task operations
- Never hallucinate task data
- Confirm actions clearly ("Task added", "Task deleted")
- Handle missing tasks gracefully
- Ask clarification only when required
- Never expose internal tool or system details

---

## Constraints

- No manual coding
- Spec-driven development only
- Do not refactor Phase II code
- No breaking API changes
- Security and user isolation are mandatory

---

## Completion Criteria

The feature is complete when:
- Users manage todos via chat
- Conversations persist across sessions
- MCP tools are used correctly
- Server remains stateless
- Existing Phase II functionality remains stable
```

## Response snapshot

Created a comprehensive specification for the Todo AI Chatbot feature. The specification includes:

- 6 user stories with priorities (P1-P3) covering all core functionality
- Detailed acceptance scenarios for each user story
- 14 functional requirements defining system behavior
- Key entities (Conversation and Message) for database design
- 10 measurable success criteria
- Assumptions, constraints, and dependencies sections

The specification follows the template structure and focuses on user value while avoiding implementation details. All requirements are testable and measurable.

## Outcome

- ✅ Impact: Created complete specification for Todo AI Chatbot feature
- 🧪 Tests: N/A (Specification document)
- 📁 Files: specs/001-ai-chatbot/spec.md, specs/001-ai-chatbot/checklists/requirements.md
- 🔁 Next prompts: Generate plan for the AI Chatbot feature using /sp.plan
- 🧠 Reflection: Specification covers all required functionality with clear acceptance criteria and measurable outcomes

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed with planning phase