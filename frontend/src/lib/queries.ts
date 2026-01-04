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
