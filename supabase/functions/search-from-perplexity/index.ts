// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const PERPLEXITY_API_KEY = Deno.env.get("Perplexity_API_Key")
// const GOOGLE_GEMINI_API_KEY = Deno.env.get("Gemini_API_Key")

console.log("Hello from Functions!")

// Deno.serve(async (req) => {
//   const { name } = await req.json()
//   const data = {
//     message: `Hello ${name}!`,
//   }

//   return new Response(
//     JSON.stringify(data),
//     { headers: { "Content-Type": "application/json" } },
//   )
// })

Deno.serve(async (req) => {
  const {  name } = await req.json()
  const chat_url = "https://api.perplexity.ai/chat/completions"
  const payload = {
      model: "sonar-pro",
      messages: [
        {
          role: "system",
          content: "Be precise and concise."
        },
        {
          role: "user",
          content: name
        }
      ]
    }
  const headers = {
    "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
    "Content-Type": "application/json"
  }
  const chat_response = await fetch(chat_url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload)
    })

  
  const responseData = await chat_response.json()
  const perplexity_response_text = responseData.choices[0].message.content
  console.log("Perplexity response:", perplexity_response_text)

  // const data = {
  //   message: `Hello ${name}!`,
  // }
  const data = {
    message: `Hello ${name}!`,
    // perplexity_response: perplexity_response_text
  }

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})


// Deno.serve(async (req) => {
//   const { query } = await req.json()
//   console.log("Request body:", body)
//   const chat_url = "https://api.perplexity.ai/chat/completions"
//   const payload = {
//       model: "sonar-pro",
//       messages: [
//         {
//           role: "system",
//           content: "Be precise and concise."
//         },
//         {
//           role: "user",
//           content: query
//         }
//       ]
//     }
//   const headers = {
//     "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
//     "Content-Type": "application/json"
//   }
//   const chat_response = await fetch(chat_url, {
//       method: "POST",
//       headers: headers,
//       body: JSON.stringify(payload)
//     })

//   const responseData = await chat_response.json()
//   const perplexity_response_text = responseData.choices[0].message.content
//   return new Response(
//       JSON.stringify({
//         success: true,
//         response: perplexity_response_text,
//         full_data: responseData
//       }),
//       { headers: { "Content-Type": "application/json" } }
//     )
// })

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/search-from-perplexity' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
