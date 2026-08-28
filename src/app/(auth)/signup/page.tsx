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
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="cosplayer123"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="0987654321"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebook_url">Link Facebook</Label>
            <Input
              id="facebook_url"
              name="facebook_url"
              type="url"
              placeholder="https://facebook.com/username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
            />
          </div>
          <Button className="w-full" type="submit">
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
