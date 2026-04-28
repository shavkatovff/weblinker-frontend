import { EditorLoader } from "@/components/editor/editor-loader";

export default async function EditSitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditorLoader id={id} />;
}
