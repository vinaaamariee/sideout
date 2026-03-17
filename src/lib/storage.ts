import { supabase } from './supabase'

// Storage bucket names
export const STORAGE_BUCKETS = {
  TEAM_LOGOS: 'team-logos',
  PLAYER_PHOTOS: 'player-photos',
} as const

// Upload types
export type UploadType = 'team-logo' | 'player-photo'

// Get bucket name based on upload type
const getBucketName = (type: UploadType): string => {
  switch (type) {
    case 'team-logo':
      return STORAGE_BUCKETS.TEAM_LOGOS
    case 'player-photo':
      return STORAGE_BUCKETS.PLAYER_PHOTOS
  }
}

// Get folder path based on upload type and entity ID
const getFolderPath = (type: UploadType, entityId: string): string => {
  switch (type) {
    case 'team-logo':
      return `logos/${entityId}`
    case 'player-photo':
      return `photos/${entityId}`
  }
}

// Upload image to Supabase Storage
export async function uploadImage(
  file: File,
  type: UploadType,
  entityId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' }
  }
  try {
    const bucketName = getBucketName(type)
    const folderPath = getFolderPath(type, entityId)
    const fileExt = file.name.split('.').pop()
    const fileName = `${folderPath}/${Date.now()}.${fileExt}`

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName)

    return { success: true, url: urlData.publicUrl }
  } catch (error) {
    console.error('Upload exception:', error)
    return { success: false, error: 'Failed to upload image' }
  }
}

// Delete image from Supabase Storage
export async function deleteImage(
  url: string,
  type: UploadType
): Promise<{ success: boolean; error?: string }> {
  try {
    const bucketName = getBucketName(type)
    
    // Extract file path from URL
    const urlParts = url.split(`/storage/v1/object/public/${bucketName}/`)
    if (urlParts.length < 2) {
      return { success: false, error: 'Invalid URL' }
    }
    
    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete exception:', error)
    return { success: false, error: 'Failed to delete image' }
  }
}

// Validate image file
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File must be a JPEG, PNG, WebP, or GIF image' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' }
  }

  return { valid: true }
}

// Convert file to base64 (for preview)
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

// Create storage buckets (run this as admin to set up)
export async function createStorageBuckets() {
  const { data: existingBuckets } = await supabase.storage.listBuckets()
  
  // Check if buckets already exist
  const teamLogosExists = existingBuckets?.some((b: { name: string }) => b.name === STORAGE_BUCKETS.TEAM_LOGOS)
  const playerPhotosExists = existingBuckets?.some((b: { name: string }) => b.name === STORAGE_BUCKETS.PLAYER_PHOTOS)

  if (!teamLogosExists) {
    const { error: teamLogosError } = await supabase.storage.createBucket(
      STORAGE_BUCKETS.TEAM_LOGOS,
      {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      }
    )
    if (teamLogosError) {
      console.error('Error creating team-logos bucket:', teamLogosError)
    }
  }

  if (!playerPhotosExists) {
    const { error: playerPhotosError } = await supabase.storage.createBucket(
      STORAGE_BUCKETS.PLAYER_PHOTOS,
      {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      }
    )
    if (playerPhotosError) {
      console.error('Error creating player-photos bucket:', playerPhotosError)
    }
  }
}
