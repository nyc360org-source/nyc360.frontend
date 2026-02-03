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
  Tv = 11
}

export const CATEGORY_THEMES: { [key: number]: any } = {
  [CategoryEnum.Community]: {
    color: '#BC5E3D', label: 'Community', path: 'community', icon: '/icon-category/commumity.png', biIcon: 'bi-people-fill',
    route: '/public/community',
    topLinks: [
      // { label: 'Explore', route: '/public/discover' },
      // { label: 'My Communities', route: '/public/my-communities' }
    ]
  },
  [CategoryEnum.Culture]: {
    color: '#dc3545', label: 'Culture', path: 'culture', icon: '/icon-category/culture.png', biIcon: 'bi-palette-fill',
    route: '/public/category/culture',
    topLinks: [
      { label: 'Feed', route: '/public/feed/culture' },
      { label: 'initiatives', route: '/public/initiatives/culture' }
    ]
  },
  [CategoryEnum.Education]: {
    color: '#0056b3', label: 'Education', path: 'education', icon: '/icon-category/education.png', biIcon: 'bi-mortarboard-fill',
    route: '/public/category/education',
    topLinks: [
      { label: 'Feed', route: '/public/feed/education' },
      { label: 'initiatives', route: '/public/initiatives/education' },
      { label: 'create post', route: '/public/posts/create' }
    ]
  },
  [CategoryEnum.Health]: {
    color: '#00c3ff', label: 'Health', path: 'health', icon: '/icon-category/health.png', biIcon: 'bi-heart-pulse-fill',
    route: '/public/category/health',
    topLinks: [
      { label: 'Feed', route: '/public/feed/health' },
      { label: 'Initiatives', route: '/public/initiatives/health' },
      { label: 'create post', route: '/public/posts/create' }

    ]
  },
  [CategoryEnum.Housing]: {
    color: '#B59B62', label: 'Housing', path: 'housing', icon: '/icon-category/housing.png', biIcon: 'bi-house-heart-fill',
    route: '/public/housing/home',
    topLinks: [
      // { label: 'Feed', route: '/public/housing/feed' },
      // { label: 'Initiatives', route: '/public/initiatives/housing' },
      // { label: 'Housing Requests', route: '/public/housing/requests' },
      // { label: 'post listing', route: '/public/housing/create' },
      // { label: 'create post', route: '/public/posts/create' }
    ]
  },
  [CategoryEnum.Lifestyle]: {
    color: '#28a745', label: 'Lifestyle', path: 'lifestyle', icon: '/icon-category/lifestyle.png', biIcon: 'bi-cup-hot-fill',
    route: '/public/category/lifestyle',
    topLinks: [
      // { label: 'Feed', route: '/public/feed/lifestyle' },
      // { label: 'Initiatives', route: '/public/initiatives/lifestyle' }
    ]
  },
  [CategoryEnum.Legal]: {
    color: '#6610f2', label: 'Legal', path: 'legal', icon: '/icon-category/legal.png', biIcon: 'bi-hammer',
    route: '/public/category/legal',
    topLinks: [
      // { label: 'Feed', route: '/public/feed/legal' },
      // { label: 'Initiatives', route: '/public/initiatives/legal' }
    ]
  },
  [CategoryEnum.News]: {
    color: '#6c757d', label: 'News', path: 'news', icon: '/icon-category/newspaper.png', biIcon: 'bi-newspaper',
    route: '/public/category/news',
    topLinks: [
      // { label: 'Feed', route: '/public/feed/news' },
      // { label: 'Initiatives', route: '/public/initiatives/news' }
    ]
  },
  [CategoryEnum.Professions]: {
    color: '#fd7e14', label: 'Professions', path: 'professions', icon: '/icon-category/professions.png', biIcon: 'bi-briefcase-fill',
    route: '/public/profession/feed',
    topLinks: [
      // { label: 'Jobs', route: '/public/profession/jobs' },
      // { label: 'my offers', route: '/public/profession/my-offers' },
      // { label: 'my applications', route: '/public/profession/my-applications' },

    ]
  },
  [CategoryEnum.Social]: {
    color: '#e83e8c', label: 'Social', path: 'social', icon: '/icon-category/social.png', biIcon: 'bi-chat-heart-fill',
    route: '/public/category/social',
    topLinks: [
      // { label: 'Feed', route: '/public/feed/social' },
      // { label: 'Initiatives', route: '/public/initiatives/social' }
    ]
  },
  [CategoryEnum.Transportation]: {
    color: '#17a2b8', label: 'Transportation', path: 'transportation', icon: '/icon-category/transportation.png', biIcon: 'bi-bus-front-fill',
    route: '/public/category/transportation',
    topLinks: [
      // { label: 'Feed', route: '/public/feed/transportation' },
      // { label: 'Alerts', route: '/public/transport-alerts' }
    ]
  },
  [CategoryEnum.Tv]: {
    color: '#343a40', label: 'TV', path: 'tv', icon: '/icon-category/tv.png', biIcon: 'bi-tv-fill',
    route: '/public/category/tv',
    topLinks: [
      // { label: 'Feed', route: '/public/feed/tv' },
      // { label: 'initiatives', route: '/public/initiatives/tv' }
    ]
  }
};
