import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'timestamp', component: () => import('pages/TimestampPage.vue') },
      { path: 'fuel-computer', component: () => import('src/pages/FuelComputerPage.vue') },
      { path: 'notam-mapper', component: () => import('src/pages/NotamMapperPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
