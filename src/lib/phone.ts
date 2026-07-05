export const COUNTRY_PREFIXES = [
  { code: "US", name: "United States", prefix: "+1" },
  { code: "IN", name: "India", prefix: "+91" },
  { code: "GB", name: "United Kingdom", prefix: "+44" },
  { code: "CA", name: "Canada", prefix: "+1" },
  { code: "AU", name: "Australia", prefix: "+61" },
  { code: "JP", name: "Japan", prefix: "+81" },
  { code: "RU", name: "Russia", prefix: "+7" },
  { code: "DE", name: "Germany", prefix: "+49" },
  { code: "FR", name: "France", prefix: "+33" },
  { code: "IT", name: "Italy", prefix: "+39" },
  { code: "NL", name: "Netherlands", prefix: "+31" },
  { code: "BE", name: "Belgium", prefix: "+32" },
  { code: "ES", name: "Spain", prefix: "+34" },
  { code: "NZ", name: "New Zealand", prefix: "+64" },
  { code: "SG", name: "Singapore", prefix: "+65" },
  { code: "AE", name: "United Arab Emirates", prefix: "+971" },
  { code: "ZA", name: "South Africa", prefix: "+27" },
  { code: "CH", name: "Switzerland", prefix: "+41" },
  { code: "SE", name: "Sweden", prefix: "+46" },
  { code: "NO", name: "Norway", prefix: "+47" },
  { code: "PL", name: "Poland", prefix: "+48" },
  { code: "AT", name: "Austria", prefix: "+43" },
  { code: "BR", name: "Brazil", prefix: "+55" },
  { code: "MX", name: "Mexico", prefix: "+52" },
  { code: "CN", name: "China", prefix: "+86" },
  { code: "UA", name: "Ukraine", prefix: "+380" },
  { code: "FI", name: "Finland", prefix: "+358" },
  { code: "DK", name: "Denmark", prefix: "+45" },
  { code: "IE", name: "Ireland", prefix: "+353" },
  { code: "PT", name: "Portugal", prefix: "+351" },
  { code: "GR", name: "Greece", prefix: "+30" },
  { code: "CZ", name: "Czech Republic", prefix: "+420" },
  { code: "HU", name: "Hungary", prefix: "+36" },
  { code: "TR", name: "Turkey", prefix: "+90" },
  { code: "IL", name: "Israel", prefix: "+972" },
  { code: "SA", name: "Saudi Arabia", prefix: "+966" },
  { code: "KR", name: "South Korea", prefix: "+82" },
  { code: "HK", name: "Hong Kong", prefix: "+852" },
  { code: "TW", name: "Taiwan", prefix: "+886" },
  { code: "MY", name: "Malaysia", prefix: "+60" },
  { code: "TH", name: "Thailand", prefix: "+66" },
  { code: "VN", name: "Vietnam", prefix: "+84" },
  { code: "PH", name: "Philippines", prefix: "+63" },
  { code: "ID", name: "Indonesia", prefix: "+62" },
  { code: "ARG", name: "Argentina", prefix: "+54" },
  { code: "CL", name: "Chile", prefix: "+56" },
  { code: "CO", name: "Colombia", prefix: "+57" },
  { code: "PE", name: "Peru", prefix: "+51" },
].sort((a, b) => a.name.localeCompare(b.name))

export function parsePhoneNumber(fullNumber: string, defaultCountry = "US") {
  const cleanNumber = (fullNumber || "").trim()
  
  // Sort prefixes by length descending
  const sortedPrefixes = [...COUNTRY_PREFIXES].sort((a, b) => b.prefix.length - a.prefix.length)
  
  for (const item of sortedPrefixes) {
    if (cleanNumber.startsWith(item.prefix)) {
      // Special check for +1 prefix: differentiate US from CA
      if (item.prefix === "+1") {
        if (defaultCountry === "CA") {
          return {
            code: "CA",
            prefix: "+1",
            number: cleanNumber.slice(2).trim()
          }
        }
        return {
          code: "US",
          prefix: "+1",
          number: cleanNumber.slice(2).trim()
        }
      }
      return {
        code: item.code,
        prefix: item.prefix,
        number: cleanNumber.slice(item.prefix.length).trim()
      }
    }
  }
  
  const defaultItem = COUNTRY_PREFIXES.find(c => c.code === defaultCountry) || COUNTRY_PREFIXES.find(c => c.code === "US")!
  return {
    code: defaultItem.code,
    prefix: defaultItem.prefix,
    number: cleanNumber
  }
}
