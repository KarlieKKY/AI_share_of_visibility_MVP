# Data Requirements

## Database Schema

### Table: `history`

Stores competitive analysis records with the following fields:

- `id` (number) - Unique identifier
- `created_at` (string) - Timestamp when analysis was created
- `completed_at` (string) - Timestamp when analysis was completed
- `targets` (string) - Target company/client name
- `prompts` (string) - The analysis prompt/question
- `competitors` (array of strings) - List of competitor names analyzed
- `answer_text` (string) - The generated analysis text
- `is_visible` (boolean) - Visibility flag
- `rank_position` (number) - Ranking position (0 = not found, 1-3 = high visibility, 4+ = medium visibility)
- `citations` (array of strings) - List of source URLs

## API Endpoints

### 1. Retrieve Analysis History

- **Method**: GET or Database Query
- **Table/Endpoint**: `history`
- **Request**: No parameters required (retrieves all records)
- **Returns**: Array of all analysis records

```json
[
  {
    "id": 1,
    "created_at": "2024-01-15T10:30:00Z",
    "completed_at": "2024-01-15T10:32:00Z",
    "targets": "Stripe",
    "prompts": "How does Stripe compare to competitors?",
    "competitors": ["PayPal", "Square", "Adyen"],
    "answer_text": "Analysis text here...",
    "is_visible": true,
    "rank_position": 2,
    "citations": [
      "https://example.com/article1",
      "https://example.com/article2"
    ]
  }
]
```

### 2. Create New Analysis

- **Method**: POST
- **Endpoint**: Edge function
- **Request Headers**:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer {SUPABASE_ANON_KEY}`
- **Request Body**:

```json
{
  "query": "User's competitive analysis prompt",
  "targetClient": "Company name"
}
```

- **Returns**: Single analysis record with all fields populated

```json
{
  "id": 2,
  "created_at": "2024-01-15T11:00:00Z",
  "completed_at": "2024-01-15T11:02:00Z",
  "targets": "Company name",
  "prompts": "User's competitive analysis prompt",
  "competitors": ["Competitor1", "Competitor2"],
  "answer_text": "Generated analysis...",
  "is_visible": true,
  "rank_position": 1,
  "citations": ["https://source1.com", "https://source2.com"]
}
```

## Notes

- Dates are stored as ISO strings
- Rankings: null = not found, 1-3 = high visibility, 4+ = medium, null = mentioned but not ranked
- Citations are full URLs
- New analyses are added to the beginning of the history list
- The edge function processes the query and returns a complete analysis record
