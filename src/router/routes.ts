import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'flash', component: () => import('pages/FlashPage.vue') },
      { path: 'analysis', component: () => import('pages/AnalysisPage.vue') },
      { path: 'ble', component: () => import('pages/BlePage.vue') },
      {
        path: 'bledev/:devId',
        name: 'bledev',
        component: () => import('pages/BleDev.vue'),
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
