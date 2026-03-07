import { createRouter, createWebHistory } from 'vue-router';
import { useSessionStore } from './stores/session';
import LoginView from './views/LoginView.vue';
import DashboardView from './views/DashboardView.vue';
import OnboardingView from './views/OnboardingView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/app' },
    { path: '/login', component: LoginView },
    { path: '/onboarding', component: OnboardingView, meta: { requiresAuth: true } },
    { path: '/app', component: DashboardView, meta: { requiresAuth: true } }
  ]
});

router.beforeEach(async (to) => {
  const session = useSessionStore();
  const requiresAuth = Boolean(to.meta.requiresAuth);

  if (requiresAuth && !session.token) {
    return { path: '/login' };
  }

  if (session.token && !session.meLoaded && !session.loading) {
    try {
      await session.fetchMe();
    } catch {
      session.clearAuth();
      return { path: '/login' };
    }
  }

  if (!requiresAuth && session.token) {
    const hasBusinesses = session.ownerBusinesses.length > 0 || session.staffBusinesses.length > 0;
    return { path: hasBusinesses ? '/app' : '/onboarding' };
  }

  if (to.path === '/app' && session.meLoaded) {
    const hasBusinesses = session.ownerBusinesses.length > 0 || session.staffBusinesses.length > 0;
    if (!hasBusinesses) {
      return { path: '/onboarding' };
    }
  }

  return true;
});

export default router;
