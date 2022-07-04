<template>
  <q-bar class="bg-grey-5 q-pa-none q-mb-sm">
    <q-btn dense flat size="md" @click="goback()">
      <q-icon name="arrow_back" color="primary" />
    </q-btn>
    <div class="col text-bold">{{ title }}</div>
  </q-bar>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'TitleBar',
  components: {},
  props: ['title'],
  setup() {
    const router = useRouter();

    const goback = () => {
      router.back();
    };

    return { goback };
  },
});
</script>
