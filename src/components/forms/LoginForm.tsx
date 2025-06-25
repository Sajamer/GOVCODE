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
import { loginSchema } from '@/schema/auth.schema'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import OtpModal from '../shared/modals/OTPModal'

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [accountId] = useState<number | null>(null)

  const formSchema = loginSchema()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })
  const { push } = useRouter()

  const onSubmit = async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const user = await signIn('credentials', {
        email: form.getValues('email'),
        password: form.getValues('password'),
        redirect: false,
      })

      if (user?.error) return setErrorMessage('Invalid credentials')

      if (user?.ok) push('/')
    } catch (e) {
      console.log(e)
      setErrorMessage('Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
          <h1 className="form-title">{'Sign In'}</h1>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="shad-form-item">
                  <FormLabel className="shad-form-label">Email</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      className="shad-input"
                      type="email"
                      autoComplete="email"
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
                      autoComplete="current-password"
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
            {'Sign In'}

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
          <div className="body-2 flex justify-center">
            <p className="text-light-100">{"Don't have account yet."}</p>
            <Link href={'/sign-up'} className="ml-1 font-medium text-primary">
              {'Sign Up'}
            </Link>
          </div>
        </form>
      </Form>

      {accountId && <OtpModal email={form.getValues('email')} />}
    </>
  )
}

export default LoginForm
