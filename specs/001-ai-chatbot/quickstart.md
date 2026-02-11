# Quickstart Guide: Todo AI Chatbot

This guide provides a quick overview to get started with the Todo AI Chatbot feature.

## 1. Overview

The AI Chatbot allows users to manage their Todo tasks using natural language commands. This is integrated into the existing Todo full-stack application, leveraging a new chat API endpoint and an AI agent that interacts with existing task management tools. Conversation history is persisted across sessions.

## 2. Key Components

-   **Backend Chat API**: A new `POST /api/{user_id}/chat` endpoint (defined in `specs/001-ai-chatbot/contracts/chat_api.yaml`) handles user messages, interacts with the AI agent, and returns responses.
-   **AI Agent**: Utilizes OpenAI Agents SDK and OpenRouter API to understand natural language and execute task operations via MCP tools.
-   **Database Extensions**: New `Conversation` and `Message` models (described in `specs/001-ai-chatbot/data-model.md`) store chat history.
-   **Frontend Integration**: A conversational UI will be integrated into the existing frontend application.

## 3. Setup and Run

To run the full-stack application with the AI Chatbot feature:

### Backend Setup (assuming Python environment)

1.  Navigate to the `backend/` directory.
2.  Ensure `requirements.txt` includes necessary AI/MCP dependencies (e.g., `openai-agents`, `fastapi`, `uvicorn`). Install them if not already:
    ```bash
    pip install -r requirements.txt
    ```
3.  Apply any new database migrations for `Conversation` and `Message` models (specific migration steps will be provided during implementation).
4.  Set up environment variables for AI API keys (e.g., `OPENROUTER_API_KEY`).
5.  Start the backend server:
    ```bash
    uvicorn src.main:app --reload
    ```

### Frontend Setup (assuming Node.js environment)

1.  Navigate to the `frontend/todo-app/` directory.
2.  Install frontend dependencies:
    ```bash
    npm install
    ```
3.  Ensure the frontend is configured to communicate with the new chat API endpoint.
4.  Start the frontend development server:
    ```bash
    npm run dev
    ```

## 4. Using the Chatbot

Once both backend and frontend are running:

1.  Access the frontend application in your browser.
2.  Ensure you are authenticated.
3.  Locate the new chat UI component.
4.  Start typing natural language commands to manage your tasks (e.g., "Add a task to buy groceries", "Show me my pending tasks").

## 5. API Reference

Refer to `specs/001-ai-chatbot/contracts/chat_api.yaml` for detailed API specifications.