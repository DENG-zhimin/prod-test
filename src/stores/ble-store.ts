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
  name: '',
  deviceId: '',
  lName: '',
};

// const bondDevs = LS.getItem('bondDevs')
// const bondDevs = [
//   { name: 'aaa', deviceId: 'abcd' },
//   { name: 'eee', deviceId: 'eeee' },
//   { name: 'fff', deviceId: 'ffff' },
// ];

const HBCntdDevs = LS.getItem('HBCntdDevs');

export const useBleStore = defineStore('ble', {
  state: () => ({
    currDev,
    selectDev: <cntBleDev>{},
    cntdDevs: <lBleDev[]>[
      { name: 'aaa', deviceId: 'abcd', connected: true },
      { name: 'bbb', deviceId: 'aabbb', connected: true },
      // { name: 'ccc', deviceId: 'cccdd', connected: true },
      // { name: 'ddd', deviceId: 'ddd', connected: true },
      // { name: 'eee', deviceId: 'eeee', connected: true },
      // { name: 'fff', deviceId: 'ffff', connected: true },
    ],
    HBCntdDevs: <lBleDev[]>HBCntdDevs,
    // bondDevs: <lBleDev[]>bondDevs,
  }),
  getters: {},
  actions: {
    saveHBCntdDev(dev: lBleDev) {
      const savedDevs = <lBleDev[]>[];
      const oldSaved = this.HBCntdDevs;
      if (oldSaved) {
        savedDevs.push(...oldSaved);
      }

      let newItem = 1;
      if (savedDevs.length > 0) {
        savedDevs.forEach((item, index) => {
          if (item.deviceId === dev.deviceId) {
            newItem = 0;
            // console.log(dev.name);
            savedDevs[index].lName = dev.lName;
            savedDevs[index].connected = false;
          }
        });
      }
      if (newItem === 1) {
        dev.connected = false;
        savedDevs.push(dev);
      }
      LS.set('HBCntdDevs', savedDevs);
    },
    updateName() {
      this.cntdDevs = updateDevName(this.cntdDevs);
    },
    disconnect(dev: BleDevice) {
      if (this.currDev.deviceId === dev.deviceId) {
        this.currDev = Object.assign(this.currDev, {
          name: '',
          lName: '',
          deviceId: '',
        });
      }
      this.cntdDevs.forEach((item, index) => {
        if (item.deviceId === dev.deviceId) {
          this.cntdDevs.splice(index, 1);
        }
      });
    },
  },
});

const updateDevName = (arr: lBleDev[]) => {
  const savedDevs = LS.getItem('HBCntdDevs');
  arr.forEach((item, index) => {
    savedDevs.forEach((el) => {
      if (item.deviceId === el.deviceId) {
        arr[index].lName = el.lName;
      }
    });
  });
  return arr;
};
