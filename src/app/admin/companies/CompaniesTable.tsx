'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Building2, Search, Star } from 'lucide-react'

type Edition = {
  id: string
  name: string
}

type Company = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  is_active: boolean
  featured: boolean
  editions: Edition[]
}

interface CompaniesTableProps {
  companies: Company[]
  editions: Edition[]
  timestamp: number
}

export function CompaniesTable({ companies, editions, timestamp }: CompaniesTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEditionId, setSelectedEditionId] = useState<string | null>(null)

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      // Search filter
      const matchesSearch = !searchQuery ||
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.slug.toLowerCase().includes(searchQuery.toLowerCase())

      // Edition filter
      const matchesEdition = !selectedEditionId ||
        company.editions.some((e) => e.id === selectedEditionId)

      return matchesSearch && matchesEdition
    })
  }, [companies, searchQuery, selectedEditionId])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Hledat firmu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Edition filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button
            variant={selectedEditionId === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedEditionId(null)}
          >
            Vše ({companies.length})
          </Button>
          {editions.map((edition) => {
            const count = companies.filter((c) =>
              c.editions.some((e) => e.id === edition.id)
            ).length
            return (
              <Button
                key={edition.id}
                variant={selectedEditionId === edition.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedEditionId(edition.id)}
              >
                {edition.name} ({count})
              </Button>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Logo</TableHead>
              <TableHead>Název</TableHead>
              <TableHead>Edice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Akce</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    {company.logo_url ? (
                      <img
                        src={`${company.logo_url.split('?')[0]}?v=${timestamp}`}
                        alt={company.name}
                        width={40}
                        height={40}
                        className="rounded object-contain"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium flex items-center gap-2">
                      {company.name}
                      {company.featured && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-400 bg-yellow-50">
                          <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                          Hero
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{company.slug}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {company.editions.length > 0 ? (
                        company.editions.map((edition) => (
                          <Badge key={edition.id} variant="outline">
                            {edition.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={company.is_active ? 'default' : 'secondary'}>
                      {company.is_active ? 'Aktivní' : 'Neaktivní'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/companies/${company.id}`}>Upravit</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/companies/${company.id}/editions`}>Edice</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  {searchQuery || selectedEditionId
                    ? 'Žádné firmy neodpovídají filtru.'
                    : 'Žádné firmy. Přidejte první firmu.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      {(searchQuery || selectedEditionId) && (
        <p className="text-sm text-gray-500">
          Zobrazeno {filteredCompanies.length} z {companies.length} firem
        </p>
      )}
    </div>
  )
}
