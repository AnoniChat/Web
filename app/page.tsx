'use client';

import { useRef, useEffect, useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import MatchingQueue from './components/MatchingQueue';
import ChatRoom from './components/Chatroom';

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

  // WebSocket 연결
  const connectWebSocket = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 
        `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/chat`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] 연결됨');
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);

          switch (data.type) {
            case 'CONNECTED':
              console.log('[WebSocket] 서버 연결 확인');
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
              console.log('[WebSocket] 알 수 없는 메시지:', data);
          }
        } catch (error) {
          console.error('[WebSocket] 메시지 파싱 오류:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] 에러:', error);
      };

      ws.onclose = (event) => {
        console.log('[WebSocket] 연결 종료:', event.code);
        wsRef.current = null;
      };

    } catch (error) {
      console.error('[WebSocket] 연결 실패:', error);
    }
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

  // 🔒 보안: 채팅 시작 시 카테고리 검증 및 안전한 API 호출
  const handleStartChat = async () => {
    try {
      // 1단계: 카테고리 유효성 재검증
      if (!isValidCategory(activeCategory)) {
        throw new Error('유효하지 않은 카테고리입니다.');
      }

      // 2단계: UI 상태 변경 (매칭 화면으로 전환)
      setAppState({
        currentScreen: 'matching',
        selectedCategory: activeCategory,
        roomId: null,
        queueSize: 0
      });

      // 3단계: 보안이 강화된 API 함수 사용 (검증 내장)
      const response = await registerMatchingQueue(activeCategory.id);

      // 4단계: WebSocket 연결
      connectWebSocket();

      // 5단계: 대기열 크기 업데이트
      setAppState(prev => ({
        ...prev,
        queueSize: response.queueSize || 0
      }));

      console.log('[Matching] 대기열 등록 성공:', response);

    } catch (error) {
      console.error('[Matching] 대기열 등록 오류:', error);
      
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
    console.log('[Matching] 매칭 성공! RoomID:', roomId);
    
    setAppState(prev => ({
      ...prev,
      currentScreen: 'chat',
      roomId: roomId || `room_${Date.now()}`
    }));
  };

  // 🔒 보안: 매칭 취소 시 안전한 API 호출
  const handleBackToMain = async () => {
    disconnectWebSocket();

    try {
      if (activeCategory && isValidCategory(activeCategory)) {
        await cancelMatching(activeCategory.id);
        console.log('[Matching] 매칭 취소 성공');
      }
      
    } catch (error) {
      console.error('[Matching] 매칭 취소 중 오류:', error);
    } finally {
      setAppState({
        currentScreen: 'main',
        selectedCategory: null,
        roomId: null,
        queueSize: 0
      });
    }
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