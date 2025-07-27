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
    <aside className="w-72 bg-white/95 backdrop-blur-md shadow-xl">
      <div className="p-8">
        <h3 className="text-indigo-600 text-lg font-semibold mb-6 pb-4 border-b border-indigo-100">
          관심사 카테고리
        </h3>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => onCategoryClick(category)}
                className={`w-full text-left px-6 py-4 rounded-lg transition-all duration-300 border-l-4 ${
                  activeCategory.id === category.id
                    ? 'bg-indigo-50 text-indigo-600 border-l-indigo-500 font-semibold transform translate-x-1'
                    : 'text-gray-600 border-l-transparent hover:bg-indigo-50 hover:text-indigo-600 hover:border-l-indigo-300 hover:transform hover:translate-x-1'
                }`}
              >
                <span className="mr-3">{category.icon}</span>
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}