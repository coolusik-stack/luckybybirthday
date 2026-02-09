interface Env {
  OPENAI_API_KEY: string;
}

interface RequestBody {
  year: string;
  month: string;
  day: string;
  hour?: string;
  minute?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (context.request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = context.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "OPENAI_API_KEY가 설정되지 않았습니다." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  let body: RequestBody;
  try {
    body = await context.request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "잘못된 요청입니다." }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const { year, month, day, hour, minute } = body;

  if (!year || !month || !day) {
    return new Response(
      JSON.stringify({ error: "생년월일은 필수입니다." }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const birthInfo = `나는 ${year}년 ${month}월 ${day}일${hour ? ` ${hour}시` : ""}${minute ? ` ${minute}분` : ""} 생이다`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: {
          id: "pmpt_69897a6089148193ba48b5d85cb9badb0ab3da406226d921",
          version: "1",
        },
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: birthInfo,
              },
            ],
          },
        ],
        reasoning: {},
        store: true,
        include: [
          "reasoning.encrypted_content",
          "web_search_call.action.sources",
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      return new Response(
        JSON.stringify({ error: "AI 서비스에 문제가 발생했습니다. 잠시 후 다시 시도해주세요." }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const data: any = await response.json();

    // Extract text from Responses API output format
    let text = "";
    if (data.output) {
      for (const item of data.output) {
        if (item.type === "message" && item.content) {
          for (const content of item.content) {
            if (content.type === "output_text") {
              text += content.text;
            }
          }
        }
      }
    }

    if (!text) {
      return new Response(
        JSON.stringify({ error: "AI 응답을 받지 못했습니다." }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(JSON.stringify({ content: text }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("Fortune API error:", err);
    return new Response(
      JSON.stringify({ error: "서버 오류가 발생했습니다." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};
