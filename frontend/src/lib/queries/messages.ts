import { gql } from '@apollo/client';

// Fragment for Message fields
export const MESSAGE_FIELDS = gql`
  fragment MessageFields on Message {
    id
    content
    imageUrl
    createdAt
    isDeleted
    sender {
      id
      username
      name
      avatar
    }
  }
`;

// Fragment for Conversation fields
export const CONVERSATION_FIELDS = gql`
  fragment ConversationFields on Conversation {
    id
    createdAt
    updatedAt
    unreadCount
    participants {
      id
      username
      name
      avatar
    }
    lastMessage {
      ...MessageFields
    }
  }
  ${MESSAGE_FIELDS}
`;

// Query: Get all conversations
export const GET_CONVERSATIONS = gql`
  query GetConversations($limit: Int, $offset: Int, $search: String) {
    myConversations(limit: $limit, offset: $offset, search: $search) {
      ...ConversationFields
    }
  }
  ${CONVERSATION_FIELDS}
`;

// Query: Get or create conversation with a user
export const GET_CONVERSATION = gql`
  query GetConversation($userId: ID!) {
    conversation(userId: $userId) {
      ...ConversationFields
    }
  }
  ${CONVERSATION_FIELDS}
`;

// Query: Get messages in a conversation
export const GET_MESSAGES = gql`
  query GetMessages($conversationId: ID!, $limit: Int, $offset: Int) {
    messages(conversationId: $conversationId, limit: $limit, offset: $offset) {
      ...MessageFields
    }
  }
  ${MESSAGE_FIELDS}
`;

// Query: Get total unread message count
export const GET_UNREAD_MESSAGE_COUNT = gql`
  query GetUnreadMessageCount {
    unreadMessageCount
  }
`;

// Query: Check if user can send DM
export const CAN_SEND_DM = gql`
  query CanSendDM($userId: ID!) {
    canSendDM(userId: $userId)
  }
`;

// Mutation: Send a message
export const SEND_MESSAGE = gql`
  mutation SendMessage(
    $conversationId: ID
    $recipientId: ID
    $content: String!
    $imageUrl: String
  ) {
    sendMessage(
      conversationId: $conversationId
      recipientId: $recipientId
      content: $content
      imageUrl: $imageUrl
    ) {
      ...MessageFields
      conversation {
        id
        updatedAt
      }
    }
  }
  ${MESSAGE_FIELDS}
`;

// Mutation: Mark messages as read
export const MARK_MESSAGES_AS_READ = gql`
  mutation MarkMessagesAsRead($conversationId: ID!) {
    markMessagesAsRead(conversationId: $conversationId)
  }
`;

// Mutation: Delete a message
export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($messageId: ID!) {
    deleteMessage(messageId: $messageId)
  }
`;

// Mutation: Delete a conversation
export const DELETE_CONVERSATION = gql`
  mutation DeleteConversation($conversationId: ID!) {
    deleteConversation(conversationId: $conversationId)
  }
`;

// Mutation: Update DM privacy settings
export const UPDATE_DM_PRIVACY = gql`
  mutation UpdateDMPrivacy($allowDMsFrom: String!) {
    updateDMPrivacy(allowDMsFrom: $allowDMsFrom) {
      id
      allowDMsFrom
    }
  }
`;

// Mutation: Block a user
export const BLOCK_USER = gql`
  mutation BlockUser($userId: ID!) {
    blockUser(userId: $userId)
  }
`;

// Mutation: Unblock a user
export const UNBLOCK_USER = gql`
  mutation UnblockUser($userId: ID!) {
    unblockUser(userId: $userId)
  }
`;
