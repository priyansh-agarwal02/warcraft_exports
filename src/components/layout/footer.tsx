import Link from "next/link"
import { siteConfig } from "@/config/site.config"
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react"
import { NewsletterForm } from "./newsletter-form"

function IconFacebook() {
  return <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
}
function IconInstagram() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
}
function IconYoutube() {
  return <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" /></svg>
}
function IconX() {
  return <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
}

function IconAmazon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 448 512" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M257.2 162.7c-48.7 1.8-169.5 15.5-169.5 117.5c0 109.5 138.3 114 183.5 43.2c6.5 10.2 35.4 37.5 45.3 46.8l56.8-56S341 288.9 341 261.4V114.3C341 89 316.5 32 228.7 32C140.7 32 94 87 94 136.3l73.5 6.8c16.3-49.5 54.2-49.5 54.2-49.5c40.7-.1 35.5 29.8 35.5 69.1m0 86.8c0 80-84.2 68-84.2 17.2c0-47.2 50.5-56.7 84.2-57.8zm136 163.5c-7.7 10-70 67-174.5 67S34.2 408.5 9.7 379c-6.8-7.7 1-11.3 5.5-8.3C88.5 415.2 203 488.5 387.7 401c7.5-3.7 13.3 2 5.5 12m39.8 2.2c-6.5 15.8-16 26.8-21.2 31c-5.5 4.5-9.5 2.7-6.5-3.8s19.3-46.5 12.7-55c-6.5-8.3-37-4.3-48-3.2c-10.8 1-13 2-14-.3c-2.3-5.7 21.7-15.5 37.5-17.5c15.7-1.8 41-.8 46 5.7c3.7 5.1 0 27.1-6.5 43.1" />
    </svg>
  )
}

function IconEbay({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M6.056 12.132v-4.92h1.2v3.026c.59-.703 1.402-.906 2.202-.906 1.34 0 2.828.904 2.828 2.855 0 .233-.015.457-.06.668.24-.953 1.274-1.305 2.896-1.344.51-.018 1.095-.018 1.56-.018v-.135c0-.885-.556-1.244-1.53-1.244-.72 0-1.245.3-1.305.81h-1.275c.136-1.29 1.5-1.62 2.686-1.62 1.064 0 1.995.27 2.415 1.02l-.436-.84h1.41l2.055 4.125 2.055-4.126H24l-3.72 7.305h-1.346l1.07-2.04-2.33-4.38c.13.255.2.555.2.93v2.46c0 .346.01.69.04 1.005H16.8a6.543 6.543 0 01-.046-.765c-.603.734-1.32.96-2.32.96-1.48 0-2.272-.78-2.272-1.695 0-.15.015-.284.037-.405-.3 1.246-1.36 2.086-2.767 2.086-.87 0-1.694-.315-2.2-.93 0 .24-.015.494-.04.734h-1.18c.02-.39.04-.855.04-1.245v-1.05h-4.83c.065 1.095.818 1.74 1.853 1.74.718 0 1.355-.3 1.568-.93h1.24c-.24 1.29-1.61 1.725-2.79 1.725C.95 15.009 0 13.822 0 12.232c0-1.754.982-2.91 3.116-2.91 1.688 0 2.93.886 2.94 2.806v.005zm9.137.183c-1.095.034-1.77.233-1.77.95 0 .465.36.97 1.305.97 1.26 0 1.935-.69 1.935-1.814v-.13c-.45 0-.99.006-1.484.022h.012zm-6.06 1.875c1.11 0 1.876-.806 1.876-2.02s-.768-2.02-1.893-2.02c-1.11 0-1.89.806-1.89 2.02s.765 2.02 1.875 2.02h.03zm-4.35-2.514c-.044-1.125-.854-1.546-1.725-1.546-.944 0-1.694.474-1.815 1.546z" />
    </svg>
  )
}

