'use client'

import { useState } from 'react'
import { ListingsGrid } from '@/components/listings/ListingsGrid'
import { ListingFilters } from '@/lib/hooks/useListings'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export function ListingsSection({ initialQuery }: { initialQuery?: string }) {
  const [filters, setFilters] = useState<ListingFilters>({
    query: initialQuery || '',
    listingMode: 'all',
    sizes: [],
    category: '',
    city: ''
  })

  const handleSizeChange = (size: string, checked: boolean) => {
    setFilters(prev => {
      const sizes = prev.sizes || []
      if (checked) {
        return { ...prev, sizes: [...sizes, size] }
      } else {
        return { ...prev, sizes: sizes.filter(s => s !== size) }
      }
    })
  }

  const resetFilters = () => {
    setFilters({ query: initialQuery || '', listingMode: 'all', sizes: [], category: '', city: '' })
  }

  return (
    <div className="space-y-6 mt-8">
      
      {/* Top Bar: Title & Listing Mode Segments */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900">Sàn Giao Dịch Cosplay Toàn Quốc</h2>
          <p className="text-xs text-slate-500 mt-1">Hơn 500+ trang phục cho thuê & đồ thanh lý pass lại từ cộng đồng cosplayer uy tín</p>
        </div>
        
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link href="/listings/new">
            <button className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-5 py-2.5 rounded-2xl flex items-center gap-2 transition shadow-md shadow-brand-600/20">
              <Plus className="w-4 h-4" /> Đăng đồ cho thuê / Bán pass
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar: Filters (3 Cols) */}
        <aside className="xl:col-span-3 space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                BỘ LỌC SẢN PHẨM
              </h3>
              <button onClick={resetFilters} className="text-[11px] font-bold text-brand-600 hover:text-brand-700">Làm mới</button>
            </div>
            
            <div className="space-y-6">
              
              {/* Type Filter */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700">Hình thức</label>
                <div className="flex bg-slate-100 p-1 rounded-2xl w-full">
                  {(['all', 'rent', 'sale'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setFilters({ ...filters, listingMode: mode })}
                      className={`flex-1 text-center py-2 text-[11px] sm:text-xs font-bold rounded-xl transition ${
                        filters.listingMode === mode 
                          ? 'bg-white text-slate-900 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {mode === 'all' ? 'Tất cả' : mode === 'rent' ? 'Thuê' : 'Pass lại'}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Size Filter */}
              {filters.category !== 'studio' && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700">Size trang phục</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One-size'].map(size => (
                      <div key={size} className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <Checkbox 
                          id={`size-${size}`} 
                          checked={filters.sizes?.includes(size)}
                          onCheckedChange={(checked) => handleSizeChange(size, checked as boolean)}
                        />
                        <label htmlFor={`size-${size}`} className="text-xs font-semibold text-slate-600 cursor-pointer">
                          {size === 'One-size' ? 'One-size' : `Size ${size}`}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Danh mục món đồ</label>
                <Select 
                  value={filters.category || 'all'} 
                  onValueChange={(val: any) => setFilters({
                    ...filters, 
                    category: val === 'all' ? '' : val,
                    sizes: val === 'studio' ? [] : filters.sizes
                  })}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-100 text-sm font-medium">
                    <SelectValue placeholder="Tất cả danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    <SelectItem value="costume">Trang phục (Costume)</SelectItem>
                    <SelectItem value="wig">Tóc giả (Wig)</SelectItem>
                    <SelectItem value="props">Đạo cụ / Vũ khí</SelectItem>
                    <SelectItem value="shoes">Giày dép</SelectItem>
                    <SelectItem value="accessories">Phụ kiện</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-bold text-slate-700">Khu vực (PostGIS Matching)</label>
                  <p className="text-[10px] text-slate-400 mt-0.5 mb-1.5">Độ lệch an toàn Fuzzy ±500m</p>
                </div>
                <Input 
                  placeholder="Nhập tỉnh/thành phố..." 
                  className="h-11 rounded-xl bg-slate-50 border-slate-100 text-sm font-medium"
                  value={filters.city || ''}
                  onChange={(e) => setFilters({...filters, city: e.target.value})}
                />
              </div>

            </div>
          </div>
        </aside>

        {/* Right: Listing Grid (9 Cols) */}
        <section className="xl:col-span-9 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500">Hiển thị các sản phẩm</h3>
            <Select defaultValue="newest">
              <SelectTrigger className="h-9 rounded-xl bg-white border-slate-200 text-xs font-bold w-[130px]">
                <SelectValue placeholder="Mới đăng nhất" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới đăng nhất</SelectItem>
                <SelectItem value="price_asc">Giá thấp đến cao</SelectItem>
                <SelectItem value="price_desc">Giá cao đến thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <ListingsGrid filters={filters} />
        </section>
        
      </div>
    </div>
  )
}
