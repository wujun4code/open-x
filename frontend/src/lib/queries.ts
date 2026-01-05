import { gql } from '@apollo/client';

// Hashtag Queries
export const TRENDING_HASHTAGS = gql`
  query TrendingHashtags($limit: Int) {
    trendingHashtags(limit: $limit) {
      id
      name
      postsCount
      createdAt
    }
  }
`;

export const SEARCH_HASHTAGS = gql`
  query SearchHashtags($query: String!, $limit: Int) {
    searchHashtags(query: $query, limit: $limit) {
      id
      name
      postsCount
      createdAt
    }
  }
`;

export const POSTS_BY_HASHTAG = gql`
  query PostsByHashtag($hashtag: String!, $limit: Int, $offset: Int) {
    postsByHashtag(hashtag: $hashtag, limit: $limit, offset: $offset) {
      id
      content
      imageUrl
      createdAt
      user {
        id
        username
        name
        avatar
      }
      likesCount
      commentsCount
      isLiked
      isBookmarked
    }
  }
`;

// Profile Mutations
export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($name: String, $bio: String, $avatar: String, $coverImage: String) {
    updateProfile(name: $name, bio: $bio, avatar: $avatar, coverImage: $coverImage) {
      id
      name
      bio
      avatar
      coverImage
      updatedAt
    }
  }
`;

export const COMMENT_FIELDS = gql`
  fragment CommentFields on Comment {
    id
    content
    createdAt
    user {
      id
      name
      username
      avatar
    }
  }
`;

export const CREATE_COMMENT_MUTATION = gql`
  ${COMMENT_FIELDS}
  mutation CreateComment($postId: ID!, $content: String!) {
    createComment(postId: $postId, content: $content) {
      ...CommentFields
    }
  }
`;

export const DELETE_COMMENT_MUTATION = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id)
  }
`;

export const GET_POST_COMMENTS = gql`
  ${COMMENT_FIELDS}
  query GetPostComments($postId: ID!) {
    post(id: $postId) {
      id
      comments {
        ...CommentFields
      }
      commentsCount
    }
  }
`;

// Follow/Unfollow Mutations
export const FOLLOW_USER_MUTATION = gql`
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId)
  }
`;

export const UNFOLLOW_USER_MUTATION = gql`
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId)
  }
`;

// User Fragment for Followers/Following Lists
export const USER_LIST_FIELDS = gql`
  fragment UserListFields on User {
    id
    username
    name
    avatar
    bio
    isFollowing
  }
`;

// Get Followers List
export const GET_FOLLOWERS_QUERY = gql`
  ${USER_LIST_FIELDS}
  query GetFollowers($userId: ID!) {
    user(id: $userId) {
      id
      username
      name
      followers {
        ...UserListFields
      }
      followersCount
    }
  }
`;

// Get Following List
export const GET_FOLLOWING_QUERY = gql`
  ${USER_LIST_FIELDS}
  query GetFollowing($userId: ID!) {
    user(id: $userId) {
      id
      username
      name
      following {
        ...UserListFields
      }
      followingCount
    }
  }
`;

// Search Users for Mentions
export const SEARCH_USERS = gql`
  query SearchUsers($query: String, $limit: Int) {
    searchUsers(query: $query, limit: $limit) {
      id
      username
      name
      avatar
    }
  }
`;

export const GET_USER_BY_USERNAME = gql`
  query GetUserByUsername($username: String!) {
    userByUsername(username: $username) {
      id
      username
      name
      bio
      avatar
      coverImage
      createdAt
      followersCount
      followingCount
      postsCount
      isFollowing
    }
  }
`;

// Role Management Queries
export const MY_ROLE_QUERY = gql`
  query MyRole {
    myRole
  }
`;

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: ID!, $role: String!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      username
      role
    }
  }
`;

// Moderation Dashboard Queries
export const GET_REPORTS = gql`
  query GetReports($status: String, $limit: Int, $offset: Int) {
    reports(status: $status, limit: $limit, offset: $offset) {
      id
      reason
      description
      status
      action
      createdAt
      updatedAt
      reporter {
        id
        username
        name
        avatar
      }
      post {
        id
        content
        imageUrl
        user {
          id
          username
          name
        }
      }
      comment {
        id
        content
        user {
          id
          username
          name
        }
      }
      reviewedBy {
        id
        username
        name
      }
      reviewedAt
      moderatorNotes
    }
  }
`;

export const REVIEW_REPORT = gql`
  mutation ReviewReport(
    $reportId: ID!
    $action: String!
    $moderatorNotes: String
    $duration: Int
  ) {
    reviewReport(
      reportId: $reportId
      action: $action
      moderatorNotes: $moderatorNotes
      duration: $duration
    ) {
      id
      status
      action
      reviewedAt
      moderatorNotes
    }
  }
`;

export const DISMISS_REPORT = gql`
  mutation DismissReport($reportId: ID!, $moderatorNotes: String) {
    dismissReport(reportId: $reportId, moderatorNotes: $moderatorNotes) {
      id
      status
      action
      reviewedAt
      moderatorNotes
    }
  }
`;

// Deleted Content Queries (Moderator only)
export const GET_DELETED_POSTS = gql`
  query GetDeletedPosts($limit: Int, $offset: Int) {
    deletedPosts(limit: $limit, offset: $offset) {
      id
      content
      imageUrl
      createdAt
      deletedAt
      isDeleted
      user {
        id
        username
        name
        avatar
      }
      deletedBy {
        id
        username
        name
      }
      likesCount
      commentsCount
    }
  }
`;

export const GET_DELETED_COMMENTS = gql`
  query GetDeletedComments($limit: Int, $offset: Int) {
    deletedComments(limit: $limit, offset: $offset) {
      id
      content
      createdAt
      deletedAt
      isDeleted
      user {
        id
        username
        name
        avatar
      }
      deletedBy {
        id
        username
        name
      }
      post {
        id
        content
      }
    }
  }
`;

// Deleted Content Mutations (Moderator only)
export const PERMANENTLY_DELETE_POST = gql`
  mutation PermanentlyDeletePost($postId: ID!) {
    permanentlyDeletePost(postId: $postId)
  }
`;

export const PERMANENTLY_DELETE_COMMENT = gql`
  mutation PermanentlyDeleteComment($commentId: ID!) {
    permanentlyDeleteComment(commentId: $commentId)
  }
`;

export const RESTORE_POST = gql`
  mutation RestorePost($postId: ID!) {
    restorePost(postId: $postId) {
      id
      isDeleted
      deletedAt
      deletedBy {
        id
        username
      }
    }
  }
`;

export const RESTORE_COMMENT = gql`
  mutation RestoreComment($commentId: ID!) {
    restoreComment(commentId: $commentId) {
      id
      isDeleted
      deletedAt
      deletedBy {
        id
        username
      }
    }
  }
`;
