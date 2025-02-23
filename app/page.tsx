import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
      <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
        Welcome to ModernApp
      </h1>
      <p className="mt-4 text-xl text-muted-foreground max-w-[700px]">
        A modern Next.js application with rich text editing capabilities,
        authentication, and beautiful UI.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/auth/signin">
          <Button size="lg">Get Started</Button>
        </Link>
        <Link href="/documents">
          <Button size="lg" variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            View Documents
          </Button>
        </Link>
      </div>
    </div>
  );
}