import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const resource = url.pathname.split('/')[2]; // Extract the resource name from the path (e.g., /api/[resources]/[id])
    const allowedResources = ['events', 'resources', 'assignments'];

    // Check if the resource is allowed
    if (!allowedResources.includes(resource)) {
        return NextResponse.json({ error : 'Invalid resource type' }, { status : 400 });
    }

    // Continue the request if the resource is valid
    return NextResponse.next();
}

// Configuration to apply middleware to API routes matching the pattern
export const config = {
    matcher : '/api/:path*' // Apply middleware to all API routes
};