function IconWalmart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M21.41818 9.10219c-.22048 0-.39583.12308-.39583.27297l.13393 1.51627c.01478.09132.12669.16185.26197.16185.13555-.00017.24705-.07065.26214-.16185l.13424-1.51627c0-.1499-.17555-.27297-.39645-.27297zM-.00002 10.3184s.59713 2.44699.69242 2.84417c.11123.46362.3117.63419.88954.51913l.37291-1.51718c.0945-.37683.1579-.64553.21866-1.02883h.01065c.04269.3871.10354.65314.18131 1.03017 0 0 .15176.68869.22949 1.05042.07795.36163.29482.5895.86083.46542l.88851-3.3633h-.71735l-.30339 1.45411c-.08155.42325-.15544.75396-.21251 1.14117h-.01022c-.05189-.38347-.11777-.70096-.20072-1.11331l-.31586-1.48197h-.7474l-.3378 1.44462c-.09569.43899-.18528.79337-.2422 1.16745h-.01023c-.05832-.35224-.13599-.7977-.22006-1.22261 0 0-.20074-1.03328-.27115-1.38946zm6.83845 0v3.3633h.68299v-3.3633zm9.6188 0v2.48118c0 .34202.0644.5817.20213.72811.12033.12806.31854.21094.55604.21094.20193 0 .40062-.0383.49426-.07317l-.0088-.53367c-.06968.01711-.1498.03078-.25942.03078-.23265 0-.31068-.149-.31068-.45611v-.94921h.59479v-.64351h-.59481v-.79533zm2.77885 0c-.11446.0027-.24452.08936-.32723.23277-.11062.19096-.09105.40434.03838.47923l1.3799.64254c.0862.03205.20323-.02912.27103-.14597.06814-.11745.0629-.2496-.0088-.3082l-1.24635-.8741c-.03237-.01874-.06877-.02717-.10693-.02627zm4.36427 0c-.03815-.0009-.0745.0075-.1068.02628l-1.2464.8741c-.07112.05846-.07653.1901-.0092.30734.00006.00013.00015.00023.00025.00036.00009.00016.00015.00033.00024.00049.06804.11686.18472.17803.27091.14598l1.38004-.64254c.12997-.0749.14861-.28827.03874-.47923-.08309-.1434-.21333-.23006-.32777-.23277zM5.312 11.0981c-.42444 0-.76136.11916-.94501.22529l.13442.46019c.16808-.10595.43566-.19366.68907-.19366.41954-.0011.48817.23728.48817.39012v.03613c-.9142-.0014-1.49164.31493-1.49164.9598 0 .3937.29399.76266.80512.76266.31466 0 .57778-.12554.73548-.32662h.01545s.10445.4367.67982.26969c-.03022-.18174-.04002-.37546-.04002-.60884v-.89849c0-.57263-.24452-1.07627-1.07086-1.07627zm4.08552 0c-.42739 0-.61944.2166-.7359.40034h-.01016v-.34335h-.65173v2.5266h.68658V12.2c0-.06945.00799-.1429.03223-.2068.05689-.1492.19565-.3237.41725-.3237.27704 0 .40667.2342.40667.57222v1.44h.68585v-1.4996c0-.06636.0091-.14622.02859-.20486.05639-.16969.20602-.30776.41201-.30776.28086 0 .41567.23012.41567.62788v1.38434h.68633v-1.48805c0-.78478-.39845-1.09555-.8483-1.09555-.19922 0-.35646.04996-.49863.13722-.1195.07334-.22655.17753-.32006.3147h-.0101c-.10853-.27228-.36375-.45192-.6963-.45192zm3.7702 0c-.42435 0-.76113.11916-.94495.22529l.13454.46019c.16792-.10595.43572-.19366.689-.19366.41926-.0011.48806.23728.48806.39012v.03613c-.91407-.0014-1.49164.31494-1.49164.9598 0 .3937.29418.76266.8056.76266.31441 0 .57759-.12554.735-.32662h.01557s.10437.4367.67982.26969c-.03027-.18174-.03996-.37546-.03996-.60884v-.89849c0-.57263-.24458-1.07627-1.07104-1.07627zm2.85129 0c-.26292 0-.56205.1697-.68761.53354h-.0191v-.47655h-.6181v2.5266h.70453V12.388c0-.06985.0042-.1307.01527-.1865.0521-.27102.25945-.44425.55696-.44425.08167 0 .1401.0088.20333.018v-.66151c-.05302-.0107-.0893-.01563-.15528-.01563zm4.35946 1.22067c-.01785-.00025-.03513.0026-.05134.0087l-1.3799.6418c-.12943.07519-.149.28868-.03838.47984.11028.1906.30469.28118.43415.20644l1.24634-.87349c.0717-.05929.07696-.19127.0088-.30862l.0006.00025c-.05507-.09558-.14292-.15388-.22027-.15492zm2.07955 0c-.07727.001-.1649.05934-.22012.15491l.00049-.00025c-.06781.11735-.06254.24934.0088.30862l1.2464.87349c.12921.07474.3238-.01584.43458-.20644.10986-.19116.09122-.40466-.03875-.47983l-1.38012-.64181c-.0162-.0061-.03344-.0089-.05128-.0087zm-16.75741.14518v.31519c0 .0466-.00406.09467-.01697.13673-.05286.17506-.23415.32303-.46086.32303-.18901 0-.33916-.1073-.33916-.33422 0-.34707.38204-.443.81699-.44073zm7.85577 0v.31519c0 .0466-.0041.09467-.0169.13673-.05287.17506-.23421.32303-.46093.32303-.18905 0-.3392-.1073-.3392-.33422 0-.34707.38209-.443.81703-.44073zm7.86138.48324c-.13506.00016-.24672.07024-.26148.16137l-.13393 1.5162c0 .15015.17535.27304.39583.27304.2209 0 .39645-.12289.39645-.27303l-.13424-1.51621c-.01509-.09113-.12659-.1612-.26214-.16137z" />
    </svg>
  )
}

