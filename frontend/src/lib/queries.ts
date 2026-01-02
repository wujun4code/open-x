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
