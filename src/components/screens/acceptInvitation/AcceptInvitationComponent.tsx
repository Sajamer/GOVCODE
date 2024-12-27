'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useRouter } from '@/i18n/routing'
import { acceptInvitation } from '@/lib/actions/invitation.actions'
import { sendError } from '@/lib/utils'
import { acceptInvitationSchema } from '@/schema/auth.schema'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { FC, useState } from 'react'

const AcceptInvitationComponent: FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const formSchema = acceptInvitationSchema()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      if (!token) {
        setErrorMessage('Invalid token')
        return
      }

      if (values.password !== values.confirmPassword) {
        setErrorMessage('Passwords do not match')
        return
      }

      const response = await acceptInvitation(token, values.password)

      if (!response) {
        setErrorMessage('Failed to create account.')
      } else {
        router.push('/sign-in')
      }
    } catch (error) {
      setErrorMessage('Failed to create account. Please try again.')
      sendError(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
        <h1 className="form-title">Create New Password</h1>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="shad-form-item">
                <FormLabel className="shad-form-label">Password</FormLabel>

                <FormControl>
                  <Input
                    placeholder="Enter your password"
                    className="shad-input"
                    type="password"
                    {...field}
                  />
                </FormControl>
              </div>

              <FormMessage className="shad-form-message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <div className="shad-form-item">
                <FormLabel className="shad-form-label">
                  Confirm Password
                </FormLabel>

                <FormControl>
                  <Input
                    placeholder="Re-type your password"
                    className="shad-input"
                    type="password"
                    {...field}
                  />
                </FormControl>
              </div>

              <FormMessage className="shad-form-message" />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="form-submit-button"
          disabled={isLoading}
        >
          {'Create Account'}

          {isLoading && (
            <Image
              src="/assets/icons/loader.svg"
              alt="loader"
              width={24}
              height={24}
              className="ml-2 animate-spin"
            />
          )}
        </Button>
        {errorMessage && <p className="error-message">*{errorMessage}</p>}
      </form>
    </Form>
  )
}

export default AcceptInvitationComponent
