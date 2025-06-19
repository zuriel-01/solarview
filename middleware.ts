import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next();
    // No need to get session since we are not protecting any routes
    // const supabase = createMiddlewareClient({ req: request, res });
    // const { data: { session } } = await supabase.auth.getSession();
    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // If there's an error, just continue with the request
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/auth/:path*'],
};