<template>
  <q-page class="column items-center q-pa-sm">
    <div class="text-h5 q-my-sm">产品测试</div>
    <q-separator class="full-width" inset />
    <div class="row justify-evenly q-pa-xs">
      <q-input
        class="col-4"
        dense
        outlined
        v-model="prodName"
        label="产品名称(必填)"
      />
      <q-input class="col-4" dense outlined v-model="prodModel" label="型号" />
    </div>
    <q-separator class="full-width" inset />
    <div class="row full-width justify-evenly q-pa-xs q-mt-sm">
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

    <div class="row full-width q-ma-xs">
      <div class="col-4 row items-center q-ml-md">
        <q-select
          label="阀值设置"
          dense
          outlined
          v-model="thresholdAction"
          :options="thresholdActionOptions"
          map-options
          emit-value
        />
      </div>
      <div v-if="thresholdAction > 0" class="col-7 row justify-between">
        <q-input
          class="col-5"
          dense
          outlined
          label="阀值"
          type="number"
          v-model="threshold"
        />
        <q-input
          v-if="thresholdAction === 2"
          class="col-5"
          dense
          outlined
          label="暂停时间/秒"
          type="number"
          v-model="thresholdActionTime"
        />

        <!-- <div class="row items-center">启用阀值：</div>
        <q-radio v-model="enableThreshold" val="1" label="是" />
        <q-radio v-model="enableThreshold" val="0" label="否" /> -->
      </div>
      <div v-else>
        <q-space></q-space>
      </div>
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
        :color="startFlag ? 'grey-7' : 'green'"
        :disable="startFlag"
        @click="startTest()"
        label="开始"
      />
      <q-btn
        :disable="!testFlag"
        :color="testFlag === true ? 'negative' : 'grey-7'"
        @click="manualStopTest()"
        label="停止"
      />
      <!-- <q-btn color="negative" @click="showExportDialog = true" label="show" /> -->
    </div>
    <!-- <div class="col-6 row justify-evenly q-my-sm full-width">
      <q-btn color="green" @click="startReceive()" label="开始接收" />
      <q-btn color="negative" @click="stopReceive()" label="停止接收" />
    </div> -->
    <q-separator class="full-width"></q-separator>
    <div class="col column q-pa-sm full-width">
      <div
        v-if="testResult.length > 0"
        class="row items-center justify-end q-pr-md"
      >
        <q-btn
          outline
          color="negative"
          label="重置"
          @click="resetParam()"
        ></q-btn>
        <q-btn
          class="q-ml-lg"
          color="primary"
          label="数据分析"
          @click="goAnalysis()"
        ></q-btn>
      </div>
      <div
        class="row justify-center q-my-sm"
        style="overflow: auto; max-height: 450px"
      >
        <q-list separator dense>
          <q-item v-for="test in testResult" :key="test.time">
            <q-item-section>
              {{
                ' 序号：' +
                test.count +
                ' 时间：' +
                test.time.substring(test.time.length - 12) +
                ' 亮度：' +
                test.value
              }}
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
    <div class="q-pa-sm">
      <!-- {{ testResult }} -->
      {{ error }}
    </div>
    <q-dialog v-model="showMsg" pointer-events="all">
      <div class="column items-center q-gutter-sm bg-white q-pa-sm">
        <div class="row items-center q-pa-sm">测试中, 不能离开。</div>
        <div class="q-mt-md">
          <q-btn
            outline
            unelevated
            color="primary"
            label="知道了"
            type="button"
            @click="showMsg = false"
          />
        </div>
      </div>
    </q-dialog>
  </q-page>
</template>
<script lang="ts">
import {
  defineComponent,
  onMounted,
  onBeforeMount,
  watch,
  computed,
  // computed,
} from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { send, parseNotifications, flash_test_encode } from 'src/utils/ble';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { useBleStore, lBleDev } from 'src/stores/ble-store';
import { formatTime } from 'src/utils/comm';
import { useRouter } from 'vue-router';
import { FlashFeedback, useFlashStore } from 'src/stores/flash-store';

