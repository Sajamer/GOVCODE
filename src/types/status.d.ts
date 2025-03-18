/* eslint-disable @typescript-eslint/no-explicit-any */
interface IRules {
  min: number
  max: number
  label: string
  color: string
}

interface IStatusResponse {
  id: number
  name: string
  rules: IRules[]

  [key: string]: any
}
