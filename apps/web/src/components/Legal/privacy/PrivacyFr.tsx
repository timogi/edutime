import { LegalDocumentSection } from '../LegalDocumentSection'
import type { TocLink } from '../PrivacyLayout'

export const privacyMetaFr = {
  title: 'Politique de Confidentialité EduTime',
  tocLabel: 'Table des matières',
  meta: { version: 'Version 1.0', lastUpdated: '3 mars 2025' },
}

export const tocLinksFr: TocLink[] = [
  { id: 'inhalt', label: '1. Introduction à la Politique de Confidentialité', order: 1 },
  { id: 'wer-ist-verantwortlich', label: '2. Qui est responsable ?', order: 1 },
  {
    id: 'welche-personendaten-bearbeiten-wir',
    label: '3. Quelles données personnelles traitons-nous ?',
    order: 1,
  },
  {
    id: 'wie-erheben-wir-personendaten',
    label: '4. Comment collectons-nous les données personnelles ?',
    order: 1,
  },
  { id: 'ueberlassene-daten', label: '4.1. Données fournies', order: 2 },
  { id: 'erhaltene-daten', label: '4.2 Données reçues', order: 2 },
  { id: 'erhobene-daten', label: '4.3 Données collectées', order: 2 },
  {
    id: 'fuer-welche-zwecke-bearbeiten-wir-personendaten',
    label: '5. À quelles fins traitons-nous les données personnelles ?',
    order: 1,
  },
  {
    id: 'warum-und-wie-teilen-wir-daten',
    label: '6. Pourquoi et comment partageons-nous les données ?',
    order: 1,
  },
  {
    id: 'warum-und-wie-geben-wir-daten-ins-ausland-weiter',
    label: "7. Pourquoi et comment transférons-nous les données à l'étranger ?",
    order: 1,
  },
  {
    id: 'wie-setzen-wir-profiling-ein',
    label: '8. Comment utilisons-nous le profilage ?',
    order: 1,
  },
  {
    id: 'wie-treffen-wir-automatisierte-einzelentscheidungen',
    label: '9. Comment prenons-nous des décisions individuelles automatisées ?',
    order: 1,
  },
  { id: 'wie-schuetzen-wir-daten', label: '10. Comment protégeons-nous les données ?', order: 1 },
  {
    id: 'wie-lange-bewahren-wir-daten-auf',
    label: '11. Combien de temps conservons-nous les données ?',
    order: 1,
  },
  { id: 'cookie-richtlinie', label: '12. Politique relative aux Cookies', order: 1 },
  { id: 'was-sind-log-daten', label: "12.1 Qu'est-ce que les journaux de connexion ?", order: 2 },
  {
    id: 'was-sind-cookies-und-aehnliche-technologien',
    label: "12.2 Qu'est-ce que les cookies et les technologies similaires ?",
    order: 2,
  },
  {
    id: 'wie-koennen-sie-cookies-und-aehnliche-technologien-deaktivieren',
    label: '12.3 Comment pouvez-vous désactiver les cookies et les technologies similaires ?',
    order: 2,
  },
  {
    id: 'welche-cookies-und-aehnliche-technologien-setzen-wir-ein-und-wie-nutzen-wir-diese',
    label:
      '12.4 Quels cookies et technologies similaires utilisons-nous et comment les utilisons-nous ?',
    order: 2,
  },
  {
    id: 'technisch-notwendige-cookies',
    label: '12.4.1 Cookies techniquement nécessaires',
    order: 3,
  },
  {
    id: 'erfolgs-und-reichweitenmessung',
    label: "12.4.2 Mesure du succès et de l'audience",
    order: 3,
  },
  { id: 'bot-erkennung-und-blockierung', label: '12.4.3 Détection et blocage des bots', order: 3 },
  {
    id: 'dienste-von-drittanbieter',
    label: '12.5 Services de tiers (notamment plugins de sites web)',
    order: 2,
  },
  { id: 'welche-rechte-haben-sie', label: '13. Quels sont vos droits ?', order: 1 },
  { id: 'rechtsgrundlagen-nach-dsgvo', label: '14. Bases juridiques en vertu du RGPD', order: 1 },
  {
    id: 'wie-koennen-wir-diese-datenschutzerklaerung-aendern',
    label: '15. Comment pouvons-nous modifier cette politique de confidentialité ?',
    order: 1,
  },
]

function titleOrder(ord: 1 | 2 | 3): 2 | 3 | 4 {
  return (ord + 1) as 2 | 3 | 4
}

