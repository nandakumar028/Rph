'use client'

import { cn } from '@/lib/utils'
import { useActionState, useState } from 'react'
import { signup, signInWithGithub } from '@/app/auth/actions'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const GitHubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" className="size-4">
    <path
      d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
      fill="currentColor"
    />
  </svg>
)

function PasswordField({
  id,
  name,
  label,
  autoComplete,
  description,
}: {
  id: string
  name: string
  label: string
  autoComplete: string
  description?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  )
}

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'form'>) {
  const [state, formAction, isPending] = useActionState(signup, null)

  return (
    <form
      action={formAction}
      className={cn('flex flex-col gap-6', className)}
      noValidate
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Fill in the details below to get started
          </p>
        </div>

        {/* Error banner — announced to screen readers */}
        {state?.error && (
          <div
            role="alert"
            aria-live="assertive"
            className="p-3 text-sm bg-destructive/10 text-destructive rounded-md text-center"
          >
            {state.error}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="signup-name">Full Name</FieldLabel>
          <Input
            id="signup-name"
            name="name"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="signup-email">Email</FieldLabel>
          <Input
            id="signup-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <FieldDescription>
            We&apos;ll only use this to contact you. Your email is never shared.
          </FieldDescription>
        </Field>

        <PasswordField
          id="signup-password"
          name="password"
          label="Password"
          autoComplete="new-password"
          description="Must be at least 8 characters long."
        />

        <PasswordField
          id="signup-confirm-password"
          name="confirm-password"
          label="Confirm Password"
          autoComplete="new-password"
          description="Re-enter your password to confirm."
        />

        <Field>
          <Button id="signup-submit-btn" type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin mr-2" aria-hidden="true" />}
            {isPending ? 'Creating account…' : 'Create Account'}
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        <Field>
          <Button
            id="signup-github-btn"
            variant="outline"
            type="submit"
            formAction={signInWithGithub}
            className="w-full gap-2"
          >
            <GitHubIcon />
            Sign up with GitHub
          </Button>

          <FieldDescription className="px-6 text-center mt-2">
            Already have an account?{' '}
            <a href="/login" className="underline underline-offset-4 hover:text-primary">
              Sign in
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
