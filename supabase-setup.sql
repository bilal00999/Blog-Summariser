-- Create the summaries table
CREATE TABLE IF NOT EXISTS summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  summary TEXT NOT NULL,
  urdu_summary TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on URL for faster lookups
CREATE INDEX IF NOT EXISTS idx_summaries_url ON summaries(url);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_summaries_created_at ON summaries(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for now)
-- You can modify this later for better security
CREATE POLICY "Allow all operations" ON summaries
  FOR ALL USING (true); 