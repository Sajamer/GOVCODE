interface IDepartment {
  id: number
  name: string
}

interface IOrganization {
  id: number
  name: string
  description: string | null
  logo: string | null
  coverPhoto: string | null
  website: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  postalCode: string | null
  timezone: string | null
  currency: string | null
  createdAt: Date
  updatedAt: Date
}

interface IOrganizationWithDepartments extends IOrganization {
  departments: IDepartment[]
}

interface IOrganizationManipulator {
  name: string
  description: string
  logo: string
  website: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  timezone: string
  currency: string
  departments: {
    id?: number
    name: string
    description?: string
  }[]
}
