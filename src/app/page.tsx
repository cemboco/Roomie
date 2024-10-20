"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, MessageCircle, ShoppingCart, Users } from "lucide-react"
import Link from "next/link"
import { supabase } from '@/lib/supabase'

function ForgotPasswordComponent({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Passwort zurücksetzen</h2>
      {success ? (
        <p className="text-center text-green-600">
          Ein Link zum Zurücksetzen des Passworts wurde an Ihre E-Mail-Adresse gesendet.
        </p>
      ) : (
        <>
          <p className="text-center text-muted-foreground">
            Geben Sie Ihre E-Mail-Adresse ein, und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
          </p>
          <form onSubmit={handleResetPassword}>
            <div className="space-y-2">
              <Label htmlFor="reset-email">E-Mail</Label>
              <Input 
                id="reset-email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button className="w-full mt-4" type="submit" disabled={loading}>
              {loading ? 'Wird gesendet...' : 'Link zum Zurücksetzen senden'}
            </Button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </form>
        </>
      )}
      <Button variant="link" onClick={onBack} className="w-full">
        Zurück zur Anmeldung
      </Button>
    </div>
  )
}

function AuthComponent() {
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setError(error.message)
    } else {
      // Redirect to dashboard or update UI state
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) {
      setError(error.message)
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError("Diese E-Mail-Adresse ist bereits registriert.")
    } else {
      setRegistrationSuccess(true)
    }
    setLoading(false)
  }

  if (showForgotPassword) {
    return <ForgotPasswordComponent onBack={() => setShowForgotPassword(false)} />
  }

  return (
    <Tabs defaultValue="login" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Anmelden</TabsTrigger>
        <TabsTrigger value="register">Registrieren</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Wird angemeldet...' : 'Anmelden'}
          </Button>
          <Button variant="link" onClick={() => setShowForgotPassword(true)} className="w-full">
            Passwort vergessen?
          </Button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </TabsContent>
      <TabsContent value="register">
        {registrationSuccess ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Registrierung erfolgreich!</h3>
            <p>Bitte überprüfen Sie Ihre E-Mail, um Ihr Konto zu bestätigen.</p>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                type="text" 
                placeholder="Max Mustermann" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Wird registriert...' : 'Registrieren'}
            </Button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        )}
      </TabsContent>
    </Tabs>
  )
}

export default function RoomieLandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b">
        <Link href="/" className="flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">Roomie</span>
        </Link>
        <nav className="flex gap-4 sm:gap-6">
          <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setIsAuthOpen(true)}>Anmelden</Button>
            </DialogTrigger>
            <DialogContent>
              <AuthComponent />
            </DialogContent>
          </Dialog>
          <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsAuthOpen(true)}>Registrieren</Button>
            </DialogTrigger>
            <DialogContent>
              <AuthComponent />
            </DialogContent>
          </Dialog>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Willkommen bei Roomie
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Deine All-in-One-Lösung für ein harmonisches Zusammenleben
                </p>
              </div>
              <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="mt-4" onClick={() => setIsAuthOpen(true)}>Jetzt starten</Button>
                </DialogTrigger>
                <DialogContent>
                  <AuthComponent />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
              Was du mit Roomie alles machen kannst
            </h2>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center">
                <CheckCircle className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-lg font-bold mb-2">Haushaltsaufgaben bewerkstelligen</h3>
                <p className="text-muted-foreground">Organisiere und verteile Aufgaben einfach und fair.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <MessageCircle className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-lg font-bold mb-2">Miteinander chatten</h3>
                <p className="text-muted-foreground">Bleib in Kontakt mit deinen Mitbewohnern.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <ShoppingCart className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-lg font-bold mb-2">Einkaufslisten erstellen</h3>
                <p className="text-muted-foreground">Plane gemeinsame Einkäufe und vergiss nie wieder etwas.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Users className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-lg font-bold mb-2">Gemeinsam den Haushalt managen</h3>
                <p className="text-muted-foreground">Koordiniere alle Aspekte des Zusammenlebens an einem Ort.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© 2024 Roomie. Alle Rechte vorbehalten.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Datenschutz
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Nutzungsbedingungen
          </Link>
        </nav>
      </footer>
    </div>
  )
}