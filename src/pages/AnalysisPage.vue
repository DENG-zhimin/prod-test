<template>
  <q-page class="column items-center justify-evenly">
    <h2>Analysis</h2>
    <div class="row justify-end">
      <q-btn @click="readTestReportDir()" label="getDirContent"></q-btn>
    </div>
    <div class="row justify-center">
      {{ dirContent }}
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

export default defineComponent({
  name: 'AnalysisPage',
  components: {},
  setup() {
    const dirContent = ref();
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
        Directory: Directory.Documents,
      });
    };
    return { readTestReport, readTestReportDir, dirContent };
  },
});
</script>
