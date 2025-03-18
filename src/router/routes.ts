import { RouteRecordRaw } from 'vue-router'

const HomePage = () => import('@/pages/HomePage.vue')
const AuthPage = () => import('@/pages/AuthPage.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    children: [
      {
        path: '',
        name: 'Home',
        component: HomePage,
        meta: { layout: 'default', auth: false }, // Explicitly define layout
      },
    ],
  },
  {
    path: '/auth',
    children: [
      {
        path: '',
        name: 'Auth',
        component: AuthPage,
        meta: { layout: 'auth', auth: false }, // Explicitly define layout
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'Home' },
  },
]

export default routes