function IconPaypal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M14.06 3.713c.12-1.071-.093-1.832-.702-2.526C12.628.356 11.312 0 9.626 0H4.734a.7.7 0 0 0-.691.59L2.005 13.509a.42.42 0 0 0 .415.486h2.756l-.202 1.28a.628.628 0 0 0 .62.726H8.14c.429 0 .793-.31.862-.731l.025-.13.48-3.043.03-.164.001-.007a.35.35 0 0 1 .348-.297h.38c1.266 0 2.425-.256 3.345-.91q.57-.403.993-1.005a4.94 4.94 0 0 0 .88-2.195c.242-1.246.13-2.356-.57-3.154a2.7 2.7 0 0 0-.76-.59l-.094-.061ZM6.543 8.82a.7.7 0 0 1 .321-.079H8.3c2.82 0 5.027-1.144 5.672-4.456l.003-.016q.326.186.548.438c.546.623.679 1.535.45 2.71-.272 1.397-.866 2.307-1.663 2.874-.802.57-1.842.815-3.043.815h-.38a.87.87 0 0 0-.863.734l-.03.164-.48 3.043-.024.13-.001.004a.35.35 0 0 1-.348.296H5.595a.106.106 0 0 1-.105-.123l.208-1.32z" />
    </svg>
  )
}

function IconRazorpay({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z" />
    </svg>
  )
}

