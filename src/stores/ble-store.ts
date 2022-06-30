import { defineStore } from 'pinia';
import {
  BleDevice,
  // BleService,
} from '@capacitor-community/bluetooth-le';
// import { LocalStorage as LS } from 'quasar';

const currDev = <BleDevice>{
  name: '',
  deviceId: '',
};

export const useBleStore = defineStore('ble', {
  state: () => ({
    currDev,
    connectedDevs: <BleDevice[]>[],
  }),
  getters: {},
  actions: {
    increment() {
      // this.counter++;
    },
  },
});
