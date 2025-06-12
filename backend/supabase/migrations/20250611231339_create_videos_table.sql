-- Create videos table for YouTube content tracking
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_id VARCHAR(255) NOT NULL UNIQUE,
  title TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  transcript TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_videos_youtube_id ON videos(youtube_id);
CREATE INDEX IF NOT EXISTS idx_videos_published_at ON videos(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_videos_updated_at 
    BEFORE UPDATE ON videos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all videos
CREATE POLICY "Allow authenticated users to read videos" ON videos
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to insert videos
CREATE POLICY "Allow authenticated users to insert videos" ON videos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update videos
CREATE POLICY "Allow authenticated users to update videos" ON videos
    FOR UPDATE USING (auth.role() = 'authenticated');