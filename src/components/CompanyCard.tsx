'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, ArrowRight, Building2 } from 'lucide-react'
import type { Company } from '@/types/database'

interface CompanyCardProps {
  company: Company
  primaryColor: string
}

export function CompanyCard({ company, primaryColor }: CompanyCardProps) {
  const hasLocation = company.location && company.location.length > 0
  const hasSectors = company.sectors && company.sectors.length > 0
  const hasOpportunities = company.opportunities && company.opportunities.length > 0

  return (
    <Link href={`/${company.slug}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group overflow-hidden">
        <CardContent className="p-4">
          {/* Logo */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
              {company.logo_url ? (
                <Image
                  src={company.logo_url}
                  alt={company.name}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              ) : (
                <Building2 className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                {company.name}
              </h3>
              {hasSectors && (
                <p className="text-xs text-gray-500 truncate">
                  {company.sectors.slice(0, 2).join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Lokace */}
          {hasLocation && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{company.location.slice(0, 2).join(', ')}</span>
            </div>
          )}

          {/* Prilezitosti */}
          {hasOpportunities && (
            <div className="flex flex-wrap gap-1 mb-3">
              {company.opportunities.slice(0, 3).map((opp, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    color: primaryColor,
                  }}
                >
                  {opp}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div
            className="text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
            style={{ color: primaryColor }}
          >
            Zobrazit profil
            <ArrowRight className="w-3 h-3" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
