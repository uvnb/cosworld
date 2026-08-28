'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import imageCompression from 'browser-image-compression'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const formSchema = z.object({
  title: z.string().min(5, 'Tiêu đề ít nhất 5 ký tự'),
  description: z.string().min(10, 'Mô tả ít nhất 10 ký tự'),
  listing_type: z.enum(['rent', 'sale', 'both']),
  size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One-size']),
  price_per_day: z.string().optional(),
  sale_price: z.string().optional(),
  deposit_amount: z.string().min(1, 'Vui lòng nhập tiền cọc'),
  buffer_days: z.string().min(1, 'Nhập số ngày buffer'),
  min_rental_days: z.string().min(1, 'Nhập số ngày thuê tối thiểu'),
  max_rental_days: z.string().min(1, 'Nhập số ngày thuê tối đa'),
  district: z.string().min(1, 'Nhập quận/huyện'),
  city: z.string().min(1, 'Nhập tỉnh/thành phố'),
})

type FormData = z.infer<typeof formSchema>

export function CreateListingForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      listing_type: 'rent',
      size: 'M',
      buffer_days: '1',
      min_rental_days: '1',
      max_rental_days: '30',
      deposit_amount: '0',
    }
  })

  const listingType = watch('listing_type')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      if (images.length + selectedFiles.length > 5) {
        toast.error('Chỉ được upload tối đa 5 ảnh')
        return
      }
      setImages(prev => [...prev, ...selectedFiles])
    }
  }

  const uploadImagesToR2 = async () => {
    const uploadedUrls: string[] = []
    
    for (const file of images) {
      // 1. Nén ảnh ở client
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      })

      // 2. Lấy presigned URL
      const res = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: compressedFile.name,
          fileType: compressedFile.type,
          fileSize: compressedFile.size,
        })
      })

      if (!res.ok) throw new Error('Không thể lấy URL upload')
      
      const { url, key } = await res.json()

      // 3. Upload lên R2
      const uploadRes = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': compressedFile.type },
        body: compressedFile
      })

      if (!uploadRes.ok) throw new Error('Upload ảnh thất bại')

      uploadedUrls.push(`https://${process.env.NEXT_PUBLIC_R2_BUCKET_NAME}.r2.cloudflarestorage.com/${key}`)
    }
    
    return uploadedUrls
  }

  const onSubmit = async (data: FormData) => {
    if (images.length === 0) {
      toast.error('Vui lòng upload ít nhất 1 ảnh')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Upload ảnh
      toast.info('Đang nén và tải ảnh lên server...')
      const imageUrls = await uploadImagesToR2()

      // 2. Tạo Listing trong Supabase
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          owner_id: userId,
          title: data.title,
          description: data.description,
          listing_type: data.listing_type,
          size: data.size,
          price_per_day: data.price_per_day ? parseInt(data.price_per_day) : null,
          sale_price: data.sale_price ? parseInt(data.sale_price) : null,
          deposit_amount: parseInt(data.deposit_amount),
          buffer_days: parseInt(data.buffer_days),
          min_rental_days: parseInt(data.min_rental_days),
          max_rental_days: parseInt(data.max_rental_days),
          district: data.district,
          city: data.city,
          status: 'active'
        })
        .select()
        .single()

      if (listingError) throw listingError

      // 3. Lưu ảnh vào listing_images
      const imageRecords = imageUrls.map((url, index) => ({
        listing_id: listing.id,
        r2_url: url,
        display_order: index,
        is_cover: index === 0
      }))

      const { error: imageError } = await supabase.from('listing_images').insert(imageRecords)
      if (imageError) throw imageError

      toast.success('Đăng sản phẩm thành công!')
      router.push('/')
      
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Có lỗi xảy ra')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label>Tiêu đề sản phẩm</Label>
        <Input {...register('title')} placeholder="Ví dụ: Fullset Cosplay Raiden Shogun size M" />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Loại hình</Label>
          <Select onValueChange={(val: any) => setValue('listing_type', val)} defaultValue={watch('listing_type')}>
            <SelectTrigger><SelectValue placeholder="Chọn loại hình" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="rent">Chỉ Cho Thuê</SelectItem>
              <SelectItem value="sale">Chỉ Bán Pass</SelectItem>
              <SelectItem value="both">Cả Thuê & Bán Pass</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Size đồ</Label>
          <Select onValueChange={(val: any) => setValue('size', val)} defaultValue={watch('size')}>
            <SelectTrigger><SelectValue placeholder="Chọn size" /></SelectTrigger>
            <SelectContent>
              {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One-size'].map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {(listingType === 'rent' || listingType === 'both') && (
          <div className="space-y-2">
            <Label>Giá thuê / Ngày (VNĐ)</Label>
            <Input type="number" {...register('price_per_day')} placeholder="Ví dụ: 100000" />
          </div>
        )}
        {(listingType === 'sale' || listingType === 'both') && (
          <div className="space-y-2">
            <Label>Giá bán pass (VNĐ)</Label>
            <Input type="number" {...register('sale_price')} placeholder="Ví dụ: 800000" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Tiền cọc (VNĐ)</Label>
        <Input type="number" {...register('deposit_amount')} placeholder="Tiền cọc đồ" />
      </div>

      <div className="space-y-2">
        <Label>Mô tả chi tiết</Label>
        <Textarea {...register('description')} rows={5} placeholder="Tình trạng đồ, các phụ kiện đi kèm, lưu ý khi thuê..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Quận/Huyện</Label>
          <Input {...register('district')} placeholder="Quận 1" />
        </div>
        <div className="space-y-2">
          <Label>Tỉnh/Thành phố</Label>
          <Input {...register('city')} placeholder="TP.HCM" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Hình ảnh (Tối đa 5 ảnh)</Label>
        <Input type="file" multiple accept="image/jpeg, image/png, image/webp" onChange={handleImageChange} />
        <p className="text-sm text-zinc-500">{images.length} ảnh đã chọn</p>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Đang xử lý...' : 'Đăng sản phẩm'}
      </Button>
    </form>
  )
}
