import Link from 'next/link'
import { login } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function LoginPage({
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
            Chào mừng trở lại
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Đăng nhập vào tài khoản của bạn để tiếp tục
          </p>
        </div>

        <form className="space-y-4" action={login}>
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mật khẩu</Label>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
            />
          </div>
          <Button className="w-full" type="submit">
            Đăng nhập
          </Button>

          {resolvedSearchParams?.message && (
            <p className="mt-4 p-4 bg-red-100 text-red-900 text-center text-sm rounded">
              {resolvedSearchParams.message}
            </p>
          )}
        </form>

        <div className="mt-6 text-center text-sm text-zinc-500">
          Chưa có tài khoản?{' '}
          <Link href="/signup" className="text-indigo-600 hover:underline dark:text-indigo-400">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  )
}
