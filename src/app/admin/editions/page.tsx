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

export default async function EditionsPage() {
  const supabase = await createClient()
  const { data: editions } = await supabase
    .from('editions')
    .select(`
      *,
      portal:portals(name, slug)
    `)
    .order('display_order', { ascending: true })

  const seasonLabels: Record<string, string> = {
    spring: 'Jaro',
    winter: 'Zima',
    fall: 'Podzim',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edice</h1>
          <p className="text-gray-500">Správa edicí brožur</p>
        </div>
        <Button asChild>
          <Link href="/admin/editions/new">
            <Plus className="mr-2 h-4 w-4" />
            Nová edice
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Název</TableHead>
              <TableHead>Portál</TableHead>
              <TableHead>Rok</TableHead>
              <TableHead>Sezóna</TableHead>
              <TableHead>Lokace</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Akce</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editions && editions.length > 0 ? (
              editions.map((edition) => (
                <TableRow key={edition.id}>
                  <TableCell className="font-medium">{edition.name}</TableCell>
                  <TableCell>
                    {edition.portal ? (
                      <Badge variant="outline">{edition.portal.name}</Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{edition.year}</TableCell>
                  <TableCell>
                    {edition.season ? seasonLabels[edition.season] || edition.season : '-'}
                  </TableCell>
                  <TableCell>{edition.location || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={edition.is_active ? 'default' : 'secondary'}>
                      {edition.is_active ? 'Aktivní' : 'Neaktivní'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/editions/${edition.id}`}>Upravit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Žádné edice. Přidejte první edici.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
