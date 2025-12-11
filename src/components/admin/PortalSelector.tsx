'use client'

import { useAdminPortal } from '@/contexts/AdminPortalContext'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Globe, ChevronDown, Loader2 } from 'lucide-react'

export function PortalSelector() {
  const { portals, selectedPortalId, setSelectedPortalId, selectedPortal, loading } =
    useAdminPortal()

  if (loading) {
    return (
      <div className="px-3 py-2 flex items-center gap-2 text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Nacitam...</span>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            {selectedPortal && (
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: selectedPortal.primary_color }}
              />
            )}
            <span className="truncate">{selectedPortal?.name || 'Vyberte portal'}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Vybrat portal</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={selectedPortalId || ''}
          onValueChange={setSelectedPortalId}
        >
          {portals.map((portal) => (
            <DropdownMenuRadioItem key={portal.id} value={portal.id}>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: portal.primary_color }}
                />
                <span>{portal.name}</span>
                {!portal.is_active && (
                  <span className="text-xs text-gray-400 ml-auto">(neaktivni)</span>
                )}
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
