import { api } from '@/lib/axios'

export const importKpis = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post(`kpis`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  if (response.status !== 200) {
    throw new Error(response.statusText)
  }
  return response.data
}
