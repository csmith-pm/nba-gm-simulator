import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createTestingPinia } from '@pinia/testing';
import { useDraftStore } from '@/stores/draft';
import DraftCreateView from './DraftCreateView.vue';

vi.mock('@/api', () => ({
  createDraft: vi.fn(),
}));

function buildRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/drafts/new', component: DraftCreateView },
      { path: '/drafts/:id', component: { template: '<div />' } },
    ],
  });
}

async function mountCreate() {
  const router = buildRouter();
  const pinia = createTestingPinia({ createSpy: vi.fn });

  router.push('/drafts/new');
  await router.isReady();

  const wrapper = mount(DraftCreateView, {
    global: {
      plugins: [router, pinia],
      stubs: {
        Card: { template: '<div><slot name="title" /><slot name="content" /></div>' },
        Button: { template: '<button type="submit"><slot /></button>' },
        Message: { template: '<div class="message"><slot /></div>' },
        InputText: {
          template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
          props: ['modelValue'],
          emits: ['update:modelValue'],
        },
        InputNumber: {
          template: '<input type="number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />',
          props: ['modelValue'],
          emits: ['update:modelValue'],
        },
        SelectButton: {
          template: '<div class="select-button"><button v-for="opt in options" :key="opt.value" @click="$emit(\'update:modelValue\', opt.value)">{{ opt.label }}</button></div>',
          props: ['modelValue', 'options', 'optionLabel', 'optionValue'],
          emits: ['update:modelValue'],
        },
        Checkbox: {
          template: '<input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
          props: ['modelValue'],
          emits: ['update:modelValue'],
        },
      },
    },
  });

  const store = useDraftStore(pinia);
  return { wrapper, store, router };
}

describe('DraftCreateView', () => {
  describe('rendering', () => {
    it('renders form with title', async () => {
      const { wrapper } = await mountCreate();
      expect(wrapper.find('form').exists()).toBe(true);
      expect(wrapper.text()).toContain('Create New Draft');
    });

    it('hides Player 2 name in online mode', async () => {
      const { wrapper } = await mountCreate();
      expect(wrapper.find('#team2Name').exists()).toBe(false);
    });

    it('shows Player 2 name in local mode', async () => {
      const { wrapper } = await mountCreate();
      const localBtn = wrapper.findAll('.select-button button').find(b => b.text() === 'Local Two-Player');
      await localBtn!.trigger('click');
      await flushPromises();
      expect(wrapper.find('#team2Name').exists()).toBe(true);
    });

    it('shows year range inputs when checkbox is checked (default)', async () => {
      const { wrapper } = await mountCreate();
      expect(wrapper.text()).toContain('Start Year');
      expect(wrapper.text()).toContain('End Year');
    });

    it('hides year range inputs when checkbox is unchecked', async () => {
      const { wrapper } = await mountCreate();
      const checkboxes = wrapper.findAll('input[type="checkbox"]');
      // First checkbox is useYearRange
      await checkboxes[0].setValue(false);
      await flushPromises();
      expect(wrapper.text()).not.toContain('Start Year');
    });

    it('hides draft class input by default', async () => {
      const { wrapper } = await mountCreate();
      expect(wrapper.text()).not.toContain('Draft Class Year');
    });

    it('shows draft class input when checkbox is checked', async () => {
      const { wrapper } = await mountCreate();
      const checkboxes = wrapper.findAll('input[type="checkbox"]');
      // Second checkbox is useDraftClass
      await checkboxes[1].setValue(true);
      await flushPromises();
      expect(wrapper.text()).toContain('Draft Class Year');
    });
  });

  describe('validation', () => {
    it('shows error when both filters are unchecked', async () => {
      const { wrapper, store } = await mountCreate();
      const checkboxes = wrapper.findAll('input[type="checkbox"]');
      await checkboxes[0].setValue(false);
      await flushPromises();

      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(wrapper.find('.message').text()).toBe('Select at least one filter criterion');
      expect(store.create).not.toHaveBeenCalled();
    });

    it('shows error when local mode and Player 2 name empty', async () => {
      const { wrapper, store } = await mountCreate();
      const localBtn = wrapper.findAll('.select-button button').find(b => b.text() === 'Local Two-Player');
      await localBtn!.trigger('click');
      await flushPromises();

      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(wrapper.find('.message').text()).toBe('Player 2 name is required for local mode');
      expect(store.create).not.toHaveBeenCalled();
    });
  });

  describe('success', () => {
    it('calls draftStore.create and navigates on success', async () => {
      const { wrapper, store, router } = await mountCreate();
      (store.create as any).mockResolvedValue({ id: 99 });

      const nameInput = wrapper.find('#name');
      await nameInput.setValue('My Draft');

      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(store.create).toHaveBeenCalledWith(
        'My Draft',
        expect.objectContaining({ activeYearRange: { start: 1970, end: 2024 } }),
        'online',
        undefined,
      );
      expect(router.currentRoute.value.path).toBe('/drafts/99');
    });

    it('passes team2Name in local mode', async () => {
      const { wrapper, store, router } = await mountCreate();
      (store.create as any).mockResolvedValue({ id: 50 });

      const localBtn = wrapper.findAll('.select-button button').find(b => b.text() === 'Local Two-Player');
      await localBtn!.trigger('click');
      await flushPromises();

      const team2Input = wrapper.find('#team2Name');
      await team2Input.setValue('Jordan');

      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(store.create).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        'local',
        'Jordan',
      );
      expect(router.currentRoute.value.path).toBe('/drafts/50');
    });
  });

  describe('errors', () => {
    it('shows server error message', async () => {
      const { wrapper, store } = await mountCreate();
      (store.create as any).mockRejectedValue({
        response: { data: { message: 'Duplicate name' } },
      });

      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(wrapper.find('.message').text()).toBe('Duplicate name');
    });

    it('shows fallback error when no message provided', async () => {
      const { wrapper, store } = await mountCreate();
      (store.create as any).mockRejectedValue(new Error('network'));

      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(wrapper.find('.message').text()).toBe('Failed to create draft');
    });
  });
});
