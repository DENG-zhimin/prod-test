<template>
  <q-page class="column items-center">
    <h1>flash testing</h1>
    {{ testFB }}
  </q-page>
</template>
<script lang="ts">
import { ref, defineComponent, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { /* send, */ parseNotifications, bleDev } from 'src/utils/ble';
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

    const error = ref('');

    const bleStore = useBleStore();

    const testFB = <FlashFeedback[]>[];

    const bleInit = async () => {
      try {
        await BleClient.initialize();
        // bleEnabled.value = await BleClient.isEnabled();
        await BleClient.startNotifications(
          bleStore.currDev.deviceId,
          bleDev.srvId,
          bleDev.characteristicId,
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

    // receive msg from ble
    onMounted(async () => {
      bleInit();
    });

    return {
      testFB,
    };
  },
});
</script>
