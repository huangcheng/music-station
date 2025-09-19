import {
  Clock,
  Heart,
  Home,
  Library,
  ListMusic,
  Music,
  Radio,
  Search,
  TrendingUp,
  User,
} from 'lucide-react';

export const NAVIGATION_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'library', label: 'Your Library', icon: Library },
] as const;

export const LIBRARY_ITEMS = [
  { id: 'playlists', label: 'Playlists', icon: ListMusic, count: 0 },
  { id: 'albums', label: 'Albums', icon: Music, count: 0 },
  { id: 'artists', label: 'Artists', icon: User, count: 0 },
  { id: 'liked', label: 'Liked Songs', icon: Heart, count: 0 },
] as const;

export const DISCOVER_ITEMS = [
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'recent', label: 'Recently Played', icon: Clock },
  { id: 'radio', label: 'Radio', icon: Radio },
] as const;
