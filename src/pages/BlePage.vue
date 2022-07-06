<template>
  <q-page class="column bg-grey-3">
    <title-bar title="已连接的设备" />
    <div class="q-gutter-y-sm">
      <div class="q-px-sm bg-white">
        <div class="column text-body-2 text-bold text-primary">选定设备</div>
        <q-separator></q-separator>
        <div class="row items-center q-pa-sm">
          {{ currDevName }}
          <q-space></q-space>
          <div v-if="currDevName">
            <q-separator vertical />
            <q-btn flat @click="cleanCurrDev()">
              <!-- <q-icon name="settings" /> -->
              <q-icon
                class="text-h4"
                name="clear"
                style="transform: Rotate(0deg)"
              ></q-icon>
            </q-btn>
          </div>
        </div>
        <q-separator></q-separator>
        <div class="row items-center q-pa-sm" @click="goBleConn()">
          <q-icon size="sm" class="q-mr-sm" name="add_circle_outline"></q-icon>
          连接新设备
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
            {{ dev.lName ? dev.lName : dev.name ? dev.name : dev.deviceId }}
          </span>
          <q-space></q-space>
          <q-separator vertical />
          <q-btn flat @click="goBleDev(dev)">
            <q-icon name="settings" />
          </q-btn>
        </q-list>
      </div>
      <div class="q-px-sm bg-white">
        <div class="column text-body-2 text-bold text-primary">
          之前连接设备
        </div>
        <q-separator></q-separator>
        <q-list
          separator
          class="row items-center q-pa-xs"
          v-for="dev in recentDevs"
          :key="dev.deviceId"
        >
          <span class="material-icons text-h6 q-mr-sm">&#xE25F; </span>
          {{ dev.lName ? dev.lName : dev.name ? dev.name : dev.deviceId }}
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
import { defineComponent, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useBleStore, lBleDev } from 'src/stores/ble-store';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
// import { getConnDev } from 'src/utils/ble';

import TitleBar from 'src/components/TitleBar.vue';
import { BleClient } from '@capacitor-community/bluetooth-le';

export default defineComponent({
  name: 'BlePage',
  components: { TitleBar },
  setup() {
    const router = useRouter();
    const bleStore = useBleStore();
    const $q = useQuasar();

    const { currDev, cntdDevs, HBCntdDevs } = storeToRefs(bleStore);
    const isAndroid: boolean | undefined = $q.platform.is.android;

    const currDevName = computed(() => {
      return currDev.value.lName
        ? currDev.value.lName
        : currDev.value.name
        ? currDev.value.name
        : currDev.value.deviceId;
    });

    const recentDevs = computed(() => {
      const arr = <lBleDev[]>[];
      HBCntdDevs.value.forEach((item, index) => {
        let isRecent = 1;
        cntdDevs.value.forEach((el) => {
          if (item.deviceId === el.deviceId) {
            isRecent = 0;
          }
        });
        if (isRecent === 1) {
          arr.push(HBCntdDevs.value[index]);
        }
      });
      return arr;
    });

    const setCurrDev = (dev: lBleDev) => {
      // if (dev.deviceId !== currDev.value.deviceId) {
      let tmpDev = JSON.stringify(dev);
      currDev.value = JSON.parse(tmpDev) as lBleDev;
      // } else {
      //   $q.notify({
      //     message: '已选择该设备。',
      //   });
      // }
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

    const goBleConn = () => {
      router.push({
        name: 'bleconn',
      });
    };

    // get connected devs and update pinia
    const getConnDev = async () => {
      cntdDevs.value.length = 0;
      await BleClient.getConnectedDevices([]).then((res) => {
        res.forEach((v) => {
          let ldev = <lBleDev>v;
          ldev.connected = true;
          cntdDevs.value.push(ldev);
        });
      });
    };

    onMounted(async () => {
      if ($q.platform.is.mobile === true) {
        await BleClient.initialize();
        await getConnDev(); // get system connected devices
      }
      bleStore.updateName();
    });

    onBeforeUnmount(() => {
      //
    });

    return {
      currDevName,
      isAndroid,
      currDev,
      cntdDevs,
      HBCntdDevs,
      recentDevs,
      goBleDev,
      setCurrDev,
      cleanCurrDev,
      goBleConn,
    };
  },
});
</script>
