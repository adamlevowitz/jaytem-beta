import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Simple auth - we'll improve this later
  // For now, any valid email format + password "jaytem2025" works
  const validPassword = 'jaytem2025';

  if (email && password === validPassword) {
    const response = NextResponse.json({ success: true });
    
    // Set a simple session cookie
    response.cookies.set('jt_session', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return response;
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
