<template>
  <q-bar :class="barBGC">
    <q-btn dense flat size="md" @click="goback()">
      <q-icon name="arrow_back" color="primary" />
    </q-btn>
    <div class="col text-bold">{{ title }}</div>
    <q-space />
    <slot name="action"></slot>
  </q-bar>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'TitleBar',
  components: {},
  props: {
    title: { type: String, default: '', required: true },
    bgColor: { type: String, default: 'bg-grey-5', required: false },
  },
  setup(props) {
    const router = useRouter();
    const barBGC = 'q-pa-none q-mb-sm ' + props.bgColor;

    const goback = () => {
      router.back();
    };

    return { goback, barBGC };
  },
});
</script>