export function PrivacyFr() {
  return (
    <>
      <LegalDocumentSection
        id='inhalt'
        title='1. Introduction à la Politique de Confidentialité'
        order={titleOrder(1)}
      >
        <p>
          Avec cette politique de confidentialité, nous vous informons des données personnelles
          (données qui vous identifient directement ou indirectement) que nous collectons et
          traitons dans le cadre de nos activités. Elle s&apos;applique à toutes les activités de
          traitement liées aux données personnelles. Nous traitons les données reçues et collectées
          de manière responsable, conformément aux dispositions légales applicables et à cette
          politique de confidentialité. Notre traitement est principalement régi par la loi suisse
          sur la protection des données (LPD).
        </p>
        <p>
          Si nous le jugeons utile, nous pouvons vous fournir des politiques de confidentialité
          supplémentaires ou d&apos;autres documents juridiques (par ex., conditions générales,
          conditions d&apos;utilisation et de participation) pour des traitements spécifiques ou
          supplémentaires.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wer-ist-verantwortlich'
        title='2. Qui est responsable ?'
        order={titleOrder(1)}
      >
        <p>
          Le responsable du traitement de vos données personnelles, tel que décrit dans cette
          politique de confidentialité, sauf indication contraire dans des cas spécifiques, est le
          responsable au sens de la loi sur la protection des données :
        </p>
        <p>
          EduTime GmbH
          <br />
          c/o Tim Ogi
          <br />
          Bienenstrasse 8
          <br />
          3018 Bern
        </p>
        <p>
          Les références à &apos;EduTime&apos;, &apos;nous&apos;, ou &apos;notre&apos; dans cette
          politique de confidentialité renvoient au responsable susmentionné. Si vous avez une
          préoccupation en matière de protection des données, vous pouvez nous contacter à tout
          moment, notamment à l&apos;adresse e-mail suivante :
        </p>
        <p>privacy@edutime.ch (Objet : &apos;Protection des Données&apos;).</p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='welche-personendaten-bearbeiten-wir'
        title='3. Quelles données personnelles traitons-nous ?'
        order={titleOrder(1)}
      >
        <p>Nous collectons et traitons les données personnelles suivantes vous concernant :</p>
        <ul>
          <li>
            Données de base, telles que nom, adresse, adresse e-mail, numéro de téléphone, sexe,
            date de naissance, profils sur les réseaux sociaux, photos, vidéos, informations sur les
            relations (client, prestataire de services, etc.), historique, informations officielles
            (par ex., extraits de registre du commerce, autorisations, etc.), informations sur les
            newsletters ou autres publicités auxquelles vous vous êtes abonné (y compris les
            consentements) ;
          </li>
          <li>
            Données de communication, telles que coordonnées, méthodes de communication (téléphone,
            e-mail, messages textuels, messages vidéo, etc.), ainsi que lieu, date, heure et contenu
            de la communication ;
          </li>
          <li>
            Données d&apos;inscription, telles que nom d&apos;utilisateur, mot de passe, adresse
            e-mail ;
          </li>
          <li>
            Données financières, telles que informations de paiement, informations sur la
            solvabilité ;
          </li>
          <li>
            Données contractuelles, données liées à la conclusion ou à l&apos;exécution d&apos;un
            contrat, telles que informations sur la conclusion du contrat, droits et créances
            acquis, informations sur la satisfaction du client, informations sur les achats (par
            ex., date, lieu, heure, historique des achats, quantité, type et valeur des
            biens/services) ;
          </li>
          <li>
            Données techniques, telles que adresse IP, système d&apos;exploitation, date, heure,
            informations géographiques ;
          </li>
          <li>
            Données de comportement, telles que durée et fréquence des visites sur notre site web ou
            notre application, date et heure d&apos;une visite ou de l&apos;ouverture d&apos;un
            message (newsletter, e-mail, etc.), localisation de votre appareil, interaction avec nos
            présences en ligne sur les réseaux sociaux ou autres plateformes tierces ;
          </li>
          <li>
            Données de préférence, telles que paramètres utilisateur, données issues de
            l&apos;analyse des données collectées (notamment données comportementales) ;
          </li>
          <li>Autres données que vous nous fournissez vous concernant.</li>
        </ul>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wie-erheben-wir-personendaten'
        title='4. Comment collectons-nous les données personnelles ?'
        order={titleOrder(1)}
      >
        <p>
          Nous collectons vos données personnelles de différentes manières. D&apos;une part, nous
          collectons les données personnelles que vous nous fournissez (par ex., par e-mail,
          téléphone, courrier, inscription), que nous recevons de tiers (par ex., de partenaires
          commerciaux, autorités) et que nous collectons à votre sujet (par ex., à partir de
          registres publics, sites web, partenaires commerciaux).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='ueberlassene-daten'
        title='4.1. Données fournies'
        order={titleOrder(2)}
      >
        <p>
          Vous nous fournissez vos données personnelles lorsque vous interagissez avec nous, par
          exemple dans les circonstances suivantes :
        </p>
        <ul>
          <li>Lorsque vous communiquez avec nous ou nos employés ;</li>
          <li>Lorsque vous créez un compte utilisateur chez nous ;</li>
          <li>Lorsque vous visitez nos locaux commerciaux ;</li>
          <li>Lorsque vous assistez à nos événements clients et événements publics ;</li>
          <li>Lorsque vous achetez nos produits ou services (par ex., en ligne) ;</li>
          <li>
            Lorsque vous vous inscrivez pour utiliser certaines offres et services (par ex.,
            applications, newsletters, Wi-Fi gratuit) ;
          </li>
          <li>Lorsque vous participez à l&apos;un de nos concours ou tirages au sort.</li>
        </ul>
        <p>
          Les données fournies incluent principalement les données de base, de communication,
          d&apos;inscription et contractuelles, mais aussi les données de préférence.
        </p>
        <p>
          En général, la fourniture de données personnelles est volontaire, c&apos;est-à-dire que
          vous n&apos;êtes généralement pas obligé de nous fournir des données personnelles.
          Cependant, nous devons collecter et traiter les données personnelles nécessaires au
          traitement d&apos;une relation contractuelle et à l&apos;accomplissement des obligations
          associées ou requises par la loi, telles que les données de base et contractuelles
          obligatoires. Sinon, nous pourrions ne pas être en mesure de conclure ou de poursuivre le
          contrat concerné.
        </p>
        <p>
          Si vous nous fournissez des données sur d&apos;autres personnes (par ex., membres de la
          famille, employés), nous supposons que vous êtes autorisé à le faire et que les données
          sont exactes. Veuillez vous assurer que ces autres personnes sont informées de cette
          politique de confidentialité.
        </p>
        <p>
          Si vous ne fournissez pas certaines données personnelles, cela peut entraîner
          l&apos;impossibilité de fournir le service associé ou de conclure un contrat. Nous vous
          indiquerons généralement où les données personnelles requises sont obligatoires.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='erhaltene-daten' title='4.2 Données reçues' order={titleOrder(2)}>
        <p>
          Nous pouvons également recevoir des données personnelles vous concernant de la part de
          tiers, tels que les suivants :
        </p>
        <ul>
          <li>
            De partenaires commerciaux avec lesquels nous coopérons, tels que banques, compagnies
            d&apos;assurance, distributeurs et autres partenaires contractuels (notamment des
            organisations comme les écoles) ;
          </li>
          <li>De personnes qui communiquent avec nous ;</li>
          <li>
            D&apos;agences de crédit, par ex., lorsque nous obtenons des informations sur la
            solvabilité ;
          </li>
          <li>
            De vendeurs d&apos;adresses ou de la poste suisse, par ex., pour les mises à jour
            d&apos;adresses ;
          </li>
          <li>De fournisseurs de services en ligne, par ex., services d&apos;analyse internet ;</li>
          <li>
            Des autorités et des tribunaux dans le cadre de procédures administratives et
            judiciaires.
          </li>
        </ul>
        <p>
          Les données reçues incluent principalement les données de base, de communication,
          financières et contractuelles, mais aussi les données de préférence.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='erhobene-daten'
        title='4.3 Données collectées'
        order={titleOrder(2)}
      >
        <p>
          Nous pouvons également collecter vos données personnelles nous-mêmes ou de manière
          automatisée, par exemple dans les circonstances suivantes :
        </p>
        <ul>
          <li>Lorsque vous utilisez nos services ;</li>
          <li>Lorsque vous utilisez nos services ;</li>
          <li>Lorsque vous passez des commandes et/ou faites des achats chez nous ;</li>
          <li>Lorsque vous visitez nos sites web ou utilisez nos applications ;</li>
          <li>
            Lorsque nous consultons des sources accessibles au public (par ex., registres publics,
            sites web, plateformes) ;
          </li>
          <li>
            Lorsque nous obtenons des informations vous concernant auprès de votre organisation ou
            d&apos;une autre organisation ou entreprise (par ex., à des fins de référence dans le
            processus de candidature, si vous y consentez) ;
          </li>
          <li>Lorsque nous travaillons avec des partenaires commerciaux ;</li>
          <li>
            Lorsque vous cliquez sur un lien dans l&apos;une de nos newsletters ou interagissez
            autrement avec l&apos;une de nos communications marketing électroniques.
          </li>
        </ul>
        <p>
          Les données collectées incluent principalement des données de comportement ainsi que des
          données techniques.
        </p>
        <p>
          Nous pouvons également déduire d&apos;autres données personnelles à partir de données
          personnelles déjà existantes, par exemple en évaluant les données comportementales.
          Souvent, ces données personnelles déduites incluent des données de préférence.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='fuer-welche-zwecke-bearbeiten-wir-personendaten'
        title='5. À quelles fins traitons-nous les données personnelles ?'
        order={titleOrder(1)}
      >
        <p>
          Nous traitons principalement vos données personnelles pour conclure et gérer nos contrats
          avec vous, nos clients et nos partenaires commerciaux. Nous traitons également vos données
          personnelles à d&apos;autres fins, telles que :
        </p>
        <ul>
          <li>pour communiquer avec vous ;</li>
          <li>
            pour vous fournir et améliorer nos services (y compris nos sites web) à vous et à nos
            clients ;
          </li>
          <li>pour gérer la relation commerciale avec vous et nos clients ;</li>
          <li>
            pour mener des activités publicitaires, marketing, de recherche de marché et de
            développement de produits ;
          </li>
          <li>
            pour assurer votre sécurité et la nôtre et prévenir les abus (par ex., pour la sécurité
            informatique, la prévention du vol, de la fraude et des abus, et à des fins de preuve) ;
          </li>
          <li>pour se conformer aux obligations légales ;</li>
          <li>
            pour faire valoir nos droits et nous défendre contre les réclamations d&apos;autres
            personnes ;
          </li>
          <li>
            pour préparer et exécuter la vente ou l&apos;achat de secteurs d&apos;activité,
            d&apos;entreprises ou de parts d&apos;entreprises et d&apos;autres transactions
            d&apos;entreprise, y compris le transfert de données personnelles ;
          </li>
          <li>pour la gestion d&apos;entreprise.</li>
        </ul>
        <p>
          Lorsque nous traitons des données personnelles à des fins décrites dans cette politique,
          nous nous appuyons, entre autres, sur notre intérêt légitime à maintenir, développer et
          gérer la relation commerciale et la communication avec vous en tant que partenaire
          commercial concernant nos produits et services.
        </p>
        <p>
          Pour certaines fins, vous pouvez nous accorder votre consentement pour traiter vos données
          personnelles. Dans la mesure où nous n&apos;avons pas d&apos;autre base légale, nous
          traitons vos données personnelles dans le cadre et sur la base de ce consentement. Vous
          pouvez révoquer votre consentement à tout moment. Une révocation n&apos;affecte pas le
          traitement déjà effectué.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='warum-und-wie-teilen-wir-daten'
        title='6. Pourquoi et comment partageons-nous les données ?'
        order={titleOrder(1)}
      >
        <p>
          Nous pouvons partager vos données personnelles avec des tiers de confiance si nécessaire
          ou utile pour la prestation de nos services ou pour atteindre les objectifs définis dans
          cette politique de confidentialité. Nous pouvons partager vos données personnelles avec
          les catégories de destinataires suivantes : prestataires de services externes (par ex.,
          fournisseurs de services informatiques, auditeurs, services d&apos;expédition, services de
          paiement) ; clients et autres partenaires contractuels ; contreparties, leurs
          représentants légaux et les personnes impliquées ; partenaires commerciaux avec lesquels
          nous devons éventuellement coordonner la prestation de services ; autorités et tribunaux.
          Veuillez noter que ces destinataires peuvent à leur tour faire appel à des tiers, de sorte
          que vos données peuvent également leur être accessibles.
        </p>
        <p>
          Si nous partageons vos données personnelles avec des tiers qui les traitent en notre nom,
          cela se fait sur la base de nos instructions et conformément à notre politique de
          confidentialité ainsi qu&apos;à d&apos;autres mesures de confidentialité et de sécurité
          appropriées. Par exemple, nous utilisons des prestataires de services pour soutenir le
          fonctionnement de notre infrastructure informatique, fournir nos produits et services,
          améliorer nos processus internes, et offrir un support supplémentaire à nos clients.
        </p>
        <p>
          Nous traitons généralement vos données personnelles uniquement en Suisse et dans
          l&apos;Espace économique européen (EEE) (voir également ci-dessous Section 6). Sur nos
          sites web et applications, nous utilisons des services de fournisseurs tiers ; veuillez
          vous référer à notre politique relative aux cookies (ci-dessous Section 13) pour des
          informations sur la collecte de données par ces fournisseurs tiers.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='warum-und-wie-geben-wir-daten-ins-ausland-weiter'
        title="7. Pourquoi et comment transférons-nous les données à l'étranger ?"
        order={titleOrder(1)}
      >
        <p>
          Nous pouvons transférer vos données personnelles à des destinataires dans l&apos;Espace
          économique européen (EEE), ainsi qu&apos;à des destinataires aux États-Unis et dans
          d&apos;autres pays qui ne garantissent pas un niveau de protection des données comparable
          à celui de la législation suisse (dits pays tiers). Nous le faisons généralement lorsque
          cela est nécessaire pour l&apos;exécution d&apos;un contrat ou la mise en œuvre de
          revendications légales. Si nous transférons des données vers d&apos;autres pays tiers dont
          vous n&apos;êtes pas déjà informé (par ex., par le biais d&apos;un contrat ou d&apos;une
          communication avec nous), le pays respectif, l&apos;organisation internationale ou au
          moins la région sera généralement indiquée dans cette politique de confidentialité et
          spécifiquement dans la politique relative aux cookies. Nous ne transférons vos données
          personnelles vers un pays tiers que si les exigences légales en matière de protection des
          données sont remplies (par ex., après avoir conclu des clauses contractuelles types
          reconnues, conformément au Swiss-U.S. Data Privacy Framework ou après avoir obtenu un
          consentement) ou si nous pouvons nous appuyer sur une exception. Une exception peut
          s&apos;appliquer dans des cas d&apos;intérêt public prépondérant ou lorsque le traitement
          d&apos;un contrat dans votre intérêt nécessite une telle divulgation.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wie-setzen-wir-profiling-ein'
        title='8. Comment utilisons-nous le profilage ?'
        order={titleOrder(1)}
      >
        <p>
          Le profilage fait référence au traitement automatisé des données personnelles pour
          analyser ou faire des prédictions sur des aspects personnels (par ex., analyser les
          intérêts et habitudes personnels). Le profilage génère généralement des données de
          préférence. Nous utilisons le profilage principalement dans le traitement automatisé des
          données de base, contractuelles, comportementales et de préférence lors de
          l&apos;utilisation et de l&apos;achat de nos offres et services, mais aussi en lien avec
          nos sites web, applications, événements, concours et tirages au sort. Nous utilisons le
          profilage principalement pour améliorer nos offres, présenter ces dernières et nos
          contenus selon vos besoins, vous présenter uniquement les publicités et offres
          probablement pertinentes pour vous, et décider des options de paiement disponibles pour
          vous sur la base d&apos;une vérification de solvabilité. Nous pouvons également lier les
          données personnelles de différentes sources pour améliorer la qualité de nos analyses et
          prévisions.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wie-treffen-wir-automatisierte-einzelentscheidungen'
        title='9. Comment prenons-nous des décisions individuelles automatisées ?'
        order={titleOrder(1)}
      >
        <p>
          Les décisions individuelles automatisées sont des décisions prises entièrement
          automatiquement, c&apos;est-à-dire sans intervention humaine, qui peuvent avoir des
          conséquences juridiques pour la personne concernée ou l&apos;affecter de manière
          significative. Nous n&apos;utilisons généralement pas de décisions individuelles
          automatisées, mais si nous le faisons, nous vous en informerons séparément dans des cas
          individuels.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wie-schuetzen-wir-daten'
        title='10. Comment protégeons-nous les données ?'
        order={titleOrder(1)}
      >
        <p>
          Nous prenons des mesures techniques (par ex., pare-feu, cryptage SSL, protection par mot
          de passe) et organisationnelles (par ex., restriction d&apos;accès, formation des
          personnes autorisées) appropriées pour garantir la sécurité de vos données personnelles.
          Ces mesures protègent vos données personnelles contre tout traitement non autorisé ou
          illégal, tout accès non autorisé, et/ou contre toute perte, modification ou divulgation
          accidentelle. Veuillez toujours garder à l&apos;esprit que la transmission
          d&apos;informations par Internet et d&apos;autres moyens électroniques comporte certains
          risques de sécurité. Nous ne pouvons garantir la sécurité des informations transmises de
          cette manière.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wie-lange-bewahren-wir-daten-auf'
        title='11. Combien de temps conservons-nous les données ?'
        order={titleOrder(1)}
      >
        <p>
          Nous conservons vos données personnelles aussi longtemps que nos finalités de traitement
          (voir Section 4), les délais de conservation légaux (généralement cinq ou dix ans), et nos
          intérêts légitimes, en particulier à des fins de documentation et de preuve, le
          nécessitent ou que des raisons techniques rendent le stockage nécessaire (par ex., en cas
          de sauvegardes ou de systèmes de gestion documentaire). Nous supprimons ou anonymisons vos
          données personnelles, à moins qu&apos;il n&apos;y ait des obligations légales ou
          contractuelles ou des raisons techniques qui s&apos;y opposent, généralement après
          l&apos;expiration de la période de conservation et de traitement dans le cadre de nos
          procédures habituelles et conformément à notre politique de conservation.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='cookie-richtlinie'
        title='12. Politique relative aux Cookies'
        order={titleOrder(1)}
      >
        <p>
          Nous décrivons ci-dessous comment et à quelles fins nous utilisons les journaux de
          connexion, les cookies, les technologies similaires et d&apos;autres services de tiers
          lors de l&apos;utilisation de nos sites web et applications (désignés collectivement
          &apos;site web&apos;) et ainsi traitons les données personnelles et autres.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='was-sind-log-daten'
        title="12.1 Qu'est-ce que les journaux de connexion ?"
        order={titleOrder(2)}
      >
        <p>
          Certaines informations sont automatiquement enregistrées et stockées à chaque connexion à
          un serveur web pour des raisons techniques. Lorsque vous visitez notre site web, des
          informations sont automatiquement envoyées au serveur de notre site web. Ces informations
          incluent l&apos;adresse IP de votre ordinateur, la date et l&apos;heure de l&apos;accès,
          le nom et l&apos;URL des données consultées, le site web à partir duquel l&apos;accès a
          été effectué (URL de référence), le type et la version du navigateur, ainsi que
          d&apos;autres informations transmises par le navigateur (par ex., système
          d&apos;exploitation de votre ordinateur, emplacement géographique, paramètre de langue).
          Ces informations sont temporairement stockées dans un fichier journal appelé
          &apos;logfile&apos; et conservées conformément aux exigences légales. Nous traitons ces
          données dans le but d&apos;assurer une connexion fluide et une utilisation confortable de
          notre site web, ainsi que d&apos;évaluer la sécurité et la stabilité du système.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='was-sind-cookies-und-aehnliche-technologien'
        title="12.2 Qu'est-ce que les cookies et les technologies similaires ?"
        order={titleOrder(2)}
      >
        <p>
          Nous pouvons utiliser des cookies et des technologies similaires sur notre site web. Les
          cookies sont généralement de petits fichiers texte que votre navigateur crée
          automatiquement et stocke sur votre appareil (ordinateur, tablette, smartphone, etc.)
          lorsque vous accédez à notre site. Les cookies de session enregistrent vos saisies pendant
          que vous naviguez d&apos;une page à l&apos;autre sur le site. Les cookies de session sont
          supprimés après une courte période, au plus tard lorsque vous fermez votre navigateur. Les
          cookies persistants restent stockés même après la fermeture du navigateur pendant une
          période déterminée. Les technologies similaires incluent, par exemple, les balises pixel
          (images invisibles ou code de programme chargés depuis un serveur et transmettant
          certaines informations à l&apos;opérateur du serveur), les empreintes digitales
          (informations sur l&apos;appareil et le navigateur collectées lors de la visite d&apos;un
          site web et distinguant l&apos;appareil des autres), et d&apos;autres technologies (par
          ex., &apos;Web Storage&apos;) pour stocker des données dans le navigateur.
        </p>
        <p>
          Nous utilisons à la fois des cookies persistants et des cookies de session sur notre site
          web. Nous ne pouvons pas toujours vous identifier avec un cookie. Nous utilisons des
          cookies et des technologies similaires pour capturer statistiquement l&apos;utilisation de
          notre site web et l&apos;évaluer à des fins d&apos;optimisation et de convivialité. Nous
          utilisons également des cookies pour la fourniture de nos services (notamment les cookies
          techniquement nécessaires). Les cookies ont des durées de conservation différentes. Nous
          n&apos;avons aucun contrôle sur la durée de conservation des cookies définis par des
          tiers.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wie-koennen-sie-cookies-und-aehnliche-technologien-deaktivieren'
        title='12.3 Comment pouvez-vous désactiver les cookies et les technologies similaires ?'
        order={titleOrder(2)}
      >
        <p>
          Vous pouvez configurer votre navigateur pour qu&apos;il n&apos;accepte pas automatiquement
          les cookies et les technologies similaires ou pour qu&apos;il supprime les cookies
          existants et d&apos;autres données stockées dans le navigateur. Vous pouvez également
          étendre votre navigateur avec des logiciels supplémentaires (appelés &apos;add-ons&apos;
          ou &apos;plug-ins&apos;) qui empêchent le suivi par certains tiers (ces plug-ins sont
          disponibles, par exemple, sur www.noscript.net ou www.ghostery.com). Vous trouverez
          généralement plus d&apos;informations dans les pages d&apos;aide de votre navigateur sous
          le mot-clé &apos;confidentialité&apos;. Veuillez noter que la désactivation partielle ou
          totale des cookies peut vous empêcher d&apos;utiliser toutes les fonctionnalités de nos
          sites web.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='welche-cookies-und-aehnliche-technologien-setzen-wir-ein-und-wie-nutzen-wir-diese'
        title='12.4 Quels cookies et technologies similaires utilisons-nous et comment les utilisons-nous ?'
        order={titleOrder(2)}
      >
        <p>
          Cookies techniquement nécessaires : Nous utilisons des cookies persistants pour
          enregistrer vos paramètres utilisateur personnels (notamment concernant les cookies et la
          sélection de la langue sur notre site web). Nous ne traitons aucune donnée personnelle
          vous concernant à cette occasion. Le but du traitement est de réidentifier vos paramètres
          personnels sur notre site web. Ces cookies sont nécessaires au bon fonctionnement de notre
          site web. Ces cookies sont automatiquement supprimés de votre système après un maximum
          d&apos;un mois. Vous pouvez également supprimer les cookies manuellement à tout moment.
          Veuillez noter que vos paramètres utilisateur seront alors perdus.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='technisch-notwendige-cookies'
        title='12.4.1 Cookies techniquement nécessaires'
        order={titleOrder(3)}
      >
        <p>
          Nous utilisons des cookies persistants pour enregistrer vos paramètres utilisateur
          personnels (notamment concernant les cookies et la sélection de la langue sur notre site
          web). Nous ne traitons aucune donnée personnelle vous concernant à cette occasion. Le but
          du traitement est de réidentifier vos paramètres personnels sur notre site web. Ces
          cookies sont nécessaires au bon fonctionnement de notre site web. Ces cookies sont
          automatiquement supprimés de votre système après un maximum d&apos;un mois. Vous pouvez
          également supprimer les cookies manuellement à tout moment. Veuillez noter que vos
          paramètres utilisateur seront alors perdus.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='erfolgs-und-reichweitenmessung'
        title="12.4.2 Mesure du succès et de l'audience"
        order={titleOrder(3)}
      >
        <p>Nous utilisons les services suivants pour la mesure du succès et de l&apos;audience :</p>
        <ul>
          <li>
            Supabase de Supabase, Inc., basée à 970 Toa Payoh North #07-04, Singapore 318992. Ce
            service surveille et enregistre la manière dont notre service d&apos;authentification de
            l&apos;application est utilisé. Supabase nous fournit les informations collectées sous
            forme agrégée. Nous ne pouvons pas identifier les visiteurs individuels. Le transfert de
            données est basé sur les clauses contractuelles types de la Commission européenne avec
            des ajustements pour le droit suisse. Les détails sont disponibles à l&apos;adresse
            suivante : https://supabase.com/legal/dpa. Supabase peut utiliser les données
            supplémentaires qu&apos;elle collecte et les informations qu&apos;elle en tire à ses
            propres fins. Supabase traite alors vos données personnelles sous sa propre
            responsabilité et conformément à sa politique de confidentialité. Vous trouverez plus
            d&apos;informations concernant les données collectées dans la politique de
            confidentialité de Supabase à l&apos;adresse suivante : https://supabase.com/privacy.
          </li>
          <li>
            Plausible Analytics de Plausible Insights OÜ, basée à Västriku tn 2, 50403, Tartu,
            Estonia. Ce service nous aide à comprendre comment notre site web est utilisé, sans
            collecter de données personnelles ni utiliser de cookies. Les données sont traitées dans
            l&apos;UE. Plus d&apos;informations sont disponibles à l&apos;adresse suivante :
            https://plausible.io/data-policy.
          </li>
        </ul>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='bot-erkennung-und-blockierung'
        title='12.4.3 Détection et blocage des bots'
        order={titleOrder(3)}
      >
        <p>Nous utilisons les services suivants pour identifier et bloquer les bots :</p>
        <ul>
          <li>
            Cloudflare Bot Manager de Cloudflare, Inc., 101 Townsend Street, San Francisco,
            California 94107, USA. Nous utilisons Cloudflare Bot Manager pour protéger notre site
            web contre les bots malveillants. Le cookie défini est supprimé après 30 minutes. Plus
            d&apos;informations sont disponibles à l&apos;adresse suivante :
            https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/#__cf_bm-cookie-for-cloudflare-bot-products.
            Cloudflare participe au processus d&apos;auto-certification du Département du commerce
            des États-Unis et respecte les principes du Swiss-U.S. Data Privacy Framework lors du
            traitement des données personnelles en provenance de Suisse. La politique de
            confidentialité de Cloudflare est disponible à l&apos;adresse suivante :
            https://www.cloudflare.com/privacypolicy/
          </li>
        </ul>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='dienste-von-drittanbieter'
        title='12.5 Services de tiers (notamment plugins de sites web)'
        order={titleOrder(2)}
      >
        <p>
          Nous utilisons des services tiers pour vous fournir notre site web et offrir des
          fonctionnalités supplémentaires. En particulier, nous utilisons les services suivants :
        </p>
        <ul>
          <li>
            Supabase de Supabase, Inc., 970 Toa Payoh North #07-04, Singapore 318992. Nous utilisons
            Supabase pour stocker et traiter notre site web et nos données (notamment la base de
            données), afin de pouvoir vous fournir rapidement et sans faille les contenus et données
            sur tous les appareils. Le traitement des données personnelles a lieu dans l&apos;UE
            (emplacement du serveur : Francfort, DE). Si des données personnelles sont transférées
            dans un pays tiers non sécurisé, ce transfert de données est basé sur les clauses
            contractuelles types de la Commission européenne avec des ajustements pour le droit
            suisse. Les détails sont disponibles à l&apos;adresse suivante :
            https://supabase.com/legal/dpa. La politique de confidentialité de Supabase est
            disponible à l&apos;adresse suivante : https://supabase.com/privacy ;
          </li>
          <li>
            Cloudflare de Cloudflare, Inc., 101 Townsend Street, San Francisco, California 94107,
            USA. Nous utilisons Cloudflare pour fournir rapidement et sans faille les contenus de
            notre site web sur tous les appareils. Cloudflare participe au processus
            d&apos;auto-certification du Département du commerce des États-Unis et respecte les
            principes du Swiss-U.S. Data Privacy Framework lors du traitement des données
            personnelles en provenance de Suisse. La politique de confidentialité de Cloudflare est
            disponible à l&apos;adresse suivante : https://www.cloudflare.com/privacypolicy/ ;
          </li>
          <li>
            DigitalOcean, LLC, 101 6th Ave New York, NY 10013, USA. Nous utilisons DigitalOcean pour
            fournir rapidement et sans faille les contenus de notre site web sur tous les appareils
            (notamment l&apos;hébergement et le serveur web). Le traitement des données personnelles
            a lieu dans l&apos;UE (emplacement du serveur : Francfort, DE). DigitalOcean participe
            au processus d&apos;auto-certification du Département du commerce des États-Unis et
            respecte les principes du Swiss-U.S. Data Privacy Framework lors du traitement des
            données personnelles en provenance de Suisse. La politique de confidentialité de
            DigitalOcean est disponible à l&apos;adresse suivante :
            https://www.digitalocean.com/legal/privacy-policy ;
          </li>
          <li>
            Plausible Analytics de Plausible Insights OÜ, Västriku tn 2, 50403, Tartu, Estonie. Nous
            utilisons Plausible Analytics pour analyser et optimiser l&apos;utilisation de notre
            site web de manière respectueuse de la vie privée. Ce service ne recourt à aucun cookie
            et ne collecte aucune donnée personnelle. Le traitement des données est effectué
            exclusivement au sein de l&apos;UE. Pour plus d&apos;informations :
            https://plausible.io/privacy ;
          </li>
        </ul>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='welche-rechte-haben-sie'
        title='13. Quels sont vos droits ?'
        order={titleOrder(1)}
      >
        <p>
          En tant que personne potentiellement concernée, vous pouvez faire valoir diverses
          réclamations à notre égard conformément aux dispositions nationales et internationales
          applicables. Nous pouvons traiter à nouveau vos données personnelles pour satisfaire vos
          réclamations.
        </p>
        <p>Vous avez les droits suivants concernant vos données personnelles :</p>
        <ul>
          <li>
            Droit d&apos;accès : Vous avez le droit de recevoir des informations sur les données
            personnelles que nous avons à votre sujet et comment nous les traitons ;
          </li>
          <li>
            Droit de délivrance ou de transfert de données : Vous avez le droit de recevoir ou de
            transférer une copie de vos données personnelles dans un format électronique courant, à
            condition qu&apos;elles soient traitées automatiquement et que les données soient
            traitées sur la base de votre consentement ou en relation directe avec la conclusion ou
            l&apos;exécution d&apos;un contrat entre vous et nous ;
          </li>
          <li>
            Droit de rectification : Vous avez le droit de faire rectifier vos données personnelles
            si elles sont inexactes ;
          </li>
          <li>
            Droit à l&apos;effacement : Vous avez le droit de faire effacer vos données personnelles
            ;
          </li>
          <li>
            Droit d&apos;opposition : Vous avez le droit de vous opposer au traitement de vos
            données personnelles (notamment lors du traitement à des fins de marketing direct).
          </li>
        </ul>
        <p>
          Veuillez noter que ces droits sont soumis à des conditions et des exceptions. Nous pouvons
          limiter ou refuser votre demande d&apos;exercer ces droits si cela est légalement
          autorisé. Nous nous réservons le droit de caviarder ou de ne fournir que partiellement des
          copies pour des raisons de protection des données ou de confidentialité.
        </p>
        <p>
          Si vous souhaitez exercer vos droits à notre égard ou si vous n&apos;êtes pas satisfait de
          notre gestion de vos droits ou de la confidentialité, veuillez nous contacter ; nos
          coordonnées se trouvent dans la Section 1. Pour prévenir les abus, nous devons vous
          identifier (par ex., avec une copie de votre pièce d&apos;identité, si nécessaire).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='rechtsgrundlagen-nach-dsgvo'
        title='14. Bases juridiques en vertu du RGPD'
        order={titleOrder(1)}
      >
        <p>
          Nous ne présumons pas que le Règlement général sur la protection des données (RGPD) de
          l&apos;UE s&apos;applique à notre cas. Cependant, si c&apos;est exceptionnellement le cas
          pour certaines activités de traitement des données, cette Section 15 s&apos;applique
          exclusivement aux fins du RGPD et aux activités de traitement des données qui y sont
          soumises.
        </p>
        <p>
          Nous nous appuyons sur les bases légales suivantes pour le traitement de vos données
          personnelles :
        </p>
        <ul>
          <li>
            il est nécessaire, comme décrit dans la Section 4, pour la conclusion et
            l&apos;exécution des contrats et leur gestion et exécution (art. 6(1)(b) RGPD) ;
          </li>
          <li>
            il est nécessaire pour protéger nos intérêts légitimes ou ceux de tiers, comme décrit
            dans la Section 4, notamment pour communiquer avec vous ou des tiers, pour exploiter
            notre site web, améliorer nos offres électroniques et s&apos;inscrire à certaines offres
            et services, à des fins de sécurité, pour se conformer à la législation suisse et aux
            règlements internes pour la gestion des risques et la gouvernance d&apos;entreprise, et
            à d&apos;autres fins telles que la formation et l&apos;éducation, l&apos;administration,
            la preuve et l&apos;assurance qualité, l&apos;organisation, la mise en œuvre et le suivi
            des événements, et pour protéger d&apos;autres intérêts légitimes (voir Section 4) (art.
            6(1)(f) RGPD) ;
          </li>
          <li>
            il est légalement requis ou autorisé en vertu de notre mandat ou de notre position en
            vertu de la législation de l&apos;EEE ou d&apos;un État membre (art. 6(1)(c) RGPD) ou
            nécessaire pour protéger vos intérêts vitaux ou ceux d&apos;autres personnes physiques
            (art. 6(1)(d) RGPD) ;
          </li>
          <li>
            vous avez consenti au traitement, par exemple, via une déclaration correspondante sur
            notre site web (art. 6(1)(a) et art. 9(2)(a) RGPD).
          </li>
        </ul>
        <p>
          Si vous vous trouvez dans l&apos;EEE, en plus des droits énoncés dans la Section 14, vous
          avez également le droit de restreindre le traitement des données, et vous pouvez déposer
          une plainte auprès de l&apos;autorité de protection des données de votre pays. Une liste
          des autorités de l&apos;EEE est disponible ici :
          https://edpb.europa.eu/about-edpb/board/members_fr
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='wie-koennen-wir-diese-datenschutzerklaerung-aendern'
        title='15. Comment pouvons-nous modifier cette politique de confidentialité ?'
        order={titleOrder(1)}
      >
        <p>
          Nous pouvons modifier cette politique de confidentialité à tout moment ou initier de
          nouvelles activités de traitement. Nous mettons également à jour cette politique de
          confidentialité de temps en temps pour tenir compte des exigences légales. Nous vous
          informerons de ces modifications et ajouts de manière appropriée, notamment en publiant la
          politique de confidentialité actuelle sur notre site web (voir ci-dessous). La politique
          de confidentialité actuelle peut être consultée à tout moment à l&apos;adresse suivante :
          https://edutime.ch/docs/privacy.
        </p>
      </LegalDocumentSection>
    </>
  )
}
