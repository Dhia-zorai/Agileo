import { fr } from './fr.js'
import { en } from './en.js'

const translations = { fr, en }

// Get stored language or default to French
export function getStoredLang() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('agileo-lang') || 'fr'
  }
  return 'fr'
}

export function setStoredLang(lang) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('agileo-lang', lang)
  }
}

export function t(key) {
  const lang = getStoredLang()
  const keys = key.split('.')
  let value = translations[lang]
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k]
    } else {
      value = undefined
      break
    }
  }
  
  // Fallback to English if key not found
  if (value === undefined) {
    value = translations.en
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        value = key
        break
      }
    }
  }
  
  return value || key
}

export function getCurrentLang() {
  return getStoredLang()
}

export function toggleLang() {
  const current = getStoredLang()
  const newLang = current === 'fr' ? 'en' : 'fr'
  setStoredLang(newLang)
  return newLang
}