export default defineComponent({
  name: 'FlashTestPage',
  setup() {
    const $q = useQuasar();
    //  check if mobile platform
    if ($q.platform.is.mobile) {
      // keep awake
      KeepAwake.keepAwake();
    }

    const flashStore = useFlashStore();
    const {
      showMsg,
      testFlag,
      thresholdAction,
      thresholdActionTime,
      intervalHandler,
      prodName,
      prodModel,
      stopReason,
      continueTimes,
      continueSilence,
      cycleSilence,
      minimumPeriod,
      counter,
      sendCount,
      receiveCount,
      error,
      enableThreshold,
      threshold,

      testResult,
    } = storeToRefs(flashStore);

    const intervalList = <number[]>[];

    const bleStore = useBleStore();
    const { currDev } = storeToRefs(bleStore);

    const startFlag = computed(() => {
      return testFlag.value === true || currDev.value.deviceId === '';
    });

    const router = useRouter();

    const restTime = computed(() => {
      return thresholdActionTime.value * 1000;
    });

    const thresholdActionOptions = [
      { label: '关闭阀值', value: 0 },
      { label: '停止测试', value: 1 },
      { label: '暂停继续', value: 2 },
    ];

    // const intervalHandler = ref();

    const startReceive = () => {
      // try {
      BleClient.startNotifications(
        currDev.value.deviceId,
        currDev.value.srvs.srvId,
        currDev.value.srvs.nCharId,
        (res) => {
          receiveCount.value++;
          let time = new Date();
          let t = formatTime(time); // 2022-06-10 10:10:10:888
          // t = t.substring(t.length -12);
          let val = parseNotifications(res);
          let singleFB = <FlashFeedback>{
            time: t,
            time2: time.getTime(),
            value: val,
            count: receiveCount.value,
          };
          testResult.value.unshift(singleFB);
          const ret = parseInt(val); //return numbers
          if (typeof threshold.value === 'string') {
            threshold.value = parseInt(threshold.value);
          }
          if (enableThreshold.value === '1') {
            if (ret < threshold.value) {
              switch (thresholdAction.value) {
                // 阀值动作
                case 1: // 停止
                  stopReason.value = '触发阀值停止';
                  stopTest();
                  break;
                case 2: // 暂停后继续
                  stopTest();
                  setTimeout(() => {
                    startTest();
                  }, restTime.value);
                  break;
              }
            }
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
        currDev.value.deviceId,
        currDev.value.srvs.srvId,
        currDev.value.srvs.nCharId
      );
    };

    const startTest = async () => {
      if (prodName.value === '') {
        $q.notify({
          message: '请填写测试产品名称',
        });
        return null;
      }
      testFlag.value = true; // change status flag
      startReceive(); // start notify receiver
      cycleSend(); // start command sender
    };

    const cycleSend = async () => {
      intervalHandler.value = setInterval(() => {
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

      intervalList.push(Number(intervalHandler.value));
    };

    const manualStopTest = async () => {
      stopReason.value = '手动停止';
      stopTest();
    };
    const stopTest = async () => {
      testFlag.value = false;
      intervalList.forEach((intv) => {
        // clear multiple times
        // clearInterval(Number(intv));
        clearInterval(intv);
      });
      setTimeout(() => {
        // stop receive msg after 1000ms
        stopReceive();
      }, 500);
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
      testResult.value.length = 0;
    };

    const goAnalysis = () => {
      // exportReport(); // trigger export
      router.push('/dataAnalysis');
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

    watch(currDev, (newVal: lBleDev) => {
      if (newVal.deviceId === '' && testFlag.value === true) {
        stopReason.value = '蓝牙连接断开';
        stopTest();
        $q.notify({
          message: '蓝牙连接断开，测试停止。',
        });
      }
    });

    return {
      showMsg,
      testResult,
      thresholdAction,
      thresholdActionOptions,
      thresholdActionTime,
      prodName,
      prodModel,
      currDev,
      minimumPeriod,
      enableThreshold,
      threshold,
      sendCount,
      receiveCount,
      startFlag,
      testFlag,
      continueTimes,
      continueSilence,
      cycleSilence,
      stopReason,
      // showExportDialog,
      error,
      startTest,
      startReceive,
      manualStopTest,
      stopTest,
      stopReceive,
      resetParam,
      goAnalysis,
    };
  },
});
</script>
