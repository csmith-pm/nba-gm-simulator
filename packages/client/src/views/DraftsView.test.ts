import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createTestingPinia } from '@pinia/testing';
import { useDraftStore } from '@/stores/draft';
import DraftsView from './DraftsView.vue';

const mockConfirmRequire = vi.fn();
vi.mock('primevue/useconfirm', () => ({
  useConfirm: () => ({ require: mockConfirmRequire }),
}));
vi.mock('primevue/usetoast', () => ({
  useToast: () => ({ add: vi.fn() }),
}));
vi.mock('@/api', () => ({
  getDrafts: vi.fn(),
  deleteDraft: vi.fn(),
}));

function buildRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/drafts', component: DraftsView },
      { path: '/drafts/new', component: { template: '<div />' } },
      { path: '/drafts/:id', component: { template: '<div />' } },
    ],
  });
}

async function mountDrafts(drafts: any[] = []) {
  const router = buildRouter();
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: { draft: { drafts } },
  });

  router.push('/drafts');
  await router.isReady();

  const wrapper = mount(DraftsView, {
    global: {
      plugins: [router, pinia],
      stubs: {
        Card: { template: '<div class="card-stub"><slot name="content" /></div>' },
        Button: {
          template: '<button :class="$attrs.icon" @click="$emit(\'click\')"><slot /></button>',
          inheritAttrs: false,
        },
        DataTable: { template: '<div class="datatable-stub"><slot /></div>' },
        Column: { template: '<div />' },
        Tag: {
          template: '<span class="tag-stub" :data-severity="$attrs.severity">{{ $attrs.value }}</span>',
          inheritAttrs: false,
        },
      },
    },
  });

  const store = useDraftStore(pinia);
  return { wrapper, store, router };
}

const sampleDrafts = [
  { id: 1, name: 'Draft A', status: 'waiting', shareCode: 'abc', createdAt: '2024-01-01' },
  { id: 2, name: 'Draft B', status: 'drafting', shareCode: 'def', createdAt: '2024-01-02' },
  { id: 3, name: 'Draft C', status: 'complete', shareCode: 'ghi', createdAt: '2024-01-03' },
];

describe('DraftsView', () => {
  it('calls fetchDrafts on mount', async () => {
    const { store } = await mountDrafts();
    expect(store.fetchDrafts).toHaveBeenCalled();
  });

  describe('empty state', () => {
    it('shows "No drafts yet" message', async () => {
      const { wrapper } = await mountDrafts([]);
      expect(wrapper.text()).toContain('No drafts yet');
    });

    it('shows create draft link', async () => {
      const { wrapper } = await mountDrafts([]);
      const links = wrapper.findAllComponents({ name: 'RouterLink' });
      const createLink = links.find(l => l.props('to') === '/drafts/new');
      expect(createLink).toBeTruthy();
    });

    it('does not render DataTable', async () => {
      const { wrapper } = await mountDrafts([]);
      expect(wrapper.find('.datatable-stub').exists()).toBe(false);
    });
  });

  describe('with drafts', () => {
    it('renders draft names with links', async () => {
      const { wrapper } = await mountDrafts(sampleDrafts);
      const links = wrapper.findAllComponents({ name: 'RouterLink' });
      const draftLinks = links.filter(l =>
        typeof l.props('to') === 'string' && l.props('to').startsWith('/drafts/')
        && l.props('to') !== '/drafts/new'
      );
      expect(draftLinks.length).toBeGreaterThanOrEqual(3);
    });

    it('renders status tags with correct severity', async () => {
      const { wrapper } = await mountDrafts(sampleDrafts);
      const tags = wrapper.findAll('.tag-stub');
      const severities = tags.map(t => t.attributes('data-severity'));
      expect(severities).toContain('warn');
      expect(severities).toContain('info');
      expect(severities).toContain('success');
    });

    it('shows delete button only on non-complete drafts', async () => {
      const { wrapper } = await mountDrafts(sampleDrafts);
      const trashButtons = wrapper.findAll('button.pi.pi-trash');
      // waiting + drafting = 2 (mobile cards only, desktop hidden)
      expect(trashButtons.length).toBe(2);
    });

    it('shows copy button only on waiting drafts', async () => {
      const { wrapper } = await mountDrafts(sampleDrafts);
      const copyButtons = wrapper.findAll('button.pi.pi-copy');
      expect(copyButtons.length).toBe(1);
    });
  });

  describe('delete flow', () => {
    it('calls confirm.require with draft name', async () => {
      const { wrapper } = await mountDrafts(sampleDrafts);
      const trashButtons = wrapper.findAll('button.pi.pi-trash');
      await trashButtons[0].trigger('click');

      expect(mockConfirmRequire).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Draft A'),
        }),
      );
    });

    it('accept callback calls draftStore.deleteDraft', async () => {
      const { wrapper, store } = await mountDrafts(sampleDrafts);
      (store.deleteDraft as any).mockResolvedValue(undefined);

      const trashButtons = wrapper.findAll('button.pi.pi-trash');
      await trashButtons[0].trigger('click');

      const call = mockConfirmRequire.mock.calls[mockConfirmRequire.mock.calls.length - 1][0];
      await call.accept();
      await flushPromises();

      expect(store.deleteDraft).toHaveBeenCalledWith(1);
    });
  });
});
