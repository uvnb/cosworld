'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import imageCompression from 'browser-image-compression'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { ImagePlus, X, Loader2 } from 'lucide-react'

const formSchema = z.object({
  title: z.string().min(5, 'Tiêu đề ít nhất 5 ký tự'),
  category: z.enum(['costume', 'wig', 'props', 'shoes', 'accessories', 'studio', 'other']),
  character_name: z.string().optional(),
  description: z.string().min(10, 'Mô tả ít nhất 10 ký tự'),
  listing_type: z.enum(['rent', 'sale', 'both', 'want_to_rent', 'want_to_buy']),
  size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One-size']),
  price_per_day: z.string().optional(),
  sale_price: z.string().optional(),
  deposit_amount: z.string().min(1, 'Vui lòng nhập tiền cọc'),
  buffer_days: z.string().min(1, 'Nhập số ngày buffer'),
  min_rental_days: z.string().min(1, 'Nhập số ngày thuê tối thiểu'),
  max_rental_days: z.string().min(1, 'Nhập số ngày thuê tối đa'),
  district: z.string().min(1, 'Vui lòng nhập quận/huyện'),
  city: z.string().min(1, 'Vui lòng nhập tỉnh/thành phố'),
  includes: z.array(z.string()).optional(),
})

type FormData = z.infer<typeof formSchema>

const INCLUDE_OPTIONS = [
  { id: 'wig', label: 'Wig (Tóc giả)' },
  { id: 'costume', label: 'Trang phục (Costume)' },
  { id: 'shoes', label: 'Giày/Dép' },
  { id: 'props', label: 'Đạo cụ (Props/Vũ khí)' },
  { id: 'accessories', label: 'Phụ kiện nhỏ (Trang sức, mũ...)' }
]

