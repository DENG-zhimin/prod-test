import { defineStore } from 'pinia';

export type FlashFeedback = {
  time: string;
  value: string;
  count: number;
  time2: number;
};

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

    testResult: <FlashFeedback[]>[
      { count: 13, time: '2022-07-08 18:33:16:760', value: '4' },
      { count: 12, time: '2022-07-08 18:33:16:760', value: '5' },
      { count: 11, time: '2022-07-08 18:33:16:760', value: '6' },
      { count: 10, time: '2022-07-08 18:33:15:760', value: '5' },
      { count: 9, time: '2022-07-08 18:33:14:760', value: '6' },
      { count: 8, time: '2022-07-08 18:33:13:760', value: '7' },
      { count: 7, time: '2022-07-08 18:33:12:760', value: '9' },
      { count: 6, time: '2022-07-08 18:33:11:760', value: '8' },
      { count: 5, time: '2022-07-08 18:33:10:760', value: '9' },
      { count: 4, time: '2022-07-08 18:33:09:760', value: '9' },
      { count: 3, time: '2022-07-08 18:33:08:760', value: '9' },
      { count: 2, time: '2022-07-08 18:33:07:760', value: '9' },
      { count: 1, time: '2022-07-08 18:33:06:760', value: '9' },
    ],
    reportHeader: <string>'',
  }),
  getters: {},
  actions: {},
});
