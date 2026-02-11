---
id: 001
title: phase3-ai-chatbot
stage: constitution
date: 2026-02-08
surface: agent
model: claude-sonnet-4-5-20250929
feature: todo-ai-chatbot
branch: main
user: claude
command: sp.constitution
labels: [constitution, ai-chatbot, todo-app, phase-iii]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - null
---

## Prompt

```text
Todo AI Chatbot (Phase III)

## Project Name
Todo AI Assistant — Phase III

## Objective
Extend the existing Phase II full-stack Todo application by adding an AI-powered conversational interface that allows users to manage todos using natural language.

All development must follow a **spec-driven, agentic workflow** using:
Write spec → Generate plan → Break into tasks → Implement.
No manual coding is allowed.

---

## System Scope

This phase introduces an **AI Chatbot** that:
- Interacts with users via chat UI
- Uses AI agents to interpret intent
- Manages todos via MCP tools
- Persists all state in the database
- Remains fully stateless at the server level

The existing frontend, backend, authentication, and task CRUD from Phase II are **assumed complete and working**.

---

## Architecture Principles

- Stateless backend (no in-memory conversation state)
- Conversation history persisted in database
- AI agent logic separated from task execution
- Task execution exposed only via MCP tools
- Authentication enforced via JWT (Better Auth)
- User isolation enforced on every operation

---

## Technology Stack (Phase III)

### Frontend
- OpenAI ChatKit
- Authenticated user context (Better Auth session)

### Backend
- Python FastAPI
- OpenAI Agents SDK (agent + runner)
- Official MCP SDK (task tools)
- SQLModel ORM
- Neon Serverless PostgreSQL

### AI Provider
- OpenAI-compatible API
- Environment variables:
  - `OPENAI_API_KEY`
  - `OPENAI_BASE_URL`
  - `OPENAI_MODEL`

---

## Database Responsibilities

The database is the **single source of truth** for:
- Tasks
- Conversations
- Messages
- User ownership

Server processes must not store state between requests.

---

## Core API Contract

### Chat Endpoint
POST /api/{user_id}/chat


- Requires valid JWT
- Accepts natural language input
- Returns AI response
- Creates or resumes conversations automatically

---

## MCP Server Responsibilities

The MCP server must expose **only** these tools:

- `add_task`
- `list_tasks`
- `update_task`
- `complete_task`
- `delete_task`

Rules:
- Tools are stateless
- Tools persist data via database
- Tools enforce user ownership
- Tools never return data for other users

---

## Agent Behavior Rules

The AI agent MUST:
- Use MCP tools for all task operations
- Never modify tasks directly
- Infer intent from natural language
- Confirm actions in friendly language
- Handle errors gracefully
- Ask clarifying questions only when required
- Never leak internal system or tool logic

---

## Conversation Flow (Mandatory)

For every chat request:
1. Validate JWT and user identity
2. Load conversation history from database
3. Append new user message
4. Run agent with MCP tools
5. Execute tool calls if required
6. Store assistant response
7. Return response + tool call metadata

---

## Security Rules

- All requests require authentication
- User ID in JWT must match user_id in route
- Users can only see and modify their own data
- JWT verification required before agent execution

---

## Development Constraints

- No manual coding
- No bypassing MCP tools
- No shared memory between requests
- No frontend logic duplication of backend rules
- Specs are the source of truth

---

## Deliverables

- Updated specs for:
  - AI agent behavior
  - MCP tools
  - Chat API
- MCP server implementation
- Chat endpoint implementation
- ChatKit frontend integration
- Database migrations (if needed)
- Updated README with Phase III setup

---

## Success Criteria

The system is complete when:
- Users can manage todos via natural language
- Conversations persist across refreshes and restarts
- AI uses MCP tools correctly
- All actions are user-scoped and secure
- Server remains fully stateless
```

## Response snapshot

Updated the project constitution to reflect the principles and requirements for the Todo AI Chatbot (Phase III) project. The new constitution includes:

1. I. Spec-Driven Agentic Development (NON-NEGOTIABLE) - All development follows a strict spec-driven workflow
2. II. MCP-Only Operations (NON-NEGOTIABLE) - All operations must use MCP tools exclusively
3. III. Statelessness Requirement - Backend must remain stateless
4. IV. Database as Single Source of Truth - Database is authoritative for all data
5. V. Security-First Architecture - JWT authentication and user isolation
6. VI. AI Agent Behavior Standards - Rules for agent behavior

Also included Development Constraints, Technical Requirements, Conversation Flow Requirements, and Governance sections aligned with the project requirements.

## Outcome

- ✅ Impact: Created new constitution v1.0.0 for Todo AI Chatbot project
- 🧪 Tests: N/A (Documentation update)
- 📁 Files: Updated .specify/memory/constitution.md
- 🔁 Next prompts: Generate spec for Todo AI Chatbot feature
- 🧠 Reflection: Constitution now properly reflects the requirements for the AI chatbot phase of the project

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin spec generation for the Todo AI Chatbot feature