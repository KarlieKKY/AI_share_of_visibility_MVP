// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
const apiKey = Deno.env.get("PERPLEXITY_API_KEY");
const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  // 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
console.info('server started');
//
//
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    // Create Supabase client
    const startTime = new Date();
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Use service role for backend operations
    );
    const { id, query, targetClient } = await req.json();
    const responseData = await PerplexitySearch(query);
    const perplexity_response_text = responseData.choices[0].message.content;
    const citations = responseData["citations"];
    const geneminiAnalysis = await GeminiAnalysis(query, perplexity_response_text, targetClient);
    const jsonGeneminiAnalysis = JSON.parse(geneminiAnalysis);
    const is_visible = jsonGeneminiAnalysis["is_visible"];
    const rank_position = jsonGeneminiAnalysis["rank_position"];
    const competitors = jsonGeneminiAnalysis["competitors"];
    const completedTime = new Date();
    // Prepare data for database insert
    let historyRecord = {
      targets: targetClient,
      prompts: query,
      answer_text: perplexity_response_text,
      citations: citations,
      is_visible: is_visible,
      rank_position: rank_position,
      competitors: competitors,
      created_at: startTime,
      completed_at: completedTime
    };
    let existingRecord = false;
    if (id) {
      const { data, error } = await supabaseClient.from('history').select('id').eq('id', id).single();
      existingRecord = !error && data !== null;
    }
    if (!existingRecord) {
      // Insert data into database
      const { data: insertedData, error: dbError } = await supabaseClient.from('history') // Replace with your table name
      .insert([
        historyRecord
      ]).select();
      if (dbError) {
        console.error('Database error:', dbError);
      } else {
        console.log('Successfully saved to database:', historyRecord);
      }
    } else {
      // Update the row with matching id
      const { data: insertedData, error: dbError } = await supabaseClient.from('history').update({
        targets: historyRecord.targets,
        prompts: historyRecord.prompts,
        answer_text: historyRecord.answer_text,
        citations: historyRecord.citations,
        is_visible: historyRecord.is_visible,
        rank_position: historyRecord.rank_position,
        competitors: historyRecord.competitors,
        completed_at: new Date().toISOString()
      }).eq('id', id).select().single();
      if (dbError) {
        console.error('Database error:', dbError);
      } else {
        console.log(`Successfully updated with id=${id}:`, historyRecord);
      }
    }
    // Insert data into database
    return new Response(JSON.stringify(historyRecord), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
});
//
//
const analysisSchema = {
  type: "object",
  properties: {
    is_visible: {
      type: "boolean",
      description: "Whether if the target client 'ACME' is mentioned in the response"
    },
    competitors: {
      type: "array",
      items: {
        type: "string"
      },
      description: "List of competitors extracted from the response."
    },
    rank_position: {
      type: "integer",
      description: "Rank position of the target client among competitors."
    }
  },
  required: [
    "is_visible",
    "competitors",
    "rank_position"
  ]
};
//
//
async function PerplexitySearch(query) {
  const chat_url = "https://api.perplexity.ai/chat/completions";
  const payload = {
    model: "sonar-pro",
    messages: [
      {
        role: "system",
        content: "Be precise and concise."
      },
      {
        role: "user",
        content: query
      }
    ]
  };
  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };
  const chat_response = await fetch(chat_url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload)
  });
  if (!chat_response.ok) {
    const errorData = await chat_response.text();
    throw new Error(`Perplexity API error: ${chat_response.status} - ${errorData}`);
  }
  const responseData = await chat_response.json();
  return responseData;
}
//
//
async function GeminiAnalysis(query, perplexityResponse, targetClient) {
  const gemini_prompt = `
You are an expert data extractor.

The following text delimited by triple askticks is a user query for Perplexity AI:

***
${query}
***

And the following text delimited by triple backticks is the response from Perplexity AI for the query above:

\`\`\`
${perplexityResponse}
\`\`\`

Your task is to determine if the target client '${targetClient}' is mentioned in the response from Perplexity AI, by following these steps:
Step 1. Check if the target client '${targetClient}' is mentioned in the response.
Step 2. Extract all the competitors in the response.
Step 3. If client '${targetClient}', determine the rank position of the target client '${targetClient}' among the competitors extracted, using the following rule:
    - If the target client '${targetClient}' is mentioned and a ranking is explicitly list in the response, such as "1. PayPal, 2. Stripe", return the ranking of the target client listed.
    - If the target client '${targetClient}' is mentioned but no explicit ranking is provided, return 0 for rank position.
    - If the target client '${targetClient}' is not mentioned, return Null for rank position.


Return your response as a single JSON object which strictly following the JSON schema given in this request
`.trim();
  const gemini_response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: gemini_prompt
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseJsonSchema: analysisSchema
      }
    })
  });
  if (!gemini_response.ok) {
    const errText = await gemini_response.text();
    console.error("Gemini error:", gemini_response.status, errText);
    return new Response(JSON.stringify({
      error: errText,
      upstreamStatus: gemini_response.status,
      upstreamBody: errText
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  const analysis_data = await gemini_response.json();
  const analysis_data_json = analysis_data["candidates"][0]["content"]["parts"][0]["text"];
  return analysis_data_json;
}
