import { NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function callOpenAI(content: string) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content }],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  const data = await res.json();
  return data.choices[0].message.content;
}

export async function POST(request: Request) {
  try {
    const { step, clientStory, clientInfo, previousResponses, prompts } = await request.json();

    const clientContext = `
CLIENT NAME: ${clientInfo.lastName}, ${clientInfo.firstName}
EMAIL: ${clientInfo.email}
PHONE: ${clientInfo.phone}
PRIMARY LANGUAGE: ${clientInfo.primaryLanguage}
SECONDARY LANGUAGE: ${clientInfo.secondaryLanguage || 'N/A'}

CLIENT STORY:
${clientStory}`;

    let prompt = '';

    // Alpha 01: Initial plaintiff case evaluation
    if (step === 'alpha01') {
      prompt = `${prompts.alphaPersona}

${prompts.alpha01}

${clientContext}`;
    }

    // Alpha 02: Draft complaint based on Alpha 01
    if (step === 'alpha02') {
      prompt = `${prompts.alphaPersona}

${prompts.alpha02}

Client Story:
${clientStory}

Alpha Case Analysis:
${previousResponses.alpha01}`;
    }

    // Beta 01: Defense analysis of plaintiff's case
    if (step === 'beta01') {
      prompt = `${prompts.betaPersona}

${prompts.beta01}

${clientContext}

Alpha Case Analysis:
${previousResponses.alpha01}

Alpha Case Strategy:
${previousResponses.alpha02}`;
    }

    // Beta 02: Defense strategy document
    if (step === 'beta02') {
      prompt = `${prompts.betaPersona}

${prompts.beta02}

Client Story:
${clientStory}

Beta Case Analysis:
${previousResponses.beta01}`;
    }

    // Kaycee 01: Strengthened plaintiff strategy
    if (step === 'kaycee01') {
      prompt = `${prompts.kayceePersona}

${prompts.kaycee01}

${clientContext}

Beta Case Analysis:
${previousResponses.beta01}

Beta Case Strategy:
${previousResponses.beta02}`;
    }

    // Kaycee 02: Final enhanced complaint
    if (step === 'kaycee02') {
      prompt = `${prompts.kayceePersona}

${prompts.kaycee02}

Client Story:
${clientStory}

Kaycee Case Analysis:
${previousResponses.kaycee01}`;
    }

    const result = await callOpenAI(prompt);
    return NextResponse.json({ result });

  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json({ error: 'Failed to generate evaluation' }, { status: 500 });
  }
}