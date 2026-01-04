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
