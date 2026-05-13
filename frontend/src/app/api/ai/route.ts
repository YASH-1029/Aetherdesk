import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    console.log('Sending to backend:', body);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: JSON.stringify(body),
    });

    console.log('Backend response status:', response.status);
    console.log('Backend response headers:', Object.fromEntries(response.headers));

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error details:', errorData);
      return Response.json(
        { error: `Backend error: ${response.status} - ${errorData}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);

  } catch (error) {
    console.error('Proxy error details:', error);
    return Response.json(
      { error: 'Failed to connect to AI service' },
      { status: 500 }
    );
  }
}