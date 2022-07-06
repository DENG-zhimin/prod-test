<template>
  <q-page class="column items-center">
    <div class="text-h4 q-my-md">Flash Test</div>
    <div class="row full-width justify-evenly q-ma-md">
      <q-input
        class="col-3"
        dense
        outlined
        label="连闪次数"
        type="number"
        v-model="continueTimes"
      />
      <q-input
        class="col-3"
        dense
        outlined
        label="连闪间隔/毫秒"
        type="number"
        v-model="continueSilence"
      />
      <q-input
        class="col-3"
        dense
        outlined
        label="周期间隔/毫秒"
        type="number"
        v-model="cycleSilence"
      />
    </div>
    <q-separator inset />
    <div class="col-6 row justify-evenly full-width q-ma-md">
      <div class="col-6 row items-center bg-grey-7 text-white q-px-xs">
        <div class="col-6">发送：{{ sendCount }}</div>
        <div class="col-6">收到： {{ receiveCount }}</div>
      </div>
      <q-btn
        color="green"
        :disable="testFlag"
        @click="startTest()"
        label="开始"
      />
      <q-btn color="negative" @click="stopTest()" label="停止" />
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
                ' 时间：' +
                test.time.substring(test.time.length - 12) +
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
import { ref, defineComponent, onMounted, onBeforeMount, watch } from 'vue';
import { useQuasar } from 'quasar';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { send, parseNotifications, flash_test_encode } from 'src/utils/ble';
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
    const continueTimes = ref(1);
    const continueSilence = ref(1000);
    const cycleSilence = ref(1000);

    const sendCount = ref(0);
    const receiveCount = ref(0);

    const error = ref('');

    const bleStore = useBleStore();
    // const { ble = storeToRefs(bleStore);

    const testFB = ref(<FlashFeedback[]>[]);

    const intervalHandle = ref();

    const startReceive = () => {
      // try {
      BleClient.startNotifications(
        bleStore.currDev.deviceId,
        bleStore.bleModule.srvId,
        bleStore.bleModule.nCharId,
        (res) => {
          receiveCount.value++;
          let time = new Date();
          let t = formatTime(time);
          let fb = parseNotifications(res);
          let singleFB = <FlashFeedback>{
            time: t,
            time2: time.getTime(),
            fb: fb,
            count: receiveCount.value,
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
        bleStore.bleModule.srvId,
        bleStore.bleModule.nCharId
      );
    };

    const startTest = () => {
      testFlag.value = true;
      startReceive();
      console.log(continueSilence.value);
      const cycleTime =
        continueTimes.value * continueSilence.value + cycleSilence.value * 1; // value changed to string after input.
      intervalHandle.value = setInterval(() => {
        for (let i = 0; i < continueTimes.value; i++) {
          sleep(continueSilence.value);
          sendComm();
        }
      }, cycleTime);
    };

    const sleep = (delay: number) => {
      const start = new Date().getTime();
      while (new Date().getTime() - start < delay) {
        continue;
      }
    };

    const stopTest = () => {
      testFlag.value = false;
      clearInterval(intervalHandle.value);
      stopReceive();
    };

    const sendComm = async () => {
      const comm = flash_test_encode('FLASH');
      await send(comm);
      sendCount.value++;
    };

    onBeforeMount(() => {
      BleClient.initialize();
    });

    // receive msg from ble
    onMounted(async () => {
      // bleInit();
    });

    watch(continueSilence, (newVal: number, oldVal: number) => {
      if (newVal < 500) {
        continueSilence.value = oldVal;
      }
    });
    watch(cycleSilence, (newVal: number, oldVal: number) => {
      if (newVal < 500) {
        cycleSilence.value = oldVal;
      }
    });
    watch(continueTimes, (newVal: number, oldVal: number) => {
      if (newVal < 1) {
        continueTimes.value = oldVal;
      }
    });

    return {
      sendCount,
      receiveCount,
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
