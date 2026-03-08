import { createRouter, createWebHistory } from 'vue-router';
import { useSessionStore } from './stores/session';
import LoginView from './views/LoginView.vue';
import WalletView from './views/WalletView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/wallet' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/wallet', name: 'wallet', component: WalletView, meta: { requiresAuth: true } }
  ]
});

router.beforeEach((to) => {
  const session = useSessionStore();
  const requiresAuth = Boolean(to.meta.requiresAuth);

  if (requiresAuth && !session.isAuthenticated) {
    return { name: 'login' };
  }

  if (!requiresAuth && session.isAuthenticated) {
    return { name: 'wallet' };
  }

  return true;
});

export default router;
