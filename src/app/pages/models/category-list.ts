// src/app/shared/models/category-list.ts

export interface CategoryModel {
  id: number | null; // null or -1 for 'All'
  name: string;
  icon: string;
}

// هذه القائمة تطابق الـ C# Enum بالمللي (للتعامل مع الداتا بيز)
// Community=0, Culture=1, ..., Tv=11
export const CATEGORY_LIST: CategoryModel[] = [
  { id: 0, name: 'Community', icon: 'bi-people-fill' },
  { id: 1, name: 'Culture', icon: 'bi-palette-fill' },
  { id: 2, name: 'Education', icon: 'bi-mortarboard-fill' },
  { id: 3, name: 'Events', icon: 'bi-calendar-event-fill' },
  { id: 4, name: 'Health', icon: 'bi-heart-fill' },
  { id: 5, name: 'Legal', icon: 'bi-hammer' },
  { id: 6, name: 'Lifestyle', icon: 'bi-person-arms-up' },
  { id: 7, name: 'News', icon: 'bi-newspaper' },
  { id: 8, name: 'Professions', icon: 'bi-briefcase-fill' },
  { id: 9, name: 'Social', icon: 'bi-globe' },
  { id: 10, name: 'Tour', icon: 'bi-airplane-fill' },
  { id: 11, name: 'TV', icon: 'bi-tv-fill' }
];

// دالة مساعدة لو عايز القائمة ومعاها "All" عشان الفلترة في الهوم والناف بار
export function getCategoriesWithAll(): CategoryModel[] {
  return [
    { id: -1, name: 'All', icon: 'bi-grid-fill' }, // -1 for UI handling
    ...CATEGORY_LIST
  ];
}