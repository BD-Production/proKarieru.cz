'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

type Inquiry = {
  id: string
  company_name: string
  ico: string | null
  contact_name: string
  email: string
  phone: string | null
  message: string | null
  status: string
  created_at: string
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
      return <Badge variant="default">Nová</Badge>
    case 'contacted':
      return <Badge variant="secondary">Kontaktována</Badge>
    case 'converted':
      return <Badge className="bg-green-500">Konvertována</Badge>
    case 'closed':
      return <Badge variant="outline">Uzavřená</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function InquiriesPage() {
  const supabase = createClient()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('company_inquiries')
      .select('*')
      .order('created_at', { ascending: false })

    setInquiries((data as Inquiry[]) || [])
    setLoading(false)
  }

  const handleResolve = async (id: string) => {
    await supabase
      .from('company_inquiries')
      .update({ status: 'closed' })
      .eq('id', id)
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tuto poptávku?')) return
    await supabase
      .from('company_inquiries')
      .delete()
      .eq('id', id)
    loadData()
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const totalInquiries = inquiries.length
  const newInquiries = inquiries.filter((i) => i.status === 'new').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Firemní poptávky</h1>
        <p className="text-gray-500">Přehled poptávek od firem</p>
      </div>

      {/* Statistiky */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Celkem poptávek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalInquiries}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Nových
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{newInquiries}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabulka */}
      {inquiries.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Firma</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Zpráva</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {formatDate(inquiry.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        {inquiry.company_name}
                      </div>
                      {inquiry.ico && (
                        <div className="text-sm text-gray-500">
                          IČO: {inquiry.ico}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{inquiry.contact_name}</div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a
                          href={`mailto:${inquiry.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {inquiry.email}
                        </a>
                      </div>
                      {inquiry.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a
                            href={`tel:${inquiry.phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {inquiry.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {inquiry.message ? (
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p
                          className="text-sm text-gray-600 truncate"
                          title={inquiry.message}
                        >
                          {inquiry.message}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {inquiry.status !== 'closed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolve(inquiry.id)}
                          title="Označit jako vyřešené"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(inquiry.id)}
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
            <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Zatím žádné firemní poptávky</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
