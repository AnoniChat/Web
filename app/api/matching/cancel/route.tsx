// app/api/matching/cancel/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface QueueRequest {
  category: string;
}

export async function DELETE(
  request: NextRequest,
) {
  try {
    const clientIp = getClientIP(request);
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    // 백엔드 Spring Boot API 호출
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/matching/cancel?category=${category}`, 
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Real-IP': clientIp,
          'X-Forwarded-For': clientIp,
        },
      }
    );

    if (!backendResponse.ok) {
      throw new Error('Backend API 호출 실패');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: '대기열 취소 실패' },
      { status: 500 }
    );
  }
}

function getClientIP(request: NextRequest): string {
  // 여러 헤더를 순차적으로 확인
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'x-client-ip',
    'x-cluster-client-ip'
  ];
  
  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      return value.split(',')[0].trim();
    }
  }
  
 
  return process.env.NODE_ENV === 'development' ? '127.0.0.1' : 'unknown';
}