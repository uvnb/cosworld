import Link from 'next/link'
import { signup } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const resolvedSearchParams = await searchParams
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900">
        <div className="mb-8 flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Tạo tài khoản mới
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Tham gia cộng đồng CosWorld ngay hôm nay
          </p>
        </div>

        <form className="space-y-4" action={signup}>
          <div className="space-y-2">
            <Label htmlFor="username">Tên người dùng (Username) <span className="text-red-500">*</span></Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Ví dụ: cosplayer123 (viết liền, không dấu)"
              pattern="^\S+$"
              title="Username không được chứa dấu cách"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Ví dụ: ban@gmail.com (Dùng để đăng nhập)"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại <span className="text-slate-400 text-xs font-normal">(Tùy chọn)</span></Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Ví dụ: 0987654321"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebook_url">Link Facebook <span className="text-slate-400 text-xs font-normal">(Tùy chọn)</span></Label>
            <Input
              id="facebook_url"
              name="facebook_url"
              type="url"
              placeholder="Ví dụ: https://facebook.com/username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu <span className="text-red-500">*</span></Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              minLength={6}
              required
            />
          </div>
          <Button className="w-full bg-brand-600 hover:bg-brand-700 font-bold" type="submit">
            Đăng ký
          </Button>

          {resolvedSearchParams?.message && (
            <p className="mt-4 p-4 bg-zinc-100 text-zinc-900 text-center text-sm rounded">
              {resolvedSearchParams.message}
            </p>
          )}
        </form>

        <div className="mt-6 text-center text-sm text-zinc-500">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline dark:text-indigo-400">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}
