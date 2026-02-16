import { LegalDocumentSection } from '../LegalDocumentSection'
import type { TocLink } from '../PrivacyLayout'

export const termsMetaFr = {
  title: "Conditions d'utilisation d'EduTime",
  tocLabel: 'Table des matières',
  meta: {
    version: 'Version 1.0',
    lastUpdated: '3 mars 2025',
  },
}

export const tocLinksFr: TocLink[] = [
  {
    id: 'anwendungsbereich-und-nutzungsvoraussetzungen',
    label: "1. Champ d'application et conditions d'utilisation",
    order: 1,
  },
  { id: 'umfang-der-nutzung', label: "2. Étendue de l'utilisation", order: 1 },
  {
    id: 'testversion-und-kostenloser-leistungsumfang',
    label: "3. Version d'essai et étendue gratuite des prestations",
    order: 1,
  },
  {
    id: 'daten-datenspeicherung-und-backup',
    label: '4. Données, stockage des données et sauvegarde',
    order: 1,
  },
  {
    id: 'verantwortung-fuer-inhalte-und-rechtmaessige-nutzung',
    label: '5. Responsabilité du contenu et utilisation licite',
    order: 1,
  },
  {
    id: 'sperrung-bei-unzulaessiger-nutzung',
    label: "6. Blocage en cas d'utilisation illicite",
    order: 1,
  },
  { id: 'geistiges-eigentum', label: '7. Propriété intellectuelle', order: 1 },
  {
    id: 'gewaehrleistung-und-haftung',
    label: '8. Garantie et responsabilité',
    order: 1,
  },
  {
    id: 'geheimhaltung-und-datenschutz',
    label: '9. Confidentialité et protection des données',
    order: 1,
  },
  { id: 'aktualisierungen', label: '10. Mises à jour', order: 1 },
  {
    id: 'gerichtsstand-und-anwendbares-recht',
    label: '11. For juridique et droit applicable',
    order: 1,
  },
]

/**
 * French version of the Terms of Use (Conditions d'utilisation).
 *
 * To update this content, edit the JSX below directly.
 * For other languages, create TermsEn.tsx / TermsDe.tsx following the same pattern.
 */
