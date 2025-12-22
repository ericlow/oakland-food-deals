import { DealDetails } from "@/components/deal-details"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DealPage({ params }: PageProps) {
  const { id } = await params

  return <DealDetails dealId={Number.parseInt(id)} />
}
