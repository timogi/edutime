import { LegalDocumentSection } from '../LegalDocumentSection'
import type { TocLink } from '../PrivacyLayout'

export const termsMetaDe = {
  title: 'Nutzungsbedingungen von EduTime',
  tocLabel: 'Inhaltsverzeichnis',
  meta: {
    version: 'Version 1.0',
    lastUpdated: '3. März 2025',
  },
}

export const tocLinksDe: TocLink[] = [
  {
    id: 'anwendungsbereich-und-nutzungsvoraussetzungen',
    label: '1. Anwendungsbereich und Nutzungsvoraussetzungen',
    order: 1,
  },
  { id: 'umfang-der-nutzung', label: '2. Umfang der Nutzung', order: 1 },
  {
    id: 'testversion-und-kostenloser-leistungsumfang',
    label: '3. Testversion und kostenloser Leistungsumfang',
    order: 1,
  },
  {
    id: 'daten-datenspeicherung-und-backup',
    label: '4. Daten, Datenspeicherung und Backup',
    order: 1,
  },
  {
    id: 'verantwortung-fuer-inhalte-und-rechtmaessige-nutzung',
    label: '5. Verantwortung für Inhalte und rechtmässige Nutzung',
    order: 1,
  },
  {
    id: 'sperrung-bei-unzulaessiger-nutzung',
    label: '6. Sperrung bei Unzulässiger Nutzung',
    order: 1,
  },
  { id: 'geistiges-eigentum', label: '7. Geistiges Eigentum', order: 1 },
  {
    id: 'gewaehrleistung-und-haftung',
    label: '8. Gewährleistung und Haftung',
    order: 1,
  },
  {
    id: 'geheimhaltung-und-datenschutz',
    label: '9. Geheimhaltung und Datenschutz',
    order: 1,
  },
  { id: 'aktualisierungen', label: '10. Aktualisierungen', order: 1 },
  {
    id: 'gerichtsstand-und-anwendbares-recht',
    label: '11. Gerichtsstand und anwendbares Recht',
    order: 1,
  },
]

/**
 * German version of the Terms of Use (Nutzungsbedingungen).
 *
 * To update this content, edit the JSX below directly.
 * For other languages, create TermsEn.tsx / TermsFr.tsx following the same pattern.
 */
