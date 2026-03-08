import { createRouter, createWebHistory } from 'vue-router';
import { useSessionStore } from './stores/session';
import LoginView from './views/LoginView.vue';
import WalletView from './views/WalletView.vue';
import MagicLinkView from './views/MagicLinkView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/wallet' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/magic', name: 'magic', component: MagicLinkView },
    { path: '/wallet', name: 'wallet', component: WalletView, meta: { requiresAuth: true } }
  ]
});

router.beforeEach((to) => {
  const session = useSessionStore();
  const requiresAuth = Boolean(to.meta.requiresAuth);

  if (requiresAuth && !session.isAuthenticated) {
    return { name: 'login' };
  }

  if (!requiresAuth && session.isAuthenticated && to.name !== 'magic') {
    return { name: 'wallet' };
  }

  return true;
});

export default router;
