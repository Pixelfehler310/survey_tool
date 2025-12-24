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

## � Partial Responses (Detailkonzept)

### Was ist das Problem?

Aktuell werden Antworten nur bei Submit gespeichert. Wenn ein Nutzer bei Frage 25 von 40 abbricht, gehen alle Daten verloren. Bei langen Umfragen (wie der Civic OS Validation Survey mit 45 Fragen) ist das ein signifikanter Datenverlust.

### Warum ist das wichtig?

1. **Datenrettung** – Partielle Daten sind besser als keine Daten
2. **Drop-off-Analyse** – Verstehen, bei welcher Frage Nutzer abbrechen (UX-Problem? Zu persönliche Frage?)
3. **Funnel-Optimierung** – Conversion Rate von "Umfrage gestartet" zu "Umfrage abgeschlossen" messen
4. **A/B-Testing** – Testen ob kürzere Versionen bessere Completion Rates haben

### Implementierungsoptionen

#### Option A: Auto-Save bei jeder Frage (empfohlen)

```
Frontend: Bei jedem "Weiter"-Klick → PATCH /api/responses/{partial_id}
Backend: Speichert in separater PartialResponse-Tabelle
Submit: Verschiebt von PartialResponse → Response, markiert als completed
```

**Vorteile:**

- Nutzer kann später weitermachen (mit Link/Token)
- Maximale Datenrettung
- Genaue Drop-off-Analyse möglich

**Nachteile:**

- Mehr API-Calls
- Komplexere Datenbankstruktur
- Privacy-Bedenken (Daten vor explizitem Consent gespeichert)

#### Option B: LocalStorage + Beacon API

```
Frontend: Speichert Fortschritt in LocalStorage
Bei Page-Close: navigator.sendBeacon() sendet Partial-Daten
Backend: Speichert als "abandoned" Response
```

**Vorteile:**

- Weniger API-Calls
- Funktioniert offline
- Privacy-freundlicher

**Nachteile:**

- Beacon-Daten können verloren gehen
- Kein Cross-Device Resume

#### Option C: Nur Tracking (kein Resume)

```
Frontend: Sendet nur Event: "user_reached_question_15"
Backend: Speichert Progress-Events separat
```

**Vorteile:**

- Minimal invasiv
- Keine Partial-Daten-Probleme
- Reicht für Drop-off-Analyse

**Nachteile:**

- Keine Datenrettung
- Kein Resume möglich

### Vorgeschlagene Features

- [ ] **Auto-Save Toggle** – Per Survey konfigurierbar (`"auto_save": true`)
- [ ] **Resume-Link** – Nutzer bekommt Link um später weiterzumachen
- [ ] **Partial Response Status** – `in_progress`, `abandoned`, `completed`
- [ ] **Timeout-Erkennung** – Nach 30min Inaktivität als "abandoned" markieren
- [ ] **Drop-off Heatmap** – Visualisierung: Bei welcher Frage brechen wie viele ab?
- [ ] **Partial Exclusion** – Option: Partial Responses aus Analyse ausschließen
- [ ] **DSGVO-Hinweis** – Bei Auto-Save: "Deine Antworten werden automatisch gespeichert"

### Datenmodell

```python
class PartialResponse(Base):
    id = Column(UUID, primary_key=True)
    survey_id = Column(String)
    session_token = Column(String, unique=True)  # For resume
    answers = Column(JSON)  # Current answers
    current_question = Column(Integer)  # Last answered question index
    started_at = Column(DateTime)
    last_activity = Column(DateTime)
    status = Column(Enum: 'in_progress', 'abandoned', 'completed')
    completed_at = Column(DateTime, nullable=True)
```

### Priorisierung

| Feature                       | Aufwand | Priorität       |
| ----------------------------- | ------- | --------------- |
| Drop-off Tracking (Option C)  | 2h      | 🟡 Mittel       |
| Auto-Save + Resume (Option A) | 6-8h    | 🟢 Nice-to-have |
| Drop-off Heatmap              | 3h      | 🟢 Nice-to-have |

---

## �🔒 Sicherheit & Compliance

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
