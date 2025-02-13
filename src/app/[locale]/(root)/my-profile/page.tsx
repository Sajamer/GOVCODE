import ProfileCard from '@/components/screens/my-profile/ProfileCard'
import { getUserById } from '@/lib/actions/userActions'
import { auth } from '@/lib/auth'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'

export default async function MyProfile() {
  const session = await auth()

  const userId = session?.user?.id || ''

  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['my-profile', userId],
    queryFn: async () => await getUserById(userId),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfileCard userId={userId} />
    </HydrationBoundary>
  )
}
