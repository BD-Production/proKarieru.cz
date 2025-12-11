'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
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
import { Plus, Loader2, BookOpen } from 'lucide-react'
import { useAdminPortal } from '@/contexts/AdminPortalContext'

type Edition = {
  id: string
  name: string
  year: number
  season: string | null
  location: string | null
  is_active: boolean
  portal: { name: string; slug: string } | null
}

const seasonLabels: Record<string, string> = {
  spring: 'Jaro',
  winter: 'Zima',
  fall: 'Podzim',
}

export function EditionsPageClient() {
  const supabase = createClient()
  const { selectedPortalId, loading: portalLoading } = useAdminPortal()
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (portalLoading) return

      setLoading(true)

      let query = supabase
        .from('editions')
        .select(`
          *,
          portal:portals(name, slug)
        `)
        .order('display_order', { ascending: true })

      if (selectedPortalId) {
        query = query.eq('portal_id', selectedPortalId)
      }

      const { data } = await query

      setEditions((data as Edition[]) || [])
      setLoading(false)
    }

    loadData()
  }, [selectedPortalId, portalLoading, supabase])

  if (loading || portalLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edice</h1>
          <p className="text-gray-500">
            {selectedPortalId
              ? 'Edice ve vybraném portálu'
              : 'Správa edicí brožur'}
          </p>
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
              {!selectedPortalId && <TableHead>Portál</TableHead>}
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
                  {!selectedPortalId && (
                    <TableCell>
                      {edition.portal ? (
                        <Badge variant="outline">{edition.portal.name}</Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  )}
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
                <TableCell colSpan={selectedPortalId ? 6 : 7} className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p>Žádné edice. Přidejte první edici.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
