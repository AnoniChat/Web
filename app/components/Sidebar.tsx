'use client';

interface Category {
  id: string;
  name: string;
  icon: string;
  displayName: string;
}

interface SidebarProps {
  categories: Category[];
  activeCategory: Category;
  onCategoryClick: (category: Category) => void;
}

export default function Sidebar({ 
  categories, 
  activeCategory, 
  onCategoryClick 
}: SidebarProps) {
  return (
    <aside className="
      w-20 sm:w-24 md:w-48 lg:w-64 xl:w-72
      bg-white/95 
      backdrop-blur-md 
      shadow-xl
      overflow-y-auto
      overflow-x-hidden
      h-full
      flex-shrink-0
      flex
      flex-col
    ">
      <div className="p-2 sm:p-3 md:p-4 lg:p-6 flex flex-col h-full">
        {/* 헤더 - 모바일에서는 숨김 */}
        <h3 className="
          hidden md:block
          text-indigo-600 
          text-sm md:text-base lg:text-lg 
          font-semibold 
          mb-4 md:mb-6 
          pb-3 md:pb-4 
          border-b border-indigo-100
          flex-shrink-0
        ">
          관심사 카테고리
        </h3>
        
        {/* 균등 분배 + 최소 간격 */}
        <ul className="flex flex-col justify-evenly flex-1 gap-2 sm:gap-3 md:gap-0">
          {categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => onCategoryClick(category)}
                className={`
                  w-full 
                  flex flex-col md:flex-row items-center md:justify-start justify-center
                  px-1 sm:px-2 md:px-4 lg:px-6 
                  py-2 sm:py-2.5 md:py-3 lg:py-4 
                  rounded-lg md:rounded-xl
                  transition-all duration-300 
                  border-l-0 md:border-l-4
                  relative
                  gap-0.5 md:gap-0
                  ${
                    activeCategory.id === category.id
                      ? 'bg-indigo-50 text-indigo-600 md:border-l-indigo-500 font-semibold md:transform md:translate-x-1'
                      : 'text-gray-600 md:border-l-transparent hover:bg-indigo-50 hover:text-indigo-600 hover:md:border-l-indigo-300 hover:md:transform hover:md:translate-x-1'
                  }
                `}
              >
                {activeCategory.id === category.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r md:hidden" />
                )}
                
                <span className="text-xl sm:text-2xl md:text-xl flex-shrink-0">
                  {category.icon}
                </span>
                
                <span className="text-[10px] sm:text-xs md:text-base md:ml-2 md:ml-3 leading-tight text-center md:text-left">
                  {category.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}