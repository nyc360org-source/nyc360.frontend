// 1. نفس الـ Enum اللي في الـ Backend بالظبط
export enum CategoryEnum {
  Community = 0,
  Culture = 1,
  Education = 2,
  Health = 3,
  Housing = 4,
  Lifestyle = 5,
  Legal = 6,
  News = 7,
  Professions = 8,
  Social = 9,
  Transportation = 10,
  Tv = 11,
  Events = 12
}

// 2. خريطة الألوان والأيقونات والروابط لكل قسم (المصدر الموحد للموقع)
export const CATEGORY_THEMES: { [key: number]: any } = {
  [CategoryEnum.Community]: {
    color: '#ff7f50', label: 'Community', path: 'community', icon: '/icon-category/commumity.png',
    route: '/public/community',
    topLinks: [
      { label: 'Explore', route: '/public/discover' },
      { label: 'My Communities', route: '/public/my-communities' }
    ]
  },
  [CategoryEnum.Culture]: {
    color: '#dc3545', label: 'Culture', path: 'culture', icon: '/icon-category/culture.png',
    route: '/public/category/culture',
    topLinks: [
      { label: 'Feed', route: '/public/feed/culture' },
      { label: 'initiatives', route: '/public/initiatives/culture' }
    ]
  },
  [CategoryEnum.Education]: {
    color: '#0056b3', label: 'Education', path: 'education', icon: '/icon-category/education.png',
    route: '/public/category/education',
    topLinks: [
      { label: 'Feed', route: '/public/feed/education' },
      { label: 'initiatives', route: '/public/initiatives/education' }
    ]
  },
  [CategoryEnum.Health]: {
    color: '#00c3ff', label: 'Health', path: 'health', icon: '/icon-category/health.png',
    route: '/public/category/health',
    topLinks: [
      { label: 'Feed', route: '/public/feed/health' },
      { label: 'Initiatives', route: '/public/initiatives/health' }
    ]
  },
  [CategoryEnum.Housing]: {
    color: '#8E24AA', label: 'Housing', path: 'housing', icon: '/icon-category/housing.png',
    route: '/public/category/housing',
    topLinks: [
      { label: 'Feed', route: '/public/feed/housing' },
      { label: 'initiatives', route: '/public/initiatives/housing' }
    ]
  },
  [CategoryEnum.Lifestyle]: {
    color: '#8bc34a', label: 'Lifestyle', path: 'lifestyle', icon: '/icon-category/lifestyle.png',
    route: '/public/category/lifestyle',
    topLinks: [
      { label: 'Feed', route: '/public/feed/lifestyle' },
      { label: 'Trends', route: '/public/lifestyle/trends' },
      { label: 'initiatives', route: '/public/initiatives/lifestyle' }
    ]
  },
  [CategoryEnum.Legal]: {
    color: '#102a43', label: 'Legal', path: 'legal', icon: '/icon-category/legal.png',
    route: '/public/category/legal',
    topLinks: [
      { label: 'Feed', route: '/public/feed/legal' },
      { label: 'initiatives', route: '/public/initiatives/legal' }
    ]
  },
  [CategoryEnum.News]: {
    color: '#333333', label: 'News', path: 'news', icon: '/icon-category/newspaper.png',
    route: '/public/category/news',
    topLinks: [
      { label: 'Feed', route: '/public/feed/news' },
      { label: 'initiatives', route: '/public/initiatives/news' }
    ]
  },
  [CategoryEnum.Professions]: {
    color: '#2ecc71', label: 'Professions', path: 'professions', icon: '/icon-category/professions.png',
    route: '/public/profession/feed',
    topLinks: [
      { label: 'Feed', route: '/public/profession/feed' },
      { label: 'Jobs', route: '/public/profession/jobs' },
      { label: 'My Application', route: '/public/profession/my-applications' },
      { label: 'Posted Jobs', route: '/public/profession/my-offers' }
    ]
  },
  [CategoryEnum.Social]: {
    color: '#17a2b8', label: 'Social', path: 'social', icon: '/icon-category/social.png',
    route: '/public/category/social',
    topLinks: [
      { label: 'Feed', route: '/public/feed/social' },
      { label: 'initiatives', route: '/public/initiatives/social' }
    ]
  },
  [CategoryEnum.Transportation]: {
    color: '#f1c40f', label: 'Transportation', path: 'transportation', icon: '/icon-category/transportation.png',
    route: '/public/category/transportation',
    topLinks: [
      { label: 'Feed', route: '/public/feed/transportation' },
      { label: 'initiatives', route: '/public/initiatives/transportation' }
    ]
  },
  [CategoryEnum.Tv]: {
    color: '#0d47a1', label: 'TV', path: 'tv', icon: '/icon-category/tv.png',
    route: '/public/category/tv',
    topLinks: [
      { label: 'Feed', route: '/public/feed/tv' },
      { label: 'initiatives', route: '/public/initiatives/tv' }
    ]
  },

  
};
