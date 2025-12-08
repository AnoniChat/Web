'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import MatchingQueue from './components/MatchingQueue';
import ChatRoom from './components/Chatroom';
import { isMobileDevice} from '@/utils/device';

// 🔒 보안: 중앙화된 카테고리 관리
import { 
  CATEGORIES, 
  Category, 
  isValidCategory, 
  validateCategory 
} from '@/utils/categories';

// 🔒 보안: 검증이 포함된 API 함수
import { 
  registerMatchingQueue, 
  cancelMatching 
} from '@/utils/api-secure';

type Screen = 'main' | 'matching' | 'chat';

interface AppState {
  currentScreen: Screen;
  selectedCategory: Category | null;
  roomId: string | null;
  queueSize: number;
}

interface WebSocketMessage {
  type: 'MATCHING_SUCCESS' | 'HEARTBEAT' | 'CONNECTED' | 'ERROR';
  roomId?: string;
  content?: string;
  message?: string;
}

export default function HomePage() {
  const wsRef = useRef<WebSocket | null>(null);
  const isManualDisconnectRef = useRef(false);
  const isCleaningUpRef = useRef(false); // 중복 요청 방지
  const hasHistoryEntryRef = useRef(false); 

  const [activeCategory, setActiveCategory] = useState<Category>(CATEGORIES[0]);
  const [appState, setAppState] = useState<AppState>({
    currentScreen: 'main',
    selectedCategory: null,
    roomId: null,
    queueSize: 0
  });

  // 🔒 보안: 카테고리 변경 시 검증
  const handleCategoryClick = (category: Category) => {
    try {
      validateCategory(category);
      setActiveCategory(category);
    } catch (error) {
      console.error('[Security] Invalid category selection:', error);
      setActiveCategory(CATEGORIES[0]);
    }
  };

  // WebSocket 연결 (Promise 반환)
  const connectWebSocket = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.log('[WebSocket] 이미 연결됨');
        resolve();
        return;
      }

      try {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 
          `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/chat`;
        
        console.log('[WebSocket] 연결 시도:', wsUrl);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        let isResolved = false;

        ws.onopen = () => {
          
          setTimeout(() => {
            if (!isResolved) {
              isResolved = true;
              resolve();
            }
          }, 500);
        };

        ws.onmessage = (event) => {
          try {
            const data: WebSocketMessage = JSON.parse(event.data);

            switch (data.type) {
              case 'CONNECTED':
                if (!isResolved) {
                  isResolved = true;
                  resolve();
                }
                break;

              case 'MATCHING_SUCCESS':
                handleMatchFound(data.roomId);
                break;

              case 'HEARTBEAT':
                break;

              case 'ERROR':
                console.error('[WebSocket] 서버 에러:', data.message);
                break;

              default:
            }
          } catch (error) {
            console.error('[WebSocket] 메시지 파싱 오류:', error);
            console.error('[WebSocket] 원본 데이터:', event.data);
          }
        };

        ws.onerror = (error) => {
          console.error('[WebSocket] 연결 에러:', error);
          if (!isResolved) {
            reject(error);
          }
        };

        ws.onclose = (event) => {
          console.log('[WebSocket] 연결 종료 :', event);
          wsRef.current = null;
        };

        // 타임아웃 설정 (10초)
        setTimeout(() => {
          if (!isResolved) {
            console.error('[WebSocket] 연결 타임아웃');
            reject(new Error('WebSocket 연결 타임아웃'));
          }
        }, 10000);

      } catch (error) {
        console.error('[WebSocket] 연결 실패:', error);
        reject(error);
      }
    });
  };

  const disconnectWebSocket = () => {
    isManualDisconnectRef.current = true;
    
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, 'User initiated');
      }
      wsRef.current = null;
    }
  };

  // 매칭 취소 API 호출 (fetch + keepalive 사용)
  const cancelMatchingKeepalive = useCallback((category: Category) => {
    // 중복 호출 방지
    if (isCleaningUpRef.current) {
      return;
    }
    isCleaningUpRef.current = true;

    if (!isValidCategory(category)) {
      return;
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/matching/cancel?category=${category.id}`;
    
    // fetch + keepalive: true 사용
    fetch(apiUrl, {
      method: 'DELETE',
      credentials: 'include',
      keepalive: true, // 핵심: 페이지가 닫혀도 요청 완료 보장
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .catch((err) => {
        console.error('[Keepalive] 매칭 취소 요청 전송 실패:', err);
      });
  }, []);

  // 보안: 매칭 취소 시 안전한 API 호출
  const handleBackToMain = useCallback(async () => {
    disconnectWebSocket();

    try {
      if (activeCategory && isValidCategory(activeCategory) && !isCleaningUpRef.current) {
        await cancelMatching(activeCategory.id);
      }
      
    } catch (error) {
      console.error('[Matching] 매칭 취소 중 오류:', error);
    } finally {
      isCleaningUpRef.current = false;
            hasHistoryEntryRef.current = false;
      setAppState({
        currentScreen: 'main',
        selectedCategory: null,
        roomId: null,
        queueSize: 0
      });
    }
  }, [activeCategory]); // activeCategory 의존성 추가

  // 브라우저 종료/새로고침/탭 닫기 감지
  useEffect(() => {
    const isMobile = isMobileDevice();

    const handleBeforeUnload = (_e: BeforeUnloadEvent) => {
      // 매칭 중이거나 채팅 중일 때만 실행
      if (appState.currentScreen === 'matching' || appState.currentScreen === 'chat') {
        
        if (activeCategory && isValidCategory(activeCategory)) {
          cancelMatchingKeepalive(activeCategory);
        }
        
        disconnectWebSocket();
        
        _e.preventDefault();
        _e.returnValue = '매칭이 진행 중입니다. 페이지를 나가시겠습니까?';
      }
    };

    // pagehide 이벤트 (모바일 대응 - iOS Safari)
    const handlePageHide = () => {
      if (appState.currentScreen === 'matching' || appState.currentScreen === 'chat') {
        
        if (activeCategory && isValidCategory(activeCategory)) {
          cancelMatchingKeepalive(activeCategory);
        }
        
        disconnectWebSocket();
      }
    };

    // visibilitychange 이벤트 (백그라운드 전환 - 추가 안전장치)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (appState.currentScreen === 'matching' || appState.currentScreen === 'chat') {
          
          if (activeCategory && isValidCategory(activeCategory)) {
            cancelMatchingKeepalive(activeCategory);
          }
        }
      } else {
        // 다시 보일 때 cleanup flag 리셋
        isCleaningUpRef.current = false;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    if(isMobile){
      window.addEventListener('pagehide', handlePageHide);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if(isMobile){
        window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [appState.currentScreen, activeCategory, cancelMatchingKeepalive]);

  useEffect(() => {
    const handlePopState = async (event: PopStateEvent) => {
      
      // 매칭 중이거나 채팅 중일 때
      if (appState.currentScreen === 'matching' || appState.currentScreen === 'chat') {
        if (event.state?.screen === 'app-navigation') {
          await handleBackToMain();
        } else {
          window.history.pushState(
            { screen: 'app-navigation' }, 
            '', 
            window.location.pathname
          );
          await handleBackToMain();
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [appState.currentScreen, handleBackToMain]);

  // 보안: 채팅 시작 시 카테고리 검증 및 안전한 API 호출
  const handleStartChat = async () => {
    try {
      
      if (!isValidCategory(activeCategory)) {
        throw new Error('유효하지 않은 카테고리입니다.');
      }

      // cleanup flag 리셋
      isCleaningUpRef.current = false;

      if (!hasHistoryEntryRef.current) {
        window.history.pushState(
          { screen: 'app-navigation' }, 
          '', 
          window.location.pathname
        );
        hasHistoryEntryRef.current = true;
      }

      setAppState({
        currentScreen: 'matching',
        selectedCategory: activeCategory,
        roomId: null,
        queueSize: 0
      });
      const response = await registerMatchingQueue(activeCategory.id);

      await connectWebSocket();

      setAppState(prev => ({
        ...prev,
        queueSize: response.queueSize || 0
      }));

    } catch (error) {;
      console.error('[Matching] 매칭 오류:', error);
      disconnectWebSocket();
      alert(
        error instanceof Error 
          ? error.message 
          : '매칭 등록에 실패했습니다. 다시 시도해주세요.'
      );
      
      handleBackToMain();
    }
  };

  const handleMatchFound = (roomId?: string) => {
    // cleanup flag 리셋 (새로운 채팅 세션)
    isCleaningUpRef.current = false;
    
    const finalRoomId = roomId || `room_${Date.now()}`;
    
    setAppState(prev => ({
      ...prev,
      currentScreen: 'chat',
      roomId: finalRoomId
    }));
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        disconnectWebSocket();
      }
    };
  }, []);

  // 매칭 화면
  if (appState.currentScreen === 'matching') {
    return (
      <MatchingQueue
        onCancel={handleBackToMain}
        onMatchFound={handleMatchFound}
        queueSize={appState.queueSize}
      />
    );
  }

  // 채팅 화면
  if (appState.currentScreen === 'chat' && appState.roomId && appState.selectedCategory) {
    return (
      <ChatRoom
        roomId={appState.roomId}
        category={appState.selectedCategory}
        onExit={handleBackToMain}
        websocket={wsRef.current}
      />
    );
  }

  // 메인 화면
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600">
      <Header />
      <div className="flex flex-row h-screen pt-20">
        <Sidebar 
          categories={CATEGORIES}
          activeCategory={activeCategory}
          onCategoryClick={handleCategoryClick}
        />
        <MainContent 
          activeCategory={activeCategory}
          onStartChat={handleStartChat}
        />
      </div>
    </div>
  );
}