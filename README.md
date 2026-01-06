# Open X

A modern, full-stack social media platform inspired by Twitter/X, built with cutting-edge technologies.

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Apollo Client** - GraphQL client
- **TailwindCSS** - Utility-first CSS framework

### Backend
- **Apollo Server** - GraphQL server
- **Social Features**: Create posts, like posts, and comment on posts
- **Comments System**: 
  - Real-time optimistic updates for creating and deleting comments
  - Delete own comments with confirmation dialog
  - Internationalized UI (EN/ES/ZH-CN)
- **Profile System**: User profiles with avatar and bio
- **Internationalization**: Support for English, Spanish, and Chinese
- **Authentication**: JWT-based auth with secure password hashing

## 📁 Project Structure

```
open-x/
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/      # Next.js App Router pages
│   │   └── lib/      # Utilities and configurations
│   └── package.json
├── backend/           # Apollo GraphQL backend
│   ├── src/
│   │   ├── schema/   # GraphQL schema and resolvers
│   │   ├── context.ts
│   │   └── index.ts
│   ├── prisma/       # Database schema
│   └── package.json
└── package.json       # Root workspace configuration
```

## 🛠️ Local Development Guide

### Prerequisites

- **Node.js** 18+ and npm 9+
- **Docker & Docker Compose** (recommended for PostgreSQL)
  - [Install Docker Desktop](https://www.docker.com/products/docker-desktop/) for Windows/Mac
  - OR **PostgreSQL** 14+ installed locally

### Quick Start with Docker (Recommended)

The easiest way to get started is using Docker Compose for PostgreSQL.

> 📘 **For detailed Docker documentation, see [DOCKER.md](DOCKER.md)**


1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd open-x
   ```

2. **Start PostgreSQL with Docker Compose**
   ```bash
   docker-compose up -d
   ```
   
   This will:
   - Pull PostgreSQL 16 Alpine image
   - Start PostgreSQL on port 5432
   - Create a database named `openx`
   - Set up persistent storage for data
   
   **Verify PostgreSQL is running:**
   ```bash
   docker-compose ps
   ```
   
   You should see `openx-postgres` with status "Up" and healthy.

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up the database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev --name init
   cd ..
   ```
   
   This will:
   - Generate Prisma Client
   - Create database tables
   - Apply all migrations

5. **Start development servers**
   ```bash
   npm run dev
   ```
   
   This starts both frontend and backend:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:4000/graphql

6. **Verify everything works**
   - Open http://localhost:3000
   - You should see the GraphQL API status showing "✅ Connected"

### Alternative: Local PostgreSQL Setup

If you prefer to use a local PostgreSQL installation:

1. **Install PostgreSQL** (if not already installed)
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - Mac: `brew install postgresql@16`
   - Linux: `sudo apt-get install postgresql-16`

2. **Create database**
   ```bash
   createdb openx
   ```

3. **Configure environment variables**
   
   Copy `.env.example` and create backend `.env`:
   ```bash
   cp .env.example backend/.env
   ```
   
   Update `backend/.env` with your database credentials:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/openx?schema=public"
   PORT=4000
   JWT_SECRET="your-secret-key"
   ```

4. **Continue from step 3** in the Docker guide above

### Docker Commands Reference

```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# View logs
docker-compose logs -f postgres

# Stop and remove data (⚠️ destructive)
docker-compose down -v

# Restart PostgreSQL
docker-compose restart

# Access PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d openx
```

### Database Management

**Prisma Studio** - Visual database browser:
```bash
cd backend
npx prisma studio
```
Opens at http://localhost:5555

**Reset database** (⚠️ deletes all data):
```bash
cd backend
npx prisma migrate reset
```

**Create new migration**:
```bash
cd backend
npx prisma migrate dev --name your_migration_name
```

### Troubleshooting

**Port 5432 already in use:**
```bash
# Check what's using the port
netstat -ano | findstr :5432  # Windows
lsof -i :5432                 # Mac/Linux

# Option 1: Stop the conflicting service
# Option 2: Change port in docker-compose.yml to "5433:5432"
```

**Database connection refused:**
```bash
# Check if PostgreSQL container is running
docker-compose ps

# Check container logs
docker-compose logs postgres

# Restart the container
docker-compose restart postgres
```

**Prisma Client errors:**
```bash
# Regenerate Prisma Client
cd backend
npx prisma generate
```

**Frontend won't start:**
```bash
# Clear Next.js cache
cd frontend
rm -rf .next
npm run dev


## 📜 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend
- `npm run build` - Build both applications
- `npm run lint` - Lint all workspaces
- `npm run format` - Format code with Prettier

### Backend
- `npm run dev --workspace=backend` - Start backend dev server
- `npm run build --workspace=backend` - Build backend
- `npm run prisma:generate --workspace=backend` - Generate Prisma Client
- `npm run prisma:migrate --workspace=backend` - Run database migrations
- `npm run prisma:studio --workspace=backend` - Open Prisma Studio

### Frontend
- `npm run dev --workspace=frontend` - Start frontend dev server
- `npm run build --workspace=frontend` - Build frontend for production

## ✨ Features

### 🔐 Authentication & User Management
- [x] **User Registration** - Email, username, and password-based signup
- [x] **User Login** - JWT-based authentication
- [x] **Protected Routes** - Secure API endpoints with authentication middleware
- [x] **User Onboarding** - Welcome flow for new users
- [x] **User Profiles** - Display user information, bio, avatar, and cover images
- [x] **Profile Stats** - Followers count, following count, and posts count

### 📝 Posts & Content
- [x] **Create Posts** - Share text content with optional images
- [x] **Delete Posts** - Remove your own posts
- [x] **Post Feed** - Chronological timeline of posts
- [x] **User Posts** - View all posts from a specific user
- [x] **Image Uploads** - Upload images to Cloudflare R2 storage
- [x] **Image Preview** - Preview images before posting
- [x] **Image Modal** - Click to view full-size images with smooth animations
- [x] **Post Metadata** - Timestamps, author information, and engagement stats
- [x] **Hashtags** - Automatic hashtag extraction and linking in posts

### 💬 Social Interactions
- [x] **Like Posts** - Like/unlike posts with real-time count updates
- [x] **Comments** - Add comments/replies to posts
- [x] **Delete Comments** - Remove your own comments
- [x] **Follow/Unfollow Users** - Build your network by following other users
- [x] **Bookmark Posts** - Save posts for later viewing
- [x] **Engagement Counts** - Display likes count and comments count
- [x] **Follower/Following Lists** - View who follows you and who you follow

### 🔍 Content Discovery
- [x] **Trending Hashtags** - Discover popular topics with post counts
- [x] **Hashtag Pages** - View all posts for a specific hashtag
- [x] **Clickable Hashtags** - Navigate to hashtag pages from posts
- [x] **Hashtag Extraction** - Automatic detection and storage of hashtags

### 🎨 User Interface
- [x] **Modern Design** - Clean, Twitter/X-inspired UI with TailwindCSS
- [x] **Responsive Layout** - Mobile-friendly design
- [x] **Dark Theme** - Sleek dark mode interface
- [x] **Smooth Animations** - Hover effects, transitions, and modal animations
- [x] **Loading States** - Skeleton loaders and loading indicators
- [x] **Error Handling** - User-friendly error messages
- [x] **Profile Cards** - Compact user information display
- [x] **Header Navigation** - Persistent navigation with user menu

### 🔧 Technical Features
- [x] **GraphQL API** - Type-safe API with Apollo Server
- [x] **Real-time Updates** - Optimistic UI updates with Apollo Client
- [x] **Database ORM** - Prisma for type-safe database queries
- [x] **File Storage** - Cloudflare R2 for scalable image storage
- [x] **Presigned URLs** - Secure direct-to-R2 uploads
- [x] **Password Hashing** - bcrypt for secure password storage
- [x] **Type Safety** - Full TypeScript coverage
- [x] **Hot Reload** - Development servers with auto-reload
- [x] **Multi-language Support** - Internationalization (English, Spanish, Chinese)

### �️ Content Moderation & Safety
- [x] **Role-Based Access Control** - User, Moderator, and Admin roles
- [x] **Report System** - Report inappropriate posts and comments
- [x] **Moderation Dashboard** - Review and manage user reports
- [x] **Moderation Actions** - Warning, content removal, suspension, and ban
- [x] **Soft Delete** - Two-stage deletion with restore capability
- [x] **Deleted Content Management** - Review and permanently delete or restore content
- [x] **Audit Trail** - Track who deleted content and when

### �🔮 Planned Features

#### 📊 Content Discovery & Search
- [ ] **Search** - Search for users, posts, and hashtags
- [x] **Trending Topics** - Discover popular hashtags and topics in real-time
- [ ] **Explore Page** - Curated content discovery
- [ ] **Advanced Filters** - Filter feed by media, likes, date, etc.
- [ ] **Suggested Users** - Recommendations based on interests
- [ ] **Topic Following** - Follow specific topics/hashtags

#### 🔄 Enhanced Engagement
- [ ] **Retweets/Reposts** - Share other users' posts to your followers
- [ ] **Quote Posts** - Repost with your own commentary
- [ ] **Thread Support** - Multi-post threads for longer stories
- [ ] **Polls** - Create and vote on polls
- [ ] **Emoji Reactions** - React with multiple emoji types beyond likes
- [ ] **Pin Posts** - Pin important posts to profile
- [ ] **Scheduled Posts** - Schedule posts for future publishing
- [ ] **Draft Posts** - Save posts as drafts

#### 👤 Profile & Customization
- [x] **Edit Profile** - Update bio, avatar, cover image, and personal info
- [ ] **Profile Themes** - Customize profile appearance
- [ ] **Media Gallery** - View all media from a user's posts
- [ ] **Liked Posts** - View posts a user has liked
- [ ] **User Verification** - Verified badge system
- [ ] **Custom URLs** - Personalized profile URLs
- [ ] **Profile Analytics** - Insights on profile views and engagement

#### 💬 Communication
- [ ] **Direct Messages** - Private messaging between users
- [ ] **Group DMs** - Group conversations
- [ ] **Message Reactions** - React to messages
- [ ] **Voice Messages** - Send audio messages
- [ ] **Read Receipts** - See when messages are read
- [ ] **Typing Indicators** - Show when someone is typing

#### 🔔 Notifications
- [x] **Real-time Notifications** - Instant updates for interactions
  - [x] Notification types: Like, Comment, Follow, Mention
  - [x] Notification bell icon with unread count badge
  - [x] Notification dropdown with recent notifications
  - [x] Full notifications page with pagination
  - [x] Mark as read functionality
  - [x] Real-time polling (5-second intervals)
  - [x] Notification creation triggers integrated into mutations
- [ ] **Push Notifications** - Browser/mobile push notifications
- [ ] **Email Notifications** - Configurable email alerts
- [ ] **Notification Filters** - Customize which notifications you receive
- [ ] **Notification Groups** - Grouped notifications for similar events

#### 🎥 Media & Content
- [ ] **Video Uploads** - Support for video content
- [ ] **Video Player** - In-app video playback
- [ ] **GIF Support** - Integrate GIF picker (Giphy/Tenor)
- [ ] **Multiple Images** - Upload multiple images per post
- [ ] **Image Editing** - Crop, filter, and edit images before posting
- [ ] **Audio Posts** - Voice notes and audio content
- [ ] **Live Streaming** - Live video broadcasts

#### 🔒 Privacy & Safety
- [x] **Content Moderation** - Comprehensive moderation system
  - [x] Role-based access control (User, Moderator, Admin)
  - [x] User reporting system for posts and comments
  - [x] Moderator dashboard for content review
  - [x] Report management with status tracking (pending, reviewed, actioned, dismissed)
  - [x] Moderation actions (warnings, content removal, suspension, ban)
  - [x] Soft delete system for content (two-stage deletion)
  - [x] Restore deleted content functionality
  - [x] Permanent deletion for final content removal
  - [ ] Automated detection of inappropriate content (AI-powered)
  - [ ] Appeal system for moderation decisions
- [ ] **Mute Users** - Hide posts from specific users
- [ ] **Block Users** - Prevent interactions with blocked users
- [ ] **Private Accounts** - Require approval for followers
- [ ] **Content Warnings** - Mark sensitive content
- [ ] **Two-Factor Authentication** - Enhanced account security
- [ ] **Privacy Settings** - Granular privacy controls
- [ ] **Who Can Reply** - Control who can reply to your posts

#### 📈 Analytics & Insights
- [ ] **Post Analytics** - Views, engagement rate, reach
- [ ] **Profile Analytics** - Follower growth, demographics
- [ ] **Best Time to Post** - Optimal posting times
- [ ] **Engagement Insights** - Detailed interaction metrics

#### 🛠️ Platform Features
- [ ] **Lists** - Curated lists of users for organized feeds
- [ ] **Bookmarks Collections** - Organize bookmarks into folders
- [ ] **Edit Posts** - Modify posts after publishing (with edit history)
- [ ] **Post History** - View edit history of posts
- [ ] **Keyboard Shortcuts** - Power user shortcuts
- [x] **Dark/Light Theme Toggle** - Switch between themes
- [ ] **Accessibility Features** - Screen reader support, high contrast

- [ ] **Progressive Web App** - Installable web app
- [ ] **Offline Mode** - View cached content offline
- [ ] **Export Data** - Download your data archive

## 🧪 Testing the Setup

1. **Backend Health Check**
   ```bash
   curl http://localhost:4000/health
   ```

2. **GraphQL Playground**
   
   Open http://localhost:4000/graphql and run:
   ```graphql
   query {
     hello
   }
   ```

3. **Frontend**
   
   Open http://localhost:3000 and verify the page loads with API status

## 📝 Development Workflow

1. Make changes to frontend or backend code
2. Hot reload will automatically update the application
3. Run `npm run lint` before committing
4. Run `npm run format` to format code

## 🤝 Contributing

This is a learning project. Feel free to explore, modify, and extend it!

## 📄 License

MIT License - see LICENSE file for details
