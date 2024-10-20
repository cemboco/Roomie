import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface ProfileImageUploadProps {
  userId: string;
  url: string | null;
  onUpload: (filePath: string | null) => void;
}

export function ProfileImageUpload({ userId, url, onUpload }: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadAvatar = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setError(null)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Sie müssen ein Bild auswählen zum Hochladen.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}/${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      onUpload(filePath)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fehler beim Hochladen des Avatars!')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }, [userId, onUpload])

  const deleteAvatar = useCallback(async () => {
    try {
      setUploading(true)
      setError(null)

      if (!url) {
        throw new Error('Kein Bild zum Löschen vorhanden.')
      }

      const { error: deleteError } = await supabase.storage
        .from('profile-images')
        .remove([url])

      if (deleteError) {
        throw deleteError
      }

      onUpload(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fehler beim Löschen des Avatars!')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }, [url, onUpload])

  return (
    <div className="flex flex-col items-center">
      {url ? (
        <Avatar className="h-20 w-20">
          <AvatarImage src={url} alt="Avatar" />
          <AvatarFallback>Avatar</AvatarFallback>
        </Avatar>
      ) : (
        <Avatar className="h-20 w-20">
          <AvatarFallback>Avatar</AvatarFallback>
        </Avatar>
      )}
      {error && (
        <p className="text-red-500 text-sm mt-2" role="alert">{error}</p>
      )}
      <div className="mt-4 flex space-x-2">
        <Button disabled={uploading} asChild>
          <label htmlFor="avatar-upload" className="cursor-pointer">
            {uploading ? 'Hochladen ...' : 'Profilbild hochladen'}
          </label>
        </Button>
        <input
          id="avatar-upload"
          className="sr-only"
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          aria-label="Profilbild hochladen"
        />
        {url && (
          <Button variant="destructive" onClick={deleteAvatar} disabled={uploading}>
            Löschen
          </Button>
        )}
      </div>
    </div>
  )
}
