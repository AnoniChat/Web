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
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 flex items-center justify-center">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full blur-2xl" />
      </div>

      {/* ESC 힌트 */}
      <div className="absolute top-6 left-6 text-white/70 text-sm font-medium">
        ESC를 누르면 취소됩니다
      </div>

      {/* 경과 시간 */}
      <div className="absolute top-6 right-6 text-white/70 text-sm font-medium">
        {formatTime(elapsedTime)}
      </div>

      {/* 메인 컨테이너 */}
      <div className="bg-white rounded-3xl p-12 shadow-2xl text-center min-w-[400px] max-w-[500px] mx-4 relative animate-in fade-in-0 zoom-in-95 duration-500">
        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={handleCancelClick}
          className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 group"
          aria-label="매칭 취소"
        >
          <span className="text-lg group-hover:scale-110 transition-transform">✕</span>
        </button>

        {/* 로고 섹션 */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-purple-600 mb-2 tracking-tight">
            Anonichat
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mx-auto" />
        </div>

        {/* 대기 중 텍스트 */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {/* 스피너 */}
          <div className="relative">
            <div className="w-8 h-8 border-4 border-gray-200 rounded-full" />
            <div className="absolute top-0 left-0 w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
          
          <span className="text-2xl font-semibold text-gray-800">매칭 대기중</span>
          
          {/* 점 애니메이션 */}
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:0ms]" />
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:150ms]" />
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>

        {/* 대기열 정보 */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 border-2 border-purple-100 mb-6 relative overflow-hidden">
          {/* 배경 장식 */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-full -translate-y-10 translate-x-10 opacity-50" />
          
          <div className="relative">
            <div className="text-gray-600 mb-3 font-medium">현재 대기열</div>
            <div className="flex items-center justify-center">
              <span className="text-5xl font-bold text-purple-600 tracking-tight drop-shadow-sm">
                {queueSize.toString()}
              </span>
              <span className="text-xl text-gray-500 ml-3 font-medium">명</span>
            </div>
          </div>
        </div>

        {/* 상태 메시지 */}
        <div className="text-gray-600 text-sm mb-6">
          최적의 상대를 찾고 있습니다...
        </div>

        {/* 펄스 효과 (매칭 중임을 강조) */}
        <div className="absolute inset-0 border-4 border-purple-300 rounded-3xl animate-ping opacity-20" />
      </div>

      {/* 취소 버튼 (하단) */}
      <button
        type="button"
        onClick={handleCancelClick}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-medium hover:bg-white/30 transition-all duration-200 flex items-center gap-2"
      >
        <span>매칭 취소</span>
        <span className="text-sm opacity-70">(ESC)</span>
      </button>
    </div>
  );
};

export default MatchingQueue;