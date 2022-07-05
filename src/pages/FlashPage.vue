<template>
  <q-page class="column items-center">
    <h1>flash testing</h1>
    <div class="col-6 row justify-evenly full-width">
      <q-btn color="green" @click="testFlag = true" label="开始" />
      <q-btn color="negative" @click="testFlag = false" label="停止" />
    </div>
    <div class="row justify-center">
      <q-input type="number" v-model="freq" />
    </div>
    {{ testFB }}
  </q-page>
</template>
<script lang="ts">
import { ref, defineComponent, onMounted, onBeforeMount } from 'vue';
import { useQuasar } from 'quasar';
import { KeepAwake } from '@capacitor-community/keep-awake';
import {
  send,
  parseNotifications,
  bleDev,
  bleBrand,
  flash_test_encode,
} from 'src/utils/ble';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { useBleStore } from 'src/stores/ble-store';
import { formatTime } from 'src/utils/comm';

type FlashFeedback = {
  time: string;
  fb: number;
};

export default defineComponent({
  name: 'FlashTestPage',
  setup() {
    const $q = useQuasar();
    //  check if mobile platform
    if ($q.platform.is.mobile) {
      // keep awake
      KeepAwake.keepAwake();
    }

    const testFlag = ref(false);
    const freq = ref(1000);

    const error = ref('');

    const bleStore = useBleStore();

    const testFB = <FlashFeedback[]>[];

    const bleInit = async () => {
      try {
        await BleClient.initialize();
        // bleEnabled.value = await BleClient.isEnabled();
        await BleClient.startNotifications(
          bleStore.currDev.deviceId,
          bleDev[bleBrand].srvId,
          bleDev[bleBrand].nCharId,
          (res) => {
            let t = formatTime(new Date());
            let fb = parseNotifications(res);
            let singleFB = <FlashFeedback>{
              time: t,
              fb: fb,
            };
            testFB.unshift(singleFB);
          }
        );
      } catch (err) {
        error.value = (err as Error).message;
      }
    };

    const start = () => {
      testFlag.value = true;
    };
    const stop = () => {
      testFlag.value = false;
    };
    onBeforeMount(() => {
      BleClient.initialize();
    });

    // receive msg from ble
    onMounted(async () => {
      bleInit();
      setInterval(() => {
        if (!testFlag.value) return null;
        const comm = flash_test_encode('FLASH');
        send(comm);
      }, freq.value);
    });

    return {
      testFB,
      testFlag,
      freq,
      start,
      stop,
    };
  },
});
</script>
