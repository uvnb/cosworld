import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreateListingForm } from '@/components/listings/CreateListingForm'

export default async function CreateListingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?message=Vui lòng đăng nhập để đăng sản phẩm')
  }

  // Khởi tạo các options cho Tags ở đây nếu cần (hoặc fetch client side)
  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Đăng bài cho thuê/bán pass</h1>
      <p className="text-zinc-500 mb-8">
        Hãy cung cấp thông tin chi tiết và hình ảnh rõ nét để dễ dàng kết nối với người thuê/mua.
      </p>
      
      <CreateListingForm userId={user.id} />
    </div>
  )
}
