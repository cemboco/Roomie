"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, LogOut, Upload } from "lucide-react"
import { supabase } from '@/components/lib/supabase'
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"

export default function ProfilPage() {
  const { toast } = useToast()
  const [userId, setUserId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [points, setPoints] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    getProfile()
  }, [])

  async function getProfile() {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        setEmail(user.email || "")

        const { data, error } = await supabase
          .from('profiles')
          .select('name, avatar_url, points')
          .eq('id', user.id)
          .single()

        if (error) {
          throw error
        }

        if (data) {
          setName(data.name || "")
          setAvatarUrl(data.avatar_url)
          setPoints(data.points || 0)
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden des Profils', error)
      toast({
        title: "Fehler",
        description: "Profil konnte nicht geladen werden.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Fehler beim Abmelden', error)
      toast({
        title: "Fehler",
        description: "Abmeldung fehlgeschlagen.",
        variant: "destructive",
      })
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Sie müssen ein Bild auswählen zum Hochladen.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      setIsSaving(true)

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = await supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      if (!data || !data.publicUrl) {
        throw new Error('Fehler beim Abrufen der öffentlichen URL')
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', userId)

      if (updateError) {
        throw updateError
      }

      setAvatarUrl(data.publicUrl)
      toast({
        title: "Erfolg",
        description: "Profilbild wurde aktualisiert.",
      })
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Profilbildes', error)
      toast({
        title: "Fehler",
        description: "Profilbild konnte nicht aktualisiert werden.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateProfile = async () => {
    if (userId) {
      try {
        setIsSaving(true)
        const { error } = await supabase
          .from('profiles')
          .update({ name })
          .eq('id', userId)

        if (error) throw error

        toast({
          title: "Erfolg",
          description: "Profil wurde erfolgreich gespeichert.",
        })
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Profils', error)
        toast({
          title: "Fehler",
          description: "Profil konnte nicht aktualisiert werden.",
          variant: "destructive",
        })
      } finally {
        setIsSaving(false)
        setIsEditing(false)
      }
    }
  }

  if (isLoading) {
    return <div>Laden...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Profil</h1>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" aria-label="Einstellungen">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-2" />
            Abmelden
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Dein Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl || undefined} alt={name} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
                disabled={isSaving}
              />
              <Button asChild disabled={isSaving}>
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {isSaving ? 'Wird hochgeladen...' : 'Profilbild ändern'}
                </label>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">E-Mail</label>
            <Input id="email" value={email} disabled />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Punkte</label>
            <p>{points}</p>
          </div>

          <Button 
            onClick={isEditing ? updateProfile : () => setIsEditing(true)} 
            disabled={isSaving}
          >
            {isEditing 
              ? (isSaving ? 'Wird gespeichert...' : 'Profil speichern')
              : 'Profil bearbeiten'
            }
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}