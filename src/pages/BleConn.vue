<template>
  <q-page class="bg-white">
    <title-bar title="添加设备">
      <template v-slot:action>
        <div v-if="isMobile" class="q-px-md">
          <div>
            <q-btn @click="scan()" :loading="scanning" label="搜索" />
          </div>
        </div>
      </template>
    </title-bar>
    <div class="row q-pa-sm">
      <div
        v-if="results.length > 0"
        class="col-12 row ble-list q-gutter-y-sm q-pa-sm"
      >
        <div class="col-12" v-for="(ble, indexb) in results" :key="indexb">
          <q-card>
            <q-card-section
              class="text-grey-8 bg-white"
              clickable
              v-ripple
              @click.stop="connBle(ble)"
            >
              {{ ble.name + ' -- ' + ble.deviceId }}
            </q-card-section>
          </q-card>
        </div>
      </div>
      <div v-else></div>
      <div class="col-12 row justify-center" v-if="error">
        {{ error }}
      </div>
      <!-- <div>
        {{ bleStore.cntdDevs }}
      </div> -->
      <!-- <div class="q-pa-lg">默认pin码： 112233</div> -->
    </div>
  </q-page>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
} from 'vue';
import { BleClient, BleDevice } from '@capacitor-community/bluetooth-le';
import { bleModules } from 'src/utils/ble';
import { useQuasar } from 'quasar';
import { useBleStore, lBleDev } from 'src/stores/ble-store';
import TitleBar from 'src/components/TitleBar.vue';

export default defineComponent({
  name: 'BleConn',
  emits: ['bleConnected'],
  components: { TitleBar },
  setup() {
    const $q = useQuasar();
    const bleStore = useBleStore();
    const results = ref<BleDevice[]>([]);
    const scanning = ref(false);
    // const tried_scanning = ref(false);
    const error = ref('');
    const isMobile = $q.platform.is.mobile as boolean;

    const scanTime = 20000;

    const scan = async () => {
      results.value.length = 0; // scanning devices list
      // tried_scanning.value = true;
      try {
        if (isMobile) {
          scanning.value = true;
          await BleClient.requestLEScan({}, (res) => {
            const rssi = res.rssi as number;
            if (rssi > -90) {
              results.value.push(res.device);
            }
          }).finally(() => {
            scanning.value = false;
          });
          setTimeout(() => {
            void BleClient.stopLEScan().then(() => {
              scanning.value = false;
            });
          }, scanTime);
        } else {
          $q.notify({
            message: '非移动设备',
          });
        }
      } catch (err) {
        error.value = (err as Error).message;
        scanning.value = false;
      }
    };

    const connBle = async (ble: BleDevice) => {
      await BleClient.connect(ble.deviceId, () => {
        // callback on disconnect event
        const lBle = <lBleDev>ble; // change to extended type
        lBle.connected = false; // add status property
        bleStore.disconnect(lBle); // update ble status on pinia
        $q.notify({ message: ble.deviceId + ' 蓝牙连接已断开' });
      })
        .then(() => {
          // ctx.emit('bleConnected', ble);
          const ldev = <lBleDev>ble;
          ldev.connected = true;
          ldev.srvs = bleModules[0].value; // default srvs and characteristics value
          bleStore.cntdDevs.push(ldev);
          bleStore.updateName();
          if (results.value.length > 0) {
            results.value.forEach((item, index) => {
              if (item.deviceId === ble.deviceId) {
                results.value.splice(index, 1);
              }
            });
          }
          $q.notify({
            message: '设备连接成功',
          });
        })
        .catch((e: Error) => {
          $q.notify({
            message: e.message,
          });
        });
    };

    onBeforeMount(async () => {
      if (isMobile) {
        await BleClient.initialize();
      }
    });

    onBeforeUnmount(async () => {
      await BleClient.stopLEScan();
    });

    onMounted(() => {
      scan();
    });

    return {
      isMobile,
      results,
      error,
      scanning,
      connBle,
      scan,
      bleStore,
    };
  },
});
</script>

<style lang="scss" scoped>
.ble-list {
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
