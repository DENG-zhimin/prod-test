import { defineStore } from 'pinia';
import { MainMenu } from './module';

export const useAppStore = defineStore('app', {
  state: () => ({ MainMenu }),
  getters: {},
  actions: {},
});
