'use client';

interface Category {
  id: string;
  name: string;
  icon: string;
  displayName: string;
}

interface MainContentProps {
  activeCategory: Category;
  onStartChat: () => void;
}

export default function MainContent({ activeCategory, onStartChat }: MainContentProps) {
  const isDefaultCategory = activeCategory.id === 'sports';

  return (
    <main className="
      flex-1 
      flex items-center justify-center 
      p-2 sm:p-4 md:p-6 lg:p-8 xl:p-12
      overflow-y-auto
      h-full
      w-full
    ">
      <div className="
        bg-white/95 
        backdrop-blur-md 
        rounded-xl sm:rounded-2xl md:rounded-3xl 
        p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 
        max-w-2xl 
        text-center 
        shadow-2xl 
        animate-fade-in-up
        w-full
      ">
        {/* 타이틀 */}
        <h1 className="
          text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 
          font-bold 
          bg-gradient-to-r from-indigo-600 to-purple-600 
          bg-clip-text text-transparent 
          mb-2 sm:mb-3 md:mb-4 lg:mb-6
          leading-tight
        ">
          {isDefaultCategory ? '익명으로 소통하세요' : `${activeCategory.displayName} 채팅방`}
        </h1>
        
        {/* 서브 타이틀 */}
        <p className="
          text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 
          text-gray-600 
          mb-3 sm:mb-4 md:mb-6 lg:mb-8
        ">
          {isDefaultCategory 
            ? '새로운 사람들과의 진솔한 대화' 
            : `${activeCategory.displayName}에 관심있는 사람들과의 대화`
          }
        </p>

        {/* 설명 텍스트 */}
        <div className="
          text-gray-700 
          leading-relaxed 
          mb-4 sm:mb-5 md:mb-6 lg:mb-8 xl:mb-10 
          space-y-2 sm:space-y-3 md:space-y-4
          text-xs sm:text-sm md:text-base
        ">
          {isDefaultCategory ? (
            <>
              <p>
                AnoniChat은 완전 익명 채팅 서비스입니다.
                원하는 관심사 카테고리를 선택하여 같은 취향을 가진 사람들과
                자유롭고 편안하게 대화를 나누어보세요.
              </p>
              <p className="hidden sm:block">
                실명이나 개인정보 없이도 의미 있는 소통이 가능하며,
                언제든지 새로운 사람과 매칭되어 새로운 이야기를 시작할 수 있습니다.
              </p>
            </>
          ) : (
            <p>
              {activeCategory.displayName}에 관심있는 사람들과
              익명으로 자유롭게 대화를 나누어보세요.
            </p>
          )}
        </div>

        {/* 채팅 시작 버튼 */}
        <button
          onClick={onStartChat}
          className="
            bg-gradient-to-r from-indigo-600 to-purple-600 
            text-white 
            px-6 sm:px-8 md:px-10 lg:px-12
            py-2.5 sm:py-3 md:py-3.5 lg:py-4 
            rounded-full 
            text-sm sm:text-base md:text-lg 
            font-semibold 
            hover:shadow-xl 
            hover:-translate-y-1 
            active:scale-95
            transition-all duration-300 
            shadow-lg
            w-full sm:w-auto
            min-w-[200px] sm:min-w-[240px]
          "
        >
          채팅 시작하기
        </button>

        {/* 특징 카드들 */}
        <div className="
          grid 
          grid-cols-3 
          gap-2 sm:gap-3 md:gap-4 lg:gap-6 
          mt-4 sm:mt-5 md:mt-6 lg:mt-8 xl:mt-10
        ">
          <div className="
            text-center 
            p-2 sm:p-3 md:p-4 lg:p-5 
            rounded-lg sm:rounded-xl md:rounded-2xl 
            bg-indigo-50 
            border border-indigo-100
          ">
            <div className="text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2 md:mb-3">🔒</div>
            <div className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 leading-tight">
              완전 익명
            </div>
          </div>
          
          <div className="
            text-center 
            p-2 sm:p-3 md:p-4 lg:p-5 
            rounded-lg sm:rounded-xl md:rounded-2xl 
            bg-indigo-50 
            border border-indigo-100
          ">
            <div className="text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2 md:mb-3">⚡</div>
            <div className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 leading-tight">
              즉시 매칭
            </div>
          </div>
          
          <div className="
            text-center 
            p-2 sm:p-3 md:p-4 lg:p-5 
            rounded-lg sm:rounded-xl md:rounded-2xl 
            bg-indigo-50 
            border border-indigo-100
          ">
            <div className="text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2 md:mb-3">🌍</div>
            <div className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 leading-tight">
              글로벌 연결
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}