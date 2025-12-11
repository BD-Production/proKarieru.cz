'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Phone, Building2, Calendar, MessageSquare, Loader2, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAdminPortal } from '@/contexts/AdminPortalContext'

type Lead = {
  id: string
  name: string
  email: string
  phone: string | null
  message: string | null
  status: string
  created_at: string
  company: { id: string; name: string; slug: string } | null
  portal: { id: string; name: string } | null
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'new':
      return <Badge variant="default">Nový</Badge>
    case 'contacted':
      return <Badge variant="secondary">Kontaktován</Badge>
    case 'closed':
      return <Badge variant="outline">Uzavřený</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function LeadsPageClient() {
  const supabase = createClient()
  const { selectedPortalId, loading: portalLoading } = useAdminPortal()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (portalLoading) return

    setLoading(true)

    let query = supabase
      .from('contact_leads')
      .select(`
        *,
        company:companies(id, name, slug),
        portal:portals(id, name)
      `)
      .order('created_at', { ascending: false })

    if (selectedPortalId) {
      query = query.eq('portal_id', selectedPortalId)
    }

    const { data } = await query

    setLeads((data as Lead[]) || [])
    setLoading(false)
  }

  const handleResolve = async (id: string) => {
    await supabase
      .from('contact_leads')
      .update({ status: 'closed' })
      .eq('id', id)
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tohoto zájemce?')) return
    await supabase
      .from('contact_leads')
      .delete()
      .eq('id', id)
    loadData()
  }

  useEffect(() => {
    loadData()
  }, [selectedPortalId, portalLoading])

  if (loading || portalLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const totalLeads = leads.length
  const newLeads = leads.filter((l) => l.status === 'new').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Zájemci</h1>
        <p className="text-gray-500">
          {selectedPortalId
            ? 'Zájemci z vybraného portálu'
            : 'Přehled zájemců z kontaktních formulářů'}
        </p>
      </div>

      {/* Statistiky */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Celkem zájemců
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalLeads}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Nových
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{newLeads}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabulka */}
      {leads.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Jméno</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Firma</TableHead>
                {!selectedPortalId && <TableHead>Portál</TableHead>}
                <TableHead>Zpráva</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {formatDate(lead.created_at)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {lead.email}
                        </a>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a
                            href={`tel:${lead.phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {lead.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.company ? (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span>{lead.company.name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  {!selectedPortalId && (
                    <TableCell>
                      {lead.portal ? (
                        <Badge variant="outline">{lead.portal.name}</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="max-w-xs">
                    {lead.message ? (
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600 truncate" title={lead.message}>
                          {lead.message}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(lead.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {lead.status !== 'closed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolve(lead.id)}
                          title="Označit jako vyřešené"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(lead.id)}
                        title="Smazat"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Zatím žádní zájemci</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
