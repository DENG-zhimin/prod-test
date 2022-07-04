<template>
  <q-page class="column bg-grey-3">
    <title-bar title="已连接的设备" />
    <div class="q-gutter-y-sm">
      <div class="q-px-sm bg-white">
        <div class="column text-body-2 text-bold text-primary">选定设备</div>
        <q-separator></q-separator>
        <div class="row items-center">
          {{ currDevName }}
          <q-space></q-space>
          <div v-if="currDevName">
            <q-separator vertical />
            <q-btn flat @click="cleanCurrDev()">
              <!-- <q-icon name="settings" /> -->
              <span class="text-h4" style="transform: Rotate(45deg)">+</span>
            </q-btn>
          </div>
        </div>
      </div>
      <div class="q-px-sm bg-white">
        <div class="column text-body-2 text-bold text-primary">已连接设备</div>
        <q-separator></q-separator>
        <q-list
          separator
          class="row items-center q-pa-xs"
          v-for="dev in cntdDevs"
          :key="dev.deviceId"
        >
          <span class="material-icons text-h6 q-mr-sm">&#xE25F; </span>
          <span @click="setCurrDev(dev)" style="cursor: pointer">
            {{ dev.name }}
          </span>
          <q-space></q-space>
          <q-separator vertical />
          <q-btn flat @click="goBleDev(dev)">
            <q-icon name="settings" />
          </q-btn>
        </q-list>
      </div>
      <div class="q-px-sm bg-white">
        <div class="column text-body-2 text-bold text-primary">已绑定设备</div>
        <q-separator></q-separator>
        <q-list
          separator
          class="row items-center q-pa-xs"
          v-for="dev in bndDevs"
          :key="dev.deviceId"
        >
          <span class="material-icons text-h6 q-mr-sm">&#xE25F; </span>
          {{ dev.name }}
          <q-space></q-space>
          <q-separator vertical />
          <q-btn flat @click="goBleDev(dev)">
            <q-icon name="settings" />
          </q-btn>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useBleStore, lBleDev } from 'src/stores/ble-store';
import { storeToRefs } from 'pinia';
// import { BleClient } from '@capacitor-community/bluetooth-le';
import { useQuasar } from 'quasar';

import TitleBar from 'src/components/TitleBar.vue';

export default defineComponent({
  name: 'BlePage',
  components: { TitleBar },
  setup() {
    const router = useRouter();
    const bleStore = useBleStore();
    const $q = useQuasar();

    const { currDev, cntdDevs, bndDevs } = storeToRefs(bleStore);
    const isAndroid: boolean | undefined = $q.platform.is.android;

    const currDevName = computed(() => {
      return currDev.value.lName
        ? currDev.value.lName
        : currDev.value.name
        ? currDev.value.name
        : currDev.value.deviceId;
    });

    cntdDevs.value = <lBleDev[]>[
      { name: 'aaa', deviceId: 'abcd' },
      { name: '', deviceId: 'aabbb' },
      { name: 'ccc', deviceId: 'cccdd' },
    ];

    bndDevs.value = <lBleDev[]>[
      { name: 'aaa', deviceId: 'abcd' },
      { name: 'eee', deviceId: 'eeee' },
      { name: 'fff', deviceId: 'ffff' },
    ];

    const setCurrDev = (dev: lBleDev) => {
      currDev.value = dev;
    };

    const cleanCurrDev = () => {
      currDev.value = Object.assign(currDev.value, {
        name: '',
        deviceId: '',
        lName: '',
      });
    };

    const goBleDev = (dev: lBleDev) => {
      router.push({ name: 'bledev', params: { devId: dev.deviceId } });
    };

    return {
      currDevName,
      isAndroid,
      currDev,
      cntdDevs,
      bndDevs,
      goBleDev,
      setCurrDev,
      cleanCurrDev,
    };
  },
});
</script>
