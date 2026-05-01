"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useResumeContext } from "@/hooks/useResumeContext";

export default function DashboardPage() {
  const router = useRouter();
  const { isHydrated, taskId } = useResumeContext();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    router.replace(taskId ? `/dashboard/${taskId}` : "/");
  }, [isHydrated, router, taskId]);

  return null;
}
