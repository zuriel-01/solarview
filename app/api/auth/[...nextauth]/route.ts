import { NextResponse } from 'next/server';

const unavailable = () =>
	NextResponse.json(
		{ error: 'This application uses Supabase Auth.' },
		{ status: 404 }
	);

export function GET() {
	return unavailable();
}

export function POST() {
	return unavailable();
}