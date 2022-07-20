# 产品自动测试与分析

测试 App 通过蓝牙 BLE 根据设定频率自动向测试平台发送测试信号并收集反馈数据。测试结束后自动分析反馈数据。

![panel](src/assets/panel.png)
![dataAnalysis](src/assets/data-analysis.png)
![dataAnalysis2](src/assets/data-analysis2.png)

## Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
