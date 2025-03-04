"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { User, Loader2 } from "lucide-react";
import ErrorField from "@/components/ui/error-field";

// API function to update profile
const updateProfile = async (profileData: {
  name: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
}) => {
  const response = await fetch("/api/auth/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update profile");
  }

  return data;
};

// Validation schema
const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  currentPassword: Yup.string().test(
    "password-match",
    "Current password is required when setting a new password",
    function (value) {
      return !this.parent.newPassword || !!value;
    }
  ),
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .test(
      "password-match",
      "New password is required when current password is provided",
      function (value) {
        return !this.parent.currentPassword || !!value;
      }
    ),
});

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
            <div>
      <h1>Welcome, {session?.user?.name}</h1>
      {/* Your profile content */}
    </div>
  );
}
