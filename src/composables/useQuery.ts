import { computed, ComputedRef, ref, shallowRef } from 'vue'
import axios from 'axios'
import api from '@/utils/axios'

interface QueryOptions<T> {
  url: string
  params?: Record<string, any>
  select?: (data: T) => any
  onSuccess?: (data: T) => void
  onError?: (error: any) => void
}

interface QueryData<T> {
  original: T
  transformed: any
}

interface UseQueryReturn<T> {
  data: ComputedRef<QueryData<T>>
  loading: ComputedRef<boolean>
  error: ComputedRef<string | null>
  refetch: () => Promise<void>
}

export function useQuery<T>(options: QueryOptions<T>): UseQueryReturn<T> {
  const { url, params = {}, select, onSuccess, onError } = options

  let rawData = shallowRef<T>(null as unknown as T)
  const data = computed(() => ({
    original: rawData.value,
    transformed: select ? select(rawData.value) : rawData.value,
  }))
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Cancel token for request cancellation
  let cancelTokenSource = axios.CancelToken.source()

  const fetchData = async () => {
    // Cancel previous request
    cancelTokenSource.cancel('New request started')
    cancelTokenSource = axios.CancelToken.source()

    loading.value = true
    error.value = null

    try {
      const response = await api.get(url, {
        params,
        cancelToken: cancelTokenSource.token,
      })
      rawData = shallowRef(response.data as T)
      if (onSuccess) onSuccess(response.data as T)
    } catch (err) {
      if (!axios.isCancel(err)) {
        error.value = err instanceof Error ? err.message : 'Error occurred'
        if (onError) onError(err)
      }
    } finally {
      loading.value = false
    }
  }

  fetchData()

  const refetch = async () => {
    await fetchData()
  }

  return {
    data,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    refetch,
  }
}
