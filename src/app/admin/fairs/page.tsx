import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function FairsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Veletrhy</h1>
        <p className="text-gray-500">Sprava veletrhu prace</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pripravujeme</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-500">
          Sprava veletrhu bude dostupna ve Fazi 2.
        </CardContent>
      </Card>
    </div>
  )
}
