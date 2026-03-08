# CGI Suvepraktika – Restorani Lauabroneeringute Rakendus

Veebipõhine rakendus restorani laudade haldamiseks ja broneerimiseks. Kasutaja saab vaadata laudade paigutust, otsida vabu laudu filtrite abil ning lasta süsteemil soovitada sobivaid laudu.

## Tehnoloogiad

| Osa | Tehnoloogia |
|---|---|
| Backend | Java 25, Spring Boot 3, Spring Data JPA |
| Build | Gradle |
| Andmebaas | PostgreSQL 14, Liquibase (migratsioonid) |
| Frontend | React 19, TypeScript, Vite |
| Konteinerid | Docker, Docker Compose |

---

## Projekti käivitamine

### 1. Backend + andmebaas

Projekti juurkaustas käivita:

```bash
docker-compose up --build
```

See käivitab:
- **PostgreSQL** andmebaasi pordil `5432`
- **Spring Boot** backendi pordil `8080`

Liquibase rakendab automaatselt andmebaasi migratsioonid (skeema loomine + näidisandmed).

Backend on kättesaadav aadressil: `http://localhost:8080`

---

### 2. Frontend

Ava eraldi terminalis:

```bash
cd frontend
npm install
npm run dev
```

Frontend käivitub aadressil: `http://localhost:5173`

> Frontend eeldab, et backend töötab `localhost:8080` peal.

---

### Keskkonna muutujad

Docker Compose kasutab vaikimisi järgmisi väärtusi. Soovi korral saab need `.env` failis üle kirjutada:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=ParimKandideerija
POSTGRES_DB=postgres
```

---

## Dokumentatsioon
Veebirakenduse tegemiseks läks aega umbes 1 nädal, mida tegin jooksvalt oma vabal ajal kooli kõrvalt. Suur osa läks mõtlemiseks, kuidas ma seda teha kavatsen.
Kõige keerulisem osa oli kindlasti soovitusalgoritmi loomine. Sellega läks palju aega. Ei tahtnud lihtsalt võtta sisestatud inimeste arvu ja sellele liita +2, mis oleks ülempiir.
Mu andmebaasis on vähe laudu, seega siin see väga hästi ei kajastu, aga soovitus pakub 5 parimat lauda. Suure restorani puhul(palju laudu) oleks see kindlasti sobilik.
Lasin AI-l genereerida skoori arvutamise põhjal saadud parimad lauad.

- **Backend** on loodud tuginedes varasemale Spring Boot projektile. Github: https://github.com/GrGrit/Fiish
- **Andmebaasis** `initial-schema.xml` on algatatud enda poolt ja töö kiirendamiseks kasutatud AI abi. Ülejäänud andmebaasi failid on täielikult AI kirjutatud
- **Soovitusalgoritmi/vabade laudade loogika** (`recommendTables` ja `getAvailableTables`) on kirjutatud AI abil.
- **Frontend** (React komponendid, stiilid, API integratsioon) on genereeritud AI abil. Olin liiga optimistlik ja arvasin, et suudan reacti endale selgeks teha
  ja fronti ise kujundada.


### Soovitusalgoritmi kirjeldus

Endpoint `POST /api/reservations/recommend-tables` tagastab parima(d) laua(d) kasutaja soovide põhjal.

Kontrollitakse, et kuupäev, algus- ja lõppaeg ning seltskonna suurus on antud ning et algusaeg on enne lõpuaega.
Laudu otsitakse vahemikus `seltskonna suurus kuni seltskonna suurus * 1.5`, et leida sobivaid, kuid mitte liiga suuri laudu.

Igale järelejäänud lauale arvutatakse skoor:

```
skoor = 100
      - (istekohtade arv - seltskonna suurus) × 10   // karistus liiga suure laua eest
      + eelistatud omaduste arv × 15                  // boonus eelistatud omaduste eest
      + 10 (kui laud asub eelistatud tsoonis)
```
Lauad sorteeritakse skoori järgi kahanevalt (kõrgem = parem). Tagastatakse maksimaalselt `limit` lauda (vaikimisi 5).
