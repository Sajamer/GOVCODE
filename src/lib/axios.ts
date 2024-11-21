import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL + '/api/',
  withCredentials: true,
})

export const axiosGet = async <T>(path: string): Promise<IResponse<T>> => {
  try {
    const response = await api.get(path)

    const data = response.data as IResponse<T>

    if (data && data.status === 500) {
      throw new Error(data.message)
    }

    return data
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'An unknown error occurred while fetching data',
    )
  }
}

export const axiosPost = async <TRequest, TResponse>(
  path: string,
  dto: TRequest,
): Promise<IResponse<TResponse>> => {
  try {
    const response = await api.post(path, dto)

    const data = response?.data as IResponse<TResponse>

    if (data && data?.status === 500) {
      throw new Error(data?.message)
    }

    return data
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'An unknown error occurred while posting data',
    )
  }
}

export const axiosPut = async <TRequest, TResponse>(
  path: string,
  dto: TRequest,
): Promise<IResponse<TResponse>> => {
  try {
    const response = await api.put(path, dto)

    const data = response?.data as IResponse<TResponse>
    if (data && data?.status === 500) {
      throw new Error(data?.message)
    }
    return data
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'An unknown error occurred while fetching data',
    )
  }
}

export const axiosDelete = async <T>(path: string): Promise<IResponse<T>> => {
  try {
    const response = await api.delete(path)

    const data = response?.data as IResponse<T>
    if (data && data?.status === 500) {
      throw new Error(data?.message)
    }

    return data
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'An unknown error occurred while deleting the resource',
    )
  }
}
