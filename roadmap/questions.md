# proKarieru - Otevrene otazky

Seznam otazek, ktere potrebuji objasneni pred nebo behem implementace.

---

## Kriticke otazky (VSECHNY ZODPOVEZENY ✅)

*Vsechny kriticke otazky byly zodpovezeny - viz sekce "Zodpovezene otazky" nize.*
---

## Technicke otazky

### 4. Lokalni vyvoj
- **Otazka:** Jak resit multi-domain routing lokalne?
- **Mozne reseni:**
  - Upravit `/etc/hosts` nebo `C:\Windows\System32\drivers\etc\hosts`
  - Pridat: `127.0.0.1 localhost katalog.localhost veletrh.localhost admin.localhost`
- **Status:** K ROZHODNUTI

### 5. Obrazky firem
- **Otazka:** Jsou jiz k dispozici obrazky stranek brozury pro testovani?
- **Kontext:** Pro testovani uploadu a zobrazeni.
- **Status:** jsou k dispozici 
---

## Produktove otazky

### 6. Prvni portal
- **Otazka:** Zacit primo s prostavare.cz, nebo nejdrive obecny prokarieru.cz?
- **Doporuceni:** Dle dokumentace zacit s katalogem pro prostavare.cz (jiz existuje reference https://prostavare.vercel.app/)
- **Status:** začal bych s prokarieru.cz jenom ale velmi rychle a administrací a potom se podívat už na prostavare.cz

### 7. Ecomail
- **Otazka:** Jsou k dispozici Ecomail API credentials pro integraci soutezi?
- **Kontext:** Potrebne pro Fazi 2 (Veletrh).
- **Status:** CEKA NA ODPOVED (neni kriticke pro MVP) 
bude doplněno

---

## Zodpovezene otazky

### 1. Supabase projekt ✅
- **Odpoved:** Existuje
- **URL:** https://stjedwggzxnglzcleeaw.supabase.co
- **Anon key:** k dispozici

### 2. Domeny ✅
- **Odpoved:** prokarieru.cz a prostavare.cz jsou zakoupeny

### 3. Vercel + GitHub ✅
- **Odpoved:** K dispozici
- **GitHub repo:** https://github.com/BD-Production/proKarieru.cz.git

### 4. Testovaci obrazky ✅
- **Odpoved:** Jsou k dispozici

### 5. Prvni portal ✅
- **Odpoved:** Zacit s prokarieru.cz (rychle admin), pak prostavare.cz

### 6. Ecomail ⏳
- **Odpoved:** Bude doplneno pozdeji (neni kriticke pro MVP)
