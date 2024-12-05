'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'
import { useState } from 'react'

const TanStackProvider = ({
  children,
}: {
  children: React.ReactNode
}): JSX.Element => {
  const [client] = useState(new QueryClient())

  return (
    <QueryClientProvider client={client}>
      {children}
      <ProgressBar
        height="4px"
        color="#266a55"
        options={{ showSpinner: false }}
        shallowRouting
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default TanStackProvider
