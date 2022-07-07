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
    <div class="row justify-evenly full-width q-ma-md">
      <q-input
        class="col-4"
        dense
        outlined
        label="阀值"
        type="number"
        v-model="threshold"
      />
      <q-radio v-model="enableThreshold" val="1" label="是" />
      <q-radio v-model="enableThreshold" val="0" label="否" />
    </div>
    <q-separator inset />
    <div class="row justify-evenly full-width q-ma-md">
      <div
        class="col-6 row items-center bg-grey-7 text-bold text-white q-px-xs"
      >
        <div class="col-6">发送：{{ sendCount }}</div>
        <div class="col-6">接收：{{ receiveCount }}</div>
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
import {
  ref,
  defineComponent,
  onMounted,
  onBeforeMount,
  watch,
  // computed,
} from 'vue';
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
    const continueSilence = ref(0);
    const cycleSilence = ref(1000);
    const minimumPeriod = ref(10); // minimum period time
    const counter = ref(0);

    const sendCount = ref(0);
    const receiveCount = ref(0);

    const error = ref('');

    const enableThreshold = ref('1');
    const threshold = ref(5);

    const bleStore = useBleStore();
    // const { ble = storeToRefs(bleStore);

    const testFB = ref(<FlashFeedback[]>[]);

    const intervalHandle1 = ref();

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
          const ret = parseInt(fb); //return numbers
          if (enableThreshold.value === '1' && ret < threshold.value) {
            stopTest();
          }
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

    const startTest = async () => {
      testFlag.value = true;
      startReceive();
      cycleSend();
    };

    const cycleSend = async () => {
      intervalHandle1.value = setInterval(() => {
        // set a timer and handler

        // calc the step number against minimumPeriod time.
        const step1 = continueSilence.value / minimumPeriod.value;
        const step2 = cycleSilence.value / minimumPeriod.value;
        // console.log(counter.value, counter2);
        if (
          // counter number within continue time range
          // and same with continue step number
          counter.value < step1 * continueTimes.value &&
          counter.value % step1 === 0
        ) {
          sendComm(); // send test command
          // const t = new Date();
          // const mark = t.getSeconds() + '.' + t.getMilliseconds();
          // console.log(counter.value, mark);
        }

        if (
          counter.value > 0 &&
          counter.value % (step1 * continueTimes.value + step2) === 0
        ) {
          // reached all period time, reset counter
          counter.value = 0;
        }
        counter.value++; // counter add
      }, minimumPeriod.value); //
    };

    const stopTest = () => {
      testFlag.value = false;
      clearInterval(intervalHandle1.value);
      stopReceive();
    };

    const sendComm = () => {
      const comm = flash_test_encode('FLASH');
      send(comm);
      sendCount.value++;
    };

    onBeforeMount(() => {
      BleClient.initialize();
    });

    // receive msg from ble
    onMounted(async () => {
      // bleInit();
    });

    watch(
      continueSilence,
      (newVal: number | string, oldVal: number | string) => {
        if (newVal >= 500) {
          continueSilence.value =
            Math.floor(continueSilence.value / minimumPeriod.value) *
            minimumPeriod.value;
        } else if (
          (newVal === 0 || newVal === '0') &&
          continueTimes.value === 1
        ) {
          continueSilence.value = 0;
        } else {
          // minimum 10ms periods
          continueSilence.value = oldVal as number;
        }
      }
    );
    watch(cycleSilence, (newVal: number | string) => {
      if (newVal < 500) {
        cycleSilence.value = 500;
      } else {
        // minimum 10ms periods
        cycleSilence.value =
          Math.floor(cycleSilence.value / minimumPeriod.value) *
          minimumPeriod.value;
      }
    });
    watch(continueTimes, (newVal: number | string, oldVal: number | string) => {
      if (newVal < 1) {
        continueTimes.value = oldVal as number;
      } else if (newVal === 1) {
        continueSilence.value = 0;
      } else {
        continueTimes.value = Math.floor(continueTimes.value);
        if (continueSilence.value < 500) {
          continueSilence.value = 500;
        }
      }
    });

    return {
      minimumPeriod,
      enableThreshold,
      threshold,
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
