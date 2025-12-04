import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import users from '@/lib/users.json';

export async function POST(request: Request) {
  const { email, password } = await request.json();
  
  const user = users.users.find(
    (u: any) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (user && await bcrypt.compare(password, user.password)) {
    const response = NextResponse.json({ 
      success: true,
      user: {
        email: user.email,
        organization: user.organization,
        role: user.role,
      }
    });
    
    response.cookies.set('jt_session', JSON.stringify({
      email: user.email,
      organization: user.organization,
      role: user.role,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
    });
    
    return response;
  }
  
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}