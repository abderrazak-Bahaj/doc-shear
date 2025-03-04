'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Github } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useMutation } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ErrorField from '@/components/ui/error-field';

const initialValues = {
  email: '',
  password: '',
};

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export default function SignIn() {
  const router = useRouter();

  const mutationSignin = useMutation({
    mutationFn: async (params: any) => await signIn(...params),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Signed in successfully',
      });
      router.push('/documents');
      router.refresh();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to sign in',
        variant: 'destructive',
      });
    },
  });

  const { values, handleChange, handleBlur, handleSubmit, errors, isSubmitting } = useFormik({
    initialValues,
    validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting }) => {
      await mutationSignin.mutateAsync([
        'credentials',
        {
          ...values,
          redirect: false,
        },
      ]);
      setSubmitting(false);
    },
  });
  const handleGithubSignIn = async () => {
    await mutationSignin.mutateAsync([
      'github',
      {
        redirect: true,
        callbackUrl: '/documents',
      },
    ]);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorField message={errors.email} />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorField message={errors.password} />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || mutationSignin.isPending}
            >
              {isSubmitting || mutationSignin.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isSubmitting || mutationSignin.isPending}
            onClick={handleGithubSignIn}
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>

          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
