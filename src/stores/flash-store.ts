import { defineStore } from 'pinia';

export type FlashFeedback = {
  time: string;
  value: string;
  count: number;
  time2: number;
};

const testFlag = false;
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
const enableThreshold = '1';
const threshold = <number | string>1;

export const useFlashStore = defineStore('flash', {
  state: () => ({
    testFlag,
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

    testResult: <FlashFeedback[]>[],
    reportHeader: <string>'',
  }),
  getters: {},
  actions: {},
});
