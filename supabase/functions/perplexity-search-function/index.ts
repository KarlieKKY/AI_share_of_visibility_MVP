// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const chat_url = "https://api.perplexity.ai/chat/completions";
const apiKey = Deno.env.get("PERPLEXITY_API_KEY");
const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  // 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
console.info('server started');
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { query, targeClient } = await req.json();
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
    const responseData = await chat_response.json();
    const perplexity_response_text = responseData.choices[0].message.content;
    const data = {
      perplexity_response: perplexity_response_text
    };
    const geneminiAnalysis = await GeminiAnalysis(query, perplexity_response_text, targeClient);
    // const gemini_response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json"
    //   },
    //   body: JSON.stringify({
    //     contents: [
    //       {
    //         role: "user",
    //         parts: [
    //           {
    //             text: "Hello from Edge"
    //           }
    //         ]
    //       }
    //     ],
    //     generationConfig: {
    //       responseMimeType: "application/json",
    //       responseJsonSchema: analysisSchema
    //     }
    //   })
    // });
    // if (!gemini_response.ok) {
    //   const errText = await gemini_response.text();
    //   console.error("Gemini error:", gemini_response.status, errText);
    //   return new Response(JSON.stringify({
    //     error: errText,
    //     upstreamStatus: gemini_response.status,
    //     upstreamBody: errText
    //   }), {
    //     status: 500,
    //     headers: {
    //       ...corsHeaders,
    //       "Content-Type": "application/json"
    //     }
    //   });
    // }
    // const analysis_data = await gemini_response.json();
    // const analysis_data_json = analysis_data["candidates"][0]["content"]["parts"][0]["text"];
    // console.log(analysis_data_json);
    return new Response(JSON.stringify(geneminiAnalysis), {
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
const analysisSchema = {
  type: "object",
  properties: {
    is_visisble: {
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
    "is_visisble",
    "competitors",
    "rank_position"
  ]
};
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
    - If the target client '${targetClient}' is not mentioned, return None for rank position.


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
