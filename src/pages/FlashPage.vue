<template>
  <q-page class="column items-center">
    <h4>flash testing</h4>
    <div class="row full-width justify-evenly q-ma-md">
      <q-input
        outlined
        label="连闪次数"
        type="number"
        v-model="continueTimes"
      />
      <q-input
        outlined
        label="连闪间隔/毫秒"
        type="number"
        v-model="continueSilence"
      />
      <q-input
        outlined
        label="周期间隔/毫秒"
        type="number"
        v-model="cycleSilence"
      />
    </div>
    <q-separator inset />
    <div class="col-6 row justify-evenly full-width q-ma-md">
      <q-btn color="green" @click="startTest()" label="开始测试" />
      <q-btn color="negative" @click="stopTest()" label="停止测试" />
    </div>
    <!-- <div class="col-6 row justify-evenly q-my-sm full-width">
      <q-btn color="green" @click="startReceive()" label="开始接收" />
      <q-btn color="negative" @click="stopReceive()" label="停止接收" />
    </div> -->
    <q-separator></q-separator>
    <div class="row q-pa-sm full-width justify-center">
      <div class="row justify-center q-my-sm">
        <q-list dense>
          <q-item v-for="test in testFB" :key="test.time">
            <q-item-section>
              {{
                ' 序号：' +
                test.count +
                '时间：' +
                test.time.substring(test.time.length, -12) +
                ' 亮度：' +
                test.fb
              }}
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
  count: number;
  time2: number;
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
    const continueTimes = ref(1000);
    const continueSilence = ref(1000);
    const cycleSilence = ref(1000);

    const count = ref(0);

    const error = ref('');

    const bleStore = useBleStore();

    const testFB = ref(<FlashFeedback[]>[]);

    const intervalHandle = ref();

    const startReceive = () => {
      // try {
      BleClient.startNotifications(
        bleStore.currDev.deviceId,
        bleDev[bleBrand].srvId,
        bleDev[bleBrand].nCharId,
        (res) => {
          let time = new Date();
          let t = formatTime(time);
          let fb = parseNotifications(res);
          let singleFB = <FlashFeedback>{
            time: t,
            time2: time.getTime(),
            fb: fb,
            count: count.value,
          };
          testFB.value.unshift(singleFB);
          count.value++;
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
        for (let i = 0; i < continueTimes.value; i++) {
          setTimeout(() => {
            sendComm();
          }, continueSilence.value);
        }
      }, cycleSilence.value);
    };
    const stopTest = () => {
      testFlag.value = false;
      clearInterval(intervalHandle.value);
      stopReceive();
    };

    const sendComm = async () => {
      const comm = flash_test_encode('FLASH');
      await send(comm);
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
      continueTimes,
      continueSilence,
      cycleSilence,
      error,
      startTest,
      startReceive,
      stopTest,
      stopReceive,
    };
  },
});
</script>
