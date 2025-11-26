// ============================================
// 1. page.tsx - WebSocket을 Chatroom에 전달
// ============================================
'use client';
import api from '@/utils/api';
import { useRef, useEffect } from 'react';
import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import MatchingQueue from './components/MatchingQueue';
import ChatRoom from './components/Chatroom';

type Screen = 'main' | 'matching' | 'chat';

interface Category {
  id: string;
  name: string;
  icon: string;
  displayName: string;
}

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

const categories: Category[] = [
  { id: 'sports', name: '스포츠', icon: '🏈', displayName: '스포츠' },
  { id: 'game', name: '게임', icon: '🎮', displayName: '게임' },
  { id: 'travel', name: '여행', icon: '✈️', displayName: '여행' },
  { id: 'music', name: '음악/영화', icon: '🎵', displayName: '음악/영화' },
  { id: 'hobby', name: '일상/취미', icon: '🎨', displayName: '일상/취미' },
  { id: 'love', name: '연애/썸', icon: '💕', displayName: '연애/썸' },
  { id: 'free', name: '자유주제', icon: '💬', displayName: '자유주제' },
];

export default function HomePage() {
  const wsRef = useRef<WebSocket | null>(null);
  const isManualDisconnectRef = useRef(false);
  
  const [activeCategory, setActiveCategory] = useState<Category>(categories[0]);
  const [appState, setAppState] = useState<AppState>({
    currentScreen: 'main',
    selectedCategory: null,
    roomId: null,
    queueSize: 0
  });

  const handleCategoryClick = (category: Category) => {
    setActiveCategory(category);
  };

  // WebSocket 연결 (한 번만 생성)
  const connectWebSocket = () => {
    // 이미 연결되어 있으면 재사용
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('기존 WebSocket 재사용');
      return;
    }

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 
      `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/chat`;
      
      console.log('WebSocket 연결 시도:', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket 연결됨');
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log('메시지 수신 (page.tsx):', data);

          switch (data.type) {
            case 'CONNECTED':
              console.log('WebSocket 연결 확인:', data.message);
              break;

            case 'MATCHING_SUCCESS':
              // ⭐ 매칭 완료 알림 - WebSocket은 유지하고 화면만 전환
              console.log('매칭 완료! 방 ID:', data.roomId);
              handleMatchFound(data.roomId);
              break;

            case 'HEARTBEAT':
              // Heartbeat 응답
              break;

            case 'ERROR':
              console.error('WebSocket 에러:', data.content);
              break;

            default:
              console.log('알 수 없는 메시지 타입:', data);
          }
        } catch (error) {
          console.error('메시지 파싱 오류:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket 에러:', error);
      };

      ws.onclose = (event) => {
        console.log('WebSocket 연결 종료:', event.code);
        wsRef.current = null;
      };

    } catch (error) {
      console.error('WebSocket 연결 실패:', error);
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

  const handleStartChat = async () => {
    try {
      setAppState({
        currentScreen: 'matching',
        selectedCategory: activeCategory,
        roomId: null,
        queueSize: 0
      });

      // 대기열 등록
      const response = await api.post('/matching/queue', {
        category: activeCategory.id,
      });

      // WebSocket 연결 (없으면 생성, 있으면 재사용)
      connectWebSocket();

      setAppState(prev => ({
        ...prev,
        queueSize: response.data.queueSize || 0
      }));

      console.log('대기열 등록 완료:', response.data);

    } catch (error) {
      console.error('대기열 등록 오류:', error);
      disconnectWebSocket();
      handleBackToMain();
    }
  };

  const handleMatchFound = (roomId?: string) => {
    console.log('매칭 완료 처리! 방 ID:', roomId);
    
    // ⭐ WebSocket 유지 (종료하지 않음!)
    
    setAppState(prev => ({
      ...prev,
      currentScreen: 'chat',
      roomId: roomId || `room_${Date.now()}`
    }));
  };

  const handleBackToMain = async () => {
    // ⭐ WebSocket 종료
    disconnectWebSocket();

    try {
      const response = await api.delete('/matching/cancel', {
        params: {
          category: activeCategory.id
        }
      });
      console.log('매칭 취소 성공:', response.data);
      
    } catch (error) {
      console.error('매칭 취소 중 오류 발생:', error);

    } finally {
      setAppState({
        currentScreen: 'main',
        selectedCategory: null,
        roomId: null,
        queueSize: 0
      });
    }
  };

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

  // 채팅 화면 - WebSocket을 props로 전달
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
          categories={categories}
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