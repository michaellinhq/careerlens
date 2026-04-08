import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/analyze
 *
 * Server-side resume analysis endpoint.
 * Calls Qwen API with the secret API key — never exposed to the browser.
 *
 * Request body: { resumeText: string }
 * Response: { profile: CareerProfile, mode: 'ai' } or { error: string }
 */

const QWEN_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const QWEN_MODEL = 'qwen-plus';

const SYSTEM_PROMPT = `你是一位资深制造业人力资源顾问，专注于高端制造业（汽车、航空、机器人、电子、能源、医疗器械、工业自动化、IT制造、咨询）的职业发展分析。

用户会给你一段简历文本。请分析并返回JSON（不要Markdown代码块，直接返回JSON）：

{
  "industry": "Automotive Electronics",
  "industry_zh": "汽车电子",
  "function_area": "Quality Management",
  "function_area_zh": "质量管理",
  "level": "senior",
  "level_zh": "高级工程师",
  "years_experience": 8,
  "core_competencies": ["IATF 16949", "FMEA", "SPC", "VDA 6.3"],
  "languages": [{"language": "Chinese", "level": "Native"}, {"language": "English", "level": "C1"}],
  "summary": "Experienced automotive quality professional...",
  "summary_zh": "资深汽车质量专家...",
  "cross_industry": [
    {"industry_id": "medical-devices", "reason": "Quality systems (ISO 13485) overlap significantly with automotive IATF", "reason_zh": "质量体系(ISO 13485)与汽车IATF高度重合"},
    {"industry_id": "aerospace", "reason": "AS9100 shares DNA with automotive quality standards", "reason_zh": "AS9100与汽车质量标准同源"}
  ]
}

level必须是: junior, senior, lead, manager, director 之一。
industry_id必须是: automotive, electronics, aerospace, consulting, energy, industrial-automation, medical-devices, it-manufacturing, robotics 之一。
core_competencies用英文技能名（与行业标准一致）。
summary用2-3句话概括此人的职业竞争力和发展潜力。`;

export async function POST(request: NextRequest) {
  try {
    const { resumeText } = await request.json();

    if (!resumeText || typeof resumeText !== 'string' || resumeText.length < 20) {
      return NextResponse.json(
        { error: 'Resume text too short (min 20 chars)' },
        { status: 400 },
      );
    }

    // Cap input to prevent abuse
    const text = resumeText.slice(0, 8000);

    const apiKey = process.env.QWEN_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI not configured', mode: 'unavailable' },
        { status: 503 },
      );
    }

    const response = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: QWEN_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`Qwen API error ${response.status}: ${err}`);
      return NextResponse.json(
        { error: 'AI service error', mode: 'unavailable' },
        { status: 502 },
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'Empty AI response', mode: 'unavailable' },
        { status: 502 },
      );
    }

    // Parse JSON from response (handle possible markdown wrapping)
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const profile = JSON.parse(jsonStr);

    return NextResponse.json({ profile, mode: 'ai' });
  } catch (e) {
    console.error('Analyze API error:', e);
    return NextResponse.json(
      { error: 'Analysis failed', mode: 'unavailable' },
      { status: 500 },
    );
  }
}