function CardVisa() {
  return (
    <div className="w-12 h-8 bg-[#1B140E] border border-parchment/10 rounded flex items-center justify-center px-1" title="Visa">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8.5 h-auto text-[#2563EB]" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z" />
      </svg>
    </div>
  )
}

function CardMastercard() {
  return (
    <div className="w-12 h-8 bg-[#1B140E] border border-parchment/10 rounded flex items-center justify-center px-1" title="Mastercard">
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-auto" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="12" r="6" fill="#EB001B" />
        <circle cx="15" cy="12" r="6" fill="#F79E1B" fillOpacity="0.8" />
      </svg>
    </div>
  )
}

function CardAmex() {
  return (
    <div className="w-12 h-8 bg-[#1B140E] border border-parchment/10 rounded flex items-center justify-center px-1" title="American Express">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8.5 h-auto text-[#0070CD]" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.015 14.378c0-.32-.135-.496-.344-.622-.21-.12-.464-.135-.81-.135h-1.543v2.82h.675v-1.027h.72c.24 0 .39.024.478.125.12.13.104.38.104.55v.35h.66v-.555c-.002-.25-.017-.376-.108-.516-.06-.08-.18-.18-.33-.234l.02-.008c.18-.072.48-.297.48-.747zm-.87.407l-.028-.002c-.09.053-.195.058-.33.058h-.81v-.63h.824c.12 0 .24 0 .33.05.098.048.156.147.15.255 0 .12-.045.215-.134.27zM20.297 15.837H19v.6h1.304c.676 0 1.05-.278 1.05-.884 0-.28-.066-.448-.187-.582-.153-.133-.392-.193-.73-.207l-.376-.015c-.104 0-.18 0-.255-.03-.09-.03-.15-.105-.15-.21 0-.09.017-.166.09-.21.083-.046.177-.066.272-.06h1.23v-.602h-1.35c-.704 0-.958.437-.958.84 0 .9.776.855 1.407.87.104 0 .18.015.225.06.046.03.082.106.082.18 0 .077-.035.15-.08.18-.06.053-.15.07-.277.07zM0 0v10.096L.81 8.22h1.75l.225.464V8.22h2.043l.45 1.02.437-1.013h6.502c.295 0 .56.057.756.236v-.23h1.787v.23c.307-.17.686-.23 1.12-.23h2.606l.24.466v-.466h1.918l.254.465v-.466h1.858v3.948H20.87l-.36-.6v.585h-2.353l-.256-.63h-.583l-.27.614h-1.213c-.48 0-.84-.104-1.08-.24v.24h-2.89v-.884c0-.12-.03-.12-.105-.135h-.105v1.036H6.067v-.48l-.21.48H4.69l-.202-.48v.465H2.235l-.256-.624H1.4l-.256.624H0V24h23.786v-7.108c-.27.135-.613.18-.973.18H21.09v-.255c-.21.165-.57.255-.914.255H14.71v-.9c0-.12-.018-.12-.12-.12h-.075v1.022h-1.8v-1.066c-.298.136-.643.15-.928.136h-.214v.915h-2.18l-.54-.617-.57.6H4.742v-3.93h3.61l.518.602.554-.6h2.412c.28 0 .74.03.942.225v-.24h2.177c.202 0 .644.045.903.225v-.24h3.265v.24c.163-.164.508-.24.803-.24h1.89v.24c.194-.15.464-.24.84-.24h1.176V0H0zM21.156 14.955c.004.005.006.012.01.016.01.01.024.01.032.02l-.042-.035zM23.828 13.082h.065v.555h-.065zM23.865 15.03v-.005c-.03-.025-.046-.048-.075-.07-.15-.153-.39-.215-.764-.225l-.36-.012c-.12 0-.194-.007-.27-.03-.09-.03-.15-.105-.15-.21 0-.09.03-.16.09-.204.076-.045.15-.05.27-.05h1.223v-.588h-1.283c-.69 0-.96.437-.96.84 0 .9.78.855 1.41.87.104 0 .18.015.224.06.046.03.076.106.076.18 0 .07-.034.138-.09.18-.045.056-.136.07-.27.07h-1.288v.605h1.287c.42 0 .734-.118.9-.36h.03c.09-.134.135-.3.135-.523 0-.24-.045-.39-.135-.526zM18.597 14.208v-.583h-2.235V16.458h2.235v-.585h-1.57v-.57h1.533v-.584h-1.532v-.51M13.51 8.787h.685V11.6h-.684zM13.126 9.543l-.007.006c0-.314-.13-.5-.34-.624-.217-.125-.47-.135-.81-.135H10.43v2.82h.674v-1.034h.72c.24 0 .39.03.487.12.122.136.107.378.107.548v.354h.677v-.553c0-.25-.016-.375-.11-.516-.09-.107-.202-.19-.33-.237.172-.07.472-.3.472-.75zm-.855.396h-.015c-.09.054-.195.056-.33.056H11.1v-.623h.825c.12 0 .24.004.33.05.09.04.15.128.15.25s-.047.22-.134.266zM15.92 9.373h.632v-.6h-.644c-.464 0-.804.105-1.02.33-.286.3-.362.69-.362 1.11 0 .512.123.833.36 1.074.232.238.645.31.97.31h.78l.255-.627h1.39l.262.627h1.36v-2.11l1.272 2.11h.95l.002.002V8.786h-.684v1.963l-1.18-1.96h-1.02V11.4L18.11 8.744h-1.004l-.943 2.22h-.3c-.177 0-.362-.03-.468-.134-.125-.15-.186-.36-.186-.662 0-.285.08-.51.194-.63.133-.135.272-.165.516-.165zm1.668-.108l.46 1.118v.002h-.93l.466-1.12zM2.38 10.97l.254.628H4V9.393l.972 2.205h.584l.973-2.202.015 2.202h.69v-2.81H6.118l-.807 1.904-.876-1.905H3.343v2.663L2.205 8.787h-.997L.01 11.597h.72l.26-.626h1.39zm-.688-1.705l.46 1.118-.003.002h-.915l.457-1.12zM11.856 13.62H9.714l-.85.923-.825-.922H5.346v2.82H8l.855-.932.824.93h1.302v-.94h.838c.6 0 1.17-.164 1.17-.945l-.006-.003c0-.78-.598-.93-1.128-.93zM7.67 15.853l-.014-.002H6.02v-.557h1.47v-.574H6.02v-.51H7.7l.733.82-.764.824zm2.642.33l-1.03-1.147 1.03-1.108v2.253zm1.553-1.258h-.885v-.717h.885c.24 0 .42.098.42.344 0 .243-.15.372-.42.372zM9.967 9.373v-.586H7.73V11.6h2.237v-.58H8.4v-.564h1.527V9.88H8.4v-.507" /></svg>
    </div>
  )
}

function CardDiscover() {
  return (
    <div className="w-12 h-8 bg-[#1B140E] border border-parchment/10 rounded flex items-center justify-center gap-0.5 px-1" title="Discover">
      <span className="font-sans font-bold text-[8px] tracking-tighter text-white select-none">DISC</span>
      <span className="w-1.5 h-1.5 bg-[#FF6600] rounded-full mx-0.5 select-none"></span>
      <span className="font-sans font-bold text-[8px] tracking-tighter text-white select-none">VER</span>
    </div>
  )
}

function CardDinersClub() {
  return (
    <div className="w-12 h-8 bg-[#1B140E] border border-parchment/10 rounded flex items-center justify-center px-1" title="Diners Club">
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-auto" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 4a6 6 0 0 1 4.5 5.5h-9A6 6 0 0 1 13 6zm-2 12a6 6 0 0 1-4.5-5.5h9A6 6 0 0 1 11 18z" fill="#0079C1" />
      </svg>
    </div>
  )
}

function CardApplePay() {
  return (
    <div className="w-12 h-8 bg-[#1B140E] border border-parchment/10 rounded flex items-center justify-center gap-0.5 px-1" title="Apple Pay">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z" />
      </svg>
      <span className="font-sans font-semibold text-[9px] text-white select-none">Pay</span>
    </div>
  )
}

const SHOP_LINKS = [
  { href: "/shop", label: "All Products" },
  { href: "/shop/nation/us", label: "US Gear" },
  { href: "/shop/nation/german", label: "German Gear" },
  { href: "/shop/era/ww2", label: "WW2 Collection" },
  { href: "/shop/era/ww1", label: "WW1 Collection" },
  { href: "/faq", label: "FAQs" },
]

const INFO_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/wholesale", label: "Wholesale Enquiry" },
  { href: "/fit-guide", label: "Fit Guide" },
  { href: "/stores", label: "Where to Find Us" },
  { href: "/contact", label: "Contact Us" },
]

const POLICY_LINKS = [
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/returns-policy", label: "Returns Policy" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/track-order", label: "Track Order" },
]

