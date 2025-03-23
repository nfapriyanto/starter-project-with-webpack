import RegisterPage from '../pages/auth/register/register-page';
import LoginPage from '../pages/auth/login/login-page';
import HomeLandingPage from '../pages/home-landing/home-landing-page';
import StoriesPage from '../pages/stories/stories-page';
import GuestStoryPage from '../pages/guest-story/guest-story-page';
import StoryDetailPage from '../pages/story-detail/story-detail-page';
import NotificationsPage from '../pages/notifications/notifications-page';
import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly, getAccessToken } from '../utils/auth';

export const routes = {
  // Public routes (accessible to anyone)
  '/': () => {
    // If user is logged in, show stories page, otherwise show landing page
    return getAccessToken() ? new StoriesPage() : new HomeLandingPage();
  },
  
  // Auth routes
  '/login': () => checkUnauthenticatedRouteOnly(new LoginPage()),
  '/register': () => checkUnauthenticatedRouteOnly(new RegisterPage()),

  // Guest story route - penting: tidak perlu autentikasi dan diletakkan SEBELUM route dengan parameter
  '/stories/guest': () => new GuestStoryPage(),
  
  // Authenticated routes
  '/stories': () => checkAuthenticatedRoute(new StoriesPage()),
  '/stories/:id': () => checkAuthenticatedRoute(new StoryDetailPage()),
  
  '/notifications': () => checkAuthenticatedRoute(new NotificationsPage()),
};