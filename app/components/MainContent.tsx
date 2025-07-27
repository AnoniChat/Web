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
    <main className="flex-1 flex items-center justify-center p-12">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-16 max-w-2xl text-center shadow-2xl animate-fade-in-up">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
          {isDefaultCategory ? '익명으로 소통하세요' : `${activeCategory.displayName} 채팅방`}
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          {isDefaultCategory 
            ? '새로운 사람들과의 진솔한 대화' 
            : `${activeCategory.displayName}에 관심있는 사람들과의 대화`
          }
        </p>

        <div className="text-gray-700 leading-relaxed mb-10 space-y-5">
          {isDefaultCategory ? (
            <>
              <p>
                AnoniChat은 완전 익명 채팅 서비스입니다.<br />
                원하는 관심사 카테고리를 선택하여 같은 취향을 가진 사람들과<br />
                자유롭고 편안하게 대화를 나누어보세요.
              </p>
              <p>
                실명이나 개인정보 없이도 의미 있는 소통이 가능하며,<br />
                언제든지 새로운 사람과 매칭되어 새로운 이야기를 시작할 수 있습니다.
              </p>
            </>
          ) : (
            <p>
              {activeCategory.displayName}에 관심있는 사람들과<br />
              익명으로 자유롭게 대화를 나누어보세요.
            </p>
          )}
        </div>

        <button
          onClick={onStartChat}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-lg"
        >
          채팅 시작하기
        </button>

        {/* 특징 카드들 */}
        <div className="grid grid-cols-3 gap-6 mt-10">
          <div className="text-center p-5 rounded-2xl bg-indigo-50 border border-indigo-100">
            <div className="text-2xl mb-3">🔒</div>
            <div className="text-sm font-medium text-gray-600">완전 익명</div>
          </div>
          <div className="text-center p-5 rounded-2xl bg-indigo-50 border border-indigo-100">
            <div className="text-2xl mb-3">⚡</div>
            <div className="text-sm font-medium text-gray-600">즉시 매칭</div>
          </div>
          <div className="text-center p-5 rounded-2xl bg-indigo-50 border border-indigo-100">
            <div className="text-2xl mb-3">🌍</div>
            <div className="text-sm font-medium text-gray-600">글로벌 연결</div>
          </div>
        </div>
      </div>
    </main>
  );
}