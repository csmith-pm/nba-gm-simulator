import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createTestingPinia } from '@pinia/testing';
import { useDraftStore } from '@/stores/draft';
import JoinView from './JoinView.vue';

vi.mock('@/api', () => ({
  joinDraft: vi.fn(),
}));

function buildRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/join/:shareCode', component: JoinView },
      { path: '/drafts/:id', component: { template: '<div />' } },
    ],
  });
}

async function mountJoin(
  shareCode: string,
  mockSetup: (store: ReturnType<typeof useDraftStore>) => void,
) {
  const router = buildRouter();
  const pinia = createTestingPinia({ createSpy: vi.fn });
  const store = useDraftStore(pinia);
  mockSetup(store);

  router.push(`/join/${shareCode}`);
  await router.isReady();

  const wrapper = mount(JoinView, {
    global: {
      plugins: [router, pinia],
      stubs: {
        ProgressSpinner: { template: '<div class="spinner" />' },
        Message: { template: '<div class="message"><slot /></div>' },
      },
    },
  });

  return { wrapper, router, store };
}

describe('JoinView', () => {
  it('calls draftStore.join with the share code and navigates on success', async () => {
    const { store, router } = await mountJoin('abc123', (s) => {
      (s.join as any).mockResolvedValue({ draftId: 42 });
    });
    await flushPromises();

    expect(store.join).toHaveBeenCalledWith('abc123');
    expect(router.currentRoute.value.path).toBe('/drafts/42');
  });

  it('shows spinner and "Joining draft..." while loading', async () => {
    let resolve!: (v: any) => void;
    const { wrapper } = await mountJoin('abc123', (s) => {
      (s.join as any).mockReturnValue(new Promise((r) => { resolve = r; }));
    });

    expect(wrapper.find('.spinner').exists()).toBe(true);
    expect(wrapper.text()).toContain('Joining draft...');

    resolve({ draftId: 1 });
    await flushPromises();
  });

  it('shows server error message on failure', async () => {
    const { wrapper } = await mountJoin('bad', (s) => {
      (s.join as any).mockRejectedValue({
        response: { data: { message: 'Draft not found' } },
      });
    });
    await flushPromises();

    expect(wrapper.find('.message').text()).toBe('Draft not found');
  });

  it('shows fallback error when no message provided', async () => {
    const { wrapper } = await mountJoin('bad', (s) => {
      (s.join as any).mockRejectedValue(new Error('network'));
    });
    await flushPromises();

    expect(wrapper.find('.message').text()).toBe('Failed to join draft');
  });

  it('does not show error while loading', async () => {
    let resolve!: (v: any) => void;
    const { wrapper } = await mountJoin('abc123', (s) => {
      (s.join as any).mockReturnValue(new Promise((r) => { resolve = r; }));
    });

    expect(wrapper.find('.message').exists()).toBe(false);

    resolve({ draftId: 1 });
    await flushPromises();
  });
});
