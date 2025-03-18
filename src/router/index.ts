import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import routes from '@/router/routes'

interface RouteMeta {
  auth?: boolean
  roles?: string[]
}

// Use the RouteMeta type in your RouteRecordRaw type definition
const typedRoutes: Array<RouteRecordRaw & { meta: RouteMeta }> =
  routes as Array<RouteRecordRaw & { meta: RouteMeta }>

const router = createRouter({
  history: createWebHistory(),
  routes: typedRoutes,

  scrollBehavior() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          top: 0,
          left: 0,
          behavior: 'smooth',
        })
      }, 50)
    })
  },
})

router.beforeEach(async (to, _from, next) => {
  const hasToken = !!localStorage.getItem('session')
  let auth = undefined
  to.meta.auth === false ? (auth = false) : (auth = true)
  // Get user role

  // Check if route_files requires auth and user is not authenticated
  if (auth && !hasToken) {
    next({ name: 'Auth' })
  } else {
    next()
  }
})

export default router
