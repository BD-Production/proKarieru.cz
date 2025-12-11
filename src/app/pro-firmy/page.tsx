import { headers } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CompanyInquiryForm } from '@/components/CompanyInquiryForm'
import {
  Users,
  Target,
  TrendingUp,
  Award,
  ArrowLeft,
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold" style={{ color: primaryColor }}>
              {portal?.name || 'proKarieru'}
            </span>
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zpet na portal
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Oslovte tisice{' '}
            <span style={{ color: primaryColor }}>budoucich stavaru</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Predstavte svou firmu studentum stavebnictvi. Ziskejte kvalitni kandidaty
            na staze, brigady i plne uvazky.
          </p>
        </div>
      </section>

      {/* Vyhody */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Proc inzerovat na {portal?.name || 'proKarieru'}?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <Target className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h3 className="font-semibold mb-2">Cilene osloveni</h3>
                <p className="text-gray-600 text-sm">
                  Vasí nabídku uvidi pouze studenti stavebnictvi a pribuznych oboru.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <Users className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h3 className="font-semibold mb-2">Tisice studentu</h3>
                <p className="text-gray-600 text-sm">
                  Propojeni s karierni mi centry vysokych skol po cele CR.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <TrendingUp className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h3 className="font-semibold mb-2">Meritelne vysledky</h3>
                <p className="text-gray-600 text-sm">
                  Sledujte kolik studentu si prohledlo vasi firmu a projevilo zajem.
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
                <h3 className="font-semibold mb-2">Budovani znacky</h3>
                <p className="text-gray-600 text-sm">
                  Posilte employer branding mezi budoucimi absolventy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Co nabizime */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Co nabizime</h2>
          <div className="grid md:grid-cols-3 gap-6">
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
                    Kontaktni formular pro zajemce
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Brozura/prezentace firmy
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Ucast na veletrzich</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Prezencni setkani se studenty
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Stanek na kariernich dnech
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Workshopy a prednasky
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Studentske souteze</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Sponzorovani soutezi
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Zadani diplomovych praci
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Mentoring studentu
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Formular */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">
            Zaujala vas spoluprace?
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Vyplnte formular a ozveme se vam s nabidkou na miru.
          </p>
          <CompanyInquiryForm primaryColor={primaryColor} />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} proKarieru
        </div>
      </footer>
    </div>
  )
}
