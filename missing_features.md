# Survey Tool - Missing Features & Roadmap

Dieses Dokument sammelt alle offenen Feature-Ideen und Verbesserungsvorschläge für das Survey Tool.

---

## 🔴 Kritische Fixes (Sofort)

### Dashboard Visualisierung

- [ ] **Rating-Fragen nach Wert sortieren** (nicht nach Häufigkeit) – Skalen 1-5 sollten immer in logischer Reihenfolge angezeigt werden
- [ ] **Alle Antwortmöglichkeiten anzeigen** – Auch Optionen mit 0 Antworten müssen im Chart erscheinen

---

## 📊 Analytics & Auswertung

### Filterung & Segmentierung

- [ ] **Cross-Question Filtering** – Antworten filtern basierend auf Antwort einer anderen Frage (z.B. "Zeige nur Antworten von Personen, die bei Frage X 'Ja' gewählt haben")
- [ ] **Zeitraum-Filter** – Responses nach Datum/Zeitraum filtern (letzte 7 Tage, letzter Monat, custom range)
- [ ] **Cohort-Analyse** – Responses gruppieren nach Zeiträumen (Woche 1 vs. Woche 2)
- [ ] **Variant-Filter** – Bei A/B-Tests nur Responses einer bestimmten Variante anzeigen
- [ ] **Source-Filter** – Nach Referrer/UTM-Parameter filtern

### Sortierung & Darstellung

- [ ] **Fragen-Sortierung ändern** – Manuelle Sortierung der Fragen im Dashboard
- [ ] **Numerische Sortierung** – Rating/Scale-Fragen immer numerisch sortieren
- [ ] **Chart-Typ wählen** – Bar, Pie, Line für jede Frage individuell

### Erweiterte Statistiken

- [ ] **Korrelationsanalyse** – Automatische Erkennung von Zusammenhängen zwischen Antworten
- [ ] **Bedingte Auswertung** – Bei Fragen mit `show_if` die Abhängigkeit visualisieren
- [ ] **Trendanalyse** – Wie verändern sich Antworten über Zeit?
- [ ] **NPS-Berechnung** – Net Promoter Score automatisch aus Scale-Fragen berechnen
- [ ] **Sentiment-Analyse** – Freitext-Antworten nach Stimmung analysieren (optional, mit KI)

### Export & Reporting

- [ ] **PDF-Report erstellen** – Automatischer Report mit allen Charts
- [ ] **CSV/Excel-Export erweitert** – Alle Responses mit einstellbaren Spalten exportieren
- [ ] **Scheduled Reports** – Wöchentlicher Report per E-Mail
- [ ] **Public Dashboard Link** – Teilbare Readonly-Ansicht der Ergebnisse

---

## 🎯 Umfrage-Steuerung

### Automatische Schließung

- [ ] **Teilnehmer-Limit** – Umfrage nach X Teilnehmern automatisch schließen
- [ ] **Zeitbasierte Schließung** – Umfrage zu bestimmtem Datum/Uhrzeit schließen
- [ ] **Quote-System** – Schließen wenn bestimmte Quote erreicht (z.B. "50 Männer, 50 Frauen")

### Response-Limitierung

- [ ] **Nur die ersten X Einträge zeigen** – Dashboard begrenzen auf erste 100, letzte 100, etc.
- [ ] **Sample-Modus** – Zufällige Stichprobe der Responses anzeigen

### Umfrage-Status

- [ ] **Pause/Resume** – Umfrage temporär pausieren
- [ ] **Draft-Modus** – Umfrage speichern ohne zu veröffentlichen
- [ ] **Archive** – Alte Umfragen archivieren

---

## 🔧 Survey Builder & Editor

### Visual Builder (Phase 4)

- [ ] **Drag & Drop Editor** – Fragen visuell erstellen und anordnen
- [ ] **Live Preview** – Echtzeit-Vorschau während der Bearbeitung
- [ ] **Template-Bibliothek** – Vorgefertigte Fragen-Templates
- [ ] **Branching visualisieren** – Logik-Abhängigkeiten grafisch darstellen

### Frage-Typen

- [ ] **Matrix-Fragen** – Mehrere Items auf einer Skala bewerten
- [ ] **Ranking** – Optionen per Drag & Drop sortieren
- [ ] **Slider** – Visueller Slider statt Buttons für Skalen
- [ ] **Date/Time Picker** – Datum/Uhrzeit-Auswahl
- [ ] **File Upload** – Datei-Upload (z.B. für Screenshots)
- [ ] **Image Choice** – Bilder als Antwortoptionen
- [ ] **Star Rating** – Sterne-Bewertung (1-5 Sterne visuell)

