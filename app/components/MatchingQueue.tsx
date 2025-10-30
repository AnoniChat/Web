'use client';
import React, { useState, useEffect, useCallback } from 'react';

// Props 인터페이스 정의
interface MatchingQueueProps {
  onCancel: () => void;
  onMatchFound: (roomId?: string) => void;
  queueSize: number;
}

const MatchingQueue: React.FC<MatchingQueueProps> = ({ onCancel, onMatchFound, queueSize }) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // 경과 시간을 mm:ss 형태로 포맷
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback((e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      onCancel();
    }
  }, [onCancel]);

  // 취소 버튼 클릭 핸들러
  const handleCancelClick = useCallback((): void => {
    onCancel();
  }, [onCancel]);

  useEffect(() => {
  // 경과 시간 카운터
  const timeInterval = setInterval(() => {
    setElapsedTime(prev => prev + 1);
  }, 1000);

    // ESC 키 이벤트 리스너
    document.addEventListener('keydown', handleKeyDown);

    // 클린업 함수
    return () => {
      clearInterval(timeInterval);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onMatchFound, handleKeyDown]);


  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 flex items-center justify-center p-4">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-32 h-32 sm:w-48 sm:h-48 bg-white rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full blur-2xl" />
      </div>

      {/* ESC 힌트 */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 text-white/70 text-xs sm:text-sm font-medium">
        ESC를 누르면 취소됩니다
      </div>

      {/* 경과 시간 */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 text-white/70 text-xs sm:text-sm font-medium">
        {formatTime(elapsedTime)}
      </div>

      {/* 메인 컨테이너 */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-2xl text-center w-full max-w-[90%] sm:max-w-md md:max-w-lg relative animate-in fade-in-0 zoom-in-95 duration-500">
        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={handleCancelClick}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 group"
          aria-label="매칭 취소"
        >
          <span className="text-base sm:text-lg group-hover:scale-110 transition-transform">✕</span>
        </button>

        {/* 로고 섹션 */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 mb-2 tracking-tight">
            Anonichat
          </h1>
          <div className="w-12 sm:w-16 h-0.5 sm:h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mx-auto" />
        </div>

        {/* 대기 중 텍스트 */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 md:mb-10 flex-wrap">
          {/* 스피너 */}
          <div className="relative flex-shrink-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 sm:border-4 border-gray-200 rounded-full" />
            <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-3 sm:border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
          
          <span className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">매칭 대기중</span>
          
          {/* 점 애니메이션 */}
          <div className="flex gap-1 flex-shrink-0">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:0ms]" />
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:150ms]" />
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>

        {/* 대기열 정보 */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border-2 border-purple-100 mb-4 sm:mb-5 md:mb-6 relative overflow-hidden">
          {/* 배경 장식 */}
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10 opacity-50" />
          
          <div className="relative">
            <div className="text-gray-600 mb-2 sm:mb-3 font-medium text-sm sm:text-base">현재 대기열</div>
            <div className="flex items-center justify-center">
              <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-purple-600 tracking-tight drop-shadow-sm">
                {queueSize.toString()}
              </span>
              <span className="text-base sm:text-lg md:text-xl text-gray-500 ml-2 sm:ml-3 font-medium">명</span>
            </div>
          </div>
        </div>

        {/* 상태 메시지 */}
        <div className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">
          최적의 상대를 찾고 있습니다...
        </div>

        {/* 펄스 효과 (매칭 중임을 강조) */}
        <div className="absolute inset-0 border-3 sm:border-4 border-purple-300 rounded-2xl sm:rounded-3xl animate-ping opacity-20" />
      </div>

      {/* 취소 버튼 (하단) */}
      <button
        type="button"
        onClick={handleCancelClick}
        className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-sm text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium hover:bg-white/30 transition-all duration-200 flex items-center gap-2 text-sm sm:text-base"
      >
        <span>매칭 취소</span>
        <span className="text-xs sm:text-sm opacity-70">(ESC)</span>
      </button>
    </div>
  );
};

export default MatchingQueue;