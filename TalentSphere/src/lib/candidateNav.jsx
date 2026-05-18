import { LayoutDashboard, Search, Bookmark, FileText, MessageSquare, User } from 'lucide-react';

export function getCandidateSidebarItems() {
  return [
    { to: '/candidate/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/candidate/jobs', label: 'Browse Jobs', icon: <Search size={18} /> },
    { to: '/candidate/jobs?tab=saved', label: 'Saved Jobs', icon: <Bookmark size={18} /> },
    { to: '/candidate/jobs?tab=applied', label: 'Applied Jobs', icon: <FileText size={18} /> },
    { to: '/candidate/messages', label: 'Messages', icon: <MessageSquare size={18} /> },
    { to: '/candidate/profile', label: 'Profile', icon: <User size={18} /> },
  ];
}

export function getCandidateProfileProps(user, profile) {
  return {
    name: profile?.fullName || user?.name || 'User',
    subtitle: profile?.jobTitle || 'No title set',
    initial: (profile?.fullName || user?.name || 'U')[0].toUpperCase(),
    photo: profile?.profilePhoto || null,
  };
}
