'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckCircle, Loader2, Send } from 'lucide-react'

interface CompanyInquiryFormProps {
  primaryColor?: string
}

const INTEREST_OPTIONS = [
  { id: 'katalog', label: 'Prezentace v katalogu firem' },
  { id: 'veletrh', label: 'Ucast na karierni veletrhu' },
  { id: 'soutez', label: 'Sponzorovani studentske souteze' },
]

export function CompanyInquiryForm({ primaryColor = '#C34751' }: CompanyInquiryFormProps) {
  const [formData, setFormData] = useState({
    company_name: '',
    ico: '',
    contact_name: '',
    email: '',
    phone: '',
    message: '',
    interest_type: [] as string[],
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

  const handleInterestChange = (interestId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      interest_type: checked
        ? [...prev.interest_type, interestId]
        : prev.interest_type.filter((id) => id !== interestId),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/company-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Nepodarilo se odeslat formular')
      }

      setSuccess(true)
      setFormData({
        company_name: '',
        ico: '',
        contact_name: '',
        email: '',
        phone: '',
        message: '',
        interest_type: [],
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
          <h3 className="font-semibold text-lg mb-2">Dekujeme za vas zajem!</h3>
          <p className="text-gray-600 text-sm mb-4">
            Vasi poptavku jsme prijali a ozveme se vam co nejdrive.
          </p>
          <Button variant="outline" onClick={() => setSuccess(false)}>
            Odeslat dalsi poptavku
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mam zajem o spolupracy</CardTitle>
        <CardDescription>
          Vyplnte formular a my se vam ozveme s nabidkou na miru.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Nazev firmy *</Label>
              <Input
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Vase firma s.r.o."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ico">ICO</Label>
              <Input
                id="ico"
                name="ico"
                value={formData.ico}
                onChange={handleChange}
                placeholder="12345678"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_name">Kontaktni osoba *</Label>
            <Input
              id="contact_name"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleChange}
              placeholder="Jan Novak"
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jan.novak@firma.cz"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+420 123 456 789"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>O co mate zajem?</Label>
            {INTEREST_OPTIONS.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`interest-${option.id}`}
                  checked={formData.interest_type.includes(option.id)}
                  onCheckedChange={(checked) =>
                    handleInterestChange(option.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`interest-${option.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Zprava</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Napiste nam vice o vasich potrebach..."
              rows={4}
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="gdpr_consent"
              name="gdpr_consent"
              checked={formData.gdpr_consent}
              onChange={handleChange}
              required
              className="mt-1 rounded border-gray-300"
            />
            <Label htmlFor="gdpr_consent" className="text-sm text-gray-600">
              Souhlasim se zpracovanim osobnich udaju za ucelem zpracovani poptavky. *
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
                Odeslat poptavku
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
