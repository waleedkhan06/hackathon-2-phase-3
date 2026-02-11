import os
import random
import json # New import for tool calling
from typing import Dict, Any, Optional, List # Add List for messages
from sqlmodel import Session, select

from src.services.mcp_service import get_mcp_server, MCPTool
from src.mcp.registry import register_all_mcp_tools
from src.config.ai_config import get_openrouter_client, get_ai_models
from src.services.database import get_session
from src.services.conversation_service import add_message_to_conversation, get_messages_for_conversation
from src.api.websocket_routes import manager
from src.models.user import User

class AIAgentService:
    def __init__(self):
        self.client = get_openrouter_client()
        register_all_mcp_tools() # Register tools once at startup

    async def chat(self, user_message: str, user_id: str, conversation_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Sends a message to the AI assistant and processes its response using rule-based parsing.
        This approach works without any external AI API dependencies and is suitable for Hugging Face deployment.
        """
        mcp_server = get_mcp_server()

        conversation_history: List[Dict[str, Any]] = []
        if conversation_id:
            with next(get_session()) as session:
                conversation_history = get_messages_for_conversation(session, conversation_id)

        # Extract last assistant message for context
        last_assistant_message_content = None
        for msg in reversed(conversation_history):
            if msg["role"] == "assistant":
                last_assistant_message_content = msg["content"]
                break

        # Parse user message to determine intent and extract parameters
        import re

        # Convert to lowercase for easier matching
        user_message_lower = user_message.lower().strip()

        # Initialize response variables
        assistant_response_content = ""
        action_taken_result = "none"
        tasks_result = None

        # Rule-based parsing to determine user intent

        # Handle greetings and general queries
        if any(re.search(r"\b" + re.escape(keyword) + r"\b", user_message_lower) for keyword in ["hello", "hi", "hey", "greetings"]):
            assistant_response_content = "Hello! How can I assist you today? You can ask me to add, list, update, complete, or delete tasks."
            # Persist assistant's response to the database
            if conversation_id:
                with next(get_session()) as session:
                    add_message_to_conversation(
                        session,
                        conversation_id=conversation_id,
                        user_id=user_id,
                        role="assistant",
                        content=assistant_response_content
                    )

            return {
                "thread_id": conversation_id,
                "assistant_response": assistant_response_content,
                "action_taken": "greeting",
                "tasks": None
            }
        elif any(re.search(r"\b" + re.escape(keyword) + r"\b", user_message_lower) for keyword in ["help", "what can you do", "commands"]):
            assistant_response_content = "I can help you manage your tasks! You can ask me to: \n- 'add task [title] [description]'\n- 'list tasks'\n- 'complete task [ID or title]'\n- 'update task [ID or title] [new title] [new description]'\n- 'delete task [ID or title]'\nHow can I assist you?"
        # Intent: Add task - Check this before update task to prevent conflicts
        # But exclude cases where the message starts with update/change/edit commands
        elif not any(re.search(r"\b" + re.escape(keyword) + r"\b", user_message_lower) for keyword in ["update", "change", "modify", "edit", "rename", "adjust", "alter"]) and any(re.search(r"\b" + re.escape(keyword) + r"\b", user_message_lower) for keyword in ["add", "create", "make", "new task", "need to", "have to", "want to", "go and", "go to", "buy", "purchase", "get", "pick up"]):
            task_title = None
            task_description = None

            # Check if we previously asked for a task title/description
            if last_assistant_message_content and "what's the task title and description" in last_assistant_message_content.lower():
                # If the previous message was a prompt for task details, assume the current message is the task title/description
                # Attempt to parse both title and description from the user_message_lower
                desc_pattern_follow_up = r"(.+?)(?:\s+with\s+description:|\s+-\s+description:|\s+description:\s*)(.+)"
                desc_match_follow_up = re.search(desc_pattern_follow_up, user_message_lower, re.IGNORECASE)

                if desc_match_follow_up:
                    task_title = desc_match_follow_up.group(1).strip()
                    task_description = desc_match_follow_up.group(2).strip()
                else:
                    task_title = user_message_lower.strip()
                    task_description = None # User might only provide title after prompt

            if not task_title: # Only try to extract from initial message if no title from follow-up
                # More comprehensive patterns to catch variations like "go and buy groceries"
                # Check if the message is actually an update command before trying add patterns
                if not any(re.search(r"\b" + re.escape(keyword) + r"\b", user_message_lower) for keyword in ["update", "change", "modify", "edit", "rename", "adjust", "alter"]):
                    # Flexible pattern to handle "add task title with description" and "add task title and description"
                    add_with_desc_pattern = r"(?:add|create|make|new task|need to|have to|want to|go and|go to|buy|purchase|get|pick up)\s+(?:a\s+|the\s+|an\s+)?(?:task\s+to\s+|task\s+|to\s+)?(.+?)\s+(with|and)\s+(?:description[:\s]*)(.+)$"
                    add_match = re.search(add_with_desc_pattern, user_message_lower, re.IGNORECASE)

                    if add_match:
                        task_title = add_match.group(1).strip()
                        task_description = add_match.group(3).strip()
                    else:
                        # Try pattern with hyphen: "add task title - description"
                        hyphen_desc_pattern = r"(?:add|create|make|new task|need to|have to|want to|go and|go to|buy|purchase|get|pick up)\s+(?:a\s+|the\s+|an\s+)?(?:task\s+to\s+|task\s+|to\s+)?(.+?)\s*[-–—]\s*(.+)$"
                        hyphen_match = re.search(hyphen_desc_pattern, user_message_lower, re.IGNORECASE)

                        if hyphen_match:
                            task_title = hyphen_match.group(1).strip()
                            task_description = hyphen_match.group(2).strip()
                        else:
                            # Try to find any text after common description indicators
                            loose_desc_pattern = r"(?:add|create|make|new task|need to|have to|want to|go and|go to|buy|purchase|get|pick up)\s+(?:a\s+|the\s+|an\s+)?(?:task\s+to\s+|task\s+|to\s+)?(.+?)\s+(with|and|on|at)\s+(?:description[:\s]*|)(.+)$"
                            loose_match = re.search(loose_desc_pattern, user_message_lower, re.IGNORECASE)

                            if loose_match:
                                task_title = loose_match.group(1).strip()
                                task_description = loose_match.group(3).strip()

                # If still no title, try to extract just the task title
                if not task_title:
                    # Patterns to extract just the title
                    title_patterns = [
                        r"(?:add|create|make|new task|need to|have to|want to|go and|go to|buy|purchase|get|pick up)\s+(?:a\s+|the\s+|an\s+)?(?:task\s+to\s+|task\s+|to\s+)?(.+?)(?:\.|$|,|!|\?)",
                        r"(?:add|create|make|new task|need to|have to|want to|go and|go to|buy|purchase|get|pick up)\s+(.+?)(?:\.|$|,|!|\?)",
                    ]

                    for pattern in title_patterns:
                        match = re.search(pattern, user_message_lower, re.IGNORECASE)
                        if match:
                            task_title = match.group(1).strip()
                            # Clean up common phrases
                            task_title = re.sub(r"^(to|for|a|the|an|that|it's|it is)\s+", "", task_title, flags=re.IGNORECASE)
                            task_title = re.sub(r"^(go and|go to|please|pls|can you|could you|would you|kindly)\s+", "", task_title, flags=re.IGNORECASE)
                            break

            if task_title:
                # Call the add_task MCP tool with title and optional description
                add_task_tool = mcp_server.get_tool("add_task")
                if add_task_tool:
                    try:
                        # Before adding, get current tasks to determine the next task number
                        list_tasks_tool = mcp_server.get_tool("list_tasks")
                        tasks_output = await list_tasks_tool(user_id=user_id)
                        current_tasks = tasks_output.get('tasks', [])
                        next_task_number = len(current_tasks) + 1

                        if task_description:
                            tool_output = await add_task_tool(user_id=user_id, title=task_title, description=task_description, manager=manager)
                        else:
                            tool_output = await add_task_tool(user_id=user_id, title=task_title, manager=manager)

                        # Check the status and set action_taken_result accordingly
                        status = tool_output.get('status', 'error')
                        action_taken_result = f"add_task_{status}"

                        if status == 'success':
                            new_task_id = tool_output.get('id')
                            tasks_result = [tool_output] # Return the newly added task

                            if task_description:
                                assistant_response_content = f"Task #{next_task_number} (ID: {new_task_id}) has been successfully added: '{task_title}' with description: '{task_description}'."
                            else:
                                assistant_response_content = f"Task #{next_task_number} (ID: {new_task_id}) has been successfully added: '{task_title}'."
                        else:
                            error_message = tool_output.get('message', tool_output.get('error', 'Unknown error'))
                            if not error_message or error_message.strip() == "":
                                error_message = "An unspecified error occurred"
                            assistant_response_content = f"I apologize, but I couldn't add the task '{task_title}'. {error_message}. Would you like to try again?"
                    except Exception as e:
                        action_taken_result = "add_task_error"
                        assistant_response_content = f"I apologize, but there was an issue adding the task '{task_title}'. Error: {str(e)}. Could you please try rephrasing your request?"
                else:
                    action_taken_result = "add_task_tool_not_found"
                    assistant_response_content = f"I'm sorry, but I'm unable to add tasks at the moment. Please try again later."
            else:
                assistant_response_content = "I'd be happy to help you add a task. Could you please specify what task you'd like to add?"

        # Intent: Update task - Check this before add task to prevent conflicts
        elif any(re.search(r"\b" + re.escape(keyword) + r"\b", user_message_lower) for keyword in ["update", "change", "modify", "edit", "rename", "adjust", "alter"]):
            task_identifier = None
            new_title = None
            new_description = None

            # Check if we previously asked for a task identifier
            if last_assistant_message_content and "which task do you want to update" in last_assistant_message_content.lower():
                task_identifier = user_message_lower.strip()
                if task_identifier.isdigit():
                    task_identifier = int(task_identifier)

            # Extract task identifier and new information from the current message
            if not task_identifier:
                # Priority pattern to handle "update task [number] with title [title] and description [desc]"
                update_pattern1 = r"(?:update|change|modify|edit|rename|adjust|alter)\s+(?:task\s+)?(\d+)\s+with\s+(?:title\s+)?(.+?)\s+(with|and|&)\s+(?:description[:\s]*)(.+)$"
                update_match1 = re.search(update_pattern1, user_message_lower, re.IGNORECASE)
                if update_match1:
                    task_identifier = int(update_match1.group(1))  # Only accept numeric IDs for more precision
                    new_title = update_match1.group(2).strip()
                    new_description = update_match1.group(4).strip()

                if not task_identifier:
                    # Pattern to handle "update task [number] to [title] with description [desc]"
                    update_pattern2 = r"(?:update|change|modify|edit|rename|adjust|alter)\s+(?:task\s+)?(\d+)\s+(?:to|as)\s+(.+?)\s+(with|and|&)\s+(?:description[:\s]*)(.+)$"
                    update_match2 = re.search(update_pattern2, user_message_lower, re.IGNORECASE)
                    if update_match2:
                        task_identifier = int(update_match2.group(1))  # Only accept numeric IDs for more precision
                        new_title = update_match2.group(2).strip()
                        new_description = update_match2.group(4).strip()

                if not task_identifier:
                    # Pattern to handle "update task [number] to [title] with/and/on/at description [desc]"
                    update_pattern3 = r"(?:update|change|modify|edit|rename|adjust|alter)\s+(?:task\s+)?(\d+)\s+(?:to|as)\s+(.+?)\s+(with|and|on|at)\s+(?:description[:\s]*)(.+)$"
                    update_match3 = re.search(update_pattern3, user_message_lower, re.IGNORECASE)
                    if update_match3:
                        task_identifier = int(update_match3.group(1))  # Only accept numeric IDs for more precision
                        new_title = update_match3.group(2).strip()
                        new_description = update_match3.group(4).strip()

                if not task_identifier:
                    # Pattern to handle "update task [number] to [title] with description [desc]" - most flexible version
                    # This pattern looks for "update task [number] to" and then captures everything up to "with description"
                    update_pattern4_with = r"(?:update|change|modify|edit|rename|adjust|alter)\s+(?:task\s+)?(\d+)\s+(?:to|as)\s+(.+?)\s+with\s+description\s+(.+?)(?:\.|$|!|\?)"
                    update_match4_with = re.search(update_pattern4_with, user_message_lower, re.IGNORECASE)
                    if update_match4_with:
                        task_identifier = int(update_match4_with.group(1))  # Only accept numeric IDs for more precision
                        new_title = update_match4_with.group(2).strip()
                        new_description = update_match4_with.group(3).strip()

                if not task_identifier:
                    # Alternative pattern to handle "update task [number] to [title] with [description]" (without "description" word)
                    update_pattern4_with_simple = r"(?:update|change|modify|edit|rename|adjust|alter)\s+(?:task\s+)?(\d+)\s+(?:to|as)\s+(.+?)\s+with\s+(.+?)(?:\.|$|!|\?)"
                    update_match4_with_simple = re.search(update_pattern4_with_simple, user_message_lower, re.IGNORECASE)
                    if update_match4_with_simple:
                        task_identifier = int(update_match4_with_simple.group(1))  # Only accept numeric IDs for more precision
                        new_title = update_match4_with_simple.group(2).strip()
                        new_description = update_match4_with_simple.group(3).strip()

                if not task_identifier:
                    # Alternative pattern to handle "update task [number] to [title] and description [desc]"
                    update_pattern4_alt = r"(?:update|change|modify|edit|rename|adjust|alter)\s+(?:task\s+)?(\d+)\s+(?:to|as)\s+(.+?)\s+and\s+description\s+(.+?)(?:\.|$)"
                    update_match4_alt = re.search(update_pattern4_alt, user_message_lower, re.IGNORECASE)
                    if update_match4_alt:
                        task_identifier = int(update_match4_alt.group(1))  # Only accept numeric IDs for more precision
                        new_title = update_match4_alt.group(2).strip()
                        new_description = update_match4_alt.group(3).strip()

                if not task_identifier:
                    # Pattern to handle "update task [number] to [title]" (title only) - captures everything after "to"
                    update_pattern4 = r"(?:update|change|modify|edit|rename|adjust|alter)\s+(?:task\s+)?(\d+)\s+(?:to|as)\s+(.+?)(?:\.|$)"
                    update_match4 = re.search(update_pattern4, user_message_lower, re.IGNORECASE)
                    if update_match4:
                        task_identifier = int(update_match4.group(1))  # Only accept numeric IDs for more precision
                        new_title = update_match4.group(2).strip()

                if not task_identifier:
                    # If no numeric ID found, try to extract from task title
                    # Pattern to handle "update [task title] to [new title] with description [desc]"
                    update_pattern5 = r"(?:update|change|modify|edit|rename|adjust|alter)\s+(.+?)\s+(?:to|as)\s+(.+?)\s+(with|and|on|at)\s+(?:description[:\s]*)(.+)$"
                    update_match5 = re.search(update_pattern5, user_message_lower, re.IGNORECASE)
                    if update_match5:
                        task_identifier = update_match5.group(1).strip()
                        new_title = update_match5.group(2).strip()
                        new_description = update_match5.group(4).strip()

                if not task_identifier:
                    # Pattern to handle "update [task title] to [new title]" (title only)
                    update_pattern6 = r"(?:update|change|modify|edit|rename|adjust|alter)\s+(.+?)\s+(?:to|as)\s+(.+?)(?:\.|$)"
                    update_match6 = re.search(update_pattern6, user_message_lower, re.IGNORECASE)
                    if update_match6:
                        task_identifier = update_match6.group(1).strip()
                        new_title = update_match6.group(2).strip()

            if task_identifier:
                if not new_title and not new_description:
                    assistant_response_content = f"I'd be happy to update the task '{task_identifier}'. What would you like to change it to? Please provide a new title or description."
                else:
                    # Find the task to update
                    list_tasks_tool = mcp_server.get_tool("list_tasks")
                    if list_tasks_tool:
                        try:
                            tasks_output = await list_tasks_tool(user_id=user_id)
                            tasks = tasks_output.get('tasks', [])

                            target_task = None
                            task_index = -1

                            if isinstance(task_identifier, int):
                                # Find by task number (1-based index) first, then by ID
                                if 1 <= task_identifier <= len(tasks):
                                    # Task number is valid, use it
                                    target_task = tasks[task_identifier - 1]  # Convert to 0-based index
                                    task_index = task_identifier - 1
                                else:
                                    # If task number is out of range, try to find by actual ID
                                    for i, task in enumerate(tasks):
                                        if str(task['id']) == str(task_identifier):
                                            target_task = task
                                            task_index = i
                                            break
                            else:
                                # Find by title (partial match)
                                for i, task in enumerate(tasks):
                                    if task_identifier.lower() in task['title'].lower():
                                        target_task = task
                                        task_index = i
                                        break

                            if target_task:
                                update_task_tool = mcp_server.get_tool("update_task")
                                if update_task_tool:
                                    update_params = {"user_id": user_id, "task_id": target_task['id']}
                                    if new_title:
                                        update_params["title"] = new_title
                                    if new_description:
                                        update_params["description"] = new_description
                                    update_params["manager"] = manager

                                    tool_output = await update_task_tool(**update_params)

                                    # Check the status and set action_taken_result accordingly
                                    status = tool_output.get('status', 'error')
                                    action_taken_result = f"update_task_{status}"

                                    if status == 'success':
                                        response_parts = [f"Task #{task_index + 1} (ID: {target_task['id']}) has been successfully updated."]
                                        if new_title:
                                            response_parts.append(f"The title has been changed to: '{new_title}'.")
                                        if new_description:
                                            response_parts.append(f"The description has been updated to: '{new_description}'.")
                                        assistant_response_content = " ".join(response_parts)
                                    else:
                                        error_message = tool_output.get('message', tool_output.get('error', 'Unknown error'))
                                        if not error_message or error_message.strip() == "":
                                            error_message = "An unspecified error occurred"
                                        assistant_response_content = f"I apologize, but I couldn't update task '{target_task['title']}'. {error_message}. Would you like to try again?"
                                else:
                                    assistant_response_content = "I'm sorry, but I'm unable to update tasks at the moment. Please try again later."
                            else:
                                assistant_response_content = f"I couldn't find a task matching '{task_identifier}'. Please specify the task by its number or exact title. You can ask me to 'show tasks' to see the available tasks."
                        except Exception as e:
                            assistant_response_content = f"I apologize, but there was an issue updating the task. Error: {str(e)}. Please try again."
                    else:
                        assistant_response_content = "I'm sorry, but I need to retrieve your tasks first before I can update one. Please try again."
            else:
                assistant_response_content = "I'd be happy to update a task for you. Could you please specify which task you'd like to update and what changes you'd like to make? You can use its number or title."

        # Intent: List tasks - expanded to handle more variations
        elif any(re.search(r"\b" + re.escape(keyword) + r"\b", user_message_lower) for keyword in ["list", "show", "display", "my tasks", "what are", "view", "see", "tasks", "what tasks", "task list"]):
            # Call the list_tasks MCP tool
            list_tasks_tool = mcp_server.get_tool("list_tasks")
            if list_tasks_tool:
                try:
                    tool_output = await list_tasks_tool(user_id=user_id)
                    action_taken_result = f"list_tasks_{tool_output.get('status', 'success')}"
                    tasks_result = tool_output.get('tasks')
                    if tasks_result and len(tasks_result) > 0:
                        task_list_str_parts = []
                        pending_tasks = [task for task in tasks_result if not task.get('completed')]
                        completed_tasks = [task for task in tasks_result if task.get('completed')]

                        if pending_tasks:
                            task_list_str_parts.append("Pending tasks:")
                            for i, task in enumerate(pending_tasks):
                                task_list_str_parts.append(f"  • Task #{i+1} (ID: {task.get('id')}): '{task['title']}'")

                        if completed_tasks:
                            task_list_str_parts.append("\nCompleted tasks:")
                            for i, task in enumerate(completed_tasks):
                                task_list_str_parts.append(f"  • Task #{i+1+len(pending_tasks)} (ID: {task.get('id')}): '{task['title']}' (Completed)")

                        assistant_response_content = "Here are your tasks:\n" + "\n".join(task_list_str_parts)
                    else:
                        assistant_response_content = "You don't have any tasks yet. Would you like to add one?"
                except Exception as e:
                    assistant_response_content = f"I apologize, but I couldn't retrieve your tasks. Error: {str(e)}. Please try again later."
            else:
                assistant_response_content = "I'm sorry, but I'm unable to retrieve your tasks at the moment. Please try again later."

        # Intent: Complete task - expanded to handle more variations
        elif any(re.search(r"\b" + re.escape(keyword) + r"\b", user_message_lower) for keyword in ["complete", "done", "finish", "mark", "completed", "tick", "check", "as done"]):
            task_identifier = None

            # Check if we previously asked for a task identifier
            if last_assistant_message_content and "which task do you want to complete" in last_assistant_message_content.lower():
                task_identifier = user_message_lower.strip()
                if task_identifier.isdigit():
                    task_identifier = int(task_identifier)

            if not task_identifier:
                # Try to extract by number first
                number_matches = [
                    re.search(r"(?:task|number|#)\s*(\d+)", user_message_lower),
                    re.search(r"(\d+)\s*(?:th|st|nd|rd)?\s*(?:task|one)", user_message_lower),
                    re.search(r"task\s+#?(\d+)", user_message_lower)
                ]
                for match in number_matches:
                    if match:
                        try:
                            task_identifier = int(match.group(1))
                            break
                        except (ValueError, AttributeError):
                            continue

            if not task_identifier:
                # If no number found, try to extract by title
                title_patterns = [
                    r"(?:task|complete|mark|finish|tick|check)\s+(?:as\s+)?(?:done|completed|finished|as done)?\s*(.+?)(?:\s+(?:as\s+)?(?:complete|done|finished|completed)|$)",
                    r"(?:mark|set|make)\s+(.+?)\s+(?:as\s+)?(?:complete|done|finished|completed)",
                    r"(.+?)\s+(?:as\s+)?(?:complete|done|finished|completed)",
                ]
                for pattern in title_patterns:
                    match = re.search(pattern, user_message_lower, re.IGNORECASE)
                    if match:
                        task_identifier = match.group(1).strip()
                        # Clean up common phrases
                        task_identifier = re.sub(r"^(the|a|an)\s+", "", task_identifier)
                        if task_identifier:
                            break

            if task_identifier:
                # First, get the list of tasks to find the matching one
                list_tasks_tool = mcp_server.get_tool("list_tasks")
                if list_tasks_tool:
                    try:
                        tasks_output = await list_tasks_tool(user_id=user_id)
                        tasks = tasks_output.get('tasks', [])

                        target_task = None
                        task_index = -1
                        if isinstance(task_identifier, int):
                            # Find by index (task number) or ID
                            for i, task in enumerate(tasks):
                                if (i + 1) == task_identifier or task['id'] == str(task_identifier): # user might provide task number or the actual ID
                                    target_task = task
                                    task_index = i
                                    break
                        else:
                            # Find by title (partial match)
                            for i, task in enumerate(tasks):
                                if task_identifier.lower() in task['title'].lower():
                                    target_task = task
                                    task_index = i
                                    break

                        if target_task:
                            # Call the complete_task MCP tool
                            complete_task_tool = mcp_server.get_tool("complete_task")
                            if complete_task_tool:
                                tool_output = await complete_task_tool(user_id=user_id, task_id=target_task['id'], manager=manager)

                                # Check the status and set action_taken_result accordingly
                                status = tool_output.get('status', 'error')
                                action_taken_result = f"complete_task_{status}"

                                if status == 'success':
                                    assistant_response_content = f"Great job! Task #{task_index + 1} (ID: {target_task['id']}): '{target_task['title']}' has been successfully marked as complete. 🎉"
                                else:
                                    error_message = tool_output.get('message', tool_output.get('error', 'Unknown error'))
                                    if not error_message or error_message.strip() == "":
                                        error_message = "An unspecified error occurred"
                                    assistant_response_content = f"I apologize, but I couldn't mark task '{target_task['title']}' as complete. {error_message}. Please try again."
                            else:
                                action_taken_result = "complete_task_tool_not_found"
                                assistant_response_content = "I'm sorry, but I'm unable to mark tasks as complete at the moment. Please try again later."
                        else:
                            assistant_response_content = f"I couldn't find a task matching '{task_identifier}'. Please specify the task by its number or exact title. You can ask me to 'show tasks' to see the available tasks."
                    except Exception as e:
                        assistant_response_content = f"I apologize, but there was an issue completing the task. Error: {str(e)}. Please try again."
                else:
                    assistant_response_content = "I'm sorry, but I need to retrieve your tasks first before I can complete one. Please try again."
            else:
                assistant_response_content = "I'd be happy to mark a task as complete. Could you please specify which task you'd like to complete? You can use its number or title."

        # Intent: Delete task - expanded to handle more variations
        elif any(re.search(r"\b" + re.escape(keyword) + r"\b", user_message_lower) for keyword in ["delete", "remove", "cancel", "eliminate", "get rid of", "trash", "dispose of"]):
            task_identifier = None

            # Check if we previously asked for a task identifier
            if last_assistant_message_content and "which task do you want to delete" in last_assistant_message_content.lower():
                task_identifier = user_message_lower.strip()
                if task_identifier.isdigit():
                    task_identifier = int(task_identifier)

            if not task_identifier:
                # Try to extract by number first
                number_matches = [
                    re.search(r"(?:task|number|#)\s*(\d+)", user_message_lower),
                    re.search(r"(\d+)\s*(?:th|st|nd|rd)?\s*(?:task|one)", user_message_lower),
                    re.search(r"task\s+#?(\d+)", user_message_lower)
                ]
                for match in number_matches:
                    if match:
                        try:
                            task_identifier = int(match.group(1))
                            break
                        except (ValueError, AttributeError):
                            continue

            if not task_identifier:
                # If no number found, try to extract by title
                title_patterns = [
                    r"(?:task|delete|remove|cancel|eliminate|get rid of|trash|dispose of)\s+(.+?)(?:\.|$|\?)",
                    r"(?:delete|remove|cancel|eliminate|get rid of|trash|dispose of)\s+(?:the\s+|a\s+)?(.+?)(?:\.|$|\?)",
                ]
                for pattern in title_patterns:
                    match = re.search(pattern, user_message_lower, re.IGNORECASE)
                    if match:
                        task_identifier = match.group(1).strip()
                        # Clean up common phrases
                        task_identifier = re.sub(r"^(the|a|an)\s+", "", task_identifier)
                        if task_identifier:
                            break

            if task_identifier:
                # Find the task to delete
                list_tasks_tool = mcp_server.get_tool("list_tasks")
                if list_tasks_tool:
                    try:
                        tasks_output = await list_tasks_tool(user_id=user_id)
                        tasks = tasks_output.get('tasks', [])

                        target_task = None
                        task_index = -1
                        if isinstance(task_identifier, int):
                            # Find by index (task number) or ID
                            for i, task in enumerate(tasks):
                                if (i + 1) == task_identifier or task['id'] == str(task_identifier): # user might provide task number or the actual ID
                                    target_task = task
                                    task_index = i
                                    break
                        else:
                            # Find by title (partial match)
                            for i, task in enumerate(tasks):
                                if task_identifier.lower() in task['title'].lower():
                                    target_task = task
                                    task_index = i
                                    break

                        if target_task:
                            # Call the delete_task MCP tool
                            delete_task_tool = mcp_server.get_tool("delete_task")
                            if delete_task_tool:
                                tool_output = await delete_task_tool(user_id=user_id, task_id=target_task['id'], manager=manager)

                                # Check the status and set action_taken_result accordingly
                                status = tool_output.get('status', 'error')
                                action_taken_result = f"delete_task_{status}"

                                if status == 'success':
                                    assistant_response_content = f"Task #{task_index + 1} (ID: {target_task['id']}): '{target_task['title']}' has been successfully deleted. Is there anything else I can assist you with? 📝"
                                else:
                                    error_message = tool_output.get('message', tool_output.get('error', 'Unknown error'))
                                    if not error_message or error_message.strip() == "":
                                        error_message = "An unspecified error occurred"
                                    assistant_response_content = f"I apologize, but I couldn't delete the task '{target_task['title']}'. {error_message}. Would you like to try again?"
                            else:
                                action_taken_result = "delete_task_tool_not_found"
                                assistant_response_content = "I'm sorry, but I'm unable to delete tasks at the moment. Please try again later."
                        else:
                            assistant_response_content = f"I couldn't find a task matching '{task_identifier}'. Please specify the task by its number or exact title. You can ask me to 'show tasks' to see the available tasks."
                    except Exception as e:
                        assistant_response_content = f"I apologize, but there was an issue deleting the task. Error: {str(e)}. Please try again."
                else:
                    assistant_response_content = "I'm sorry, but I need to retrieve your tasks first before I can delete one. Please try again."
            else:
                assistant_response_content = "I'd be happy to delete a task for you. Could you please specify which task you'd like to delete? You can use its number or title."

        # Intent: Ask for user identity
        elif any(re.search(r"\b" + re.escape(keyword) + r"\b", user_message_lower) for keyword in ["who am i", "what is my name", "my name", "my email", "who is this", "whose account", "user info", "account info"]):
            # Get user information from the database
            user_info = None
            try:
                with next(get_session()) as session:
                    user_query = select(User).where(User.id == user_id)
                    user_result = session.exec(user_query).first()
                    if user_result:
                        user_info = {
                            "name": getattr(user_result, 'name', None),
                            "email": getattr(user_result, 'email', 'unknown@example.com')
                        }

                if user_info:
                    if user_info["name"] and str(user_info["name"]).lower() != "null" and user_info["name"] != "there":
                        assistant_response_content = f"Your name is {user_info['name']} and your account email is {user_info['email']}. How can I assist you with your tasks today?"
                    else:
                        assistant_response_content = f"Your account email is {user_info['email']}. How can I assist you with your tasks today? If you'd like to update your profile with a name, please let me know."
                else:
                    assistant_response_content = "I'm sorry, I couldn't retrieve your account information at the moment. How can I assist you with your tasks today?"
            except Exception as e:
                print(f"Error retrieving user info: {str(e)}")  # For debugging
                assistant_response_content = "I'm sorry, I couldn't retrieve your account information at the moment. How can I assist you with your tasks today?"

        # Default response if no known intent is detected
        else:
            # Provide a more professional and helpful response for general questions
            assistant_response_content = f"Thanks for reaching out! I understand you said: '{user_message}'. I'm your AI task assistant and I'm here to help you manage your tasks more efficiently. You can ask me to add, list, update, complete, or delete tasks. How can I assist you with your tasks today?"

        # Persist assistant's response to the database
        if conversation_id:
            with next(get_session()) as session:
                add_message_to_conversation(
                    session,
                    conversation_id=conversation_id,
                    user_id=user_id,
                    role="assistant",
                    content=assistant_response_content
                )

        return {
            "thread_id": conversation_id,
            "assistant_response": assistant_response_content,
            "action_taken": action_taken_result,
            "tasks": tasks_result
        }

ai_agent_service = AIAgentService()

def get_ai_agent_service() -> AIAgentService:
    return ai_agent_service