import { Suspense } from "react";
import { EditorLoader } from "@/components/editor/editor-loader";

export default async function EditSitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-64px)] items-center justify-center text-sm text-neutral-500">
          Yuklanmoqda...
        </div>
      }
    >
      <EditorLoader id={id} />
    </Suspense>
  );
}
