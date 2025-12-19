import { headers } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CompanyInquiryForm } from '@/components/CompanyInquiryForm'
import { PortalHeader } from '@/components/PortalHeader'
import { PortalFooter } from '@/components/PortalFooter'
import {
  Target,
  Award,
  CheckCircle,
} from 'lucide-react'

export default async function ProFirmyPage() {
  const headersList = await headers()
  const portalSlug = headersList.get('x-portal-slug')

  const supabase = await createClient()

  // Nacist portal
  const { data: portal } = await supabase
    .from('portals')
    .select('*')
    .eq('slug', portalSlug)
    .eq('is_active', true)
    .single()

  const primaryColor = portal?.primary_color || '#C34751'

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <PortalHeader
        portalName={portal?.name || 'proKariéru'}
        primaryColor={primaryColor}
        currentPage="profirmy"
      />

      {/* Hero */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Oslovte tisíce{' '}
            <span style={{ color: primaryColor }}>budoucích stavařů</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Představte svou firmu studentům stavebnictví. Získejte kvalitní kandidáty
            na stáže, brigády i plné úvazky.
          </p>
        </div>
      </section>

      {/* Výhody */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Proč inzerovat na {portal?.name || 'proKariéru'}?
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <Target className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h3 className="font-semibold mb-2">Cílené oslovení</h3>
                <p className="text-gray-600 text-sm">
                  Vaši nabídku uvidí pouze studenti stavebnictví a příbuzných oborů.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <Award className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h3 className="font-semibold mb-2">Budování značky</h3>
                <p className="text-gray-600 text-sm">
                  Posilte employer branding mezi budoucími absolventy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Co nabízíme */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Co nabízíme</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Prezentace v katalogu</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Profil firmy s logem a popisem
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Kontaktní formulář pro zájemce
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Brožura/prezentace firmy
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Studentské soutěže</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Sponzorování soutěží
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Zadání diplomových prací
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Mentoring studentů
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Formulář */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">
            Zaujala vás spolupráce?
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Vyplňte formulář a ozveme se vám s nabídkou na míru.
          </p>
          <CompanyInquiryForm primaryColor={primaryColor} />
        </div>
      </section>

      {/* Footer */}
      <PortalFooter />
    </div>
  )
}
