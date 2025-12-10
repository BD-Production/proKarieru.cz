'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Loader2, Send } from 'lucide-react'

interface ContactFormProps {
  companyId: string
  companyName: string
  portalId?: string
  primaryColor?: string
}

export function ContactForm({
  companyId,
  companyName,
  portalId,
  primaryColor = '#C34751',
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    gdpr_consent: false,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          portal_id: portalId,
          ...formData,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Nepodarilo se odeslat formular')
      }

      setSuccess(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        gdpr_consent: false,
      })
    } catch (err: any) {
      setError(err.message || 'Nastala chyba')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
          <h3 className="font-semibold text-lg mb-2">Dekujeme za zajem!</h3>
          <p className="text-gray-600 text-sm">
            Vasi zpravu jsme prijali a predame ji firme {companyName}.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setSuccess(false)}
          >
            Odeslat dalsi zpravu
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Mam zajem o tuto firmu</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-name">Jmeno *</Label>
            <Input
              id="contact-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Jan Novak"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email">Email *</Label>
            <Input
              id="contact-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jan.novak@email.cz"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-phone">Telefon</Label>
            <Input
              id="contact-phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+420 123 456 789"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-message">Zprava</Label>
            <Textarea
              id="contact-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Napiste neco o sobe nebo co vas zajima..."
              rows={4}
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="contact-gdpr"
              name="gdpr_consent"
              checked={formData.gdpr_consent}
              onChange={handleChange}
              required
              className="mt-1 rounded border-gray-300"
            />
            <Label htmlFor="contact-gdpr" className="text-sm text-gray-600">
              Souhlasim se zpracovanim osobnich udaju za ucelem predani kontaktu
              firmam. *
            </Label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            style={{ backgroundColor: primaryColor }}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Odesilam...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Odeslat zajem
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
