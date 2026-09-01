import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as cheerio from 'cheerio'

// --- CÁC MODULE CỦA PHASE 3 ---

// 1. Module tích hợp Apify (Cào Facebook Events)
async function fetchApifyFacebookEvents(): Promise<any[]> {
  const APIFY_TOKEN = process.env.APIFY_API_TOKEN
  if (!APIFY_TOKEN) {
    console.warn('Thiếu APIFY_API_TOKEN. Bỏ qua nguồn Facebook.')
    return []
  }
  
  try {
    // Gọi API của Apify Actor (Ví dụ: Facebook Pages Scraper)
    // const res = await fetch(`https://api.apify.com/v2/acts/apify~facebook-pages-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`, { method: 'POST' })
    // return await res.json()
    return [] // Trả về mảng rỗng chờ tích hợp thực tế
  } catch (err) {
    console.error('Lỗi khi gọi Apify:', err)
    return []
  }
}

// 2. Module cào dữ liệu từ Website Bán vé (VD: Ticketbox)
async function fetchTicketboxEvents(): Promise<any[]> {
  try {
    const res = await fetch('https://ticketbox.vn/events?q=cosplay')
    if (!res.ok) return []
    const html = await res.text()
    const $ = cheerio.load(html)
    const events: any[] = []
    
    // Giả lập logic bóc tách DOM của Ticketbox (cần tuỳ chỉnh theo class thực tế)
    $('.event-item').each((_, el) => {
      events.push({
        title: $(el).find('.title').text().trim(),
        source_url: 'https://ticketbox.vn' + $(el).find('a').attr('href'),
        banner_url: $(el).find('img').attr('src'),
        raw_text: $(el).text() // Dùng AI để trích xuất sau
      })
    })
    return events
  } catch (err) {
    console.error('Lỗi cào Ticketbox:', err)
    return []
  }
}

// 3. Module AI Extract (Chuẩn hoá dữ liệu bằng OpenAI/Gemini)
async function extractEventDataWithAI(rawText: string) {
  // Nếu có API Key, có thể gọi ChatGPT để phân tích:
  // "Hãy tìm Ngày Bắt Đầu, Ngày Kết Thúc, Tỉnh Thành, và Địa Điểm cụ thể trong văn bản sau..."
  
  // Fallback Rule-based (như hiện tại) nếu chưa gắn AI:
  const lowerText = rawText.toLowerCase()
  let province = 'Chưa xác định'
  let location = 'Đang cập nhật'
  
  if (lowerText.includes('hà nội') || lowerText.includes('hanoi')) { province = 'Hà Nội'; location = 'Hà Nội' }
  else if (lowerText.includes('hcm') || lowerText.includes('hồ chí minh')) { province = 'TP. HCM'; location = 'TP. Hồ Chí Minh' }
  else if (lowerText.includes('đà nẵng') || lowerText.includes('danang')) { province = 'Đà Nẵng'; location = 'Đà Nẵng' }

  return { 
    province, 
    location, 
    start_date: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(), // Dummy
    end_date: new Date(new Date().getTime() + 11 * 24 * 60 * 60 * 1000).toISOString() // Dummy
  }
}

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') 
    .replace(/[^a-z0-9]+/g, '-')     
    .replace(/(^-|-$)+/g, '')        
    + '-' + Date.now().toString().slice(-6)
}

export async function GET(request: Request) {
  // 1. Xác thực Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 2. Chạy đồng thời các bộ Crawler (Phase 3 Architecture)
    const [apifyEvents, ticketboxEvents] = await Promise.all([
      fetchApifyFacebookEvents(),
      fetchTicketboxEvents()
    ])

    // Mock data tạm thời để Test nếu các nguồn trên trả về rỗng do chưa có API key
    let rawCrawledData = [...apifyEvents, ...ticketboxEvents]
    
    if (rawCrawledData.length === 0) {
      rawCrawledData = [
        {
          title: 'Lễ hội Manga Comic Con Vietnam (Dữ liệu Test Phase 3)',
          description: 'Sự kiện giao lưu văn hóa cosplay, anime, comic lớn nhất trong năm.',
          banner_url: 'https://images.unsplash.com/photo-1574516709848-1f6305aabaf5?auto=format&fit=crop&q=80',
          raw_text: 'Địa điểm: SECC, Quận 7, TP. HCM. Khai mạc tháng sau.',
          source_url: 'https://www.facebook.com/share/g/19TG16ACDN/?mibextid=wwXIfr'
        }
      ]
    }

    // 3. Tiền xử lý & AI Extraction
    const eventsToInsert = await Promise.all(
      rawCrawledData.map(async (item) => {
        // Áp dụng AI Extract
        const extractedData = await extractEventDataWithAI(item.raw_text || item.description || item.title)
        
        return {
          title: item.title,
          slug: generateSlug(item.title),
          description: item.description || '',
          banner_url: item.banner_url || '',
          location: extractedData.location,
          province: extractedData.province,
          start_date: extractedData.start_date,
          end_date: extractedData.end_date,
          source_url: item.source_url,
          is_crawled: true,
          status: 'PENDING'
        }
      })
    )

    // 4. Lưu vào Database (Sử dụng upsert để bỏ qua các event đã tồn tại)
    const { data, error } = await supabase
      .from('events')
      .upsert(eventsToInsert, { onConflict: 'source_url', ignoreDuplicates: true })
      .select('id, title')

    if (error) {
      console.error('Lỗi khi lưu sự kiện crawl:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Hoàn tất Crawler Pipeline. Đã gửi ${eventsToInsert.length} sự kiện vào hàng đợi (Bỏ qua trùng lặp).`,
      events: data
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
