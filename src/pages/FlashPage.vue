<template>
  <q-page class="column items-center">
    <h4>flash testing</h4>
    <div class="col-6 row justify-evenly full-width">
      <q-btn color="green" @click="startTest()" label="开始测试" />
      <q-btn color="negative" @click="stopTest()" label="停止测试" />
    </div>
    <!-- <div class="col-6 row justify-evenly q-my-sm full-width">
      <q-btn color="green" @click="startReceive()" label="开始接收" />
      <q-btn color="negative" @click="stopReceive()" label="停止接收" />
    </div> -->
    <div class="row justify-center">
      <q-input type="number" v-model="freq" />
    </div>
    <div class="row q-pa-sm full-width justify-center">
      <div class="row justify-center q-my-sm">
        <q-list dense>
          <q-item v-for="test in testFB" :key="test.time">
            <q-item-section>
              {{ test.time + ' ' }}
              {{ test.fb }}
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
    <div class="q-pa-sm">
      <!-- {{ testFB }} -->
      {{ error }}
    </div>
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
  fb: string;
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

    const testFB = ref(<FlashFeedback[]>[
      { time: 'asksdj', fb: '50' },
      { time: 'asksdj', fb: '50' },
      { time: 'asksdj', fb: '50' },
      { time: 'asksdj', fb: '50' },
    ]);

    const intervalHandle = ref();

    const startReceive = () => {
      // try {
      BleClient.startNotifications(
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
          testFB.value.unshift(singleFB);
        }
      );
      // } catch (err) {
      //   error.value = (err as Error).message;
      //   // $q.notify({
      //   //   message: error.value,
      //   // });
      // }
    };

    const stopReceive = () => {
      BleClient.stopNotifications(
        bleStore.currDev.deviceId,
        bleDev[bleBrand].srvId,
        bleDev[bleBrand].nCharId
      );
    };

    const startTest = () => {
      testFlag.value = true;
      startReceive();
      intervalHandle.value = setInterval(function () {
        // if (!testFlag.value) return null;
        const comm = flash_test_encode('FLASH');
        send(comm);
      }, freq.value);
    };
    const stopTest = () => {
      testFlag.value = false;
      clearInterval(intervalHandle.value);
      stopReceive();
    };
    onBeforeMount(() => {
      BleClient.initialize();
    });

    // receive msg from ble
    onMounted(async () => {
      // bleInit();
    });

    return {
      testFB,
      testFlag,
      freq,
      error,
      startTest,
      startReceive,
      stopTest,
      stopReceive,
    };
  },
});
</script>
