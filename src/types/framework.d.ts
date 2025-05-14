interface IFrameworkAttribute {
  id: string
  name: string
  value: string | null
  frameworkId: string
}

interface IFramework {
  id: string
  name: string
  attributes: IFrameworkAttribute[]
}
