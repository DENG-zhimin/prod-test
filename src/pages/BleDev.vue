<template>
  <q-page class="column bg-grey-3">
    <title-bar title="设备信息" />
    <div class="column q-pa-md bg-grey-1">
      <div class="row justify-center q-my-md">
        <q-icon class="material-icons text-grey-8 text-h3"> &#xE25F; </q-icon>
      </div>
      <div class="row justify-center q-my-sm">
        {{ devName }}
      </div>
      <q-separator></q-separator>
      <div class="row justify-center q-my-sm">
        <div class="col row items-center">备注名称：{{ devName }}</div>
        <div class="col-5 row justify-end items-center">
          <q-btn
            outline
            text-color="grey-8"
            @click="chgName()"
            label="修改名称"
          />
        </div>
      </div>
      <q-separator></q-separator>
      <div class="row justify-center q-my-sm">
        <div class="col row items-center">
          连接状态：{{ selectDev.connected ? '是' : '否' }}
        </div>
        <div class="col-5 row justify-end items-center">
          <q-btn
            v-if="selectDev.connected"
            outline
            color="negative"
            label="断开"
            @click="fireDisConnect(selectDev)"
          />
          <q-btn
            v-else
            outline
            color="green-8"
            label="连接"
            @click="connect(selectDev)"
          />
          <!-- @click="bond()" -->
        </div>
      </div>
      <q-separator />
      <div class="row items-center q-py-md">
        <q-icon class="outline text-h6 q-mr-sm" name="info_outline" />
        蓝牙地址：
        {{ selectDev.deviceId }}
      </div>
      <q-separator />
      <div class="row q-py-md items-center">
        <span class="q-mr-sm">方案：</span>
        <q-select
          dense
          outlined
          v-model="selectDev.srvs"
          :options="bleModules"
          map-options
          emit-value
          @update:model-value="checkCurrDev()"
        />
        <!-- @update:model-value="onModuleChange" -->
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, computed, onBeforeMount } from 'vue';
import { storeToRefs } from 'pinia';
// import { useRoute } from 'vue-router';
import { lBleDev, useBleStore } from 'src/stores/ble-store';
import { useQuasar } from 'quasar';
import { connect, disConnect, bleModules } from 'src/utils/ble';

import TitleBar from 'src/components/TitleBar.vue';

export default defineComponent({
  name: 'BleDev',
  components: { TitleBar },
  setup() {
    const $q = useQuasar();
    // const route = useRoute();
    const bleStore = useBleStore();
    const { currDev, HBCntdDevs, selectDev } = storeToRefs(bleStore);

    const devName = computed(() => {
      let name = <string>'';
      if (selectDev.value.lName) {
        name = selectDev.value.lName;
      } else {
        if (selectDev.value.name) {
          name = selectDev.value.name;
        } else {
          name = selectDev.value.deviceId;
        }
      }
      return name;
    });

    const chgName = () => {
      // chgNameFlag.value = true;
      $q.dialog({
        title: '重命名',
        // prompt: selectDev.value.lName,
        prompt: {
          // model: selectDev.value.lName as string,
          model: devName.value,
          type: 'text',
        },
        cancel: true,
        persistent: false,
      }).onOk((prompt) => {
        selectDev.value.lName = prompt;
        bleStore.saveHBCntdDev(selectDev.value);
      });
    };

    const fireDisConnect = async (dev: lBleDev) => {
      const disc = await disConnect(dev);
      if (disc === true) {
        selectDev.value.connected = false;
      }
    };

    const checkCurrDev = () => {
      if (currDev.value.deviceId === selectDev.value.deviceId) {
        currDev.value.srvs = selectDev.value.srvs;
      }
    };

    onBeforeMount(() => {
      HBCntdDevs.value.forEach((item) => {
        if (selectDev.value.deviceId === item.deviceId) {
          selectDev.value.lName = item.lName;
        }
      });
    });

    return {
      bleModules,
      devName,
      selectDev,
      chgName,
      connect,
      fireDisConnect,
      checkCurrDev,
    };
  },
});
</script>
