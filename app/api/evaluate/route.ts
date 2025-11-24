import { NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function callOpenAI(messages: { role: string; content: string }[]) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  const data = await res.json();
  return data.choices[0].message.content;
}

export async function POST(request: Request) {
  try {
    const { type, clientStory, clientInfo, previousResponses } = await request.json();

    let systemPrompt = '';
    let userPrompt = '';

    const clientContext = `
Client Name: ${clientInfo.firstName} ${clientInfo.lastName}
Primary Language: ${clientInfo.primaryLanguage}
${clientInfo.secondaryLanguage ? `Secondary Language: ${clientInfo.secondaryLanguage}` : ''}

Client's Account:
${clientStory}
`;

    if (type === 'persona') {
      systemPrompt = `You are Jaytem, an expert legal analyst. Your task is to create a detailed persona analysis of the client based on their story. Focus on:
- Key personal characteristics relevant to their case
- Communication style and preferences
- Emotional state and concerns
- Credibility factors
- Any vulnerabilities or strengths as a potential witness

Be thorough but concise. Write in professional legal language.`;

      userPrompt = `Analyze this client and create a persona profile:\n${clientContext}`;
    }

    if (type === 'analysis') {
      systemPrompt = `You are Jaytem, an expert legal analyst. Your task is to provide a comprehensive legal analysis of the case. Consider:
- Applicable laws and regulations
- Key facts that support the case
- Potential weaknesses or challenges
- Relevant precedents
- Burden of proof considerations
- Damages assessment

Reference your previous persona analysis to inform your legal analysis. Be thorough and cite specific legal principles where applicable.`;

      userPrompt = `Based on this client information and your persona analysis, provide a legal case analysis.

${clientContext}

Previous Persona Analysis:
${previousResponses?.persona || ''}`;
    }

    if (type === 'strategy') {
      systemPrompt = `You are Jaytem, an expert legal strategist. Your task is to develop a comprehensive case strategy. Include:
- Recommended legal approach
- Key arguments to emphasize
- Evidence needed
- Potential settlement considerations
- Litigation timeline expectations
- Risk assessment
- Recommended next steps

Build upon your previous persona and case analysis. Be specific and actionable.`;

      userPrompt = `Based on all previous analysis, develop a case strategy.

${clientContext}

Previous Persona Analysis:
${previousResponses?.persona || ''}

Previous Case Analysis:
${previousResponses?.caseAnalysis || ''}`;
    }

    const result = await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json({ error: 'Failed to generate evaluation' }, { status: 500 });
  }
}