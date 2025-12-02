import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'

export default async function PortalsPage() {
  const supabase = await createClient()
  const { data: portals } = await supabase
    .from('portals')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portaly</h1>
          <p className="text-gray-500">Sprava kariernich portalu</p>
        </div>
        <Button asChild>
          <Link href="/admin/portals/new">
            <Plus className="mr-2 h-4 w-4" />
            Pridat portal
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nazev</TableHead>
              <TableHead>Domena</TableHead>
              <TableHead>Barva</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Akce</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {portals && portals.length > 0 ? (
              portals.map((portal) => (
                <TableRow key={portal.id}>
                  <TableCell className="font-medium">{portal.name}</TableCell>
                  <TableCell>{portal.domain}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: portal.primary_color }}
                      />
                      {portal.primary_color}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={portal.is_active ? 'default' : 'secondary'}>
                      {portal.is_active ? 'Aktivni' : 'Neaktivni'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/portals/${portal.id}`}>Upravit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Zadne portaly. Pridejte prvni portal.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
