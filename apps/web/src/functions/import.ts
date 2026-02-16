import { EmploymentCategory } from '@/types/globals'

export interface ImportCategory {
  title: string
  id: number | null
  is_user_category: boolean
}

export function mapActivityToCategory(
  activity: string,
  user_categories: EmploymentCategory[],
): ImportCategory | null {
  const activityToCategory: { [key: string]: { title: string; id: number } } = {
    // English
    'Preparation and follow-up': { title: 'cat_preparation', id: 4 },
    Teaching: { title: 'cat_teaching', id: 2 },
    'Advice and support': { title: 'cat_advice', id: 8 },
    'Participation in meeting': { title: 'cat_meeting', id: 6 },
    Discussion: { title: 'cat_discussion', id: 1 },
    'Information and public relations work': { title: 'cat_information_relations', id: 5 },
    'Further training': { title: 'cat_further_training', id: 12 },
    'Documented self-study': { title: 'cat_self_study', id: 10 },
    'Intervision / supervision / hospitien': { title: 'cat_intervision', id: 3 },
    'Teach, advise, accompany': { title: 'cat_teaching', id: 2 },
    Cooperation: { title: 'cat_teaching', id: 2 },

    // French
    'Préparation et corrections': { title: 'cat_preparation', id: 4 },
    Enseignement: { title: 'cat_teaching', id: 2 },
    'Conseil et accompagnement': { title: 'cat_advice', id: 8 },
    'Participation à des séances': { title: 'cat_meeting', id: 6 },
    Réunions: { title: 'cat_discussion', id: 1 },
    'Communication et relations publiques': { title: 'cat_information_relations', id: 5 },
    'Formation continue': { title: 'cat_further_training', id: 12 },
    'Études personnelles documentées': { title: 'cat_self_study', id: 10 },
    'Intervision, supervision, stages d’observation': { title: 'cat_intervision', id: 3 },
    'Enseignement, conseil, accompagnement': { title: 'cat_teaching', id: 2 },
    Collaboration: { title: 'cat_teaching', id: 2 },

    // German
    'Vor- und Nachbereitung': { title: 'cat_preparation', id: 4 },
    Unterricht: { title: 'cat_teaching', id: 2 },
    'Beraten und Begleiten': { title: 'cat_advice', id: 8 },
    'Teilnahme an Sitzung': { title: 'cat_meeting', id: 6 },
    Besprechung: { title: 'cat_discussion', id: 1 },
    'Informations- und Öffentlichkeitsarbeit': { title: 'cat_information_relations', id: 5 },
    Weiterbildung: { title: 'cat_further_training', id: 12 },
    'Dokumentiertes Selbststudium': { title: 'cat_self_study', id: 10 },
    'Intervision / Supervision / Hospitien': { title: 'cat_intervision', id: 3 },
    'Unterrichten, beraten, begleiten': { title: 'cat_teaching', id: 2 },
    Zusammenarbeit: { title: 'cat_teaching', id: 2 },
  }

  const mappedCategory = activityToCategory[activity]
  if (mappedCategory) {
    return { ...mappedCategory, is_user_category: false }
  }

  for (const userCategory of user_categories) {
    if (activity === userCategory.title) {
      return { title: userCategory.title, id: userCategory.id, is_user_category: true }
    }
  }
  if (activity.trim() === '') {
    return null
  }
  return { title: activity, id: null, is_user_category: true }
}
