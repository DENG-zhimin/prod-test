import { defineStore } from 'pinia';
import {
  BleDevice,
  // BleService,
} from '@capacitor-community/bluetooth-le';
import { LocalStorage as LS } from 'quasar';

export type lBleDev = BleDevice & {
  lName: string | undefined; // local name
  connected: boolean | undefined;
  bonded: boolean | undefined;
};

const currDev = <lBleDev>{
  name: 'currDev',
  deviceId: 'a:b:c',
  lName: '',
};

export const useBleStore = defineStore('ble', {
  state: () => ({
    currDev,
    selectDev: <cntBleDev>{},
    cntdDevs: <lBleDev[]>[],
    HBCntdDevs: <lBleDev[]>[],
    bndDevs: <lBleDev[]>[],
  }),
  getters: {},
  actions: {
    saveHBCntdDev(dev: lBleDev) {
      LS.set('HBCntdDevs.' + dev.deviceId, dev);
    },
    getHBCntdDevs(dev: lBleDev) {
      LS.getItem('HBCntdDevs.' + dev.deviceId);
    },

    increment() {
      // this.counter++;
    },
  },
});
