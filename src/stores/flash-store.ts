import { defineStore } from 'pinia';

export type FlashFeedback = {
  time: string;
  value: string;
  count: number;
  time2: number;
};

export type TestResult = {
  cycleId: number;
  prodName: string;
  prodModel: string;
  flashTimes: number;
  flashInterval: number;
  cycleInterval: number;
  commCount: number;
  responseCount: number;
  data: FlashFeedback[];
};

const cycleId = 1;
const testFlag = false;
const saveFlag = false;
const intervalHandler = <null | NodeJS.Timeout>null;
const prodName = ''; // testing product model
const prodModel = ''; // testing product model
const stopReason = ''; // as show on Name.
const continueTimes = 1; // 连闪次数
const continueSilence = 0; // 连闪间隔时间
const cycleSilence = 1000; // 周期间隔时间
const minimumPeriod = 10; // minimum period time
const counter = 0; // time slice counter, counter for testing interval
const sendCount = 0; // how many commands sent
const receiveCount = 0; // how many feedbacks received
const error = ''; // error msg
const threshold = <number | string>1; // default threshold 1

export const useFlashStore = defineStore('flash', {
  state: () => ({
    cycleId,
    showMsg: false,
    testFlag,
    saveFlag,
    thresholdAction: 0,
    thresholdActionTime: 0,
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
    threshold,

    testResult: <FlashFeedback[]>[
      // { time: '1.2.3', value: '9', count: 10 },
      // { time: '1.2.3', value: '8', count: 9 },
      // { time: '1.2.3', value: '7', count: 8 },
      // { time: '1.2.3', value: '9', count: 7 },
      // { time: '1.2.3', value: '32', count: 6 },
      // { time: '1.2.3', value: '19', count: 7 },
      // { time: '1.2.3', value: '0', count: 6 },
      // { time: '1.2.3', value: '98', count: 72 },
      // { time: '1.2.3', value: '0', count: 61 },
      // { time: '1.2.3', value: '98', count: 72 },
      // { time: '1.2.3', value: '43', count: 69 },
      // { time: '1.2.3', value: '0', count: 69 },
      // { time: '1.2.3', value: '48', count: 69 },
    ],
    testResults: <TestResult[]>[],
    reportHeader: <string>'',
  }),
  getters: {},
  actions: {},
});
