import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createTestingPinia } from '@pinia/testing';
import LoginView from './LoginView.vue';

vi.mock('@/api', () => ({
  login: vi.fn(),
  getMe: vi.fn(),
}));

function buildRouter(initialRoute = '/login') {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', component: LoginView },
      { path: '/register', component: { template: '<div />' } },
      { path: '/drafts', component: { template: '<div />' } },
      { path: '/draft/:id', component: { template: '<div />' } },
    ],
  });
}

async function mountLogin(query: Record<string, string> = {}) {
  const router = buildRouter();
  const route = { path: '/login', query };
  router.push(route);
  await router.isReady();

  const wrapper = mount(LoginView, {
    global: {
      plugins: [
        router,
        createTestingPinia({ createSpy: vi.fn }),
      ],
      stubs: {
        Card: {
          template: '<div><slot name="title" /><slot name="content" /></div>',
        },
        InputText: { template: '<input />' },
        Password: { template: '<input />' },
        Button: { template: '<button><slot /></button>' },
        Message: { template: '<div><slot /></div>' },
      },
    },
  });

  return { wrapper, router };
}

describe('LoginView', () => {
  describe('register link redirect preservation', () => {
    it('includes redirect query param when present', async () => {
      const { wrapper } = await mountLogin({ redirect: '/draft/42' });
      const link = wrapper.findComponent({ name: 'RouterLink' });
      expect(link.props('to')).toEqual({
        path: '/register',
        query: { redirect: '/draft/42' },
      });
    });

    it('passes empty query when no redirect param', async () => {
      const { wrapper } = await mountLogin();
      const link = wrapper.findComponent({ name: 'RouterLink' });
      expect(link.props('to')).toEqual({
        path: '/register',
        query: {},
      });
    });
  });

  describe('post-login navigation', () => {
    it('navigates to redirect path after login', async () => {
      const { wrapper, router } = await mountLogin({ redirect: '/draft/42' });
      const pushSpy = vi.spyOn(router, 'push');

      const { useAuthStore } = await import('@/stores/auth');
      const store = useAuthStore();
      (store.login as any).mockResolvedValue(undefined);

      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(pushSpy).toHaveBeenCalledWith('/draft/42');
    });

    it('navigates to /drafts when no redirect', async () => {
      const { wrapper, router } = await mountLogin();
      const pushSpy = vi.spyOn(router, 'push');

      const { useAuthStore } = await import('@/stores/auth');
      const store = useAuthStore();
      (store.login as any).mockResolvedValue(undefined);

      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(pushSpy).toHaveBeenCalledWith('/drafts');
    });
  });
});