export function TermsDe() {
  return (
    <>
      <LegalDocumentSection
        id='anwendungsbereich-und-nutzungsvoraussetzungen'
        title='1. Anwendungsbereich und Nutzungsvoraussetzungen'
        order={2}
      >
        <p>
          EduTime GmbH, c/o Tim Ogi, Bienenstrasse 8, 3018 Bern (nachfolgend «EduTime»), ermöglicht
          Nutzerinnen und Nutzer unter den nachfolgenden Bedingungen die Nutzung der
          Online-Dienstleistungen von EduTime über (i) die browserbasierte Webanwendung „EduTime"
          (nachfolgend „Web-App") und/oder über (ii) die Mobilgerät-Anwendung „EduTime" (nachfolgend
          „App"; gesamthaft nachfolgend „Services").
        </p>
        <p>
          Ein allfälliges Vertragsverhältnis betreffend die Services besteht zwischen EduTime und
          der Person oder Organisation, die einen Vertrag gestützt auf die Allgemeinen
          Geschäftsbedingungen von EduTime abgeschlossen hat. Der Vertragspartner von EduTime wird
          nachfolgend als „Kunde" bezeichnet.
        </p>
        <p>
          Nur natürliche Personen ab 14 Jahren mit Wohnsitz in der Schweiz, mit einer Registrierung
          für die Services und die (i) direkt im Rahmen eines Vertrages von EduTime oder (ii)
          indirekt von einem Kunden von EduTime die Nutzungsberechtigung für die Services erhalten
          haben (nachfolgend „User"), sind berechtigt, die App herunterzuladen, auf die Services
          zuzugreifen und/oder die Services zu nutzen.
        </p>
        <p>
          Im Rahmen dieser Nutzungsbedingungen beziehen sich die Bezeichnungen „Sie", „Ihr" o.Ä.
          immer auf den User wie oben in Ziffer 1.3 definiert.
        </p>
        <p>
          Wenn Sie einen Service nutzen, gelten diese Nutzungsbedingungen für Sie, unabhängig davon,
          ob Sie Kunde von EduTime sind oder nicht. Sie verpflichten sich, diese Nutzungsbedingungen
          einzuhalten, und haftet für Verstösse. Sie dürfen andere nicht in einer Weise unterstützen
          oder einbinden, die gegen diese Nutzungsbedingungen verstossen würde. EduTime wird die
          Einhaltung dieser Nutzungsbedingungen mit den Methoden durchsetzen und sicherstellen, die
          der Ansicht von EduTime nach angemessen sind. Bei Verletzungen dieser Nutzungsbedingungen
          kann EduTime Ihre Nutzung der Services aussetzen oder beenden.
        </p>
        <p>
          Durch die vorliegenden Nutzungsbedingungen allein werden wechselseitig keinerlei
          Belieferungs-, Zahlungs-, Abnahme- oder Kontrahierungspflichten begründet. Ein Anspruch
          auf Lieferung oder Leistung in Bezug auf den Anwendungsbereich der Nutzungsbedingungen
          setzt einen abgeschlossenen Vertrag für die Services voraus. Die Präsentation von
          Produkten und Leistungen auf den Websites, in den Services oder in Preislisten von EduTime
          stellt noch kein rechtlich bindendes Vertragsangebot von EduTime dar.
        </p>
        <p>
          Bei Widersprüchen zwischen diesen Nutzungsbedingungen und dem mit dem Kunden
          abgeschlossenen Vertrag gehen die Bestimmungen des Vertrages vor, sofern darin nichts
          anderes festgehalten wird.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='umfang-der-nutzung' title='2. Umfang der Nutzung' order={2}>
        <p>
          Der Umfang, der Ihnen zur Verfügung stehenden Funktionalitäten, unterscheidet sich je
          nachdem, ob Sie über eine Registrierung verfügen oder nicht, oder, falls sie über eine
          Registrierung verfügen, ob sie gleichzeitig einen Vertrag mit EduTime über die Services
          abgeschlossen haben oder Sie die Nutzungsberechtigung für die Services durch einen Kunden
          von EduTime erhalten haben.
        </p>
        <p>
          Unter diesen Nutzungsbedingungen in Verbindung mit dem entsprechenden Vertrag räumt
          EduTime dem Kunden und den Usern das nicht exklusive, unübertragbare, nicht
          unterlizenzierbare und entgeltliche Recht ein, die Services gemäss den Bestimmungen dieser
          Nutzungsbedingungen und des entsprechenden Vertrages nach vollständiger Bezahlung der
          anfallenden Nutzungsgebühren für eigene Zwecke zu nutzen. Ein darüberhinausgehender Erwerb
          von Rechten an den Services ist mit dieser Nutzungsrechtseinräumung nicht verbunden. Die
          von EduTime überlassenen Nutzungsrechte an fremder, von Dritten erstellter Software, sind
          dem Umfang nach auf diejenigen Nutzungsrechte beschränkt, welche Dritte EduTime eingeräumt
          haben.
        </p>
        <p>
          Sie sind verpflichtet, Probleme mit den Services, wie z.B. Fehlfunktionen, Bugs oder
          Fehler sowie eine erkannte unbefugte Nutzung der Services, per Mail (info@edutime.ch) oder
          über das von EduTime unter einer bestimmten URL zur Verfügung gestellte Issue-Tool in
          angemessener Weise dokumentiert zu melden. Die Fehlerbehebung oder das Patchen der
          Services oder der dazugehörigen Dokumentation wird von EduTime nach bestem Wissen
          durchgeführt.
        </p>
        <p>
          Um auf die Services zuzugreifen und sie nutzen zu können, müssen Sie jeweils die
          aktuellsten Technologien verwenden, insbesondere die aktuellste Version des
          Internet-Browsers und/oder des Betriebssystems Ihres mobilen Gerätes. Bei Benutzung
          älterer oder nicht allgemein gebräuchlicher Technologien kann es sein, dass Sie auf die
          Services nicht zugreifen können oder Sie die Services nicht oder nur eingeschränkt nutzen
          können.
        </p>
        <p>
          EduTime ist berechtigt, die Services, insbesondere die Leistungsmerkmale der Services
          jederzeit weiterzuentwickeln und, um den technischen Fortschritt und geänderte rechtliche
          Rahmenbedingungen zu berücksichtigen, anzupassen, einzuschränken oder aber die Erbringung
          einzelner Leistungen und Funktionen ganz einzustellen oder nur noch für einen Teil der
          User zur Verfügung zu stellen.
        </p>
        <p>
          Sie anerkennen, dass der Zugang zu den Services auch von Faktoren abhängt, die ausserhalb
          der Kontrolle von EduTime liegen, wie z.B. der Netzwerkzugang zur Server-Plattform oder
          die Verfügbarkeit der App über eine offizielle Vertriebsplattform, und dass EduTime daher
          keine Garantie dafür übernimmt, dass die Services ohne Unterbrechungen verfügbar sind.
          Darüber hinaus kann EduTime keine Reaktionszeiten, Wiederherstellungszeiten oder
          monatliche oder jährliche Mindestverfügbarkeiten garantieren und auch nicht, dass die
          Services fehlerfrei sind oder unterbrechungsfrei genutzt werden können. Insbesondere ist
          EduTime berechtigt, den Zugang für dringende Wartungsarbeiten oder bei aussergewöhnlichen
          Sicherheitsrisiken jederzeit zu sperren.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='testversion-und-kostenloser-leistungsumfang'
        title='3. Testversion und kostenloser Leistungsumfang'
        order={2}
      >
        <p>
          Soweit Sie die Services als Testversion einsetzen, gewährt EduTime Ihnen dafür eine Lizenz
          zum ausschliesslichen Zweck des Testens und Evaluieren und ausschliesslich für interne
          Zwecke und, sofern nicht ausdrücklich anders angegeben, für eine begrenzte Zeitspanne von
          30 Tagen («Testversion»).
        </p>
        <p>
          Die Testversion sowie die von Ihnen gewählten Services mit einem kostenlosen
          Leistungsumfang wird unter Ausschluss jeder Sach- und Rechtsgewährleistungen «as is» zur
          Verfügung gestellt. EduTime lehnt ausdrücklich alle stillschweigenden oder gesetzlichen
          Garantien und Zusicherungen (z.B. betreffend Einsatz- und Betriebsbedingungen,
          Funktionalitäten, Eignung etc.) ab. Sie haben keinen Anspruch auf Support-, Wartungs- und
          Pflegeleistungen.
        </p>
        <p>
          Wird die Testversion während der gewährten Testdauer auf keinen kostenpflichtigen
          Leistungsumfang geändert, werden nach Ablauf der Lizenz für die Testversion alle Daten von
          Ihnen entsprechend den Löschzyklen von EduTime gelöscht.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='daten-datenspeicherung-und-backup'
        title='4. Daten, Datenspeicherung und Backup'
        order={2}
      >
        <p>
          EduTime stellt dem User zur Speicherung der Daten im Zusammenhang mit der Nutzung der
          Services Speicherkapazität nach Massgabe des Vertrages mit dem Kunden zur Verfügung.
        </p>
        <p>
          Die von Ihnen eingegebenen Daten gehören zu Ihrem Rechtsbereich, auch wenn diese örtlich
          bei EduTime oder einem Leistungserbringen gespeichert sind. Für die Speicherung und
          Verarbeitung der Daten sind ausschliesslich Sie verantwortlich. Sie halten sich
          insbesondere bei der Erfassung und Bearbeitung von Personendaten strikte an die
          Bestimmungen des jeweils anwendbaren Datenschutzgesetzes.
        </p>
        <p>
          EduTime ermöglicht Ihnen, die auf der Serverinfrastruktur durch Sie gespeicherten Daten
          während der Vertragsdauer und innerhalb von dreissig (30) Tagen nach Vertragsbeendigung in
          einem von EduTime zur Verfügung gestellten standardisierten Verfahren herunterzuladen.
          EduTime übernimmt keinerlei Gewähr für eine Nutzbarkeit von heruntergeladenen Daten auf
          anderen Systemen. EduTime ist berechtigt, die bei EduTime gespeicherten Daten von Ihnen
          nach Vertragsbeendigung im Zuge üblicher Löschzyklen zu löschen, es sei denn, EduTime ist
          zu deren Aufbewahrung nach zwingendem Recht verpflichtet.
        </p>
        <p>
          EduTime trifft geeignete Vorkehrungen gegen den Datenverlust bei Ausfällen der Services
          sowie zur Verhinderung unbefugter Zugriffe durch Dritte auf Ihre Daten. Zu diesem Zweck
          nimmt EduTime regelmässige Backups vor (mindestens einmal pro Tag) und schützt die
          gespeicherten Zugangsdaten von Ihnen mit geeigneten, dem technischen Stand entsprechenden
          Mitteln gegen unbefugte Zugriffe.
        </p>
        <p>
          Sie treffen angemessene Vorkehrungen für den Fall, dass die Services ganz oder teilweise
          nicht ordnungsgemäss arbeitet (z.B. durch Datensicherung, Störungsdiagnose, regelmässige
          Überprüfung der Ergebnisse).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='verantwortung-fuer-inhalte-und-rechtmaessige-nutzung'
        title='5. Verantwortung für Inhalte und rechtmässige Nutzung'
        order={2}
      >
        <p>
          Sie verpflichten sich, mit den Services nur zulässige Inhalte zu verarbeiten. Unzulässig
          sind insbesondere Inhalte, die Rechte von EduTime oder Dritter, insbesondere
          Immaterialgüterrechte i.w.S. (beispielsweise Urheberrechte oder Markenrechte) oder
          Persönlichkeitsrechte, oder den geschäftlichen Ruf verletzen oder gefährden; unzulässig
          sind ausserdem sämtliche Inhalte, die Straftatbestände (namentlich in den Bereichen
          Pornographie, Gewaltdarstellung, Rassismus, Geschäftsgeheimnisse, Ehrverletzung und
          Betrug) erfüllen (nachfolgend gemeinsam «Unzulässige Inhalte»). Besonders
          ressourcenintensive Nutzungen, d.h. Nutzungen, welche die normale Funktion und die
          Sicherheit der Services von EduTime sowie die Nutzung der Serverinfrastruktur durch andere
          Kunden und User beeinträchtigen können, sind verboten.
        </p>
        <p>
          Jegliche unter der Verwendung von Zugangsdaten und Passwörter von Ihnen getätigte
          Handlungen wie Mitteilungen und Änderungen an Benutzerdaten oder sonstige Einstellungen
          rechnet EduTime Ihnen zu.
        </p>
        <p>
          EduTime ist nicht zur Überwachung der in den Services enthaltenen Inhalte verpflichtet.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='sperrung-bei-unzulaessiger-nutzung'
        title='6. Sperrung bei Unzulässiger Nutzung'
        order={2}
      >
        <p>
          EduTime ist berechtigt, Ihren Zugang zu den Services ganz oder teilweise zu sperren und
          die Dienstleistungen vorläufig oder ganz einzustellen, (i) falls EduTime dazu gerichtlich
          oder behördlich aufgefordert wird, oder (ii) sich sonst wie selber rechtlich
          verantwortlich oder strafbar machen könnte, oder (iii) wenn eine Stichprobe konkrete
          Hinweise oder den Verdacht auf das Zugänglichmachen von Unzulässigen Inhalten oder auf
          eine sonstwie rechts-, vertrags- oder nutzungsbedingungswidrige Nutzung ergibt. EduTime
          ist berechtigt, dem Kunden und/oder dem User den im Zusammenhang mit Sperrungen und
          anderen Massnahmen entstandenen Aufwand in Rechnung zu stellen. Ausserdem verpflichten Sie
          sich, EduTime vollumfänglich schadlos zu halten, wenn ein Dritter EduTime im Zusammenhang
          mit der vertrags- oder nutzungsbedingungswidrigen Nutzung ins Recht fassen will. Dies
          beinhaltet auch den Ersatz für die Kosten einer Rechtsvertretung von EduTime. Die
          Geltendmachung weiteren Schadens bleibt vorbehalten. EduTime kann von Ihnen für die
          vorsorgliche Deckung des Aufwands und des weiteren Schadens eine Sicherheitsleistung
          verlangen. Wird diese Sicherheitsleistung nicht bezahl oder befolgen Sie die im
          Zusammenhang mit den getroffenen Massnahmen erfolgten Aufforderungen nicht, kann EduTime
          die Erbringung der Services aussetzen oder den gesamten Vertrag mit dem Kunden fristlos
          kündigen.
        </p>
        <p>
          Bei unberechtigter Nutzungsüberlassung haben Sie EduTime auf Verlangen unverzüglich
          sämtliche Angaben zur Geltendmachung der Ansprüche gegen den Nutzer zu machen,
          insbesondere dessen Namen und Anschrift mitzuteilen.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='geistiges-eigentum' title='7. Geistiges Eigentum' order={2}>
        <p>
          Sämtliche Urheberrechte und andere Immaterialgüterrechte, Ansprüche und Beteiligungen an
          den Services sowie an den in den Services enthaltenen oder verfügbaren Informationen
          (inklusive Marken, Namen, Logos, Bilder, Designs, Texte etc. mit Ausnahme der
          Nutzerinhalte) sind und bleiben ausschliessliches Eigentum von EduTime oder ihrer
          Lizenzgeber.
        </p>
        <p>
          Sie anerkennen die Schutzrechte, insbesondere das Urheberrecht, von EduTime als
          Rechtsinhaber an den Services, erhalten sich während der Dauer der dem Kunden und damit
          auch Ihnen eingeräumten Nutzungsbefugnis der Services jedes Angriffs auf Bestand und
          Umfang dieser Rechte und ergreifen gemäss den Instruktionen von EduTime alle Massnahmen,
          um die Rechte von EduTime zu wahren und unterstützt EduTime in angemessenem Umfang bei der
          Verteidigung der Schutzrechte.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='gewaehrleistung-und-haftung'
        title='8. Gewährleistung und Haftung'
        order={2}
      >
        <p>
          Die Services werden im Zustand wie verfügbar zur Verfügung gestellt. EduTime erteilt
          keinerlei Zusicherungen, Garantien oder Gewährleistungen im Zusammenhang mit den Services,
          sofern im Vertrag mit den Kunden nichts Abweichendes vereinbart wurde, insbesondere nicht
          für da Funktionieren der Services, dafür dass die Services und ihrer Leistungen und
          Funktionalitäten verfügbar oder fehlerfrei sind oder für allfällige in den Services
          enthaltenen Informationen.
        </p>
        <p>
          Sie haften EduTime und, sofern Sie die Nutzungsberechtigung für die Services von einem
          Kunden erhalten haben, diesem Kunden für Schäden, die sich aus der Verletzung dieser
          Nutzungsbedingungen ergeben unbeschränkt.
        </p>
        <p>
          Sie nutzen die Services auf eigene Gefahr und Verantwortung. Die Haftung von EduTime
          beschränkt sich auf den im Vertrag mit dem Kunden vereinbarten Umfang. Liegt kein Vertrag
          zwischen dem User und EduTime vor, haftet EduTime abgesehen von einer gesetzlich
          zwingenden Haftung nicht.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='geheimhaltung-und-datenschutz'
        title='9. Geheimhaltung und Datenschutz'
        order={2}
      >
        <p>
          Sie und EduTime verpflichten sich, alle erlangten Kenntnisse von vertraulichen
          Informationen und Betriebsgeheimnissen der jeweils anderen Partei, vertraulich zu
          behandeln. Solange ein Geheimhaltungsinteresse besteht, gilt die Geheimhaltungspflicht
          zeitlich unbegrenzt.
        </p>
        <p>
          Sie und EduTime sorgen für den Datenschutz und die Datensicherheit in ihrem jeweiligen
          Einflussbereich.
        </p>
        <p>
          Die Bearbeitung von Personendaten durch EduTime erfolgt in Übereinstimmung mit der
          Datenschutzerklärung von EduTime, die auf der Website www.edutime.ch abrufbar ist.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='aktualisierungen' title='10. Aktualisierungen' order={2}>
        <p>
          EduTime behält sich das Recht vor, nachträgliche Änderungen oder Ergänzungen dieser
          Nutzungsbedingungen vorzunehmen. Im Falle von Änderungen und Ergänzungen, die sich für Sie
          nachteilig auswirken können, wird EduTime Sie schriftlich, per E-Mail oder auf einem
          geeigneten Pflegeportal orientieren.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='gerichtsstand-und-anwendbares-recht'
        title='11. Gerichtsstand und anwendbares Recht'
        order={2}
      >
        <p>
          Für Streitigkeiten aus diesen Nutzungsbedingungen wird als Gerichtsstand der Wohnsitz des
          Users oder der Sitz von EduTime vereinbart.
        </p>
        <p>Diese Nutzungsbedingungen unterstehen ausschliesslich schweizerischem Recht.</p>
      </LegalDocumentSection>
    </>
  )
}
