'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'

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
        color="#50B"
        options={{ showSpinner: false }}
        shallowRouting
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default TanStackProvider
