<template>
  <q-page>
    <title-bar title="数据分析" class="full-width"></title-bar>
    <div class="column q-pa-sm">
      <div
        class="row justify-center full-width q-pa-sm bg-grey-3 q-mb-sm chart"
      >
        <div id="columnChart" class="full-width"></div>
      </div>
      <div
        class="q-mt-sm"
        v-for="tr in flashStore.testResults"
        :key="tr.cycleId"
      >
        第{{ tr.cycleId }}轮： 总接收数：{{
          flashStore.testResults[tr.cycleId - 1].responseCount
        }}
        <div v-for="(c, index) in multData" :key="index">
          <div v-if="c.cycleId == tr.cycleId.toString()">
            {{ '返回值：' + c.responseVal + ' ：' + c.count }}
          </div>
        </div>
        <q-separator></q-separator>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  onBeforeMount,
  onBeforeUnmount,
  computed,
} from 'vue';
import { Column } from '@antv/g2plot';
import { useFlashStore } from 'src/stores/flash-store';
import TitleBar from 'src/components/TitleBar.vue';

export default defineComponent({
  name: 'DataAnalysisPage',
  components: { TitleBar },
  setup() {
    const flashStore = useFlashStore();
    const column = ref(); // column chart handler

    type MultData = {
      cycleId: string;
      responseVal: string;
      count: number;
    };

    const multData = ref(<MultData[]>[]);

    const cycleNum = computed(() => {
      return flashStore.testResults.length;
    });

    const getMultData = () => {
      flashStore.testResults.forEach((result) => {
        result.data.forEach((rec) => {
          let isNew = 1;
          multData.value.forEach((data, index) => {
            if (
              result.cycleId.toString() === data.cycleId &&
              rec.value === data.responseVal
            ) {
              isNew = 0;
              multData.value[index].count++;
              return false; // stop this loop
            }
          });
          if (isNew === 1) {
            multData.value.push({
              cycleId: result.cycleId.toString(),
              responseVal: rec.value,
              count: 1,
            });
          }
        });
      });
      //
    };

    onBeforeMount(() => {
      getMultData();
    });

    onMounted(() => {
      column.value = new Column('columnChart', {
        data: multData.value,
        xField: 'cycleId',
        seriesField: 'responseVal',
        yField: 'count',
        isGroup: true,
        legend: { position: 'top' },
      });

      column.value.render();
    });

    onBeforeUnmount(() => {
      column.value.destroy();
    });

    return {
      flashStore,
      cycleNum,
      multData,
    };
  },
});
</script>

<style lang="scss" scoped>
.chart {
  height: 300px;
}
</style>