### Logik & Validierung

- [ ] **Regex-Validierung** – E-Mail, Telefon, PLZ etc.
- [ ] **Calculated Fields** – Berechnete Werte basierend auf anderen Antworten
- [ ] **Piping** – Antworten in späteren Fragen referenzieren ("Du hast {answer.name} eingegeben...")

---

## 👥 Teilnehmer-Management

### Einladungen

- [ ] **E-Mail-Einladungen** – Einladungen direkt aus dem Tool versenden
- [ ] **Unique Links** – Personalisierte Links pro Teilnehmer
- [ ] **Reminder-E-Mails** – Automatische Erinnerungen an Nicht-Teilnehmer

### Tracking

- [ ] **Partial Responses** – Abgebrochene Umfragen separat tracken
- [ ] **Response Rate Dashboard** – Wie viele haben geöffnet vs. abgeschlossen
- [ ] **Drop-off Analyse** – Bei welcher Frage brechen die meisten ab?

---

## 🔒 Sicherheit & Compliance

### Erweiterte Duplikat-Erkennung

- [ ] **Device Fingerprinting** – Erweiterte Browser-Fingerprinting-Optionen
- [ ] **E-Mail-Verifizierung** – Nur verifizierte E-Mails können teilnehmen
- [ ] **Invite-Only Mode** – Umfrage nur mit gültigem Einladungslink

### Datenschutz

- [ ] **Automatische Datenlöschung** – Responses nach X Tagen automatisch löschen
- [ ] **Anonymisierung** – Alle PII nach Export automatisch entfernen
- [ ] **Consent-Tracking** – DSGVO-konforme Einwilligung dokumentieren

---

## 🎨 UI/UX Verbesserungen

### Survey-Teilnehmer

- [ ] **Keyboard Navigation** – Vollständige Tastatur-Steuerung (Pfeiltasten für Optionen)
- [ ] **Accessibility** – WCAG 2.1 AA Compliance
- [ ] **Mobile Optimierung** – Touch-optimierte Slider und Buttons
- [ ] **Offline-Modus** – Responses zwischenspeichern bei Verbindungsabbruch

### Admin-Dashboard

- [ ] **Dashboard Widgets** – Anpassbares Dashboard mit Drag & Drop
- [ ] **Dark Mode Preference** – Dark Mode Präferenz speichern
- [ ] **Keyboard Shortcuts** – Schnellzugriff für häufige Aktionen
- [ ] **Bulk Actions** – Mehrere Responses gleichzeitig bearbeiten/löschen

---

## 🔌 Integrationen

### Webhooks & API

- [ ] **Webhook bei neuer Response** – HTTP Callback bei neuer Antwort
- [ ] **Zapier/Make Integration** – Low-Code Automatisierung
- [ ] **REST API erweitern** – Alle Features über API zugänglich

### Drittanbieter

- [ ] **Slack Integration** – Benachrichtigung bei neuer Response
- [ ] **Google Sheets Sync** – Automatischer Export in Sheets
- [ ] **CRM Integration** – Salesforce, HubSpot etc.
- [ ] **Analytics** – Google Analytics, Plausible etc.

---

## 🚀 Skalierung & Performance

- [ ] **Response Streaming** – Große Datensätze streamen statt laden
- [ ] **Caching Layer** – Redis für häufig abgerufene Daten
- [ ] **CDN für Assets** – Statische Dateien über CDN ausliefern
- [ ] **Database Sharding** – Für sehr große Datenmengen

---

## 📝 Priorisierung

### Phase 1 (Sofort)

1. Rating-Sortierung & alle Optionen anzeigen
2. Zeitraum-Filter für Responses
3. Automatische Schließung (Teilnehmer-Limit)

### Phase 2 (Kurzfristig)

4. Cross-Question Filtering
5. CSV/Excel Export erweitert
6. Umfrage Pause/Resume

### Phase 3 (Mittelfristig)

7. Visual Survey Builder
8. PDF-Reports
9. Webhook-Integration

### Phase 4 (Langfristig)

10. KI-basierte Sentiment-Analyse
11. Full CRM Integration
12. Multi-Tenant SaaS Mode

---

_Zuletzt aktualisiert: 2025-12-23_
