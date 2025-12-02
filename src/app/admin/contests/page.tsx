import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ContestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Souteze</h1>
        <p className="text-gray-500">Sprava soutezi a prihlasek</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pripravujeme</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-500">
          Sprava soutezi bude dostupna ve Fazi 2 spolu s integraci Ecomail.
        </CardContent>
      </Card>
    </div>
  )
}
