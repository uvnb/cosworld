import { NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')

  if (!key) {
    return new NextResponse('Missing key', { status: 400 })
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_R2_BUCKET_NAME || 'cosworld-assets',
      Key: key,
    })

    const response = await s3Client.send(command)
    
    // Stream response body
    return new NextResponse(response.Body as any, {
      headers: {
        'Content-Type': response.ContentType || 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error: any) {
    console.error('Error fetching image from R2:', error.message)
    return new NextResponse('Image not found', { status: 404 })
  }
}
