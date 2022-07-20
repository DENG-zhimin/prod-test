<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="bg-grey-7">
        <!-- <q-toolbar-title></q-toolbar-title> -->
        <div @click.stop="goHome">
          <img src="" alt="LOGO" style="width: 80px; cursor: pointer" />
        </div>
        <q-space></q-space>
        <div class="row justify-center text-bold q-mr-lg">Product Test</div>
        <q-space></q-space>

        <div>
          <q-btn flat round size="md" @click="getDev">
            <q-icon
              name="bluetooth"
              class="text-h5"
              :color="currDev.deviceId === '' ? 'grey-2' : 'blue-5'"
            />
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Essential Links
        </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer> -->

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useBleStore } from 'src/stores/ble-store';
// import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'MainLayout',

  components: {},

  setup() {
    const router = useRouter();
    const route = useRoute();

    // const $q = useQuasar();
    const goHome = () => {
      let r = <string>route.path;
      if (r !== '/') {
        router.push('/');
      }
    };
    const BleStore = useBleStore();
    const { currDev } = storeToRefs(BleStore);

    const getDev = () => {
      router.push('/ble');
    };

    onBeforeMount(() => {
      // console.log('quasar', window);
    });

    return { goHome, currDev, getDev };
  },
});
</script>
