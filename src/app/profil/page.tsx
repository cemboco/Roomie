"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, LogOut } from "lucide-react"
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from "@/components/ui/usetoast"

const supabase = createClientComponentClient()

export default function ProfilPage() {
  const [name, setName] = useState("Max Mustermann")
  const [email, setEmail] = useState("max@example.com")
  const [avatarUrl, setAvatarUrl] = useState("/placeholder.svg?height=80&width=80")
  const [points, setPoints] = useState(150)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [nameError, setNameError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, avatar_url, points')
          .eq('id', user.id)
          .single()

        if (error) {
          toast({
            title: "Fehler",
            description: "Profil konnte nicht geladen werden.",
            variant: "destructive",
          })
        } else if (data) {
          setName(data.name || "")
          setAvatarUrl(data.avatar_url || "/placeholder.svg?height=80&width=80")
          setPoints(data.points || 0)
          setEmail(user.email || "")
        }
      } else {
        router.push('/login')
      }
      setIsLoading(false)
    }

    fetchProfile()
  }, [router, toast])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        title: "Fehler",
        description: "Abmeldung fehlgeschlagen.",
        variant: "destructive",
      })
    } else {
      router.push('/login')
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}-${Math.random()}.${fileExt}`
        const { error } = await supabase.storage
          .from('avatars')
          .upload(fileName, file)

        if (error) {
          toast({
            title: "Fehler",
            description: "Profilbild konnte nicht hochgeladen werden.",
            variant: "destructive",
          })
        } else {
          const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)

          if (data) {
            setAvatarUrl(data.publicUrl)
            await supabase
              .from('profiles')
              .update({ avatar_url: data.publicUrl })
              .eq('id', user.id)
          }
        }
      }
    }
  }

  const validateName = (name: string) => {
    if (name.length < 2) {
      setNameError("Der Name muss mindestens 2 Zeichen lang sein.")
      return false
    }
    if (name.length > 50) {
      setNameError("Der Name darf nicht länger als 50 Zeichen sein.")
      return false
    }
    setNameError("")
    return true
  }

  const updateProfile = async () => {
    if (!validateName(name)) return

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user.id)

      if (error) {
        toast({
          title: "Fehler",
          description: "Profil konnte nicht aktualisiert werden.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Erfolg",
          description: "Profil wurde erfolgreich aktualisiert.",
        })
        setIsEditing(false)
      }
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Laden...</div>
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
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
              <Button asChild>
                <label htmlFor="avatar-upload">Profilbild ändern</label>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                validateName(e.target.value)
              }}
              disabled={!isEditing}
            />
            {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">E-Mail</label>
            <Input id="email" value={email} disabled />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Punkte</label>
            <p>{points}</p>
          </div>

          {isEditing ? (
            <Button onClick={updateProfile} disabled={!!nameError}>Profil speichern</Button>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Profil bearbeiten</Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}