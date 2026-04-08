import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/plan-suggest
 *
 * AI backfill: for skills that have no hardcoded toolmap entry,
 * ask DeepSeek to recommend tools, training, and a capstone project.
 *
 * Request: { skills: string[], industry?: string }
 * Response: { suggestions: Record<string, SkillSuggestion> }
 */

const API_BASE_URL = 'https://api.deepseek.com/v1';
const API_MODEL = 'deepseek-chat';

const SYSTEM_PROMPT = `你是一位制造业职业发展顾问。用户需要学习以下技能来完成职业转型。

对每个技能，请推荐：
1. tools: 2-3个行业标准工具（名称 + 是否有免费版）
2. training: 1-2个培训资源（名称 + 平台 + 大致价格）
3. github: 1-2个GitHub学习项目（仓库名 + 简述 + 预计学时）
4. capstone: 1个实战项目（标题 + 难度 + 预计学时 + 交付物 + 对雇主证明什么）

返回JSON（不要Markdown代码块），格式：
{
  "技能名": {
    "tools": [{"name": "工具名", "free": true, "note": "社区版免费"}],
    "training": [{"name": "课程名", "platform": "平台", "price": "¥299", "url": ""}],
    "github": [{"repo": "owner/repo", "desc": "简述", "hours": 5}],
    "capstone": {"title": "项目名", "title_zh": "中文名", "difficulty": "intermediate", "hours": 20, "deliverables": ["GitHub repo", "技术报告"], "proves": "证明你能做什么"}
  }
}

技能以英文名为key。所有文本同时给中英双语（如果是工具名就不需要翻译）。`;

export async function POST(request: NextRequest) {
  try {
    const { skills, industry } = await request.json();

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ error: 'No skills provided' }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ suggestions: {}, mode: 'unavailable' }, { status: 503 });
    }

    // Limit to 8 skills per request to control cost
    const limitedSkills = skills.slice(0, 8);

    const userPrompt = `行业背景：${industry || '制造业'}
需要学习的技能：${limitedSkills.join(', ')}

请为每个技能推荐工具、培训、GitHub项目和实战项目。`;

    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: API_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`DeepSeek plan-suggest error ${response.status}: ${err}`);
      return NextResponse.json({ suggestions: {}, mode: 'unavailable' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ suggestions: {}, mode: 'unavailable' }, { status: 502 });
    }

    let jsonStr = content.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const suggestions = JSON.parse(jsonStr);
    return NextResponse.json({ suggestions, mode: 'ai' });
  } catch (e) {
    console.error('Plan-suggest API error:', e);
    return NextResponse.json({ suggestions: {}, mode: 'unavailable' }, { status: 500 });
  }
}
