import axios, { AxiosInstance, AxiosError } from 'axios';
import { isValidCategoryId, CategoryId } from './categories';

/**
 * API 응답 타입
 */
interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

/**
 * 매칭 큐 응답 타입
 */
interface MatchingQueueResponse {
  queueSize: number;
  status: string;
  message?: string;
}

/**
 * 에러 응답 타입
 */
interface ApiErrorResponse {
  error: string;
  message: string;
  details?: Record<string, string>;
}

/**
 * Axios 인스턴스 생성
 */
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 10000, // 10초 타임아웃
  });

  // 요청 인터셉터 (보안 로깅)
  instance.interceptors.request.use(
    (config) => {
      // 개발 환경에서만 로그 출력
      if (process.env.NODE_ENV === 'development') {
        console.log('[API Request]', config.method?.toUpperCase(), config.url);
      }
      return config;
    },
    (error) => {
      console.error('[API Request Error]', error);
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터 (에러 처리)
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorResponse>) => {
      // 에러 로깅
      if (error.response) {
        console.error('[API Error]', {
          status: error.response.status,
          error: error.response.data?.error,
          message: error.response.data?.message
        });
      } else if (error.request) {
        console.error('[Network Error]', error.message);
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

const api = createApiInstance();

/**
 * 🔒 보안 강화: 매칭 큐 등록
 * @param categoryId - 카테고리 ID (검증됨)
 * @returns 매칭 큐 응답
 * @throws Error - 유효하지 않은 카테고리인 경우
 */
export async function registerMatchingQueue(
  categoryId: string
): Promise<MatchingQueueResponse> {
  // 1단계: 카테고리 ID 검증
  if (!isValidCategoryId(categoryId)) {
    const error = new Error(
      `[Security] Invalid category ID: ${categoryId}. This attempt has been logged.`
    );
    console.error('[Security Alert]', {
      action: 'registerMatchingQueue',
      invalidCategory: categoryId,
      timestamp: new Date().toISOString()
    });
    throw error;
  }

  // 2단계: 검증된 값만 전송
  try {
    const response = await api.post<MatchingQueueResponse>('/matching/queue', {
      category: categoryId
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ApiErrorResponse;
      throw new Error(errorData.message || '매칭 등록에 실패했습니다.');
    }
    throw new Error('네트워크 오류가 발생했습니다.');
  }
}

/**
 * 🔒 보안 강화: 매칭 취소
 * @param categoryId - 카테고리 ID (검증됨)
 */
export async function cancelMatching(categoryId: string): Promise<void> {
  // 카테고리 ID 검증
  if (!isValidCategoryId(categoryId)) {
    console.error('[Security Alert] Invalid category in cancelMatching:', categoryId);
    throw new Error('Invalid category ID');
  }

  try {
    await api.delete('/matching/cancel', {
      params: { category: categoryId }
    });
  } catch (error) {
    console.error('[API Error] Cancel matching failed:', error);
    throw error;
  }
}

/**
 * 🔒 보안 강화: 매칭 상태 확인
 * @param categoryId - 카테고리 ID (검증됨)
 */
export async function getMatchingStatus(categoryId: string): Promise<any> {
  // 카테고리 ID 검증
  if (!isValidCategoryId(categoryId)) {
    console.error('[Security Alert] Invalid category in getMatchingStatus:', categoryId);
    throw new Error('Invalid category ID');
  }

  try {
    const response = await api.get('/matching/status', {
      params: { category: categoryId }
    });
    return response.data;
  } catch (error) {
    console.error('[API Error] Get matching status failed:', error);
    throw error;
  }
}

// 기본 API 인스턴스도 export (기존 코드 호환성)
export default api;