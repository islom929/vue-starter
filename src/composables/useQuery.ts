import { computed, ComputedRef, ref, shallowRef } from 'vue'
import axios from 'axios'
import api from '@/utils/axios'
import router from '@/router'
import { useToast } from 'vue-toastification'

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

// Error response type (adjust based on your actual API response structure)
interface TErrorResponse {
  status: number
  data: {
    message?: string
    prop?: string
  }
}

export function useQuery<T>(options: QueryOptions<T>): UseQueryReturn<T> {
  const { url, params = {}, select, onSuccess, onError } = options
  const toast = useToast()

  let rawData = shallowRef<T>(null as unknown as T)
  const data = computed(() => ({
    original: rawData.value,
    transformed: select ? select(rawData.value) : rawData.value,
  }))
  const loading = ref(false)
  const error = ref<string | null>(null)
  let cancelTokenSource = axios.CancelToken.source()

  // Error handling function
  const catchHandle = (err: any, icon = 'toast-error', reject: any = null) => {
    const response = err.response as TErrorResponse
    if (response?.status === 401) {
      toast.error(
        `${response?.data?.message ?? ''} ${response?.data.prop ?? ''}`,
        {
          icon: {
            iconClass: icon,
            iconChildren: '',
            iconTag: 'div',
            limit: 4,
          },
        },
      )
      localStorage.removeItem('session')
      router.push({ name: 'Auth' })
    } else {
      toast.error(
        `${response?.data?.message ?? ''} ${response?.data.prop ?? ''}`,
        {
          icon: {
            iconClass: icon,
            iconChildren: '',
            iconTag: 'div',
            limit: 4,
          },
        },
      )
    }
    if (reject) {
      return reject(err)
    }
  }

  const fetchData = async () => {
    // will ignore previous requests
    cancelTokenSource.cancel()
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
        // If onError is provided, let it handle the error and skip catchHandle
        if (onError) {
          onError(err)
        } else {
          // Otherwise, use the default catchHandle
          catchHandle(err)
          error.value = err instanceof Error ? err.message : 'Error occurred'
        }
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
