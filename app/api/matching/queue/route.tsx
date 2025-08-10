// app/api/chat/start/route.ts
import { NextRequest, NextResponse } from 'next/server';

// 요청 바디 타입 정의
interface QueueRequest {
  category: string;
}

// 응답 타입 정의
interface ChatStartResponse {
  success: boolean;
  roomId?: string;
  message?: string;
  queuePosition?: number;
  estimatedWaitTime?: number;
}

// POST 요청 핸들러 (Spring Boot의 @PostMapping과 동일)
export async function POST(request: NextRequest) {
  try {
    // 요청 바디 파싱
    const body: QueueRequest = await request.json();
    const { category} = body;

    // 입력 검증 (Spring Boot의 @Valid와 비슷)
    if (!category) {
      return NextResponse.json(
        { 
          success: false, 
          message: '카테고리를 선택해주세요.' 
        },
        { status: 400 }
      );
    }

    // 유효한 카테고리인지 확인
    const validCategories = ['sports', 'game', 'travel', 'music', 'hobby', 'love', 'free'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { 
          success: false, 
          message: '올바르지 않은 카테고리입니다.' 
        },
        { status: 400 }
      );
    }

    const clientIp = getClientIP(request);

    // Spring Boot 백엔드 호출 예시
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matching/queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Real-IP': clientIp,           // 클라이언트 IP 추가
        'X-Forwarded-For': clientIp,     // 추가 보험용
      },
      body: JSON.stringify({
        category
      })
    });

    if (!backendResponse.ok) {
      throw new Error('Backend API call failed');
    }

    const backendData = await backendResponse.json();


    return NextResponse.json(backendData, { status: 200 });

  } catch (error) {
    console.error('대기열 추가 오류:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
      },
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

// 유틸리티 함수들
function generateRoomId(category: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${category}_${timestamp}_${random}`;
}

function generateGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// 서버 토큰 가져오기 (실제 환경에서는 환경변수에서)
function getServerToken(): string {
  return process.env.SERVER_API_TOKEN || 'default-token';
}