import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Lấy Regex để extract location và province
function extractLocationData(text: string) {
  const lowerText = text.toLowerCase()
  if (lowerText.includes('hà nội') || lowerText.includes('hanoi')) return { province: 'Hà Nội', location: 'Hà Nội' }
  if (lowerText.includes('hcm') || lowerText.includes('hồ chí minh')) return { province: 'TP. HCM', location: 'TP. Hồ Chí Minh' }
  if (lowerText.includes('đà nẵng') || lowerText.includes('danang')) return { province: 'Đà Nẵng', location: 'Đà Nẵng' }
  if (lowerText.includes('cần thơ')) return { province: 'Cần Thơ', location: 'Cần Thơ' }
  if (lowerText.includes('đà lạt')) return { province: 'Lâm Đồng', location: 'Đà Lạt' }
  
  return { province: 'Chưa xác định', location: 'Đang cập nhật' }
}

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9]+/g, '-')     // replace non-alphanumeric with dash
    .replace(/(^-|-$)+/g, '')        // trim dashes
    + '-' + Date.now().toString().slice(-6)
}

export async function GET(request: Request) {
  // 1. Xác thực Vercel Cron (chống request từ bên ngoài)
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 2. Khởi tạo Supabase Client (sử dụng Service Role Key để bỏ qua RLS vì Cron chạy ở Server)
    // Nếu không có service_role_key, ta dùng anon key tạm thời cho mục đích demo
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 3. Crawler Logic (Giả lập việc cào dữ liệu từ Facebook Graph API hoặc Puppeteer)
    // Thực tế: fetch('https://api.facebook.com/v16.0/.../events')
    const crawledData = [
      {
        title: 'Lễ hội Manga Comic Con Vietnam (Mẫu 1)',
        description: 'Sự kiện giao lưu văn hóa cosplay, anime, comic lớn nhất trong năm.',
        banner_url: 'https://images.unsplash.com/photo-1574516709848-1f6305aabaf5?auto=format&fit=crop&q=80',
        text_content: 'Địa điểm: SECC, Quận 7, TP. HCM',
        start_date: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(new Date().getTime() + 11 * 24 * 60 * 60 * 1000).toISOString(),
        source_url: 'https://www.facebook.com/share/g/19TG16ACDN/?mibextid=wwXIfr'
      },
      {
        title: 'Natsu Matsuri - Lễ hội mùa hè (Mẫu 2)',
        description: 'Lễ hội văn hóa Nhật Bản kết hợp sự kiện cosplay quy mô lớn.',
        banner_url: 'https://images.unsplash.com/photo-1628102491629-778571d893a3?auto=format&fit=crop&q=80',
        text_content: 'Địa điểm: AEON Mall Long Biên, Hà Nội. Thời gian: 25-26/09/2026',
        start_date: new Date(new Date().getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(new Date().getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        source_url: 'https://www.facebook.com/share/g/1Hp2iuQ8z9/?mibextid=wwXIfr'
      },
      {
        title: 'Cosplay Festival - Cần Thơ (Mẫu 3)',
        description: 'Sự kiện offline cho cộng đồng Coser miền Tây.',
        banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
        text_content: 'Địa điểm: Sense City Cần Thơ',
        start_date: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        source_url: 'https://www.facebook.com/share/g/184cCacXee/?mibextid=wwXIfr'
      }
    ]

    const eventsToInsert = crawledData.map(item => {
      const locationData = extractLocationData(item.text_content)
      
      return {
        title: item.title,
        slug: generateSlug(item.title),
        description: item.description,
        banner_url: item.banner_url,
        location: locationData.location,
        province: locationData.province,
        start_date: item.start_date,
        end_date: item.end_date,
        source_url: item.source_url,
        is_crawled: true,
        status: 'PENDING' // Chờ Admin duyệt
      }
    })

    // 4. Lưu vào Database
    const { data, error } = await supabase
      .from('events')
      .insert(eventsToInsert)
      .select('id, title')

    if (error) {
      console.error('Lỗi khi lưu sự kiện crawl:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Đã cào và chờ duyệt ${data.length} sự kiện.`,
      events: data
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
