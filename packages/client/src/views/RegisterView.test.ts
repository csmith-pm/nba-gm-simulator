import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createTestingPinia } from '@pinia/testing';
import RegisterView from './RegisterView.vue';

vi.mock('@/api', () => ({
  register: vi.fn(),
  getMe: vi.fn(),
}));

function buildRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/register', component: RegisterView },
      { path: '/login', component: { template: '<div />' } },
      { path: '/drafts', component: { template: '<div />' } },
      { path: '/draft/:id', component: { template: '<div />' } },
    ],
  });
}

async function mountRegister(query: Record<string, string> = {}) {
  const router = buildRouter();
  const route = { path: '/register', query };
  router.push(route);
  await router.isReady();

  const wrapper = mount(RegisterView, {
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

describe('RegisterView', () => {
  describe('sign-in link redirect preservation', () => {
    it('includes redirect query param when present', async () => {
      const { wrapper } = await mountRegister({ redirect: '/draft/42' });
      const link = wrapper.findComponent({ name: 'RouterLink' });
      expect(link.props('to')).toEqual({
        path: '/login',
        query: { redirect: '/draft/42' },
      });
    });

    it('passes empty query when no redirect param', async () => {
      const { wrapper } = await mountRegister();
      const link = wrapper.findComponent({ name: 'RouterLink' });
      expect(link.props('to')).toEqual({
        path: '/login',
        query: {},
      });
    });
  });

  describe('post-registration navigation', () => {
    it('navigates to redirect path after registration', async () => {
      const { wrapper, router } = await mountRegister({ redirect: '/draft/42' });
      const pushSpy = vi.spyOn(router, 'push');

      const { useAuthStore } = await import('@/stores/auth');
      const store = useAuthStore();
      (store.register as any).mockResolvedValue(undefined);

      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(pushSpy).toHaveBeenCalledWith('/draft/42');
    });

    it('navigates to /drafts when no redirect', async () => {
      const { wrapper, router } = await mountRegister();
      const pushSpy = vi.spyOn(router, 'push');

      const { useAuthStore } = await import('@/stores/auth');
      const store = useAuthStore();
      (store.register as any).mockResolvedValue(undefined);

      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(pushSpy).toHaveBeenCalledWith('/drafts');
    });
  });
});
