
const languages = [
  'ar',
  'ca',
  'cs',
  'de',
  'eo',
  'en',
  'es',
  'et',
  'eu',
  'fi',
  'fr',
  'ga',
  'he',
  'hu',
  'it',
  'ja',
  'ja_easy',
  'ko',
  'nb',
  'nl',
  'oc',
  'pl',
  'pt',
  'ro',
  'ru',
  'sk',
  'te',
  'uk',
  'zh',
  'zh_Hant'
]

const specialJsonName = {
  ja: 'ja_pedantic'
}

const langCodeToJsonName = (code) => specialJsonName[code] || code

const langCodeToCldrName = (code) => code

const ensureFinalFallback = codes => {
  return codes.includes('en') ? codes : codes.concat(['en'])
}

module.exports = {
  languages,
  langCodeToJsonName,
  langCodeToCldrName,
  ensureFinalFallback
}
