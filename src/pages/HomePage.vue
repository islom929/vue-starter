<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold">HOME PAGE</h1>

    <!-- Query Section -->
    <section class="mt-6">
      <h2 class="text-xl font-semibold">Query Data</h2>
      <p v-if="queryLoading" class="text-yellow-500">Loading query...</p>
      <p v-if="queryError" class="text-red-500">{{ queryError }}</p>
      <pre v-if="queryData" class="bg-gray-800 text-white p-2 rounded">
        Original: {{ JSON.stringify(queryData.original, null, 2) }}
      </pre>
      <pre v-if="queryData" class="bg-gray-800 text-white p-2 rounded mt-2">
        Transformed: {{ JSON.stringify(queryData.transformed, null, 2) }}
      </pre>
      <button
        @click="queryRefetch"
        class="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Refresh Query
      </button>
    </section>

    <!-- Action Section -->
    <section class="mt-6">
      <h2 class="text-xl font-semibold">Action Data</h2>
      <p v-if="actionLoading" class="text-yellow-500">Loading action...</p>
      <p v-if="actionError" class="text-red-500">{{ actionError }}</p>
      <pre v-if="actionData" class="bg-gray-800 text-white p-2 rounded">
        Original: {{ JSON.stringify(actionData.original, null, 2) }}
      </pre>
      <pre v-if="actionData" class="bg-gray-800 text-white p-2 rounded mt-2">
        Transformed: {{ JSON.stringify(actionData.transformed, null, 2) }}
      </pre>
      <button
        @click="createPost"
        class="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Create Post
      </button>
    </section>

    <!-- Delete Section -->
    <section class="mt-6">
      <h2 class="text-xl font-semibold">Delete Data</h2>
      <p v-if="deleteLoading" class="text-yellow-500">Deleting...</p>
      <p v-if="deleteError" class="text-red-500">{{ deleteError }}</p>
      <pre v-if="deleteData" class="bg-gray-800 text-white p-2 rounded">
        Original: {{ JSON.stringify(deleteData.original, null, 2) }}
      </pre>
      <pre v-if="deleteData" class="bg-gray-800 text-white p-2 rounded mt-2">
        Transformed: {{ JSON.stringify(deleteData.transformed, null, 2) }}
      </pre>
      <button
        @click="deletePost"
        class="mt-2 px-4 py-2 bg-red-600 text-white rounded"
      >
        Delete Post
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
// Define interfaces at the top
interface IPost {
  id: number
  title: string
  body: string
  userId: number
}

interface Post extends IPost {}

interface DeleteResponse {
  status: string
  id?: number
}

// Import composables
import { useQuery } from '@/composables/useQuery'
import { useAction } from '@/composables/useAction'
import { useDelete } from '@/composables/useDelete'

// Use Query
const {
  data: queryData,
  loading: queryLoading,
  error: queryError,
  refetch: queryRefetch,
} = useQuery<IPost>({
  url: '/posts/1',
  params: { userId: 1 },
  select: (post) => ({ id: post.id, title: post.title }),
  onSuccess: (data) => console.log('Query Success:', data),
  onError: (error) => console.error('Query Error:', error),
})

// Use Action
const {
  data: actionData,
  loading: actionLoading,
  error: actionError,
  execute,
} = useAction<Post>({
  url: '/posts',
  method: 'POST' as const,
  data: { id: 0, title: 'Initial Post', body: 'Initial Content', userId: 1 },
  onSuccess: (post) => ({ id: post.id, title: post.title }),
})

const createPost = () => {
  execute({ id: 0, title: 'Updated Post', body: 'New Content', userId: 1 })
}

// Use Delete
const {
  data: deleteData,
  loading: deleteLoading,
  error: deleteError,
  remove,
} = useDelete<DeleteResponse>({
  url: '/posts/1',
  params: { id: 1 },
  onSuccess: (response) => ({ status: response ? 'deleted' : 'not found' }),
})

const deletePost = () => {
  remove({ id: 1 })
}
</script>

<style scoped>
.container {
  max-width: 800px;
}
pre {
  white-space: pre-wrap;
}
</style>
