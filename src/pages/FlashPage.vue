<template>
  <q-page class="column items-center q-pa-sm">
    <div class="text-h4 q-my-sm">Flash Test</div>
    <q-separator class="full-width" inset />
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
    <q-separator class="full-width" inset />
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
    <q-separator class="full-width"></q-separator>
    <div class="col column q-pa-sm full-width justify-center">
      <div v-if="testFB.length > 0" class="row items-center justify-evenly">
        <q-btn color="warning" label="重置" @click="resetParam()"></q-btn>
        <q-btn color="primary" label="导出" @click="exportFile()"></q-btn>
      </div>
      <div
        class="row justify-center q-my-sm"
        style="overflow: auto; max-height: 450px"
      >
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
import { LocalStorage as LS } from 'quasar';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

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
    const threshold = ref(1);

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
          testFB.value.push(singleFB);
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
        // console.log(counter.value, 'out');
        if (step1 === 0) {
          if (counter.value === 0) {
            sendComm(); // send test command
          }
        } else {
          if (
            // counter number within continue time range
            // and same with continue step number
            counter.value < step1 * continueTimes.value &&
            counter.value % step1 === 0
          ) {
            sendComm(); // send test command
          }
        }

        counter.value++; // counter add, must before reset

        if (
          counter.value > 0 &&
          counter.value === step1 * continueTimes.value + step2
        ) {
          // reached all period time, reset counter
          counter.value = 0;
        }
      }, minimumPeriod.value); //
    };

    const stopTest = () => {
      testFlag.value = false;
      clearInterval(intervalHandle1.value);
      setTimeout(() => {
        // stop receive msg after 1000ms
        stopReceive();
      }, 1000);
      LS.set('test-report', testFB.value);
    };

    const sendComm = () => {
      const comm = flash_test_encode('FLASH');
      send(comm);
      sendCount.value++;
    };

    const resetParam = () => {
      continueSilence.value = 0;
      continueTimes.value = 1;
      cycleSilence.value = 1000;
      threshold.value = 5;
      enableThreshold.value = '1';
      sendCount.value = 0;
      receiveCount.value = 0;
      testFB.value.length = 0;
    };

    type FileWriteRes = { uri: string };

    const exportFile = async () => {
      try {
        let stream = '序号;时间;计数\n';
        // streampush(header.split(''));
        testFB.value.forEach((line) => {
          stream += line.count + ';' + line.time + ';' + line.fb + '\n';
        });
        if ($q.platform.is.mobile) {
          // mobile download
          const res = await Filesystem.writeFile({
            path: 'test-report.csv',
            data: stream,
            directory: Directory.Documents, // target directory file://Documents
            encoding: Encoding.UTF8,
          });
          const ret = res as FileWriteRes;
          $q.notify({
            message: ret.uri,
          });
        } else {
          // web download
          const stream2 = stream.split('');
          let blob = new Blob(stream2);
          const elink = document.createElement('a');
          elink.download = 'test-report.csv';
          elink.style.display = 'none';
          elink.href = URL.createObjectURL(blob);
          document.body.appendChild(elink);
          const link = elink.click();
          console.log(link);
          $q.notify({
            message: 'report downloaded ',
          });
          URL.revokeObjectURL(elink.href);
          elink.remove();
        }
      } catch (err) {
        const msg = (err as Error).message;
        $q.notify({
          message: msg,
        });
      }
    };

    onBeforeMount(() => {
      if ($q.platform.is.mobile) {
        BleClient.initialize();
      }
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
      resetParam,
      exportFile,
    };
  },
});
</script>
