import { ListingsSection } from '@/components/listings/ListingsSection'

export default async function ListingsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams
  const q = resolvedParams?.q || ''

  return (
    <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 w-full flex-1">
      <ListingsSection initialQuery={q} />
    </main>
  )
}
