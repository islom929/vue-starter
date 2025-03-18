import { computed, ComputedRef, ref, shallowRef } from 'vue'
import api from '@/utils/axios'
import router from '@/router'
import { useToast } from 'vue-toastification'

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

interface TErrorResponse {
  status: number
  data: {
    message?: string
    prop?: string
  }
}

export function useAction<T>(options: ActionOptions<T>): UseActionReturn<T> {
  const { url, method, data: initialData, onSuccess, onError } = options
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
