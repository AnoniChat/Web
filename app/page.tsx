// app/page.tsx
'use client';

import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import MatchingQueue from './components/MatchingQueue';

type Screen = 'main' | 'matching' | 'chat';

// 카테고리 타입 정의
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

// 카테고리 데이터
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
  // 활성 카테고리 상태 관리
  const [activeCategory, setActiveCategory] = useState<Category>(categories[0]);
  const [appState, setAppState] = useState<AppState>({
    currentScreen: 'main',
    selectedCategory: null,
    roomId: null,
    queueSize: 0
  });

  // 카테고리 클릭 핸들러
  const handleCategoryClick = (category: Category) => {
    setActiveCategory(category);
  };

  // 채팅 시작 핸들러
const handleStartChat = async () => {
  try {
    setAppState({
      currentScreen: 'matching',
      selectedCategory: activeCategory,
      roomId: null,
      queueSize:0
    });

    // 대기열 등록
    const response = await fetch('/api/matching/queue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: activeCategory.id,
      }),
    });
  

    if (!response.ok) {
      throw new Error('대기열 등록 실패');
    }

    const data = await response.json();

        setAppState(prev => ({
      ...prev,
      queueSize: data.queueSize || 0
    }));
    
    // 2단계: 매칭 상태 모니터링 시작
    startMatchingMonitoring();

  } catch (error) {
    console.error('대기열 등록 오류:', error);
    handleBackToMain();
  }
};

const startMatchingMonitoring = () => {
  const checkMatching = async () => {
    try {
      const response = await fetch('/api/matching/status?category=${activeCategory.id}', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.status === 'MATCHED') {
          handleMatchFound(data.roomId);
        } else if (data.status === 'WAITING') {
          setAppState(prev => ({
            ...prev,
            queueSize: data.queueSize || 0
          }));
          
          console.log('현재 대기 인원:', data.queueSize);
          setTimeout(checkMatching, 3000);
        }
      }
    } catch (error) {
      console.error('매칭 상태 확인 오류:', error);
      setTimeout(checkMatching, 5000);
    }
  };

  checkMatching();
};

  const handleMatchFound = (roomId?: string) => {
    console.log('매칭 완료! 방 ID:', roomId);
    
    setAppState(prev => ({
      ...prev,
      currentScreen: 'chat',
      roomId: roomId || `room_${Date.now()}`
    }));
  };

const handleBackToMain = async () => {
  try {
    const response = await fetch(`/api/matching/cancel?category=${activeCategory.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('대기열 취소 실패');
    }

    setAppState({
      currentScreen: 'main',
      selectedCategory: null,
      roomId: null,
      queueSize: 0
    });
    
  } catch (error) {
    console.error('매칭 취소 중 오류 발생:', error);
  }
};

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600">
      {/* 헤더 컴포넌트 */}
      <Header />

      <div className="flex min-h-screen pt-20">
        {/* 사이드바 컴포넌트 */}
        <Sidebar 
          categories={categories}
          activeCategory={activeCategory}
          onCategoryClick={handleCategoryClick}
        />

        {/* 메인 컨텐츠 컴포넌트 */}
        <MainContent 
          activeCategory={activeCategory}
          onStartChat={handleStartChat}
        />
      </div>

      {/* 모바일 반응형을 위한 스타일 */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        @media (max-width: 768px) {
          .flex {
            flex-direction: column;
          }
          aside {
            width: 100%;
            order: 2;
          }
          main {
            order: 1;
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}