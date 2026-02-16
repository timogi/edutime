import { CategorySet, StopWatchSession } from '@/lib/types'

function timeStringToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

export const convertMinutesToHoursAndMinutes = (minutes: number): string => {
  if (minutes === 0) {
    return '0 min' // Return '0 min' when the duration is zero minutes
  }

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  return [hours > 0 ? `${hours} h` : null, mins > 0 ? `${mins} min` : null]
    .filter(Boolean)
    .join(' ')
}

function minutesToTimeString(minutes: number): string {
  if (isNaN(minutes)) {
    return '00:00'
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${padZero(hours)}:${padZero(mins)}`
}

function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`
}

const getCategoryById = (categoryId: string, categorySets: CategorySet[]) => {
  for (let set of categorySets) {
    for (let category of set.categories) {
      if (category.id.toString() === categoryId) {
        return category
      }
    }
  }
  return null // Return null if no category matches the ID
}

const calculateStopWatchDuration = (stopWatchSession: StopWatchSession, showSeconds = true) => {
  const startTime = new Date(stopWatchSession.start_time) // Convert start_time string to Date object
  const totalSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000) // Calculate elapsed seconds
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (showSeconds) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  } else {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }
}

export { timeStringToMinutes, minutesToTimeString, getCategoryById, calculateStopWatchDuration }

export const removeSeconds = (timeString: string | null) => {
  if (!timeString) return ''
  return timeString.split(':').slice(0, 2).join(':')
}

export function convertToMinutes(timeString: string): number {
  const hoursMatch = timeString.match(/(\d+)\s*h/)
  const minutesMatch = timeString.match(/(\d+)\s*min/)

  let hours = 0
  let minutes = 0

  if (hoursMatch) {
    hours = parseInt(hoursMatch[1], 10)
  }

  if (minutesMatch) {
    minutes = parseInt(minutesMatch[1], 10)
  }

  const totalMinutes = hours * 60 + minutes

  return totalMinutes
}
export const getIsoDate = (date: Date) => {
  let utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  return utcDate.toISOString().split('T')[0]
}


export const translateCategoryTitle = (title: string | undefined): string => {
  if (!title) return 'Keine Kategorie';
  
  const translations: { [key: string]: string } = {
    "cat_teaching": "Unterricht",
    "cat_advice": "Beraten und Begleiten",
    "cat_preparation": "Vor- und Nachbereitung",
    "cat_self_study": "Dokumentiertes Selbststudium",
    "cat_further_training": "Weiterbildung",
    "cat_discussion": "Besprechung",
    "cat_information_relations": "Informations- und Öffentlichkeitsarbeit",
    "cat_intervision": "Intervision / Supervision / Hospitation",
    "cat_meeting": "Teilnahme an Sitzung",
    "cs_teach_advise_accompany": "Unterrichten, Beraten und Begleiten",
    "cs_collaboration": "Zusammenarbeit",
    "cs_further_training": "Weiterbildung",
    "cs_students": "Schülerinnen und Schüler",
    "cs_school": "Schule",
    "cs_teacher": "Lehrperson",
    "cs_teaching": "Unterricht",
    "no_category": "Keine Kategorie",
    "other_canton": "Anderer Kanton",
    "others": "Weitere Einträge",
    "furtherEmployment": "Weitere Anstellungen",
    "reporting": "Berichterstattung",
    "mainEmployment": "Hauptanstellung"
  };

  return translations[title] || title;
};