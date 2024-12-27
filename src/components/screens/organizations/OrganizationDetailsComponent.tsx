'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import OrganizationEditForm from '@/components/forms/OrganizationEditForm'
import { FC } from 'react'
import OrganizationTree from './OrganizationTree'
import UserAccessComponent from './UserAccessComponent'

interface IOrganizationDetailsComponentProps {
  data: IOrganizationWithDepartments
}

const OrganizationDetailsComponent: FC<IOrganizationDetailsComponentProps> = ({
  data,
}) => {
  const chartData = [
    {
      expanded: true,
      type: 'person',
      data: {
        image: '/assets/images/avatar-placeholder.png',
        name: 'John Doe',
        title: 'Moderator',
        index: 0,
      },
      children: [
        {
          expanded: true,
          type: 'person',
          data: {
            image: '/assets/images/avatar-placeholder.png',
            name: 'Jane Smith',
            title: 'Collaborator',
            index: 1,
          },
          children: [
            {
              expanded: false,
              type: 'person',
              data: {
                image: '/assets/images/avatar-placeholder.png',
                name: 'Sam Wilson',
                title: 'User',
                index: 2,
              },
            },
            {
              expanded: false,
              type: 'person',
              data: {
                image: '/assets/images/avatar-placeholder.png',
                name: 'Alice Brown',
                title: 'User',
                index: 3,
              },
            },
          ],
        },
        {
          expanded: true,
          type: 'person',
          data: {
            image: '/assets/images/avatar-placeholder.png',
            name: 'Robert Green',
            title: 'Collaborator',
            index: 4,
          },
          children: [
            {
              expanded: false,
              type: 'person',
              data: {
                image: '/assets/images/avatar-placeholder.png',
                name: 'Nancy White',
                title: 'User',
                index: 5,
              },
            },
            {
              expanded: false,
              type: 'person',
              data: {
                image: '/assets/images/avatar-placeholder.png',
                name: 'Shadow Wolf',
                title: 'User',
                index: 6,
              },
            },
          ],
        },
      ],
    },
  ]

  const tabTriggerClasses =
    'py-2 px-5 relative group ring-0 focus-visible:ring-0 focus-visible:border-none text-[#939AAC] text-sm font-semibold flex items-center gap-2 data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent focus-visible:bg-transparent dark:bg-transparent dark:data-[state=active]:bg-transparent dark:data-[state=active]:text-primary'

  return (
    <div className="w-full">
      <Tabs defaultValue="organization-details" className="w-full">
        <TabsList className="flex w-fit items-center justify-start">
          <TabsTrigger
            value="organization-details"
            className={tabTriggerClasses}
          >
            Organization Details
          </TabsTrigger>
          <TabsTrigger value="user-access" className={tabTriggerClasses}>
            User Access
          </TabsTrigger>
          {/* <TabsTrigger value="organization-tree" className={tabTriggerClasses}>
            Organization Tree
          </TabsTrigger> */}
        </TabsList>
        <TabsContent value="organization-details" className="mt-10 w-full">
          <OrganizationEditForm data={data} />
        </TabsContent>
        <TabsContent value="user-access" className="mt-5">
          <UserAccessComponent data={data} />
        </TabsContent>
        <TabsContent value="organization-tree" className="mt-5">
          <OrganizationTree chartData={chartData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default OrganizationDetailsComponent
