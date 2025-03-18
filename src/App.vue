<template>
  <RouterView v-slot="{ Component }">
    <Transition name="layout" mode="out-in">
      <div :key="detectLayout">
        <Component :is="detectLayout">
          <div>
            <Component :is="Component" />
          </div>
        </Component>
      </div>
    </Transition>
  </RouterView>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AuthLayout from '@/layouts/AuthLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const route = useRoute()
const layouts: { [key: string]: any } = {
  default: DefaultLayout,
  auth: AuthLayout,
}

const detectLayout = computed(() => {
  return layouts[route.meta.layout as string]
})
</script>

<style>
@keyframes layout {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(60px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
