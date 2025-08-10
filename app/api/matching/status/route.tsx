import { NextRequest, NextResponse } from 'next/server';

// GET /api/chat/status
export async function GET(request: NextRequest) {
  try {
    // 백엔드 Spring Boot API 호출
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matching/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });

    if (!backendResponse.ok) {
      throw new Error('백엔드 요청 실패');
    }

    const data = await backendResponse.json();
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('매칭 상태 확인 오류:', error);
    return NextResponse.json(
      { error: '매칭 상태 확인에 실패했습니다.' },
      { status: 500 }
    );
  }
}