import { S3Client, DeleteObjectsCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!
const R2_BUCKET_NAME = process.env.NEXT_PUBLIC_R2_BUCKET_NAME!

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

/**
 * Xóa một hoặc nhiều file khỏi Cloudflare R2 Storage
 * Hàm này có thể tái sử dụng cho mọi loại dữ liệu (Avatar, Poster Event, Listing Images...)
 * @param keys Mảng chứa các khóa (key) của file cần xóa. Ví dụ: ['listings/123/img.webp', 'events/abc.webp']
 */
export async function deleteFromR2(keys: string[]) {
  if (!keys || keys.length === 0) return true

  try {
    if (keys.length === 1) {
      // Tối ưu khi chỉ xóa 1 file (VD: Đổi Avatar)
      const command = new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: keys[0]
      })
      await s3Client.send(command)
    } else {
      // Xóa hàng loạt (VD: Xóa 1 bài viết có 5 ảnh)
      const command = new DeleteObjectsCommand({
        Bucket: R2_BUCKET_NAME,
        Delete: {
          Objects: keys.map(key => ({ Key: key })),
          Quiet: false, // Bật log lỗi nếu có file không xóa được
        }
      })
      await s3Client.send(command)
    }
    return true
  } catch (error) {
    console.error('Lỗi khi xóa file trên R2:', error)
    return false
  }
}