export function TermsFr() {
  return (
    <>
      <LegalDocumentSection
        id='anwendungsbereich-und-nutzungsvoraussetzungen'
        title="1. Champ d'application et conditions d'utilisation"
        order={2}
      >
        <p>
          EduTime GmbH, c/o Tim Ogi, Bienenstrasse 8, 3018 Bern (ci-après « EduTime »), permet aux
          utilisateurs, sous les conditions suivantes, d'utiliser les services en ligne d'EduTime
          via (i) l'application web basée sur navigateur « EduTime » (ci-après « application web »)
          et/ou via (ii) l'application mobile « EduTime » (ci-après « application » ; collectivement
          ci-après « Services »).
        </p>
        <p>
          Toute relation contractuelle concernant les Services existe entre EduTime et la personne
          ou l'organisation ayant conclu un contrat sur la base des Conditions Générales d'EduTime.
          Le partenaire contractuel d'EduTime est ci-après désigné comme « Client ».
        </p>
        <p>
          Seules les personnes physiques âgées d'au moins 14 ans, domiciliées en Suisse, disposant
          d'une inscription aux Services et ayant (i) directement dans le cadre d'un contrat avec
          EduTime ou (ii) indirectement par un Client d'EduTime reçu l'autorisation d'utiliser les
          Services (ci-après « Utilisateur »), sont autorisées à télécharger l'application, à
          accéder aux Services et/ou à utiliser les Services.
        </p>
        <p>
          Dans le cadre des présentes conditions d'utilisation, les désignations « vous », « votre »
          et similaires se réfèrent toujours à l'Utilisateur tel que défini ci-dessus au chiffre
          1.3.
        </p>
        <p>
          Lorsque vous utilisez un Service, les présentes conditions d'utilisation s'appliquent à
          vous, que vous soyez Client d'EduTime ou non. Vous vous engagez à respecter les présentes
          conditions d'utilisation et êtes responsable des violations. Vous ne devez pas aider ou
          impliquer d'autres personnes d'une manière qui enfreindrait les présentes conditions
          d'utilisation. EduTime fera respecter les présentes conditions d'utilisation par les
          méthodes qu'EduTime juge appropriées. En cas de violation des présentes conditions
          d'utilisation, EduTime peut suspendre ou résilier votre utilisation des Services.
        </p>
        <p>
          Les présentes conditions d'utilisation seules ne créent aucune obligation réciproque de
          livraison, de paiement, d'acceptation ou de conclusion de contrat. Un droit à la livraison
          ou à la prestation dans le cadre des présentes conditions d'utilisation nécessite un
          contrat conclu pour les Services. La présentation de produits et de prestations sur les
          sites web d'EduTime, dans les Services ou dans les listes de prix d'EduTime ne constitue
          pas une offre contractuelle juridiquement contraignante d'EduTime.
        </p>
        <p>
          En cas de contradiction entre les présentes conditions d'utilisation et le contrat conclu
          avec le Client, les dispositions du contrat prévalent, sauf stipulation contraire.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='umfang-der-nutzung' title="2. Étendue de l'utilisation" order={2}>
        <p>
          L'étendue des fonctionnalités mises à votre disposition varie selon que vous disposez ou
          non d'une inscription, ou, si vous disposez d'une inscription, selon que vous avez
          simultanément conclu un contrat avec EduTime pour les Services ou que vous avez reçu
          l'autorisation d'utilisation des Services par un Client d'EduTime.
        </p>
        <p>
          En vertu des présentes conditions d'utilisation conjointement avec le contrat
          correspondant, EduTime accorde au Client et aux Utilisateurs le droit non exclusif, non
          transférable, non sous-licenciable et payant d'utiliser les Services conformément aux
          dispositions des présentes conditions d'utilisation et du contrat correspondant après
          paiement intégral des frais d'utilisation applicables à des fins propres. Aucune
          acquisition supplémentaire de droits sur les Services n'est liée à cette concession de
          droits d'utilisation. Les droits d'utilisation accordés par EduTime sur des logiciels
          tiers sont limités en étendue aux droits d'utilisation que ces tiers ont accordés à
          EduTime.
        </p>
        <p>
          Vous êtes tenu de signaler les problèmes liés aux Services, tels que les
          dysfonctionnements, bugs ou erreurs, ainsi que toute utilisation non autorisée reconnue
          des Services, par e-mail (info@edutime.ch) ou via l'outil de signalement mis à disposition
          par EduTime à une URL spécifique, de manière dûment documentée. La correction des erreurs
          ou la mise à jour des Services ou de la documentation associée sera effectuée par EduTime
          au mieux de ses connaissances.
        </p>
        <p>
          Pour accéder aux Services et les utiliser, vous devez utiliser les technologies les plus
          récentes, en particulier la dernière version du navigateur internet et/ou du système
          d'exploitation de votre appareil mobile. En cas d'utilisation de technologies plus
          anciennes ou peu courantes, il se peut que vous ne puissiez pas accéder aux Services ou
          que vous ne puissiez les utiliser que de manière limitée.
        </p>
        <p>
          EduTime est en droit de développer les Services, en particulier les caractéristiques des
          Services, à tout moment et de les adapter, les restreindre ou de cesser entièrement la
          fourniture de certaines prestations et fonctions ou de ne les mettre à disposition que
          d'une partie des Utilisateurs, afin de tenir compte du progrès technique et des conditions
          juridiques modifiées.
        </p>
        <p>
          Vous reconnaissez que l'accès aux Services dépend également de facteurs échappant au
          contrôle d'EduTime, tels que l'accès réseau à la plateforme serveur ou la disponibilité de
          l'application via une plateforme de distribution officielle, et qu'EduTime ne garantit
          donc pas que les Services soient disponibles sans interruption. En outre, EduTime ne peut
          garantir ni les temps de réponse, ni les temps de rétablissement, ni des disponibilités
          minimales mensuelles ou annuelles, ni que les Services soient exempts d'erreurs ou
          puissent être utilisés sans interruption. En particulier, EduTime est en droit de bloquer
          l'accès à tout moment pour des travaux de maintenance urgents ou en cas de risques de
          sécurité extraordinaires.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='testversion-und-kostenloser-leistungsumfang'
        title="3. Version d'essai et étendue gratuite des prestations"
        order={2}
      >
        <p>
          Dans la mesure où vous utilisez les Services en version d'essai, EduTime vous accorde une
          licence exclusivement aux fins de test et d'évaluation et exclusivement à des fins
          internes et, sauf indication expresse contraire, pour une durée limitée de 30 jours («
          Version d'essai »).
        </p>
        <p>
          La Version d'essai ainsi que les Services avec une étendue gratuite des prestations que
          vous avez choisis sont mis à disposition « en l'état » sans aucune garantie de qualité ou
          de conformité. EduTime décline expressément toutes les garanties et assurances implicites
          ou légales (p. ex. concernant les conditions d'exploitation et de fonctionnement, les
          fonctionnalités, l'adéquation, etc.). Vous n'avez aucun droit à des prestations de
          support, de maintenance et d'entretien.
        </p>
        <p>
          Si la Version d'essai n'est pas convertie en une étendue payante des prestations pendant
          la durée d'essai accordée, toutes vos données seront supprimées conformément aux cycles de
          suppression d'EduTime après l'expiration de la licence de la Version d'essai.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='daten-datenspeicherung-und-backup'
        title='4. Données, stockage des données et sauvegarde'
        order={2}
      >
        <p>
          EduTime met à la disposition de l'Utilisateur une capacité de stockage pour les données
          liées à l'utilisation des Services, conformément au contrat conclu avec le Client.
        </p>
        <p>
          Les données que vous saisissez relèvent de votre sphère juridique, même si elles sont
          stockées localement chez EduTime ou chez un prestataire. Vous êtes exclusivement
          responsable du stockage et du traitement des données. Vous respectez en particulier
          strictement les dispositions du droit applicable en matière de protection des données lors
          de la collecte et du traitement des données personnelles.
        </p>
        <p>
          EduTime vous permet de télécharger les données que vous avez stockées sur l'infrastructure
          serveur pendant la durée du contrat et dans les trente (30) jours suivant la fin du
          contrat, selon une procédure standardisée mise à disposition par EduTime. EduTime ne
          garantit en aucun cas l'utilisabilité des données téléchargées sur d'autres systèmes.
          EduTime est en droit de supprimer vos données stockées chez EduTime après la fin du
          contrat dans le cadre des cycles de suppression habituels, sauf si EduTime est tenu de les
          conserver en vertu de dispositions légales impératives.
        </p>
        <p>
          EduTime prend les mesures appropriées pour prévenir la perte de données en cas de
          défaillance des Services ainsi que pour empêcher l'accès non autorisé de tiers à vos
          données. À cette fin, EduTime effectue des sauvegardes régulières (au moins une fois par
          jour) et protège vos identifiants de connexion stockés par des moyens appropriés et
          conformes à l'état de la technique contre les accès non autorisés.
        </p>
        <p>
          Vous prenez les mesures appropriées au cas où les Services ne fonctionneraient pas
          correctement en tout ou en partie (p. ex. par sauvegarde des données, diagnostic des
          dysfonctionnements, vérification régulière des résultats).
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='verantwortung-fuer-inhalte-und-rechtmaessige-nutzung'
        title='5. Responsabilité du contenu et utilisation licite'
        order={2}
      >
        <p>
          Vous vous engagez à ne traiter avec les Services que des contenus licites. Sont notamment
          illicites les contenus qui violent ou menacent les droits d'EduTime ou de tiers, en
          particulier les droits de propriété intellectuelle au sens large (par ex. droits d'auteur
          ou droits de marque) ou les droits de la personnalité, ou la réputation commerciale ; sont
          également illicites tous les contenus qui constituent des infractions pénales (notamment
          dans les domaines de la pornographie, de la représentation de la violence, du racisme, des
          secrets d'affaires, de l'atteinte à l'honneur et de la fraude) (ci-après ensemble «
          Contenus illicites »). Les utilisations particulièrement gourmandes en ressources,
          c'est-à-dire les utilisations qui peuvent affecter le fonctionnement normal et la sécurité
          des Services d'EduTime ainsi que l'utilisation de l'infrastructure serveur par d'autres
          Clients et Utilisateurs, sont interdites.
        </p>
        <p>
          Toute action effectuée en utilisant vos identifiants de connexion et mots de passe, telle
          que des communications et des modifications des données utilisateur ou d'autres
          paramètres, est imputée par EduTime à votre compte.
        </p>
        <p>EduTime n'est pas tenu de surveiller les contenus présents dans les Services.</p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='sperrung-bei-unzulaessiger-nutzung'
        title="6. Blocage en cas d'utilisation illicite"
        order={2}
      >
        <p>
          EduTime est en droit de bloquer votre accès aux Services en tout ou en partie et
          d'interrompre les prestations à titre provisoire ou définitif, (i) si EduTime y est invité
          par une autorité judiciaire ou administrative, ou (ii) si EduTime pourrait autrement
          s'exposer à des responsabilités juridiques ou pénales, ou (iii) lorsqu'un contrôle donne
          des indications concrètes ou des soupçons de mise à disposition de Contenus illicites ou
          d'une utilisation par ailleurs contraire au droit, au contrat ou aux conditions
          d'utilisation. EduTime est en droit de facturer au Client et/ou à l'Utilisateur les frais
          engagés dans le cadre des blocages et autres mesures. En outre, vous vous engagez à
          dégager intégralement EduTime de toute responsabilité si un tiers entend faire valoir des
          droits à l'encontre d'EduTime dans le cadre d'une utilisation contraire au contrat ou aux
          conditions d'utilisation. Ceci comprend également le remboursement des frais de
          représentation juridique d'EduTime. La revendication de dommages et intérêts
          supplémentaires reste réservée. EduTime peut vous demander une garantie pour la couverture
          préventive des frais et des dommages supplémentaires. Si cette garantie n'est pas versée
          ou si vous ne suivez pas les instructions données dans le cadre des mesures prises,
          EduTime peut suspendre la fourniture des Services ou résilier sans préavis l'ensemble du
          contrat avec le Client.
        </p>
        <p>
          En cas de cession d'utilisation non autorisée, vous êtes tenu de communiquer à EduTime sur
          demande sans délai toutes les informations nécessaires pour faire valoir les prétentions à
          l'encontre de l'utilisateur, en particulier son nom et son adresse.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='geistiges-eigentum' title='7. Propriété intellectuelle' order={2}>
        <p>
          Tous les droits d'auteur et autres droits de propriété intellectuelle, prétentions et
          participations relatifs aux Services ainsi qu'aux informations contenues ou disponibles
          dans les Services (y compris marques, noms, logos, images, designs, textes, etc., à
          l'exception des contenus des utilisateurs) sont et restent la propriété exclusive
          d'EduTime ou de ses concédants de licence.
        </p>
        <p>
          Vous reconnaissez les droits de protection, en particulier le droit d'auteur, d'EduTime en
          tant que titulaire des droits sur les Services ; vous vous abstenez pendant la durée de
          l'autorisation d'utilisation des Services accordée au Client et donc à vous-même de toute
          atteinte à l'existence et à l'étendue de ces droits, et vous prenez conformément aux
          instructions d'EduTime toutes les mesures pour préserver les droits d'EduTime et soutenez
          EduTime dans une mesure appropriée pour la défense des droits de protection.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='gewaehrleistung-und-haftung'
        title='8. Garantie et responsabilité'
        order={2}
      >
        <p>
          Les Services sont fournis en l'état. EduTime ne donne aucune assurance, garantie ou
          déclaration concernant les Services, sauf stipulation contraire dans le contrat avec les
          Clients, en particulier pas quant au fonctionnement des Services, à la disponibilité ou à
          l'absence de défauts des Services et de leurs prestations et fonctionnalités, ni
          concernant les informations éventuellement contenues dans les Services.
        </p>
        <p>
          Vous êtes responsable envers EduTime et, si vous avez reçu l'autorisation d'utilisation
          des Services d'un Client, envers ce Client, sans limitation, des dommages résultant de la
          violation des présentes conditions d'utilisation.
        </p>
        <p>
          Vous utilisez les Services à vos propres risques et sous votre responsabilité. La
          responsabilité d'EduTime est limitée à l'étendue convenue dans le contrat avec le Client.
          S'il n'existe pas de contrat entre l'Utilisateur et EduTime, EduTime n'est pas
          responsable, sauf en cas de responsabilité légalement impérative.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='geheimhaltung-und-datenschutz'
        title='9. Confidentialité et protection des données'
        order={2}
      >
        <p>
          Vous et EduTime vous engagez à traiter de manière confidentielle toutes les informations
          confidentielles et secrets d'affaires de l'autre partie dont vous avez pris connaissance.
          Tant qu'un intérêt à la confidentialité existe, l'obligation de confidentialité est
          illimitée dans le temps.
        </p>
        <p>
          Vous et EduTime veillez à la protection des données et à la sécurité des données dans
          votre sphère d'influence respective.
        </p>
        <p>
          Le traitement des données personnelles par EduTime s'effectue conformément à la politique
          de confidentialité d'EduTime, consultable sur le site www.edutime.ch.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection id='aktualisierungen' title='10. Mises à jour' order={2}>
        <p>
          EduTime se réserve le droit d'apporter des modifications ou des compléments ultérieurs aux
          présentes conditions d'utilisation. En cas de modifications et de compléments pouvant vous
          être défavorables, EduTime vous en informera par écrit, par e-mail ou via un portail de
          maintenance approprié.
        </p>
      </LegalDocumentSection>

      <LegalDocumentSection
        id='gerichtsstand-und-anwendbares-recht'
        title='11. For juridique et droit applicable'
        order={2}
      >
        <p>
          Pour les litiges découlant des présentes conditions d'utilisation, le for juridique est le
          domicile de l'Utilisateur ou le siège d'EduTime.
        </p>
        <p>Les présentes conditions d'utilisation sont exclusivement soumises au droit suisse.</p>
      </LegalDocumentSection>
    </>
  )
}
