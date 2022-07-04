<template>
  <q-page class="row items-center justify-evenly">
    <div class="row justify-center q-gutter-md q-ma-md full-width">
      <div
        background-color="red"
        class="col-3 shadow-6 q-pa-sm bg-grey-3 module"
        v-for="(m, index) in MainMenu"
        :key="index"
        @click.stop="goModule(m)"
      >
        <div class="column justify-center items-center">
          <div v-if="m.icon" class="q-mb-sm">
            <q-icon size="lg" :color="m.color" :name="m.icon"></q-icon>
          </div>
          <div class="text-grey-8">
            {{ m.title }}
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from 'src/stores/app';
import { Menu } from 'src/stores/module';

export default defineComponent({
  name: 'IndexPage',
  components: {},
  setup() {
    const { MainMenu } = useAppStore();
    const router = useRouter();
    const goModule = (m: Menu) => {
      router.push({
        path: m.path,
      });
    };
    return { MainMenu, goModule };
  },
});
</script>

<style lang="sass" scoped>
.module:hover
  cursor: pointer
  position: relative
  top: -5px
  background-color: $blue-2
</style>
