import { NextResponse } from 'next/server';

const AZURE_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

async function callAzureOpenAI(content: string) {
  const url = `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=2024-08-01-preview`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'api-key': AZURE_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
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
Alpha Case Strategy:
${previousResponses.alpha02}
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
Beta Case Strategy:
${previousResponses.beta02}
Kaycee Case Analysis:
${previousResponses.kaycee01}`;
      
    }

    
    
    const result = await callAzureOpenAI(prompt);
    
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json({ error: 'Failed to generate evaluation' }, { status: 500 });
  }
}