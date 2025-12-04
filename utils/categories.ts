export const ALLOWED_CATEGORY_IDS = [
  'sports',
  'game', 
  'travel',
  'music',
  'hobby',
  'love',
  'free'
] as const;

/**
 * 카테고리 ID 타입 (TypeScript 타입 안전성)
 */
export type CategoryId = typeof ALLOWED_CATEGORY_IDS[number];

/**
 * 카테고리 인터페이스
 */
export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  displayName: string;
}

/**
 * 전체 카테고리 목록 (UI 표시용)
 */
export const CATEGORIES: Category[] = [
  { id: 'sports', name: '스포츠', icon: '🏈', displayName: '스포츠' },
  { id: 'game', name: '게임', icon: '🎮', displayName: '게임' },
  { id: 'travel', name: '여행', icon: '✈️', displayName: '여행' },
  { id: 'music', name: '음악/영화', icon: '🎵', displayName: '음악/영화' },
  { id: 'hobby', name: '일상/취미', icon: '🎨', displayName: '일상/취미' },
  { id: 'love', name: '연애/썸', icon: '💕', displayName: '연애/썸' },
  { id: 'free', name: '자유주제', icon: '💬', displayName: '자유주제' },
];

/**
 * 카테고리 ID 유효성 검증 (Type Guard)
 * @param value - 검증할 값
 * @returns 유효한 카테고리 ID이면 true
 */
export function isValidCategoryId(value: unknown): value is CategoryId {
  if (typeof value !== 'string') {
    return false;
  }
  return ALLOWED_CATEGORY_IDS.includes(value as CategoryId);
}

/**
 * 카테고리 객체 유효성 검증
 * @param category - 검증할 카테고리 객체
 * @returns 유효한 카테고리 객체이면 true
 */
export function isValidCategory(category: unknown): category is Category {
  if (!category || typeof category !== 'object') {
    return false;
  }
  
  const cat = category as Category;
  return (
    'id' in cat &&
    isValidCategoryId(cat.id) &&
    typeof cat.name === 'string' &&
    typeof cat.icon === 'string' &&
    typeof cat.displayName === 'string'
  );
}

/**
 * 카테고리 ID로 카테고리 객체 찾기
 * @param id - 카테고리 ID
 * @returns 카테고리 객체 또는 null
 */
export function getCategoryById(id: string): Category | null {
  if (!isValidCategoryId(id)) {
    console.warn(`[Security] Invalid category ID attempted: ${id}`);
    return null;
  }
  
  return CATEGORIES.find(cat => cat.id === id) || null;
}

/**
 * 카테고리 검증 및 에러 처리
 * @param category - 검증할 카테고리
 * @throws Error - 유효하지 않은 카테고리인 경우
 */
export function validateCategory(category: unknown): asserts category is Category {
  if (!isValidCategory(category)) {
    throw new Error(
      `Invalid category. Allowed categories: ${ALLOWED_CATEGORY_IDS.join(', ')}`
    );
  }
}

/**
 * 카테고리 ID 검증 및 에러 처리
 * @param categoryId - 검증할 카테고리 ID
 * @throws Error - 유효하지 않은 카테고리 ID인 경우
 */
export function validateCategoryId(categoryId: unknown): asserts categoryId is CategoryId {
  if (!isValidCategoryId(categoryId)) {
    throw new Error(
      `Invalid category ID: ${categoryId}. Allowed: ${ALLOWED_CATEGORY_IDS.join(', ')}`
    );
  }
}