'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { signup } from '@/services/api';
import { useMutation } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ErrorField from '@/components/ui/error-field';

export default function SignUp() {
  const router = useRouter();
  const mutationSignup = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Account created successfully',
      });
      router.push('/auth/signin');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create account',
        variant: 'destructive',
      });
    },
  });

  const initialValues = {
    name: '',
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const { values, handleChange, handleBlur, handleSubmit, errors, isSubmitting } = useFormik({
    initialValues,
    validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting }) => {
      await mutationSignup.mutateAsync(values);
      setSubmitting(false);
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Name"
                name="name"
                value={values.name}
                autoComplete="new-name"
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorField message={errors.name} />
            </div>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                name="email"
                value={values.email}
                autoComplete="new-email"
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
                autoComplete="new-password"
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorField message={errors.password} />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || mutationSignup.isPending}
            >
              {mutationSignup.isPending ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-blue-500 hover:underline">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
