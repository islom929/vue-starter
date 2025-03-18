import { computed, ComputedRef, ref, shallowRef } from 'vue'
import api from '@/utils/axios'

// Type definitions
interface ActionOptions<T> {
  url: string
  method: 'POST' | 'PUT'
  data?: T
  onSuccess?: (data: T) => any
  onError?: (error: any) => void
}

interface ActionData<T> {
  original: T
  transformed: any
}

interface UseActionReturn<T> {
  data: ComputedRef<ActionData<T>>
  loading: ComputedRef<boolean>
  error: ComputedRef<string | null>
  execute: (payload?: T) => Promise<void>
}

export function useAction<T>(options: ActionOptions<T>): UseActionReturn<T> {
  const { url, method, data: initialData, onSuccess, onError } = options

  let rawData = shallowRef<T>(null as unknown as T)
  const data = computed(() => ({
    original: rawData.value,
    transformed: onSuccess ? onSuccess(rawData.value) : rawData.value,
  }))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const execute = async (payload?: T): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await api({
        url,
        method,
        data: payload || initialData,
      })
      rawData = shallowRef(response.data as T)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      if (onError) onError(err)
    } finally {
      loading.value = false
    }
  }

  if (initialData) {
    execute(initialData)
  }

  return {
    data,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    execute,
  }
}
