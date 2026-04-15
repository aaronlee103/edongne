import { createClient } from './supabase-client'

export async function uploadImage(file: File): Promise<string | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const ext = file.name.split('.').pop()
  // UUID filename prevents enumeration via storage.list() — the bucket is
  // public for GET, so without an unguessable name an attacker who knows a
  // user's id could list every image they ever uploaded.
  const fileName = `${user.id}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from('images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Upload error:', error.message)
    return null
  }

  const { data } = supabase.storage.from('images').getPublicUrl(fileName)
  return data.publicUrl
}
