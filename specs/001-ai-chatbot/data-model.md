# Data Model: Todo AI Chatbot

## Entities

### Conversation

- **Description**: Represents a chat session between a user and the AI assistant.
- **Attributes**:
    - `id` (Primary Key): Unique identifier for the conversation.
    - `user_id` (Foreign Key): Links to the user who owns the conversation.
    - `created_at` (Timestamp): Date and time when the conversation was initiated.
    - `updated_at` (Timestamp): Date and time when the conversation was last updated.
- **Relationships**:
    - One-to-many with `Message` (a conversation can have many messages).
    - Many-to-one with `User` (a user can have many conversations).

### Message

- **Description**: Represents an individual message within a conversation.
- **Attributes**:
    - `id` (Primary Key): Unique identifier for the message.
    - `conversation_id` (Foreign Key): Links to the conversation this message belongs to.
    - `role` (String): Indicates who sent the message (e.g., "user", "assistant").
    - `content` (Text): The actual text content of the message.
    - `created_at` (Timestamp): Date and time when the message was created.
- **Relationships**:
    - Many-to-one with `Conversation` (many messages belong to one conversation).

## Validation Rules (derived from Functional Requirements)

- **FR-007**: System MUST enforce user isolation - users can only access their own tasks and conversations.
    - `Conversation.user_id` must match the authenticated user's ID for all operations.
- **FR-008**: System MUST validate JWT tokens and derive user identity from authentication.
    - User identity, crucial for linking `Conversation` to `User`, must be securely derived from validated JWT.

## State Transitions (if applicable)

- Not directly applicable to `Conversation` or `Message` entities, as their state is primarily additive (new messages are added to a conversation). The state of associated tasks, however, does transition (e.g., pending to completed).