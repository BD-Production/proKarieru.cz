import { unstable_noStore as noStore } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
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
import { Mail, Phone, Building2, Calendar, MessageSquare } from 'lucide-react'

export default async function InquiriesPage() {
  noStore()
  const supabase = await createClient()

  // Nacist vsechny firemni poptavky
  const { data: inquiries } = await supabase
    .from('company_inquiries')
    .select('*')
    .order('created_at', { ascending: false })

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
        return <Badge variant="default">Nova</Badge>
      case 'contacted':
        return <Badge variant="secondary">Kontaktovana</Badge>
      case 'converted':
        return <Badge className="bg-green-500">Konvertovana</Badge>
      case 'rejected':
        return <Badge variant="outline">Odmitnuta</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getInterestLabel = (type: string) => {
    switch (type) {
      case 'katalog':
        return 'Katalog'
      case 'veletrh':
        return 'Veletrh'
      case 'soutez':
        return 'Soutez'
      default:
        return type
    }
  }

  // Statistiky
  const totalInquiries = inquiries?.length || 0
  const newInquiries = inquiries?.filter((i) => i.status === 'new').length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Firemni poptavky</h1>
        <p className="text-gray-500">Prehled poptavek od firem</p>
      </div>

      {/* Statistiky */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Celkem poptavek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalInquiries}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Novych
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{newInquiries}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabulka */}
      {inquiries && inquiries.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Firma</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Zajem o</TableHead>
                <TableHead>Zprava</TableHead>
                <TableHead>Status</TableHead>
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
                          ICO: {inquiry.ico}
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
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {inquiry.interest_type?.map((type: string) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {getInterestLabel(type)}
                        </Badge>
                      ))}
                      {(!inquiry.interest_type || inquiry.interest_type.length === 0) && (
                        <span className="text-gray-400">-</span>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Zatim zadne firemni poptavky</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
