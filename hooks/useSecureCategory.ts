import { useState, useCallback, useEffect } from 'react';
import { 
  Category, 
  CATEGORIES, 
  isValidCategory, 
  getCategoryById 
} from '@/utils/categories';

/**
 * 보안이 강화된 카테고리 관리 훅
 */
export function useSecureCategory() {
  const [activeCategory, setActiveCategory] = useState<Category>(CATEGORIES[0]);
  const [error, setError] = useState<string | null>(null);

  /**
   * 🔒 안전한 카테고리 선택
   */
  const selectCategory = useCallback((category: Category) => {
    try {
      // 유효성 검증
      if (!isValidCategory(category)) {
        throw new Error('Invalid category object');
      }

      setActiveCategory(category);
      setError(null);
      
      // 보안 로그 (개발 환경)
      if (process.env.NODE_ENV === 'development') {
        console.log('[Category] Selected:', category.id);
      }
      
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      
      // 보안 경고 로그
      console.error('[Security Alert] Invalid category selection:', {
        attempted: category,
        error: errorMsg,
        timestamp: new Date().toISOString()
      });
      
      return false;
    }
  }, []);

  /**
   * 🔒 ID로 안전하게 카테고리 선택
   */
  const selectCategoryById = useCallback((id: string) => {
    const category = getCategoryById(id);
    
    if (!category) {
      setError(`Invalid category ID: ${id}`);
      console.warn('[Security] Invalid category ID attempted:', id);
      return false;
    }
    
    return selectCategory(category);
  }, [selectCategory]);

  /**
   * 🔒 카테고리 초기화 (기본값으로)
   */
  const resetCategory = useCallback(() => {
    setActiveCategory(CATEGORIES[0]);
    setError(null);
  }, []);

  return {
    activeCategory,
    selectCategory,
    selectCategoryById,
    resetCategory,
    error,
    allCategories: CATEGORIES
  };
}