import { defineStore } from 'pinia';

export type FlashFeedback = {
  time: string;
  value: string;
  count: number;
  time2: number;
};

const testFlag = false;
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
    showMsg: false,
    testFlag,
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

    testResult: <FlashFeedback[]>[],
    reportHeader: <string>'',
  }),
  getters: {},
  actions: {},
});
