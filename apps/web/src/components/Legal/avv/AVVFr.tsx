import type { TocLink } from '../PrivacyLayout'
import { LegalDocumentSection } from '../LegalDocumentSection'

export const avvMetaFr = {
  title: "Accord de traitement des donnees (ATD) d'EduTime",
  tocLabel: 'Table des matieres',
  meta: {
    version: 'Version 1.1',
    lastUpdated: '19 mars 2026',
  },
}

export const tocLinksFr: TocLink[] = [
  { id: 'objet-et-portee', label: '1. Objet et portee', order: 1 },
  { id: 'roles-des-parties', label: '2. Roles des parties', order: 1 },
  { id: 'categories-et-finalites', label: '3. Categories de donnees et finalites', order: 1 },
  { id: 'mesures-de-securite', label: '4. Mesures techniques et organisationnelles', order: 1 },
  { id: 'sous-traitants-ulterieurs', label: '5. Sous-traitants ulterieurs', order: 1 },
  { id: 'transferts-internationaux', label: '6. Transferts internationaux de donnees', order: 1 },
  { id: 'assistance-et-notifications', label: '7. Assistance et notifications', order: 1 },
  { id: 'duree-et-fin', label: '8. Duree et fin', order: 1 },
  { id: 'dispositions-finales', label: '9. Dispositions finales', order: 1 },
]

export function AVVFr() {
  return (
    <>
      <LegalDocumentSection id='objet-et-portee' title='1. Objet et portee' order={2}>
        <p>
          Le present accord encadre le traitement des donnees personnelles par EduTime dans le
          cadre du service SaaS. Il s&apos;applique des qu&apos;un client utilise le service avec des
          donnees personnelles.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='roles-des-parties' title='2. Roles des parties' order={2}>
        <p>
          Le client agit en tant que responsable du traitement. EduTime agit en tant que
          sous-traitant et traite les donnees uniquement sur instruction documentee, sauf obligation
          legale contraire.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='categories-et-finalites'
        title='3. Categories de donnees et finalites'
        order={2}
      >
        <p>
          EduTime traite uniquement les donnees fournies par le client pour exploiter, maintenir,
          securiser et ameliorer le service SaaS, ainsi que pour respecter les obligations legales.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='mesures-de-securite'
        title='4. Mesures techniques et organisationnelles'
        order={2}
      >
        <p>
          EduTime met en place des mesures appropriees pour proteger la confidentialite, l&apos;integrite
          et la disponibilite des donnees personnelles.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='sous-traitants-ulterieurs' title='5. Sous-traitants ulterieurs' order={2}>
        <p>
          EduTime peut recourir a des sous-traitants ulterieurs lorsque cela est necessaire au
          service et s&apos;assure qu&apos;ils respectent des obligations equivalentes en matiere de
          protection des donnees.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='transferts-internationaux'
        title='6. Transferts internationaux de donnees'
        order={2}
      >
        <p>
          Pour les transferts vers des pays ne presentant pas un niveau de protection adequat,
          EduTime applique des garanties appropriees, notamment les clauses contractuelles types.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='assistance-et-notifications' title='7. Assistance et notifications' order={2}>
        <p>
          EduTime assiste le client pour les demandes des personnes concernees et la gestion des
          incidents, y compris la notification sans retard injustifie en cas de violation de donnees.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='duree-et-fin' title='8. Duree et fin' order={2}>
        <p>
          Le present accord est valable pendant la duree de la relation contractuelle. A la fin du
          contrat, les donnees sont restituees ou supprimees conformement au contrat et a la loi.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='dispositions-finales' title='9. Dispositions finales' order={2}>
        <p>
          Toute modification de cet accord doit etre faite sous forme ecrite. Si une clause est
          invalide, les autres dispositions restent applicables.
        </p>
      </LegalDocumentSection>
    </>
  )
}
