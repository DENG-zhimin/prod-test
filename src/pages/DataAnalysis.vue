<template>
  <q-page>
    <title-bar title="数据分析" class="full-width"></title-bar>
    <div class="column q-pa-sm">
      <div class="column q-mb-sm">
        <div class="row">
          产品名称：{{ flashStore.prodName }} - 型号：{{ flashStore.prodModel }}
        </div>
        <div class="row">
          时间：{{
            flashStore.testResult[0].time.substring(
              flashStore.testResult[0].time.length - 12
            )
          }}
          -
          {{
            flashStore.testResult[
              flashStore.testResult.length - 1
            ].time.substring(
              flashStore.testResult[flashStore.testResult.length - 1].time
                .length - 12
            )
          }}
        </div>
        <div class="row">
          测试信号数：{{ flashStore.sendCount }} - 反馈信号数：{{
            flashStore.receiveCount
          }}
        </div>
      </div>
      <div
        class="row justify-center full-width q-pa-sm bg-grey-3 q-mb-sm chart"
      >
        线性表现图
        <div id="chart" class="full-width"></div>
      </div>
      <div
        class="row justify-center full-width q-pa-sm bg-grey-3 q-mb-sm chart"
      >
        分部表现图
        <div id="columnPart" class="full-width"></div>
      </div>
      <div class="column justify-center q-mt-sm">
        测试数据：
        <div v-for="(line, index) in flashStore.testResult" :key="index">
          序号： {{ line.count }} - 时间：
          {{ line.time.substring(line.time.length - 12) }} - 数值：{{
            line.value
          }}
          <q-separator></q-separator>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeMount } from 'vue';
import { Line, Column } from '@antv/g2plot';
import { useFlashStore, FlashFeedback } from 'src/stores/flash-store';
import TitleBar from 'src/components/TitleBar.vue';

export default defineComponent({
  name: 'DataAnalysisPage',
  components: { TitleBar },
  setup() {
    const flashStore = useFlashStore();
    const line = ref(); // line chart handler
    const column = ref(); // column chart handler

    type LineData = {
      count: number;
      value: number;
    };
    type ColumnData = {
      count: number;
      value: string;
    };

    const lineData = ref(<LineData[]>[]);
    const columnData = ref(<LineData[]>[]);

    const getLineData = (data: FlashFeedback[]) => {
      const ret = <LineData>[];
      const len = data.length - 1;
      for (let i = len; i >= 0; i--) {
        // test result is unshift added
        const d = data[i] as FlashFeedback;
        ret.push({ count: d.count, value: parseInt(d.value) });
      }

      return ret;
    };

    const getColumnData = (data: FlashFeedback[]) => {
      const ret = <ColumnData[]>[];
      data.forEach((item) => {
        let isNew = 1;
        if (ret.length === 0) {
          ret.push({
            value: item.value,
            count: 1,
          });
        } else {
          ret.forEach((r, index) => {
            if (r.value === item.value) {
              isNew = 0;
              ret[index].count++;
            }
          });
          if (isNew === 1) {
            ret.push({
              value: item.value,
              count: 1,
            });
          }
        }
      });

      return ret;
    };

    onBeforeMount(() => {
      lineData.value = getLineData(flashStore.testResult);
      columnData.value = getColumnData(flashStore.testResult);
    });

    onMounted(() => {
      //
      line.value = new Line('chart', {
        data: lineData.value,
        xField: 'count',
        yField: 'value',
      });
      column.value = new Column('columnPart', {
        data: columnData.value,
        xField: 'value',
        yField: 'count',
      });

      line.value.render();
      column.value.render();
    });

    return {
      flashStore,
    };
  },
});
</script>

<style lang="scss" scoped>
.chart {
  height: 300px;
}
</style>
