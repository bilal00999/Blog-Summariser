const fs = require("fs");
const path = require("path");

const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ajnbiiriboejzvwjktik.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqbmJpaXJpYm9lanp2d2prdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MzcyNTAsImV4cCI6MjA2NzAxMzI1MH0.pyCBxDlIehYWPi8lwNg-9m9B4WRNYXHetQ5yIvtdrXY

# MongoDB Configuration (you'll need to add this later)
MONGODB_URI=your_mongodb_connection_string
`;

const envPath = path.join(__dirname, ".env.local");

try {
  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env.local file created successfully!");
  console.log("📝 Please add your MongoDB connection string to MONGODB_URI");
} catch (error) {
  console.error("❌ Error creating .env.local file:", error.message);
}
