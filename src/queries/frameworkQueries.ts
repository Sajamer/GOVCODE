import { api } from '@/lib/axios'

export const importFrameworks = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await api.post(`framework`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // This is crucial: Tell axios to reject promises on non-2xx responses
      validateStatus: (status) => status === 200,
    })

    return response.data
  } catch (error: AxiosErrorType) {
    // Handle axios error details
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(error.response.data.message || 'Import failed')
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response received from server')
    } else {
      // Something happened in setting up the request that triggered an Error
      throw error
    }
  }
}
