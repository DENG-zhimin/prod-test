import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'flash', component: () => import('pages/FlashPage.vue') },
      {
        path: 'reportAnalysis',
        component: () => import('src/pages/ReportAnalysis.vue'),
      },
      {
        path: 'dataAnalysis',
        component: () => import('src/pages/DataAnalysis.vue'),
      },
      {
        path: 'multipleAnalysis',
        component: () => import('src/pages/MultipleAnalysis.vue'),
      },
      { path: 'ble', component: () => import('pages/BlePage.vue') },
      {
        path: 'bledev/:devId',
        name: 'bledev',
        component: () => import('pages/BleDev.vue'),
      },
      {
        path: 'bleconn',
        name: 'bleconn',
        component: () => import('pages/BleConn.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