export function CreateListingForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: 'costume',
      listing_type: 'rent',
      size: 'M',
      buffer_days: '1',
      min_rental_days: '1',
      max_rental_days: '30',
      deposit_amount: '',
      includes: [],
      city: '',
      district: ''
    }
  })

  const listingType = watch('listing_type')
  const category = watch('category')
  const isStudio = category === 'studio'

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      if (images.length + selectedFiles.length > 5) {
        toast.error('Chỉ được upload tối đa 5 ảnh')
        return
      }
      setImages(prev => [...prev, ...selectedFiles])
      setPreviewUrls(prev => [...prev, ...selectedFiles.map(f => URL.createObjectURL(f))])
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImagesToR2 = async () => {
    const uploadedUrls: string[] = []
    
    for (const file of images) {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp'
      })

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

      const uploadRes = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': compressedFile.type },
        body: compressedFile
      })

      if (!uploadRes.ok) throw new Error('Upload ảnh thất bại')

      const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL 
        ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`
        : `/api/image?key=${encodeURIComponent(key)}` 

      uploadedUrls.push(publicUrl)
    }
    
    return uploadedUrls
  }

  const onSubmit = async (data: FormData) => {
    if (images.length === 0) {
      toast.error('Vui lòng tải lên ít nhất 1 ảnh sản phẩm')
      return
    }

    setIsSubmitting(true)

    try {
      toast.info('Đang nén và tải ảnh lên hệ thống...')
      const imageUrls = await uploadImagesToR2()

      let lng = 106.660172
      let lat = 10.762622
      
      const cityLower = data.city.toLowerCase()
      if (cityLower.includes('hà nội') || cityLower.includes('ha noi')) {
        lng = 105.8342
        lat = 21.0278
      } else if (cityLower.includes('đà nẵng') || cityLower.includes('da nang')) {
        lng = 108.2022
        lat = 16.0544
      }

      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          owner_id: userId,
          title: data.title,
          category: data.category,
          character_name: isStudio ? null : data.character_name,
          description: data.description,
          listing_type: data.listing_type,
          size: isStudio ? null : data.size,
          includes: isStudio ? [] : data.includes,
          price_per_day: data.price_per_day ? parseInt(data.price_per_day) : null,
          sale_price: data.sale_price ? parseInt(data.sale_price) : null,
          deposit_amount: parseInt(data.deposit_amount),
          buffer_days: parseInt(data.buffer_days),
          min_rental_days: parseInt(data.min_rental_days),
          max_rental_days: parseInt(data.max_rental_days),
          district: data.district,
          city: data.city,
          exact_location: `POINT(${lng} ${lat})`,
          status: 'active'
        })
        .select()
        .single()

      if (listingError) throw listingError

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

  // Format currency helpers
  const formatCurrency = (val: string) => {
    if (!val) return ''
    const num = val.replace(/\D/g, '')
    return num ? parseInt(num, 10).toLocaleString('vi-VN') : ''
  }
  const parseCurrency = (val: string) => val.replace(/\D/g, '')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
      
      {/* KHU VỰC ẢNH SẢN PHẨM */}
      <div>
        <Label className="text-base font-bold text-slate-800 block mb-3">Hình ảnh sản phẩm (Tối đa 5 ảnh) <span className="text-rose-500">*</span></Label>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {previewUrls.map((url, index) => (
            <div key={url} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group">
              <img src={url} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-rose-500 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-2 left-2 bg-brand-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">Ảnh bìa</span>
              )}
            </div>
          ))}

          {images.length < 5 && (
            <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors group">
              <ImagePlus className="w-8 h-8 text-slate-400 group-hover:text-brand-500 mb-2" />
              <span className="text-xs font-medium text-slate-500 group-hover:text-brand-600">Thêm ảnh</span>
              <input type="file" multiple accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handleImageChange} />
            </label>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-3">Ảnh sẽ tự động nén WebP (Max 0.5MB) để tối ưu tốc độ tải trang.</p>
      </div>

      <div className="h-px bg-slate-100" />

      {/* THÔNG TIN CƠ BẢN */}
      <div className="space-y-5">
        <h3 className="text-lg font-bold text-slate-800">Thông tin cơ bản</h3>
        
        <div className="space-y-2">
          <Label className="font-bold">Tiêu đề sản phẩm <span className="text-rose-500">*</span></Label>
          <Input {...register('title')} placeholder="Ví dụ: Fullset Cosplay Raiden Shogun size M" className="h-12 rounded-xl bg-slate-50 border-slate-200" />
          {errors.title && <p className="text-rose-500 text-sm">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="font-bold">Danh mục sản phẩm/dịch vụ <span className="text-rose-500">*</span></Label>
          <Select onValueChange={(val: any) => setValue('category', val)} value={watch('category')}>
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200"><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="costume">Trang phục (Costume)</SelectItem>
              <SelectItem value="wig">Tóc giả (Wig)</SelectItem>
              <SelectItem value="props">Đạo cụ / Vũ khí</SelectItem>
              <SelectItem value="shoes">Giày dép</SelectItem>
              <SelectItem value="accessories">Phụ kiện</SelectItem>
              <SelectItem value="studio">Cho thuê Studio</SelectItem>
              <SelectItem value="other">Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!isStudio && (
          <div className="space-y-2">
            <Label className="font-bold">Tên nhân vật / Tựa game (Anime) <span className="text-rose-500">*</span></Label>
            <Input {...register('character_name')} placeholder="Ví dụ: Raiden Shogun - Genshin Impact" className="h-12 rounded-xl bg-slate-50 border-slate-200" />
            {errors.character_name && <p className="text-rose-500 text-sm">{errors.character_name.message}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-bold">Loại hình</Label>
            <Select onValueChange={(val: any) => setValue('listing_type', val)} value={watch('listing_type')}>
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200"><SelectValue placeholder="Chọn loại hình" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rent">Cho Thuê</SelectItem>
                <SelectItem value="sale">Bán Pass</SelectItem>
                <SelectItem value="both">Cho Thuê & Bán</SelectItem>
                <SelectItem value="want_to_rent">Cần Thuê</SelectItem>
                <SelectItem value="want_to_buy">Cần Mua</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {!isStudio && (
            <div className="space-y-2">
              <Label className="font-bold">Size đồ</Label>
              <Select onValueChange={(val: any) => setValue('size', val)} value={watch('size')}>
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200"><SelectValue placeholder="Chọn size" /></SelectTrigger>
                <SelectContent>
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One-size'].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {!isStudio && (
          <div className="space-y-3">
            <Label className="font-bold">Tình trạng đồ (Bao gồm những gì?) <span className="text-rose-500">*</span></Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <Controller
                name="includes"
                control={control}
                render={({ field }) => (
                  <>
                    {INCLUDE_OPTIONS.map((opt) => (
                      <div key={opt.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={opt.id} 
                          checked={field.value?.includes(opt.id)}
                          onCheckedChange={(checked) => {
                            const current = field.value || []
                            const updated = checked 
                              ? [...current, opt.id] 
                              : current.filter((v: string) => v !== opt.id)
                            field.onChange(updated)
                          }}
                        />
                        <label htmlFor={opt.id} className="text-sm font-medium leading-none cursor-pointer">
                          {opt.label}
                        </label>
                      </div>
                    ))}
                  </>
                )}
              />
            </div>
            {errors.includes && <p className="text-rose-500 text-sm">{errors.includes.message}</p>}
          </div>
        )}

        <div className="space-y-2">
          <Label className="font-bold">Mô tả chi tiết (Lưu ý, hỏng hóc...)</Label>
          <Textarea {...register('description')} rows={4} placeholder="Mô tả chi tiết tình trạng đồ, các lưu ý khi mặc, có lỗi gì không..." className="rounded-xl bg-slate-50 border-slate-200 resize-none" />
          {errors.description && <p className="text-rose-500 text-sm">{errors.description.message}</p>}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* TÀI CHÍNH */}
      <div className="space-y-5">
        <h3 className="text-lg font-bold text-slate-800">Tài chính & Vận chuyển</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(listingType === 'rent' || listingType === 'both' || listingType === 'want_to_rent') && (
            <div className="space-y-2">
              <Label className="font-bold">{listingType === 'want_to_rent' ? 'Mức giá muốn thuê / Ngày' : 'Giá thuê / Ngày'}</Label>
              <div className="relative">
                <Controller
                  name="price_per_day"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Input 
                      value={formatCurrency(value || '')}
                      onChange={(e) => onChange(parseCurrency(e.target.value))}
                      placeholder="100.000" 
                      className="h-12 rounded-xl bg-slate-50 border-slate-200 pr-12 font-semibold"
                    />
                  )}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">VNĐ</div>
              </div>
            </div>
          )}
          {(listingType === 'sale' || listingType === 'both' || listingType === 'want_to_buy') && (
            <div className="space-y-2">
              <Label className="font-bold">{listingType === 'want_to_buy' ? 'Mức giá muốn mua' : 'Giá bán pass'}</Label>
              <div className="relative">
                <Controller
                  name="sale_price"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Input 
                      value={formatCurrency(value || '')}
                      onChange={(e) => onChange(parseCurrency(e.target.value))}
                      placeholder="800.000" 
                      className="h-12 rounded-xl bg-slate-50 border-slate-200 pr-12 font-semibold"
                    />
                  )}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">VNĐ</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-bold">Tiền cọc <span className="text-rose-500">*</span></Label>
            <div className="relative">
              <Controller
                name="deposit_amount"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input 
                    value={formatCurrency(value || '')}
                    onChange={(e) => onChange(parseCurrency(e.target.value))}
                    placeholder="2.000.000" 
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 pr-12 font-semibold"
                  />
                )}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">VNĐ</div>
            </div>
            {errors.deposit_amount && <p className="text-rose-500 text-sm">{errors.deposit_amount.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <Label className="font-bold">Tỉnh / Thành phố <span className="text-rose-500">*</span></Label>
            <Input {...register('city')} placeholder="Ví dụ: TP.HCM" className="h-12 rounded-xl bg-slate-50 border-slate-200" />
            {errors.city && <p className="text-rose-500 text-sm">{errors.city.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="font-bold">Quận / Huyện <span className="text-rose-500">*</span></Label>
            <Input {...register('district')} placeholder="Ví dụ: Quận 1" className="h-12 rounded-xl bg-slate-50 border-slate-200" />
            {errors.district && <p className="text-rose-500 text-sm">{errors.district.message}</p>}
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="h-14 px-8 w-full sm:w-auto rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white font-bold shadow-lg shadow-brand-500/30 text-lg transition-all"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang xử lý...
            </span>
          ) : 'Đăng sản phẩm'}
        </Button>
      </div>
    </form>
  )
}
