# Database Setup Instructions

This project uses two databases:

- **Supabase** (PostgreSQL) for storing summaries
- **MongoDB** for storing full blog content

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project dashboard
3. Create a new table called `summaries` with the following SQL:

```sql
CREATE TABLE summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  summary TEXT NOT NULL,
  urdu_summary TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on URL for faster lookups
CREATE INDEX idx_summaries_url ON summaries(url);
```

4. Get your project URL and anon key from Settings > API
5. Add them to your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

## MongoDB Setup

1. Create a MongoDB Atlas account at [mongodb.com](https://mongodb.com)
2. Create a new cluster
3. Create a database called `blog-summariser`
4. Create a collection called `blog-contents`
5. Get your connection string from Connect > Connect your application
6. Add it to your `.env.local` file:
   ```
   MONGODB_URI=your_mongodb_connection_string
   ```

## Environment Variables

Create a `.env.local` file in your project root with:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string
```

## API Endpoints

### Summarize and Save

- `POST /api/summarise` - Summarizes blog and saves to both databases

### Retrieve Data

- `GET /api/summaries` - Get all summaries from Supabase
- `GET /api/summaries?url=<url>` - Get specific summary by URL
- `GET /api/blog-contents` - Get all blog contents from MongoDB
- `GET /api/blog-contents?url=<url>` - Get specific blog content by URL

## Data Structure

### Supabase (summaries table)

```typescript
{
  id: string;
  url: string;
  summary: string;
  urdu_summary: string;
  created_at: string;
}
```

### MongoDB (blog-contents collection)

```typescript
{
  _id: ObjectId;
  url: string;
  fullText: string;
  createdAt: Date;
}
```
