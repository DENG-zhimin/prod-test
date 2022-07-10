<template>
  <q-page class="column items-center">
    <title-bar title="数据分析" class="full-width"></title-bar>
    <div class="row justify-center">
      <q-file
        clearable
        outlined
        label="选择文件"
        v-model="testFile"
        @update:model-value="onFileChange()"
      />
      <q-btn
        size="sm"
        class="q-ma-none q-ml-md"
        label="生成数据"
        @click="genData()"
      />
    </div>
    <div class="row justify-end q-my-sm">
      <!-- <q-btn @click="readTestReportDir()" label="getDirContent"></q-btn> -->
    </div>
    <div class="row justify-center full-width q-pa-sm">
      <div id="chart" class="full-width"></div>
    </div>
    <div class="column justify-center">
      <div v-for="(line, index) in flashStore.testResult" :key="index">
        {{ line }}
        <q-separator></q-separator>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { Filesystem, Encoding, Directory } from '@capacitor/filesystem';
import { Line } from '@antv/g2plot';
import { useFlashStore } from 'src/stores/flash-store';
import TitleBar from 'src/components/TitleBar.vue';

export default defineComponent({
  name: 'DataAnalysis',
  components: { TitleBar },
  setup() {
    const flashStore = useFlashStore();

    const reader = new FileReader();
    const testFile = ref(<File>{});
    const fileContent = ref(<string[]>[]);
    const dirContent = ref();

    type testData = {
      count: number;
      value: number;
    };
    const chartData = ref(<testData[]>[]);

    const line = ref();

    onMounted(() => {
      //
      line.value = new Line('chart', {
        data: chartData.value,
        xField: 'count',
        yField: 'value',
      });

      line.value.render();
    });

    reader.onload = async () => {
      const content = reader.result as string;
      fileContent.value = content.split('\n'); // change to array
      const header = fileContent.value.slice();
      header.splice(7, header.length);
      fileContent.value.splice(0, 7); // delete the file header.
      chartData.value.length = 0; // clear old data
      fileContent.value.forEach((line) => {
        const data = line.split(',');
        if (data[0]) {
          chartData.value.push({
            count: parseInt(data[0]),
            value: parseInt(data[2]),
          });
        }
      });
      // line.value.render();
      line.value.changeData(chartData.value);
      // updateChart();
    };

    const readTestReport = async () => {
      const contents = await Filesystem.readFile({
        path: 'text.txt',
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });

      console.log('secrets:', contents);
    };

    const readTestReportDir = async () => {
      dirContent.value = await Filesystem.readdir({
        path: '',
        Directory: '/home/dengzm/Downloads',
      });
    };

    const onFileChange = async () => {
      // reader.readAsText(testFile.value);
      reader.readAsText(testFile.value);
    };

    const genData = async () => {
      chartData.value.length = 0;
      for (let i = 0; i < 100; i++) {
        chartData.value.push({
          count: i,
          value: Math.floor(Math.random() * 10),
        });
      }
      line.value.changeData(chartData.value);
    };

    return {
      flashStore,

      readTestReport,
      readTestReportDir,
      dirContent,
      testFile,
      fileContent,
      chartData,
      onFileChange,
      genData,
    };
  },
});
</script>
