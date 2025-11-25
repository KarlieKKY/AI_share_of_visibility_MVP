# AI Share of Visibility Dashboard

Track and analyze your brand's visibility across AI-powered search results. Monitor rankings, citations, and competitive positioning using Perplexity AI and Google Gemini.

## Preview

[Click here to watch preview on YouTube](https://www.youtube.com/watch?v=3hcONLhaQOY)

## Prerequisites

- Node.js (v18 or higher)
- npm
- Supabase CLI
- Python 3.x (for Jupyter notebook experiments)

## 1. Supabase Setup (Free Tier Cloud)

### Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up for a free account
2. Click **New Project**
3. Fill in your project details:
   - **Name**: AI Share of Visibility
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select closest to your location
   - **Pricing Plan**: Free
4. Click **Create new project** and wait for initialization (~2 minutes)

### Database Setup

1. In your Supabase project dashboard, navigate to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents from `setup.sql`:

```sql
CREATE TABLE history (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  targets TEXT,
  prompts TEXT,
  competitors TEXT[],
  answer_text TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  rank_position INTEGER,
  citations TEXT[]
);
```

4. Click **Run** to create the table
5. Verify the table was created in **Table Editor** → **history**

### Get API Keys

1. Go to **Project Settings** → **API**
2. Copy the following values (you'll need these later):
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key
3. Go to **Project Settings** → **General**
4. Copy your **Reference ID** (you'll need this for deploying edge functions)

### Edge Functions Setup

#### Install Supabase CLI

```bash
npm install -g supabase
```

#### Login to Supabase

```bash
supabase login
```

This will open a browser window to authenticate. Follow the prompts to complete login.

#### Link to Your Project

```bash
supabase link --project-ref your-project-ref
```

Replace `your-project-ref` with the Reference ID you copied earlier.

#### Set Edge Function Secrets

Before deploying, set the required API keys:

```bash
supabase secrets set PERPLEXITY_API_KEY=your_perplexity_api_key
supabase secrets set GEMINI_API_KEY=your_gemini_api_key
```

You can get:

- **Perplexity API Key** from [https://www.perplexity.ai/settings/api](https://www.perplexity.ai/settings/api)
- **Gemini API Key** from [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

#### Deploy Edge Functions

```bash
# Deploy Perplexity search function
supabase functions deploy perplexity-search-function

# Deploy database responder function
supabase functions deploy db-responder
```

After deployment, note the function URLs shown in the terminal. They will look like:

- `https://xxxxx.supabase.co/functions/v1/perplexity-search-function`
- `https://xxxxx.supabase.co/functions/v1/db-responder`

## 2. Frontend Setup

### Install Dependencies

```bash
npm install
```

### Environment Variables

1. Copy `.env-example` to `.env`:

```bash
cp .env-example .env
```

2. Fill in your environment variables in `.env` using the values from Supabase:

```env
# From Supabase Project Settings → API
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key

# Edge function URLs (shown after deployment)
VITE_SUPABASE_EDGE_FUNCTION_URL=https://xxxxx.supabase.co/functions/v1/db-responder

# For Jupyter notebook experiments (optional)
Perplexity_API_Key=your_perplexity_api_key
Gemini_API_Key=your_gemini_api_key
```

### Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 3. Project Structure

```
src/
├── components/          # React components
│   ├── TaskList.tsx    # Sidebar with analysis history
│   ├── TaskCard.tsx    # Individual task item
│   ├── TaskDetails.tsx # Main dashboard content
│   ├── NewAnalysisForm.tsx # New analysis form
│   └── AnswerModal.tsx # Full answer modal
├── types/              # TypeScript type definitions
│   └── task.ts        # HistoryRecord interface
├── utils/             # Utility functions
│   ├── taskHelpers.ts # Helper functions
│   ├── constants.ts   # Environment constants
│   └── supabase.ts    # Supabase client
├── App.tsx            # Main application component
└── main.tsx           # Application entry point

supabase/
├── functions/
│   ├── perplexity-search-function/  # Perplexity AI integration
│   └── db-responder/                 # Database operations
└── config.toml        # Supabase configuration
```

## 4. Experiment Business Logic (Optional)

The project includes a Jupyter notebook (`experiment.ipynb`) for testing and experimenting with the core business logic:

### Setup Python Environment

```bash
# Install required packages
pip install fastapi==0.121.3 uvicorn==0.38.0 python-dotenv==1.2.1 requests==2.32.5 google-generativeai pydantic jupyter
```

Or using requirements.txt:

```bash
pip install -r requirements.txt
```

**requirements.txt:**

```
fastapi==0.121.3
uvicorn==0.38.0
python-dotenv==1.2.1
requests==2.32.5
google-generativeai
pydantic
jupyter
```

### Run Jupyter Notebook

```bash
jupyter notebook experiment.ipynb
```

### What the Notebook Does

1. **Perplexity AI Integration**: Tests API calls to Perplexity AI with sample queries
2. **Response Processing**: Processes AI responses using Google Gemini
3. **Data Extraction**: Extracts competitors, visibility status, and ranking information
4. **JSON Schema Validation**: Uses Pydantic models to validate structured responses

The notebook demonstrates the core logic before integrating it into the edge functions.

## 5. How It Works

1. **User Input**: User enters a search query (prompt) and target company
2. **AI Search**: Query is sent to Perplexity AI for search results
3. **Analysis**: Google Gemini analyzes the response to extract:
   - Visibility status (is target mentioned?)
   - Competitor list
   - Rank position (if applicable)
   - Citations
4. **Storage**: Results are stored in Supabase database
5. **Display**: Dashboard shows historical analyses with color-coded visibility indicators

## 6. Features

- ✅ Real-time AI-powered search analysis
- ✅ Visibility tracking with color-coded indicators
- ✅ Competitor identification
- ✅ Ranking position detection
- ✅ Citation tracking
- ✅ Historical analysis records
- ✅ Create new analysis
- ✅ Regenerate analysis for historical records

## 7. Visibility Indicators

- 🟢 **Green**: High visibility (Rank 1-3)
- 🟠 **Amber**: Medium visibility (Rank 4+)
- ⚫ **Grey**: Mentioned but not ranked
- 🔴 **Red**: Target not found in results

## 8. Troubleshooting

### Edge Function Not Working

1. Check function logs: `supabase functions logs perplexity-search-function`
2. Verify secrets are set: `supabase secrets list`
3. Redeploy if needed: `supabase functions deploy perplexity-search-function`

### Database Connection Issues

1. Verify your `.env` file has correct Supabase URL and anon key
2. Check if table exists in **Table Editor**
3. Ensure Row Level Security (RLS) is disabled for the `history` table (for testing)

### CORS Errors

Edge functions are automatically configured for CORS. If you encounter issues:

1. Check that `VITE_SUPABASE_EDGE_FUNCTION_URL` is correct
2. Ensure you're using the anon key, not the service role key

## AI Usage Declaration

This project leverages AI assistance in the following areas:

### Frontend (FE)

- Component generation
- Component modularization planning
- Data requirement document generation

### Supabase

- Research and best practices
- Boilerplate code generation
- Edge function templates

### Database

- Schema SQL generation

### README

- Documentation generation
- Setup instructions

## Improvements & Future Enhancements

### Backend

- Error handling for LLM JSON parsing errors
- Retry logic for API failures
- Rate limiting

### Database

- Normalize schema for base tables such as targets/competitors
- Store regenerated anlysis result instead of overriding to keep the full record
- Linking analysis result to prompt/target to show regenerated result versioning
- Row Level Security (RLS) policies

### Prompt Engineering

- More clarity in definition of whether a ranking is implicitly implied in Perplexity's response
- Disambiguation for brand name variations and typos
