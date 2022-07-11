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
          <q-space></q-space>
          <q-btn
            color="primary"
            size="sm"
            @click="exportReport()"
            label="导出数据"
          />
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
import {
  defineComponent,
  ref,
  onMounted,
  onBeforeMount,
  onBeforeUnmount,
} from 'vue';
import { Line, Column } from '@antv/g2plot';
import { useFlashStore, FlashFeedback } from 'src/stores/flash-store';
import TitleBar from 'src/components/TitleBar.vue';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { tightFormatTime, formatTime } from 'src/utils/comm';

export default defineComponent({
  name: 'DataAnalysisPage',
  components: { TitleBar },
  setup() {
    const $q = useQuasar();
    const flashStore = useFlashStore();
    const line = ref(); // line chart handler
    const column = ref(); // column chart handler

    const {
      prodName,
      prodModel,
      stopReason,
      continueTimes,
      continueSilence,
      cycleSilence,
      sendCount,
      receiveCount,
      enableThreshold,
      threshold,
    } = storeToRefs(flashStore);

    type LineData = {
      count: string;
      value: number;
    };
    type ColumnData = {
      value: string;
      count: number;
    };

    type FileWriteRes = { uri: string };

    // const lineData = ref(<LineData[]>[]);
    // const columnData = ref(<LineData[]>[]);
    const lineData = ref(<LineData[]>[]);
    const columnData = ref(<ColumnData[]>[]);

    const getLineData = (data: FlashFeedback[]) => {
      const ret = <LineData[]>[];
      const len = data.length - 1;
      if (len < 0) {
        return [];
      }
      for (let i = len; i >= 0; i--) {
        // test result is unshift added
        const d = data[i] as FlashFeedback;
        ret.push({ count: d.count.toString(), value: parseInt(d.value) });
      }

      return ret;
    };

    const getColumnData = (data: FlashFeedback[]) => {
      let ret = <ColumnData[]>[];
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

    const exportReport = async () => {
      let stream = await getReportHeader();
      const data = flashStore.testResult;
      for (let i = data.length - 1; i >= 0; i--) {
        stream +=
          data[i].count + ',' + data[i].value + ',' + data[i].time + '\n';
      }

      const filename =
        prodName.value +
        '-' +
        prodModel.value +
        '-' +
        tightFormatTime(new Date()) +
        '-' +
        'test-report.csv';
      try {
        if ($q.platform.is.mobile) {
          // mobile download
          // chkDir();
          Filesystem.mkdir({
            path: 'test-report/',
            directory: Directory.Documents,
          });

          const res = await Filesystem.writeFile({
            path: 'test-report/' + filename,
            data: stream,
            directory: Directory.Documents, // target directory file://Documents
            encoding: Encoding.UTF8,
          });
          const ret = res as FileWriteRes;
          $q.notify({
            message: ret.uri,
          });
        } else {
          // web download
          const stream2 = stream.split('');
          let blob = new Blob(stream2);
          const elink = document.createElement('a');

          elink.download = filename;
          elink.style.display = 'none';
          elink.href = URL.createObjectURL(blob);
          document.body.appendChild(elink);
          elink.click();
          $q.notify({
            message: 'report downloaded ',
          });
          URL.revokeObjectURL(elink.href);
          elink.remove();
        }
      } catch (err) {
        const msg = (err as Error).message;
        $q.notify({
          message: msg,
        });
      }
    };

    const getReportHeader = async () => {
      // generate report header
      let stream = prodName.value + '-' + prodModel.value + ' 测试报告' + '\n';
      stream += '报告生成时间,' + formatTime(new Date()) + '\n';
      stream +=
        '测试参数,' +
        '连闪次数,' +
        continueTimes.value +
        ',' +
        '连闪间隔时间（毫秒）,' +
        continueSilence.value +
        ',' +
        '周期间隔时间（毫秒）,' +
        cycleSilence.value +
        '\n';

      stream +=
        '阀值设置,' +
        '启用,' +
        (enableThreshold.value ? '是' : '否') +
        ',' +
        '阀值,' +
        threshold.value +
        '\n';
      stream +=
        '次数统计,' +
        '发送数,' +
        sendCount.value +
        ',' +
        '接收数,' +
        receiveCount.value +
        '\n';
      stream += '停止原因,' + stopReason.value + '\n';
      stream += '序号,读数\n';

      return stream;
    };

    onBeforeMount(() => {
      lineData.value = getLineData(flashStore.testResult);
      columnData.value = getColumnData(flashStore.testResult);
    });

    onMounted(() => {
      //
      line.value = new Line('chart', {
        data: lineData.value,
        padding: 'auto',
        xField: 'count',
        yField: 'value',
        yAxis: {
          tickCount: 10,
        },
      });
      column.value = new Column('columnPart', {
        data: columnData.value,
        xField: 'value',
        yField: 'count',
      });

      line.value.render();
      column.value.render();
    });

    onBeforeUnmount(() => {
      line.value.destroy();
      column.value.destroy();
    });

    return {
      flashStore,
      exportReport,
    };
  },
});
</script>

<style lang="scss" scoped>
.chart {
  height: 300px;
}
</style>
