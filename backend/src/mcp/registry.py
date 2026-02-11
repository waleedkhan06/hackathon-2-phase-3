from src.services.mcp_service import mcp_server, MCPTool
from src.mcp.tools import add_task, list_tasks, update_task, complete_task, delete_task

def register_all_mcp_tools():
    """Registers all defined MCP tools with the MCP server."""
    print("Registering MCP tools...")
    mcp_server.register_tool(
        MCPTool(
            name="add_task",
            description="Adds a new task for the specified user. Parameters: user_id (str), title (str), description (Optional[str])",
            func=add_task
        )
    )
    mcp_server.register_tool(
        MCPTool(
            name="list_tasks",
            description="Lists tasks for the specified user, optionally filtered by status. Parameters: user_id (str), status (Optional[str] - 'pending' or 'completed')",
            func=list_tasks
        )
    )
    mcp_server.register_tool(
        MCPTool(
            name="update_task",
            description="Updates an existing task for the specified user. Parameters: user_id (str), task_id (int), title (Optional[str]), description (Optional[str])",
            func=update_task
        )
    )
    mcp_server.register_tool(
        MCPTool(
            name="complete_task",
            description="Marks a task as complete for the specified user. Parameters: user_id (str), task_id (int)",
            func=complete_task
        )
    )
    mcp_server.register_tool(
        MCPTool(
            name="delete_task",
            description="Deletes a task for the specified user. Parameters: user_id (str), task_id (int)",
            func=delete_task
        )
    )
    print("All MCP tools registered.")
