import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createTestingPinia } from '@pinia/testing';
import { useSeriesStore } from '@/stores/series';
import LeaderboardView from './LeaderboardView.vue';

vi.mock('@/api', () => ({
  getLeaderboard: vi.fn(),
}));

function buildRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/leaderboard', component: LeaderboardView },
      { path: '/drafts/new', component: { template: '<div />' } },
    ],
  });
}

async function mountLeaderboard(entries: any[] = []) {
  const router = buildRouter();
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: { series: { leaderboard: entries } },
  });

  router.push('/leaderboard');
  await router.isReady();

  const wrapper = mount(LeaderboardView, {
    global: {
      plugins: [router, pinia],
      stubs: {
        Card: { template: '<div class="card-stub"><slot name="content" /></div>' },
        Button: { template: '<button><slot /></button>' },
        DataTable: { template: '<div class="datatable-stub"><slot /></div>' },
        Column: { template: '<div />' },
      },
    },
  });

  const store = useSeriesStore(pinia);
  return { wrapper, store };
}

const sampleEntries = [
  { displayName: 'Alice', wins: 3, losses: 1, winPct: 0.75, championships: 2 },
  { displayName: 'Bob', wins: 2, losses: 2, winPct: 0.5, championships: 1 },
  { displayName: 'Charlie', wins: 1, losses: 3, winPct: 0.25, championships: 0 },
];

describe('LeaderboardView', () => {
  it('calls fetchLeaderboard on mount', async () => {
    const { store } = await mountLeaderboard();
    expect(store.fetchLeaderboard).toHaveBeenCalled();
  });

  describe('empty state', () => {
    it('shows "No results yet" message', async () => {
      const { wrapper } = await mountLeaderboard([]);
      expect(wrapper.text()).toContain('No results yet');
    });

    it('shows "Start a Draft" link', async () => {
      const { wrapper } = await mountLeaderboard([]);
      const links = wrapper.findAllComponents({ name: 'RouterLink' });
      const startLink = links.find(l => l.props('to') === '/drafts/new');
      expect(startLink).toBeTruthy();
    });

    it('does not render DataTable', async () => {
      const { wrapper } = await mountLeaderboard([]);
      expect(wrapper.find('.datatable-stub').exists()).toBe(false);
    });
  });

  describe('with entries', () => {
    it('renders display names', async () => {
      const { wrapper } = await mountLeaderboard(sampleEntries);
      expect(wrapper.text()).toContain('Alice');
      expect(wrapper.text()).toContain('Bob');
      expect(wrapper.text()).toContain('Charlie');
    });

    it('formats win percentage correctly', async () => {
      const { wrapper } = await mountLeaderboard(sampleEntries);
      expect(wrapper.text()).toContain('75.0%');
      expect(wrapper.text()).toContain('50.0%');
    });

    it('shows rank numbers', async () => {
      const { wrapper } = await mountLeaderboard(sampleEntries);
      const cards = wrapper.findAll('.card-stub');
      expect(cards.length).toBe(3);
      expect(cards[0].text()).toContain('1');
      expect(cards[1].text()).toContain('2');
      expect(cards[2].text()).toContain('3');
    });

    it('shows championship count', async () => {
      const { wrapper } = await mountLeaderboard(sampleEntries);
      expect(wrapper.text()).toContain('2 titles');
      expect(wrapper.text()).toContain('1 titles');
      expect(wrapper.text()).toContain('0 titles');
    });
  });
});
