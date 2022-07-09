<template>
  <q-page class="column items-center">
    <h2>Analysis</h2>
    <div class="row justify-center">
      <q-file
        clearable
        outlined
        label="选择文件"
        v-model="testFile"
        @update:model-value="onFileChange()"
      />
    </div>
    <div class="row justify-end q-my-sm">
      <!-- <q-btn @click="readTestReportDir()" label="getDirContent"></q-btn> -->
    </div>
    <div class="column justify-center">
      <div id="chart" style="height: 300px; width: 500px"></div>
      <!-- {{ chart }} -->
    </div>
    <div class="column justify-center">
      <div v-for="(line, index) in chartData" :key="index">
        {{ line }}
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { Filesystem, Encoding, Directory } from '@capacitor/filesystem';
import { Line } from '@antv/g2plot';

export default defineComponent({
  name: 'AnalysisPage',
  components: {},
  setup() {
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

    return {
      readTestReport,
      readTestReportDir,
      dirContent,
      testFile,
      fileContent,
      chartData,
      onFileChange,
    };
  },
});
</script>
