export const typeDefs = `#graphql
  type Query {
    hello: String!
    me: User
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!
    searchUsers(query: String, limit: Int): [User!]!
    post(id: ID!): Post
    posts(limit: Int, offset: Int): [Post!]!
    userPosts(userId: ID!, limit: Int, offset: Int): [Post!]!
    feed(limit: Int, offset: Int): [Post!]!
    
    # Hashtags
    trendingHashtags(limit: Int): [Hashtag!]!
    searchHashtags(query: String!, limit: Int): [Hashtag!]!
    postsByHashtag(hashtag: String!, limit: Int, offset: Int): [Post!]!
  }

  type Mutation {
    # Authentication
    register(email: String!, username: String!, password: String!, name: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    completeOnboarding: Boolean!
    
    # Posts
    createPost(content: String!, imageUrl: String): Post!
    deletePost(id: ID!): Boolean!
    
    # Likes
    likePost(postId: ID!): Boolean!
    unlikePost(postId: ID!): Boolean!
    
    # Comments
    createComment(postId: ID!, content: String!): Comment!
    deleteComment(id: ID!): Boolean!
    
    # Follows
    followUser(userId: ID!): Boolean!
    unfollowUser(userId: ID!): Boolean!
    
    # Bookmarks
    bookmarkPost(postId: ID!): Boolean!
    unbookmarkPost(postId: ID!): Boolean!
    
    # File Upload
    generateUploadUrl(filename: String!, contentType: String!): UploadUrlResponse!
  }

  type User {
    id: ID!
    email: String!
    username: String!
    name: String
    bio: String
    avatar: String
    coverImage: String
    verified: Boolean!
    createdAt: String!
    updatedAt: String!
    
    # Relations
    posts: [Post!]!
    followers: [User!]!
    following: [User!]!
    followersCount: Int!
    followingCount: Int!
    postsCount: Int!
  }

  type Post {
    id: ID!
    content: String!
    imageUrl: String
    createdAt: String!
    updatedAt: String!
    
    # Relations
    user: User!
    likes: [Like!]!
    comments: [Comment!]!
    likesCount: Int!
    commentsCount: Int!
    isLiked: Boolean!
    isBookmarked: Boolean!
  }

  type Like {
    id: ID!
    user: User!
    post: Post!
    createdAt: String!
  }

  type Comment {
    id: ID!
    content: String!
    createdAt: String!
    updatedAt: String!
    
    # Relations
    user: User!
    post: Post!
  }

  type Follow {
    id: ID!
    follower: User!
    following: User!
    createdAt: String!
  }

  type Bookmark {
    id: ID!
    user: User!
    post: Post!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type UploadUrlResponse {
    uploadUrl: String!
    publicUrl: String!
    key: String!
  }

  type Hashtag {
    id: ID!
    name: String!
    postsCount: Int!
    createdAt: String!
  }
`;
