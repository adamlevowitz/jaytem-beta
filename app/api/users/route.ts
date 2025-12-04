import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'lib', 'users.json');

function readUsers() {
  const data = fs.readFileSync(usersFilePath, 'utf-8');
  return JSON.parse(data);
}

function writeUsers(data: any) {
  fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const data = readUsers();
    // Return users without passwords
    const safeUsers = data.users.map((u: any) => ({
      email: u.email,
      organization: u.organization,
      role: u.role,
    }));
    return NextResponse.json({ users: safeUsers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email, password, organization, role } = await request.json();
    
    if (!email || !password || !organization) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const data = readUsers();
    
    // Check if user already exists
    if (data.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add new user
    data.users.push({
      email,
      password: hashedPassword,
      organization,
      role: role || 'user',
    });

    writeUsers(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { email, password, organization, role } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const data = readUsers();
    const userIndex = data.users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
    
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update fields
    if (organization) data.users[userIndex].organization = organization;
    if (role) data.users[userIndex].role = role;
    if (password) {
      data.users[userIndex].password = await bcrypt.hash(password, 10);
    }

    writeUsers(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const data = readUsers();
    const userIndex = data.users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
    
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    data.users.splice(userIndex, 1);
    writeUsers(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}