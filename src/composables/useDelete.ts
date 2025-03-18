import { computed, ComputedRef, ref, shallowRef } from 'vue'
import api from '@/utils/axios'

// Type definitions
interface DeleteOptions<T> {
  url: string
  params?: Record<string, any>
  onSuccess?: (data: T) => any
  onError?: (error: any) => void
}

interface DeleteData<T> {
  original: T
  transformed: any
}

interface UseDeleteReturn<T> {
  data: ComputedRef<DeleteData<T>>
  loading: ComputedRef<boolean>
  error: ComputedRef<string | null>
  remove: (params?: Record<string, any>) => Promise<void>
}

export function useDelete<T>(options: DeleteOptions<T>): UseDeleteReturn<T> {
  const { url, params: initialParams, onSuccess, onError } = options

  let rawData = shallowRef<T>(null as unknown as T)
  const data = computed(() => ({
    original: rawData.value,
    transformed: onSuccess ? onSuccess(rawData.value) : rawData.value,
  }))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const remove = async (params?: Record<string, any>): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await api({
        url,
        method: 'DELETE',
        params: params || initialParams,
      })
      rawData = shallowRef(response.data as T)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      if (onError) onError(err)
    } finally {
      loading.value = false
    }
  }

  if (initialParams) {
    remove(initialParams)
  }

  return {
    data,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    remove,
  }
}
