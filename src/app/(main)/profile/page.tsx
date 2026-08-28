import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-100">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
          <form action="/auth/signout" method="post">
            <Button variant="outline" type="submit">Đăng xuất</Button>
          </form>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-sm text-zinc-500 font-medium">Email</span>
            <p className="mt-1">{user.email}</p>
          </div>
          <div>
            <span className="text-sm text-zinc-500 font-medium">Username</span>
            <p className="mt-1">{profile?.username || 'Chưa cập nhật'}</p>
          </div>
          <div>
            <span className="text-sm text-zinc-500 font-medium">Họ và tên</span>
            <p className="mt-1">{profile?.full_name || 'Chưa cập nhật'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
