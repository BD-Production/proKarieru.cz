'use client'

interface LoaderProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Loader({ text = 'Načítání...', size = 'md' }: LoaderProps) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        {/* Animated logo/spinner */}
        <div className="relative mx-auto mb-6" style={{ width: size === 'sm' ? 32 : size === 'md' ? 48 : 64, height: size === 'sm' ? 32 : size === 'md' ? 48 : 64 }}>
          <div
            className={`${sizes[size]} rounded-full border-4 border-gray-200 animate-spin`}
            style={{ borderTopColor: '#C34751' }}
          />
        </div>
        <p
          className="text-lg font-medium tracking-tight"
          style={{ color: '#C34751' }}
        >
          {text}
        </p>
      </div>
    </div>
  )
}
