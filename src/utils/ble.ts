import { BleClient, BleDevice } from '@capacitor-community/bluetooth-le';
import { lBleDev, useBleStore } from 'src/stores/ble-store';
import { useQuasar } from 'quasar';
import UTF8 from 'utf-8';

const $q = useQuasar();
const bleStore = useBleStore();

// ble srvid and characteristic for transparent transfer
/* const bleDev = {
  st: {
    srvId: '0000fdee-0000-1000-8000-00805f9b34fb',
    wCharId: '0000fda1-0000-1000-8000-00805f9b34fb', //  write
    nCharId: '0000fda1-0000-1000-8000-00805f9b34fb', //   notify
  },
  dx: {
    // dx: 大熊智能
    srvId: '0000ffe0-0000-1000-8000-00805f9b34fb',
    wCharId: '0000ffe1-0000-1000-8000-00805f9b34fb', //  write
    nCharId: '0000ffe2-0000-1000-8000-00805f9b34fb', //   notify
  },
}; */

const send = async (code: DataView) => {
  // check if ble dev been choosed.
  if (!bleStore.currDev.deviceId) {
    $q.notify({
      message: 'Please choose a device first.',
    });
    return null;
  }
  // send
  await BleClient.write(
    bleStore.currDev.deviceId,
    bleStore.bleModule.srvId,
    bleStore.bleModule.wCharId,
    code
  );
  // .then(res=>{
  //   console.log(res)
  // });
};

const notify = async () => {
  let msg = '';
  await BleClient.startNotifications(
    currDev.deviceId,
    bleStore.bleModule.srvId,
    bleStore.bleModule.nCharId,
    (resp) => {
      if (resp === null) return null;
      msg = parseNotifications(resp);
    }
  );
  return msg; // string
};

// parse ble feedback dataview to string by utf-8 encoding
const parseNotifications = function (data: DataView): string {
  // const retMsg = <number[]>[];
  const arr = <number[]>[];
  for (let i = 0; i < data.byteLength; i++) {
    arr.push(data.getUint8(i));
  }
  const ret = UTF8.getStringFromBytes(arr);
  return ret;
};

// command type
type Comm = {
  name: string;
  val: number;
};

const commandCode = <Comm[]>[{ name: 'FLASH', val: 1 }];

/*
  encode command and params to dataview
  @param comm string
  @param param1 number
  @param param2 number
  @param param3 number
  @param param4 number
  return  DataView
 */
const encode = (
  comm: string,
  param1 = 0,
  param2 = 0,
  param3 = 0,
  param4 = 0,
  param5 = 0,
  param6 = 0
) => {
  const header = 170; // 0xAA

  // get command code
  let commVal = 0;
  commandCode.forEach((el) => {
    if (el.name === comm) commVal = el.val;
  });

  // if (commVal === 0) return null;

  // get cs value
  const cs =
    header + commVal + param1 + param2 + param3 + param4 + param5 + param6;
  const buf = new ArrayBuffer(9);
  const dataView = new DataView(buf);
  dataView.setUint8(0, header);
  dataView.setUint8(1, commVal);
  dataView.setUint8(2, param1);
  dataView.setUint8(3, param2);
  dataView.setUint8(4, param3);
  dataView.setUint8(5, param4);
  dataView.setUint8(6, param5);
  dataView.setUint8(7, param6);
  dataView.setUint8(8, cs);
  return dataView;
};

/*
  encode flash light life testing code
 */
const flash_test_encode = (comm: string) => {
  const header1 = 85; // 0x55
  const header2 = 170; // 0xAA

  // get command code
  let commVal = 0;
  commandCode.forEach((el) => {
    if (el.name === comm) commVal = el.val;
  });

  // if (commVal === 0) return null;

  // get cs value
  // const cs =
  //   header + commVal + param1 + param2 + param3 + param4 + param5 + param6;
  const buf = new ArrayBuffer(3);
  const dataView = new DataView(buf);
  dataView.setUint8(0, header1);
  dataView.setUint8(1, header2);
  dataView.setUint8(2, commVal);
  return dataView;
};

const getConnDev = async function (): lBleDev[] {
  const devs = <BleDevice>[];
  await BleClient.getConnectedDevices([]).then((res) => {
    res.forEach((v) => {
      devs.push(v);
    });
  });
  return devs;
  // return [
  // { name: 'aaa', deviceId: 'asd' },
  // { name: 'aaabb', deviceId: 'asdewd' },
  // ];
};

const connect = async (dev: lBleDev) => {
  await BleClient.connect(dev.deviceId).then(() => {
    bleStore.cntdDevs.push(dev);
  });
};

const disConnect = async (dev: lBleDev) => {
  await BleClient.disconnect(dev.deviceId).then(() => {
    bleStore.cntdDevs.forEach((item, index) => {
      if (item.deviceId === dev.deviceId) {
        bleStore.cntdDevs.splice(index, 1);
      }
    });
    return true;
  });
  return false;
};

export {
  bleDev,
  encode,
  flash_test_encode,
  send,
  notify,
  parseNotifications,
  getConnDev,
  connect,
  disConnect,
};
