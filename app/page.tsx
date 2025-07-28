// app/page.tsx
'use client';

import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

// 카테고리 타입 정의
interface Category {
  id: string;
  name: string;
  icon: string;
  displayName: string;
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

  // 카테고리 클릭 핸들러
  const handleCategoryClick = (category: Category) => {
    setActiveCategory(category);
  };

  // 채팅 시작 핸들러
  const handleStartChat = async () => {
    try {
      // 백엔드 API 호출
      const response = await fetch('/api/chat/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: activeCategory.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.roomId) {
          // 채팅방으로 이동
          window.location.href = `/chat?roomId=${data.roomId}&category=${encodeURIComponent(activeCategory.displayName)}`;
        } else {
          alert(data.message || '채팅 시작 실패했습니다.');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || '채팅 시작에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('채팅 시작 오류:', error);
      alert('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

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