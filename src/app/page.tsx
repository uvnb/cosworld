import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ListingsGrid } from '@/components/listings/ListingsGrid'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams
  const q = resolvedParams?.q || ''

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-white dark:bg-zinc-950 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight text-indigo-600 dark:text-indigo-400">
            CosWorld
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/listings/create">
              <Button variant="default" className="rounded-full px-6">Đăng sản phẩm</Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" className="rounded-full">Hồ sơ</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-10 text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Thuê và Bán Đồ Cosplay Dễ Dàng
          </h1>
          <p className="text-lg text-zinc-500">
            Khám phá hàng ngàn trang phục cosplay từ cộng đồng. Uy tín, nhanh chóng và an toàn.
          </p>
          
          <form action="/" method="GET" className="relative flex items-center mt-6 max-w-lg mx-auto">
            <Search className="absolute left-3 w-5 h-5 text-zinc-400" />
            <Input 
              name="q"
              defaultValue={q}
              className="pl-10 rounded-full h-12 shadow-sm border-zinc-200 focus-visible:ring-indigo-500" 
              placeholder="Tìm kiếm trang phục, nhân vật..." 
            />
            <Button type="submit" className="absolute right-1 h-10 rounded-full px-6 bg-indigo-600 hover:bg-indigo-700 text-white">
              Tìm
            </Button>
          </form>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {q ? `Kết quả tìm kiếm cho "${q}"` : 'Đồ mới đăng gần đây'}
          </h2>
          {/* Lọc cơ bản có thể thêm ở đây */}
        </div>

        <ListingsGrid query={q} />
      </main>
    </div>
  )
}
