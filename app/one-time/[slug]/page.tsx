"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TipTapEditor } from "@/components/editor/tiptap-editor";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Lock, Eye, AlertTriangle } from "lucide-react";
import { DocumentData } from "@/types";
import { getOneTimeDocument } from "@/services/api";


// Validation schema
const validationSchema = Yup.object({
  key: Yup.string().required("Access key is required")
});

export default function OneTimeDocumentPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [viewed, setViewed] = useState(false);

  // Use React Query mutation for fetching the document
  const { mutate, isPending, error, isError } = useMutation({
    mutationFn: (key: string) => getOneTimeDocument(params.slug, key),
    onSuccess: (data) => {
      setDocument(data);
      setViewed(true);
      toast({
        title: "Document accessed",
        description: "This document can only be viewed once.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to access document",
        variant: "destructive",
      });
    },
  });

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      key: "",
    },
    validationSchema,
    onSubmit: (values) => {
      mutate(values.key);
    },
  });

  if (viewed && document) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-yellow-500" />
              One-Time View Document
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-yellow-500 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">Important Notice</p>
                <p>This document can only be viewed once. Once you leave this page, you won't be able to access it again.</p>
              </div>
            </div>
            <h1 className="text-2xl font-bold">{document.title}</h1>
            <TipTapEditor
              content={document.content}
              onChange={() => {}}
              editable={false}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Enter Access Key
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="key"
                name="key"
                type="password"
                placeholder="Enter the document key"
                value={formik.values.key}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isPending}
                aria-describedby="key-error"
              />
              {(formik.touched.key && formik.errors.key) && (
                <p id="key-error" className="text-sm text-destructive">
                  {formik.errors.key}
                </p>
              )}
              {isError && (
                <p className="text-sm text-destructive">
                  {error instanceof Error ? error.message : "Failed to access document"}
                </p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isPending || !formik.isValid || !formik.dirty}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accessing...
                </>
              ) : (
                "View Document"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
