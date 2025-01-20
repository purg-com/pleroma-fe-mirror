// routes that take :username property
export const USERNAME_ROUTES = new Set([
  'dms',
  'interactions',
  'notifications',
  'chat',
  'chats'
])

// routes that take :name property
export const NAME_ROUTES = new Set([
  'user-profile',
  'legacy-user-profile'
])

export const TIMELINES = {
  home: {
    route: 'friends',
    icon: 'home',
    label: 'nav.home_timeline',
    criteria: ['!private']
  },
  public: {
    route: 'public-timeline',
    anon: true,
    icon: 'users',
    label: 'nav.public_tl',
    criteria: ['!private']
  },
  twkn: {
    route: 'public-external-timeline',
    anon: true,
    icon: 'globe',
    label: 'nav.twkn',
    criteria: ['!private', 'federating']
  },
  bookmarks: {
    route: 'bookmarks',
    icon: 'bookmark',
    label: 'nav.bookmarks',
    criteria: ['!supportsBookmarkFolders']
  },
  favorites: {
    routeObject: { name: 'user-profile', query: { tab: 'favorites' } },
    icon: 'star',
    label: 'user_card.favorites'
  },
  dms: {
    route: 'dms',
    icon: 'envelope',
    label: 'nav.dms'
  }
}

export const ROOT_ITEMS = {
  interactions: {
    route: 'interactions',
    icon: 'bell',
    label: 'nav.interactions'
  },
  chats: {
    route: 'chats',
    icon: 'comments',
    label: 'nav.chats',
    badgeStyle: 'notification',
    badgeGetter: 'unreadChatCount',
    criteria: ['chats']
  },
  friendRequests: {
    route: 'friend-requests',
    icon: 'user-plus',
    label: 'nav.friend_requests',
    badgeStyle: 'notification',
    criteria: ['lockedUser'],
    badgeGetter: 'followRequestCount'
  },
  about: {
    route: 'about',
    anon: true,
    icon: 'info-circle',
    label: 'nav.about'
  },
  announcements: {
    route: 'announcements',
    icon: 'bullhorn',
    label: 'nav.announcements',
    badgeStyle: 'notification',
    badgeGetter: 'unreadAnnouncementCount',
    criteria: ['announcements']
  },
  drafts: {
    route: 'drafts',
    icon: 'file-pen',
    label: 'nav.drafts',
    badgeStyle: 'neutral',
    badgeGetter: 'draftCount'
  }
}

export function routeTo (item, currentUser) {
  if (!item.route && !item.routeObject) return null

  let route

  if (item.routeObject) {
    route = item.routeObject
  } else {
    route = { name: (item.anon || currentUser) ? item.route : item.anonRoute }
  }

  if (USERNAME_ROUTES.has(route.name)) {
    route.params = { username: currentUser.screen_name }
  } else if (NAME_ROUTES.has(route.name)) {
    route.params = { name: currentUser.screen_name }
  }

  return route
}
