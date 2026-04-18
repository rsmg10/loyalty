import { createRouter, createWebHistory } from 'vue-router';
import { useSessionStore } from './stores/session';
import LoginView from './views/LoginView.vue';
import DashboardView from './views/DashboardView.vue';
import OnboardingView from './views/OnboardingView.vue';
import AdminConsoleView from './views/AdminConsoleView.vue';
import OwnerStaffUsersView from './views/OwnerStaffUsersView.vue';
import OwnerReportsView from './views/OwnerReportsView.vue';
import OwnerSettingsView from './views/OwnerSettingsView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/app' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/onboarding', name: 'onboarding', component: OnboardingView, meta: { requiresAuth: true } },
    { path: '/app', name: 'app', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/owner/users', name: 'owner-users', component: OwnerStaffUsersView, meta: { requiresAuth: true, requiresOwner: true } },
    { path: '/owner/settings', name: 'owner-settings', component: OwnerSettingsView, meta: { requiresAuth: true, requiresOwner: true } },
    { path: '/owner/reports', name: 'owner-reports', component: OwnerReportsView, meta: { requiresAuth: true, requiresOwner: true } },
    { path: '/admin', name: 'admin', component: AdminConsoleView, meta: { requiresAuth: true } }
  ]
});

router.beforeEach(async (to) => {
  const session = useSessionStore();
  const requiresAuth = Boolean(to.meta.requiresAuth);
  const requiresOwner = Boolean(to.meta.requiresOwner);

  if (requiresAuth && !session.isAuthenticated) {
    return { name: 'login' };
  }

  if (session.isAuthenticated && !session.meLoaded && !session.loading) {
    try {
      await session.fetchMe();
    } catch {
      session.clearAuth();
      return { name: 'login' };
    }
  }

  if (!requiresAuth && session.isAuthenticated) {
    return { name: session.hasBusinesses ? 'app' : 'onboarding' };
  }

  if (to.name === 'app' && session.meLoaded && !session.hasBusinesses) {
    return { name: 'onboarding' };
  }

  if (requiresOwner && session.meLoaded && session.ownerBusinesses.length === 0) {
    return { name: session.hasBusinesses ? 'app' : 'onboarding' };
  }

  return true;
});

export default router;