const SOCIAL_LINKS = [
  { href: "https://www.facebook.com/warcraftexports", icon: IconFacebook, label: "Facebook" },
  { href: "https://www.instagram.com/warcraftexports", icon: IconInstagram, label: "Instagram" },
  { href: "https://www.youtube.com/@warcraftexports", icon: IconYoutube, label: "YouTube" },
  { href: "https://twitter.com/warcraftexports", icon: IconX, label: "X / Twitter" },
]

export function Footer() {
  return (
    <footer className="bg-[#110C08] text-parchment/80">
      {/* Top columns grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">

        {/* Brand column */}
        <div>
          <Link href="/" className="inline-block mb-3">
            <span className="font-heading text-xl text-parchment tracking-[-0.04em] leading-none uppercase font-black">
              WARCRAFT EXPORTS ®
            </span>
          </Link>
          <p className="text-xs leading-relaxed text-parchment/60 mb-4">
            Manufacturer and global exporter of WW1 &amp; WW2 historical reproduction gear.
            Crafted in Kanpur, India since 2014.
          </p>
          <div className="space-y-2 mb-4">
            <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2 text-xs hover:text-gold transition-colors">
              <Mail size={12} className="text-gold flex-shrink-0" />
              {siteConfig.email}
            </a>
            <a href={`tel:${siteConfig.phone}`} className="flex items-center gap-2 text-xs hover:text-gold transition-colors">
              <Phone size={12} className="text-gold flex-shrink-0" />
              {siteConfig.phone}
            </a>
            <div className="flex items-start gap-2 text-xs text-parchment/60">
              <MapPin size={12} className="text-gold flex-shrink-0 mt-0.5" />
              <span>{siteConfig.address}</span>
            </div>
          </div>
        </div>

        {/* Shop */}
        <div>
          <p className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-gold mb-3">
            Shop
          </p>
          <ul className="space-y-2">
            {SHOP_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-xs text-parchment/60 hover:text-gold transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div>
          <p className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-gold mb-3">
            Information
          </p>
          <ul className="space-y-2">
            {INFO_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-xs text-parchment/60 hover:text-gold transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Policies (Restored to its own column) */}
        <div>
          <p className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-gold mb-3">
            Policies
          </p>
          <ul className="space-y-2">
            {POLICY_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-xs text-parchment/60 hover:text-gold transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter + Available At */}
        <div>
          <p className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-gold mb-2">
            Newsletter
          </p>
          <p className="text-[13px] font-sans font-semibold text-parchment/80 mb-1 leading-snug">
            Regular Offers &amp; Free Deals
          </p>
          <p className="text-xs text-parchment/50 mb-3 leading-relaxed">
            New arrivals, exclusive discounts, and collector notes.
          </p>
          <NewsletterForm />

          {/* Available At Storefronts (Horizontal row) */}
          <div className="mt-5">
            <p className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-gold mb-2.5">
              Available At
            </p>
            <div className="flex gap-2">
              <a
                href={siteConfig.social.amazon}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#17110C] border border-parchment/10 hover:border-gold/60 text-parchment/70 hover:text-parchment rounded shadow-sm hover:bg-[#201811] transition-all duration-200 select-none"
              >
                <IconAmazon className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                <span className="font-sans font-semibold text-[9px] tracking-wide whitespace-nowrap">Amazon</span>
              </a>
              <a
                href={siteConfig.social.ebay}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#17110C] border border-parchment/10 hover:border-gold/60 text-parchment/70 hover:text-parchment rounded shadow-sm hover:bg-[#201811] transition-all duration-200 select-none"
              >
                <IconEbay className="w-6 h-2.5 flex-shrink-0 text-parchment/90" />
                <span className="font-sans font-semibold text-[9px] tracking-wide whitespace-nowrap">eBay</span>
              </a>
              <a
                href={siteConfig.social.walmart}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#17110C] border border-parchment/10 hover:border-gold/60 text-parchment/70 hover:text-parchment rounded shadow-sm hover:bg-[#201811] transition-all duration-200 select-none"
              >
                <IconWalmart className="w-3 h-3 text-[#0071DC] flex-shrink-0" />
                <span className="font-sans font-semibold text-[9px] tracking-wide whitespace-nowrap">Walmart</span>
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom trust, follow, and checkout section: merged horizontally in 4 columns on desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 items-start">

        {/* Follow Us */}
        <div>
          <p className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-gold mb-2.5">Follow Us</p>
          <div className="flex gap-2">
            {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-7 h-7 flex items-center justify-center border border-parchment/15 text-parchment/50 hover:border-gold hover:text-gold hover:bg-[#1A120B] transition-all duration-200"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* Secure SSL Checkout */}
        <div className="flex items-start gap-2">
          <ShieldCheck className="text-gold w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-gold">100% Secured SSL Checkout</h4>
            <p className="text-[11px] text-parchment/50 mt-1 leading-relaxed max-w-[240px]">
              Your payment security is our top priority. We use bank-grade 256-bit SSL encryption. All details are processed through fully PCI-DSS compliant secured payment gateways.
            </p>
          </div>
        </div>

        {/* Payment Gateways */}
        <div>
          <p className="text-[9px] font-sans font-bold uppercase tracking-[0.12em] text-gold mb-2.5">Payment Gateways</p>
          <div className="flex flex-wrap gap-2 max-w-[240px]">
            {/* PayPal Badge with only logo and name */}
            <div className="h-8 bg-[#1B140E] border border-parchment/10 rounded flex items-center gap-2 px-3 select-none" title="PayPal">
              <IconPaypal className="h-3.5 w-auto text-[#0079C1]" />
              <span className="font-sans font-bold text-xs text-parchment/80">PayPal</span>
            </div>
            {/* Razorpay Badge with only logo and name */}
            <div className="h-8 bg-[#1B140E] border border-parchment/10 rounded flex items-center gap-2 px-3 select-none" title="Razorpay">
              <IconRazorpay className="h-3.5 w-auto text-[#0070F3]" />
              <span className="font-sans font-bold text-xs text-parchment/80">Razorpay</span>
            </div>
          </div>
        </div>

        {/* Credit Debit Card Logos */}
        <div>
          <p className="text-[9px] font-sans font-bold uppercase tracking-[0.12em] text-gold mb-2.5">Accepted Credit &amp; Debit Cards</p>
          <div className="flex flex-wrap gap-1.5 max-w-[240px]">
            <CardVisa />
            <CardMastercard />
            <CardAmex />
            <CardDiscover />
            <CardDinersClub />
            <CardApplePay />
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-parchment/10 py-3.5 px-4 bg-[#0A0705]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-parchment/40">
          <p>© {new Date().getFullYear()} RAAS Enterprises. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href={siteConfig.social.amazon} target="_blank" rel="noopener noreferrer" className="hover:text-parchment/70 transition-colors">Amazon Store</a>
            <span>·</span>
            <a href={siteConfig.social.ebay} target="_blank" rel="noopener noreferrer" className="hover:text-parchment/70 transition-colors">eBay Store</a>
            <span>·</span>
            <a href={siteConfig.social.walmart} target="_blank" rel="noopener noreferrer" className="hover:text-parchment/70 transition-colors">Walmart Store</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
