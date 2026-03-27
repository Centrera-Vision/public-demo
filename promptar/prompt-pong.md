# Prompt: Bygg Pong i TypeScript med grafisk profil från separat HTML-fil

Skapa ett enkelt men välstrukturerat **Pong-spel i TypeScript** för webben.

## Krav

### Teknik
- Använd **TypeScript**
- Rita spelet med **HTML Canvas**
- Använd `requestAnimationFrame()` för game loop
- Dela upp koden tydligt i logik för:
  - spelplan
  - boll
  - paddlar
  - kollisioner
  - poäng
  - rendering
  - inputhantering

### Spelfunktioner
- Två paddlar
- En boll som studsar mot väggar och paddlar
- Poängräkning när bollen passerar vänster eller höger kant
- Möjlighet att starta om poäng eller match
- Enkel keyboard-styrning:
  - vänster spelare: `W` / `S`
  - höger spelare: `Pil upp` / `Pil ner`

### Kodkvalitet
- Skriv ren, läsbar och tydligt kommenterad TypeScript
- Använd typer eller interfaces för spelobjekt
- Separera konfiguration från spelmotor där det är rimligt
- Ingen onödig komplexitet

## Grafisk profil från separat HTML-fil

Spelet ska **inte hårdkoda färger, typsnitt eller visuella inställningar direkt i TypeScript**.

I stället ska det läsa grafisk profil från en separat HTML-fil, till exempel `grafisk-profil.html`.

### Krav för grafisk profil
Den separata HTML-filen ska innehålla grafiska värden som spelet kan läsa in, exempelvis:
- bakgrundsfärg
- primär färg
- sekundär färg
- accentfärg
- textfärg
- typsnitt
- paddel-färg
- boll-färg
- linjefärg i mitten
- eventuell border eller glow-effekt

### Implementation
- Läs in den separata HTML-filen med `fetch()`
- Tolka innehållet i webbläsaren med `DOMParser`
- Hämta ut grafiska värden från element, exempelvis via:
  - `data-*` attribut
  - `meta`-taggar
  - element med tydliga id:n
- Mappa dessa värden till ett TypeScript-objekt, till exempel `ThemeConfig`

### Exempel på önskad struktur
TypeScript-koden ska kunna skapa ett temaobjekt ungefär så här:

```ts
type ThemeConfig = {
  background: string
  primary: string
  secondary: string
  accent: string
  text: string
  fontFamily: string
  paddleColor: string
  ballColor: string
  centerLineColor: string
}

/index.html
/src/main.ts
/src/game.ts
/src/theme.ts
/grafisk-profil.html
/style.css

Önskat flöde
Ladda grafisk profil från grafisk-profil.html
Bygg ett ThemeConfig-objekt
Starta spelet först när temat har lästs in
Rendera hela spelet enligt den grafiska profilen
Viktigt
Om grafisk profil inte kan läsas in ska spelet använda en tydlig fallback-theme
Lösningen ska fungera direkt i webbläsare
Visa tydligt hur temat används i rendering av canvas, text och UI
Leverans

Generera:

komplett TypeScript-kod
exempel på grafisk-profil.html
kort förklaring av hur temat laddas in
instruktion för hur projektet körs

Här är också ett enkelt exempel på hur **`grafisk-profil.html`** kan se ut:

```html
<!doctype html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <title>Grafisk profil</title>

  <meta name="theme-background" content="#0b1020" />
  <meta name="theme-primary" content="#7dd3fc" />
  <meta name="theme-secondary" content="#c4b5fd" />
  <meta name="theme-accent" content="#f472b6" />
  <meta name="theme-text" content="#e5e7eb" />
  <meta name="theme-font" content="Arial, sans-serif" />
  <meta name="theme-paddle" content="#7dd3fc" />
  <meta name="theme-ball" content="#ffffff" />
  <meta name="theme-center-line" content="#334155" />
</head>
<body>
  <section id="brand"
    data-background="#0b1020"
    data-primary="#7dd3fc"
    data-secondary="#c4b5fd"
    data-accent="#f472b6"
    data-text="#e5e7eb"
    data-font="Arial, sans-serif"
    data-paddle="#7dd3fc"
    data-ball="#ffffff"
    data-center-line="#334155">
  </section>
</body>
</html>
