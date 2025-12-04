// hooks/useMatchingQueue.ts
// 🔒 매칭 큐 관리를 위한 커스텀 훅

import { useState, useCallback } from 'react';
import { registerMatchingQueue, cancelMatching } from '@/utils/api-secure';
import { CategoryId } from '@/utils/categories';

interface MatchingState {
  isMatching: boolean;
  queueSize: number;
  error: string | null;
}

/**
 * 보안이 강화된 매칭 큐 관리 훅
 */
export function useMatchingQueue() {
  const [state, setState] = useState<MatchingState>({
    isMatching: false,
    queueSize: 0,
    error: null
  });

  /**
   * 🔒 매칭 대기열 등록 (검증 포함)
   */
  const startMatching = useCallback(async (categoryId: CategoryId) => {
    try {
      setState(prev => ({ ...prev, isMatching: true, error: null }));
      
      // API 호출 (내부적으로 검증 수행)
      const response = await registerMatchingQueue(categoryId);
      
      setState(prev => ({
        ...prev,
        queueSize: response.queueSize || 0
      }));
      
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Matching failed';
      
      setState(prev => ({
        ...prev,
        isMatching: false,
        error: errorMsg
      }));
      
      console.error('[Matching Error]', error);
      return false;
    }
  }, []);

  /**
   * 🔒 매칭 취소 (검증 포함)
   */
  const stopMatching = useCallback(async (categoryId: CategoryId) => {
    try {
      await cancelMatching(categoryId);
      
      setState({
        isMatching: false,
        queueSize: 0,
        error: null
      });
      
      return true;
    } catch (error) {
      console.error('[Cancel Matching Error]', error);
      
      // 에러가 발생해도 상태는 초기화
      setState({
        isMatching: false,
        queueSize: 0,
        error: null
      });
      
      return false;
    }
  }, []);

  /**
   * 상태 초기화
   */
  const resetState = useCallback(() => {
    setState({
      isMatching: false,
      queueSize: 0,
      error: null
    });
  }, []);

  return {
    ...state,
    startMatching,
    stopMatching,
    resetState
  };
}