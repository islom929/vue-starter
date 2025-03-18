import { computed, ComputedRef, ref, shallowRef } from 'vue'
import api from '@/utils/axios'
import router from '@/router'
import { useToast } from 'vue-toastification'

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

interface TErrorResponse {
  status: number
  data: {
    message?: string
    prop?: string
  }
}

export function useDelete<T>(options: DeleteOptions<T>): UseDeleteReturn<T> {
  const { url, params: initialParams, onSuccess, onError } = options
  const toast = useToast()

  let rawData = shallowRef<T>(null as unknown as T)
  const data = computed(() => ({
    original: rawData.value,
    transformed: onSuccess ? onSuccess(rawData.value) : rawData.value,
  }))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const catchHandle = (err: any, icon = 'toast-error', reject: any = null) => {
    const response = err.response as TErrorResponse
    if (response?.status === 401) {
      toast.error(
        `${response?.data?.message ?? ''} ${response?.data.prop ?? ''}`,
        {
          icon: { iconClass: icon, iconChildren: '', iconTag: 'div', limit: 4 },
        },
      )
      localStorage.removeItem('session')
      router.push({ name: 'Auth' })
    } else {
      toast.error(
        `${response?.data?.message ?? ''} ${response?.data.prop ?? ''}`,
        {
          icon: { iconClass: icon, iconChildren: '', iconTag: 'div', limit: 4 },
        },
      )
    }
    if (reject) return reject(err)
  }

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
      if (onSuccess) onSuccess(response.data as T)
    } catch (err) {
      // If onError is provided, let it handle the error and skip catchHandle
      if (onError) {
        onError(err)
      } else {
        // Otherwise, use the default catchHandle
        catchHandle(err)
        error.value = err instanceof Error ? err.message : 'Error occurred'
      }
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
