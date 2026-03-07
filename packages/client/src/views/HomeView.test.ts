import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createTestingPinia } from '@pinia/testing';
import HomeView from './HomeView.vue';

vi.mock('@/api', () => ({
  getMe: vi.fn(),
}));

function buildRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomeView },
      { path: '/drafts/new', component: { template: '<div />' } },
      { path: '/drafts', component: { template: '<div />' } },
      { path: '/register', component: { template: '<div />' } },
      { path: '/login', component: { template: '<div />' } },
    ],
  });
}

async function mountHome(user: { id: number; email: string; displayName: string } | null = null) {
  const router = buildRouter();
  router.push('/');
  await router.isReady();

  const wrapper = mount(HomeView, {
    global: {
      plugins: [
        router,
        createTestingPinia({
          createSpy: vi.fn,
          initialState: { auth: { user } },
        }),
      ],
      stubs: {
        Card: { template: '<div class="card-stub"><slot name="title" /><slot name="content" /></div>' },
        Button: { template: '<button><slot /></button>' },
      },
    },
  });

  return { wrapper, router };
}

const fakeUser = { id: 1, email: 'a@b.com', displayName: 'Test' };

describe('HomeView', () => {
  describe('authenticated state', () => {
    it('shows Create Draft link to /drafts/new', async () => {
      const { wrapper } = await mountHome(fakeUser);
      const links = wrapper.findAllComponents({ name: 'RouterLink' });
      const createLink = links.find(l => l.props('to') === '/drafts/new');
      expect(createLink).toBeTruthy();
    });

    it('shows My Drafts link to /drafts', async () => {
      const { wrapper } = await mountHome(fakeUser);
      const links = wrapper.findAllComponents({ name: 'RouterLink' });
      const draftsLink = links.find(l => l.props('to') === '/drafts');
      expect(draftsLink).toBeTruthy();
    });

    it('does NOT show Get Started or Sign In', async () => {
      const { wrapper } = await mountHome(fakeUser);
      const links = wrapper.findAllComponents({ name: 'RouterLink' });
      const registerLink = links.find(l => l.props('to') === '/register');
      const loginLink = links.find(l => l.props('to') === '/login');
      expect(registerLink).toBeUndefined();
      expect(loginLink).toBeUndefined();
    });
  });

  describe('unauthenticated state', () => {
    it('shows Get Started link to /register', async () => {
      const { wrapper } = await mountHome(null);
      const links = wrapper.findAllComponents({ name: 'RouterLink' });
      const registerLink = links.find(l => l.props('to') === '/register');
      expect(registerLink).toBeTruthy();
    });

    it('shows Sign In link to /login', async () => {
      const { wrapper } = await mountHome(null);
      const links = wrapper.findAllComponents({ name: 'RouterLink' });
      const loginLink = links.find(l => l.props('to') === '/login');
      expect(loginLink).toBeTruthy();
    });

    it('does NOT show Create Draft or My Drafts', async () => {
      const { wrapper } = await mountHome(null);
      const links = wrapper.findAllComponents({ name: 'RouterLink' });
      const createLink = links.find(l => l.props('to') === '/drafts/new');
      const draftsLink = links.find(l => l.props('to') === '/drafts');
      expect(createLink).toBeUndefined();
      expect(draftsLink).toBeUndefined();
    });
  });

  describe('feature cards', () => {
    it('always renders 3 feature cards', async () => {
      const { wrapper } = await mountHome(null);
      const cards = wrapper.findAll('.card-stub');
      expect(cards).toHaveLength(3);
    });
  });
});
