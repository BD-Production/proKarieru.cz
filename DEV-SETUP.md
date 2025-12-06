# Nastavení Dev Prostředí

## Přehled

Projekt podporuje tři prostředí:
- **Local** (`localhost:3000`) - lokální vývoj
- **Development** (`*.dev.fun`) - dev deployment pro testování
- **Production** (`*.cz`) - produkční prostředí

## Dev Domény

### Prokarieru Platform
- `prokarieru-dev.fun` - hlavní landing page
- `admin.prokarieru-dev.fun` - admin rozhraní

### Prostavare Portal
- `prostavare-dev.fun` - portál landing page
- `katalog.prostavare-dev.fun` - katalog firem
- `veletrh.prostavare-dev.fun` - virtuální veletrh

## Konfigurace

### 1. Environment Variables

Pro **dev deployment** použij `.env.development`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://stjedwggzxnglzcleeaw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
NEXT_PUBLIC_APP_URL=https://prokarieru-dev.fun
NEXT_PUBLIC_ENVIRONMENT=development
```

Pro **produkci** použij `.env.production` nebo Vercel environment variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://stjedwggzxnglzcleeaw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
NEXT_PUBLIC_APP_URL=https://prokarieru.cz
NEXT_PUBLIC_ENVIRONMENT=production
```

### 2. DNS Konfigurace

V DNS pro `dev.fun` domény nastav:

```
prokarieru-dev.fun           A    <vercel-ip>
*.prokarieru-dev.fun         A    <vercel-ip>
prostavare-dev.fun           A    <vercel-ip>
*.prostavare-dev.fun         A    <vercel-ip>
```

Nebo použij CNAME na Vercel:
```
prokarieru-dev.fun           CNAME    cname.vercel-dns.com
*.prokarieru-dev.fun         CNAME    cname.vercel-dns.com
prostavare-dev.fun           CNAME    cname.vercel-dns.com
*.prostavare-dev.fun         CNAME    cname.vercel-dns.com
```

### 3. Vercel Setup

1. Vytvoř nový projekt na Vercelu pro dev prostředí
2. Přidej domény v Vercel dashboard:
   - `prokarieru-dev.fun`
   - `*.prokarieru-dev.fun`
   - `prostavare-dev.fun`
   - `*.prostavare-dev.fun`

3. Nastav Environment Variables v Vercelu:
   ```
   NEXT_PUBLIC_ENVIRONMENT=development
   NEXT_PUBLIC_APP_URL=https://prokarieru-dev.fun
   ```

4. Deploy dev větev (např. `develop` nebo `dev`)

## Routing

Middleware automaticky detekuje prostředí podle domény:

```typescript
// Production
prokarieru.cz → /landing
admin.prokarieru.cz → /admin
prostavare.cz → /portal
katalog.prostavare.cz → /catalog
veletrh.prostavare.cz → /fair

// Development
prokarieru-dev.fun → /landing
admin.prokarieru-dev.fun → /admin
prostavare-dev.fun → /portal
katalog.prostavare-dev.fun → /catalog
veletrh.prostavare-dev.fun → /fair
```

## Environment Detection

Použij utility funkce z `src/lib/env.ts`:

```typescript
import { getEnvironment, isDevelopment, isProduction, isLocal } from '@/lib/env'

// Zjisti aktuální prostředí
const env = getEnvironment() // 'local' | 'development' | 'production'

// Podmíněná logika
if (isDevelopment()) {
  console.log('Running in development mode')
}

if (isProduction()) {
  // Production-only kod
}
```

## Supabase

Projekt používá **sdílenou Supabase instanci** pro dev i prod:
- URL: `https://stjedwggzxnglzcleeaw.supabase.co`
- **Důležité**: Při testování v dev prostředí dávej pozor na data - sdílíš je s produkcí!

### Best Practices
- Používej testovací účty s prefixem `test-` nebo `dev-`
- Nepřepisuj produkční data
- Zvažte Row Level Security (RLS) policies pro oddělení dev/prod dat

## Build & Deploy

### Lokální vývoj
```bash
npm run dev
# Běží na http://localhost:3000
```

### Build test
```bash
npm run build
npm run start
```

### Deploy na Vercel
```bash
# Automatický deploy při push do dev větve
git push origin develop

# Nebo manuální deploy
vercel --prod
```

## Troubleshooting

### Middleware nefunguje správně
- Zkontroluj, že domény jsou správně nastavené v DNS
- Ověř, že Vercel má domény přidané v nastavení
- Zkontroluj response headers: `x-environment`, `x-portal-slug`, `x-subdomain`

### Environment proměnné se nenačítají
- `.env.development` je použit jen při `next build` s NODE_ENV=development
- Pro Vercel nastav variables přímo v dashboard
- NEXT_PUBLIC_* proměnné jsou veřejné a dostupné na klientovi

### Session problémy se Supabase
- Cookies musí mít správnou domain scope
- Zkontroluj CORS nastavení v Supabase dashboard
- Přidej dev domény do Allowed URLs v Supabase Auth settings
