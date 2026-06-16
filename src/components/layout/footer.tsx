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
    <svg viewBox="-150 -75.3385 1300 452.031" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M620.38 235.668c-58.111 42.833-142.34 65.686-214.86 65.686-101.685 0-193.227-37.61-262.483-100.161-5.44-4.92-.565-11.623 5.964-7.792 74.74 43.486 167.153 69.647 262.613 69.647 64.38 0 135.202-13.32 200.322-40.961 9.837-4.179 18.064 6.442 8.444 13.581" fill="#fcb61a" fillRule="evenodd" />
      <path d="M644.54 208.027c-7.4-9.49-49.102-4.484-67.82-2.264-5.702.697-6.572-4.266-1.436-7.835 33.213-23.375 87.712-16.628 94.067-8.793 6.355 7.879-1.654 62.508-32.865 88.582-4.788 4.005-9.359 1.872-7.226-3.439 7.009-17.498 22.723-56.718 15.28-66.251" fill="#fcb61a" fillRule="evenodd" />
      <path d="M578.026 32.908V10.186c0-3.439 2.612-5.746 5.746-5.746H685.5c3.265 0 5.877 2.35 5.877 5.746v19.457c-.044 3.265-2.786 7.531-7.661 14.278l-52.714 75.262c19.588-.478 40.264 2.438 58.024 12.45 4.005 2.263 5.093 5.572 5.398 8.836v24.246c0 3.308-3.657 7.182-7.487 5.18-31.298-16.41-72.868-18.195-107.474.174-3.526 1.916-7.226-1.915-7.226-5.223v-23.027c0-3.7.043-10.012 3.743-15.627l61.072-87.581h-53.15c-3.264 0-5.876-2.307-5.876-5.703M206.939 174.683h-30.95c-2.96-.217-5.31-2.437-5.528-5.267V10.578c0-3.178 2.655-5.703 5.963-5.703h28.86c3.004.13 5.398 2.438 5.616 5.31V30.95h.566c7.53-20.067 21.677-29.425 40.743-29.425 19.37 0 31.472 9.358 40.178 29.425 7.487-20.067 24.507-29.425 42.746-29.425 12.971 0 27.162 5.354 35.824 17.368 9.794 13.363 7.792 32.777 7.792 49.797l-.044 100.248c0 3.178-2.655 5.746-5.963 5.746h-30.906c-3.09-.217-5.572-2.698-5.572-5.746V84.752c0-6.704.61-23.42-.87-29.774-2.307-10.665-9.228-13.669-18.196-13.669-7.487 0-15.322 5.006-18.5 13.016-3.177 8.01-2.872 21.416-2.872 30.427v84.185c0 3.178-2.656 5.746-5.964 5.746h-30.906c-3.134-.217-5.572-2.698-5.572-5.746l-.043-84.185c0-17.717 2.916-43.79-19.066-43.79-22.243 0-21.373 25.42-21.373 43.79v84.185c0 3.178-2.655 5.746-5.963 5.746M778.958 1.524c45.923 0 70.779 39.437 70.779 89.583 0 48.448-27.467 86.885-70.78 86.885-45.096 0-69.646-39.438-69.646-88.583 0-49.449 24.855-87.885 69.647-87.885m.261 32.429c-22.81 0-24.246 31.08-24.246 50.45 0 19.415-.304 60.854 23.985 60.854 23.985 0 25.116-33.43 25.116-53.802 0-13.407-.566-29.426-4.614-42.136-3.482-11.057-10.403-15.366-20.24-15.366m130.065 140.73h-30.819c-3.09-.217-5.572-2.698-5.572-5.746l-.043-158.882c.26-2.916 2.83-5.18 5.963-5.18H907.5c2.699.13 4.919 1.96 5.528 4.44v24.29h.566c8.663-21.721 20.807-32.081 42.18-32.081 13.886 0 27.424 5.005 36.13 18.717C1000 32.951 1000 54.325 1000 69.691v99.986c-.348 2.786-2.916 5.006-5.963 5.006H963c-2.83-.217-5.18-2.307-5.485-5.006V83.402c0-17.368 2.003-42.79-19.37-42.79-7.53 0-14.452 5.05-17.89 12.711-4.354 9.708-4.92 19.371-4.92 30.08v85.534c-.043 3.178-2.742 5.746-6.05 5.746M496.931 98.812c0 12.057.305 22.113-5.79 32.82-4.918 8.707-12.753 14.06-21.416 14.06-11.883 0-18.848-9.053-18.848-22.417 0-26.379 23.637-31.167 46.054-31.167v6.704m31.21 75.436c-2.045 1.828-5.005 1.959-7.312.74-10.273-8.532-12.145-12.493-17.76-20.633-16.977 17.325-29.034 22.505-51.017 22.505-26.074 0-46.315-16.063-46.315-48.23 0-25.117 13.581-42.224 32.995-50.582 16.803-7.4 40.265-8.706 58.2-10.752v-4.004c0-7.357.565-16.063-3.788-22.418-3.743-5.702-10.97-8.053-17.368-8.053-11.797 0-22.287 6.05-24.855 18.587-.523 2.786-2.569 5.528-5.398 5.659l-29.992-3.221c-2.524-.566-5.354-2.612-4.614-6.486C417.795 10.97 450.703 0 480.13 0c15.061 0 34.736 4.005 46.62 15.41 15.06 14.06 13.624 32.82 13.624 53.236v48.23c0 14.496 6.008 20.85 11.666 28.686 1.96 2.786 2.394 6.138-.13 8.227-6.312 5.267-17.543 15.061-23.724 20.546l-.043-.087M91.194 98.812c0 12.057.305 22.113-5.79 32.82-4.918 8.707-12.71 14.06-21.416 14.06-11.883 0-18.805-9.053-18.805-22.417 0-26.379 23.637-31.167 46.011-31.167v6.704m31.21 75.436c-2.045 1.828-5.005 1.959-7.312.74-10.273-8.532-12.102-12.493-17.76-20.633-16.977 17.325-28.99 22.505-51.017 22.505C20.285 176.86 0 160.797 0 128.63c0-25.117 13.625-42.224 32.995-50.582 16.803-7.4 40.265-8.706 58.199-10.752v-4.004c0-7.357.566-16.063-3.744-22.418-3.787-5.702-11.012-8.053-17.368-8.053-11.796 0-22.33 6.05-24.899 18.587-.522 2.786-2.568 5.528-5.354 5.659L9.794 53.846c-2.525-.566-5.31-2.612-4.614-6.486C12.101 10.97 44.966 0 74.392 0c15.06 0 34.736 4.005 46.62 15.41 15.06 14.06 13.624 32.82 13.624 53.236v48.23c0 14.496 6.007 20.85 11.666 28.686 2.003 2.786 2.438 6.138-.087 8.227-6.312 5.267-17.542 15.061-23.723 20.546l-.087-.087" fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}

function IconEbay({ className }: { className?: string }) {
  return (
    <svg viewBox="-44.97 -30.031 389.74 180.186" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M38.766 26.208C17.621 26.208 0 35.18 0 62.245c0 21.441 11.849 34.944 39.312 34.944 32.327 0 34.399-21.294 34.399-21.294H58.047S54.69 87.36 38.357 87.36c-13.302 0-22.87-8.986-22.87-21.58H75.35v-7.904c0-12.46-7.91-31.669-36.583-31.669zM38.22 36.31c12.663 0 21.295 7.757 21.295 19.384h-43.68c0-12.343 11.266-19.384 22.385-19.384z" fill="#e53238" />
      <path d="M75.338 0v83.597c0 4.745-.339 11.408-.339 11.408h14.94s.536-4.785.536-9.159c0 0 7.381 11.548 27.451 11.548 21.135 0 35.49-14.673 35.49-35.695 0-19.557-13.186-35.286-35.456-35.286-20.854 0-27.334 11.261-27.334 11.261V0zm38.766 36.753c14.352 0 23.478 10.652 23.478 24.946 0 15.327-10.54 25.355-23.375 25.355-15.318 0-23.581-11.96-23.581-25.219 0-12.354 7.414-25.082 23.478-25.082z" fill="#0064d2" />
      <path d="M190.545 26.208c-31.812 0-33.852 17.42-33.852 20.203h15.834s.83-10.17 16.926-10.17c10.46 0 18.564 4.788 18.564 13.992v3.276h-18.564c-24.645 0-37.674 7.21-37.674 21.84 0 14.398 12.038 22.233 28.307 22.233 22.171 0 29.313-12.251 29.313-12.251 0 4.872.376 9.674.376 9.674h14.076s-.546-5.952-.546-9.76V52.331c0-21.58-17.407-26.123-32.76-26.123zm17.472 37.129v4.368c0 5.697-3.515 19.86-24.212 19.86-11.333 0-16.192-5.655-16.192-12.216 0-11.935 16.364-12.012 40.404-12.012z" fill="#f5af02" />
      <path d="M214.779 28.941h17.813l25.565 51.217 25.507-51.217H299.8l-46.46 91.183h-16.925l13.406-25.418z" fill="#86b817" />
    </svg>
  )
}

function IconWalmart({ className }: { className?: string }) {
  return (
    <svg viewBox="-35.036445 -14.001425 303.64919 84.00855" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M135.4744 29.8037c0-5.5309-2.3676-10.4176-10.3747-10.4176-4.1081 0-7.3715 1.1708-9.1408 2.1957l1.2968 4.4373c1.629-1.022 4.2283-1.8637 6.6817-1.8637 4.0537-.0057 4.7178 2.2874 4.7178 3.7617v.355c-8.8488-.0143-14.4426 3.0431-14.4426 9.2696 0 3.8046 2.8399 7.3716 7.804 7.3716 3.0287 0 5.588-1.2224 7.1167-3.1519h.1489s1.0078 4.2169 6.5815 2.6051c-.2834-1.7663-.3893-3.627-.3893-5.8887zm-6.6015 5.84c0 .4466-.0372.9104-.169 1.3083-.5096 1.7033-2.2672 3.129-4.4545 3.129-1.8463 0-3.295-1.045-3.295-3.235 0-3.3494 3.6986-4.2712 7.9185-4.2483M0 11.8607s5.7799 23.6464 6.6989 27.4768c1.082 4.4774 3.0202 6.132 8.614 5.0299l3.6128-14.663c.9132-3.633 1.5344-6.238 2.1242-9.9396h.1001c.4094 3.7388.9992 6.3067 1.7463 9.951 0 0 1.4743 6.6616 2.2388 10.1513.7442 3.4897 2.8397 5.6912 8.3277 4.5003l8.5998-32.5067h-6.9423l-2.9514 14.062c-.7816 4.0736-1.4916 7.2828-2.0441 11.0158h-.1002c-.498-3.693-1.1308-6.7704-1.9438-10.7611l-3.0574-14.3167h-7.2428L14.517 25.811c-.9304 4.2598-1.8006 7.675-2.3475 11.2907h-.0944c-.564-3.3924-1.3283-7.7123-2.1385-11.8118 0 0-1.9381-9.9881-2.6223-13.4292m54.095 17.943c0-5.5309-2.3734-10.4176-10.3805-10.4176-4.0965 0-7.3658 1.1708-9.135 2.1957l1.2968 4.4373c1.6232-1.022 4.2198-1.8637 6.6817-1.8637 4.0537-.0057 4.7178 2.2874 4.7178 3.7617v.355c-8.8487-.0143-14.4482 3.0431-14.4482 9.2696 0 3.8046 2.8513 7.3716 7.7924 7.3716 3.0573 0 5.5938-1.2224 7.1225-3.1519h.1545s1.0134 4.2169 6.5815 2.6051c-.2862-1.7663-.3835-3.627-.3835-5.8887zm-6.6072 5.84c0 .4466-.0372.9104-.1632 1.3083-.5155 1.7033-2.273 3.129-4.466 3.129-1.835 0-3.2893-1.045-3.2893-3.235 0-3.3494 3.6986-4.2712 7.9185-4.2483M71.6189 44.356V11.8606h-6.6072V44.356zm84.1341-32.4953v23.9757c0 3.3093.621 5.6167 1.958 7.031 1.1738 1.2395 3.0946 2.0468 5.382 2.0468 1.9639 0 3.8847-.3779 4.7923-.7071l-.0803-5.1616c-.6784.1575-1.4542.292-2.5192.292-2.2558 0-3-1.4285-3-4.4v-9.178h5.754V19.55h-5.754v-7.6894M138.6754 19.95v24.4165h6.8305V31.862c0-.6728.0428-1.2539.1489-1.7921.5095-2.6366 2.5105-4.3056 5.3934-4.3056.8044 0 1.3512.0887 1.9582.1832v-6.4011c-.5097-.0916-.856-.1403-1.483-.1403-2.5564 0-5.4536 1.6232-6.676 5.1587h-.1688V19.95m-69.2228 0v24.4165h6.6557v-14.331c0-.6727.0745-1.3598.3121-1.981.5412-1.4514 1.8838-3.1319 4.0394-3.1319 2.6795 0 3.9449 2.2616 3.9449 5.5252v13.9187h6.6388V29.8638c0-.6327.0888-1.4085.2747-1.9696.5326-1.646 1.9868-2.9716 3.9966-2.9716 2.708 0 4.0193 2.213 4.0193 6.0605v13.3834h6.6329V29.9697c0-7.5634-3.8476-10.5636-8.2162-10.5636-1.9208 0-3.4495.4724-4.8237 1.3197-1.1623.7129-2.1813 1.7177-3.0946 3.0317h-.1002c-1.0506-2.628-3.5183-4.3514-6.7419-4.3514-4.1337 0-6.0117 2.087-7.1167 3.8504h-.1003V19.95" fill="currentColor" />
      <path d="M203.7867 18.8542c1.3054 0 2.4046-.6814 2.5477-1.5574l1.294-14.6573c0-1.4515-1.709-2.6395-3.8417-2.6395-2.1443 0-3.842 1.188-3.842 2.6395l1.3054 14.6573c.1375.876 1.231 1.5574 2.5366 1.5574m-7.9394 4.5864c.6469-1.1451.6097-2.4162-.0888-2.983l-12.081-8.448c-1.2566-.7329-3.1375.1403-4.2139 1.9896-1.0735 1.8465-.856 3.9191.375 4.6377l13.3748 6.2007c.856.3206 1.9753-.2748 2.6339-1.4085m15.877-.0005c.684 1.1336 1.8034 1.729 2.6365 1.4256l13.3748-6.2179c1.2425-.7329 1.4286-2.7855.378-4.632-1.0736-1.8493-2.966-2.7167-4.2198-1.9982l-12.0837 8.4395c-.67.5754-.7185 1.8522-.0716 2.9944m-7.9518 13.723c1.3054 0 2.4046.6813 2.5477 1.5573l1.294 14.6574c0 1.4514-1.709 2.628-3.8417 2.628-2.1443 0-3.842-1.1766-3.842-2.628l1.3054-14.6574c.1375-.876 1.231-1.5573 2.5366-1.5573m7.9376-4.5736c.684-1.1365 1.8034-1.7434 2.6365-1.4142l13.3748 6.2065c1.2425.7185 1.4286 2.7883.378 4.6377-1.0736 1.835-2.966 2.7081-4.2198 1.9896l-12.0837-8.4509c-.67-.5697-.7185-1.8408-.0716-2.9687m-15.8912-.0126c.6469 1.1423.6097 2.4105-.0888 2.983l-12.081 8.4366c-1.2566.7328-3.1375-.1432-4.2139-1.9782-1.0735-1.8465-.856-3.9191.375-4.6377l13.3748-6.2064c.856-.3264 1.9753.2748 2.6339 1.4027m35.8022 10.1459h.1662c.226 0 .3177.0716.3435.252.0486.2004.0744.3349.123.3922h.4295c-.0372-.043-.086-.1518-.1117-.4037-.0488-.2176-.1604-.3407-.3178-.3836v-.04c.2176-.0488.3435-.1948.3435-.3751 0-.1632-.0745-.2806-.1488-.355-.1431-.0687-.2805-.123-.584-.123-.269 0-.4667.0228-.6241.06v1.6204h.3807v-.6442zm.0115-.7386l.1947-.0257c.229 0 .352.106.352.2548 0 .166-.166.2433-.3777.2433h-.169v-.4724zm.2434-1.0993c-.939 0-1.6833.733-1.6833 1.6318 0 .9218.7444 1.6547 1.6833 1.6547.9504 0 1.6718-.7329 1.6718-1.6547 0-.8989-.7214-1.6318-1.6718-1.6318m0 .3293c.7213 0 1.2567.584 1.2567 1.3025 0 .7243-.5354 1.3255-1.2567 1.314-.7214 0-1.2683-.5897-1.2683-1.314 0-.7185.5469-1.3025 1.2568-1.3025" fill="#fcb61a" />
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
    <div className="w-[72px] h-[48px] bg-[#1B140E] border border-parchment/10 rounded flex items-center justify-center px-1" title="Visa">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-auto text-[#2563EB]" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z" />
      </svg>
    </div>
  )
}

function CardMastercard() {
  return (
    <div className="w-[72px] h-[48px] bg-[#1B140E] border border-parchment/10 rounded flex items-center justify-center px-1" title="Mastercard">
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-auto" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="12" r="6" fill="#EB001B" />
        <circle cx="15" cy="12" r="6" fill="#F79E1B" fillOpacity="0.8" />
      </svg>
    </div>
  )
}

function CardAmex() {
  return (
    <div className="w-[72px] h-[48px] bg-[#1B140E] border border-parchment/10 rounded flex items-center justify-center px-1" title="American Express">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-auto text-[#0070CD]" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.015 14.378c0-.32-.135-.496-.344-.622-.21-.12-.464-.135-.81-.135h-1.543v2.82h.675v-1.027h.72c.24 0 .39.024.478.125.12.13.104.38.104.55v.35h.66v-.555c-.002-.25-.017-.376-.108-.516-.06-.08-.18-.18-.33-.234l.02-.008c.18-.072.48-.297.48-.747zm-.87.407l-.028-.002c-.09.053-.195.058-.33.058h-.81v-.63h.824c.12 0 .24 0 .33.05.098.048.156.147.15.255 0 .12-.045.215-.134.27zM20.297 15.837H19v.6h1.304c.676 0 1.05-.278 1.05-.884 0-.28-.066-.448-.187-.582-.153-.133-.392-.193-.73-.207l-.376-.015c-.104 0-.18 0-.255-.03-.09-.03-.15-.105-.15-.21 0-.09.017-.166.09-.21.083-.046.177-.066.272-.06h1.23v-.602h-1.35c-.704 0-.958.437-.958.84 0 .9.776.855 1.407.87.104 0 .18.015.225.06.046.03.082.106.082.18 0 .077-.035.15-.08.18-.06.053-.15.07-.277.07zM0 0v10.096L.81 8.22h1.75l.225.464V8.22h2.043l.45 1.02.437-1.013h6.502c.295 0 .56.057.756.236v-.23h1.787v.23c.307-.17.686-.23 1.12-.23h2.606l.24.466v-.466h1.918l.254.465v-.466h1.858v3.948H20.87l-.36-.6v.585h-2.353l-.256-.63h-.583l-.27.614h-1.213c-.48 0-.84-.104-1.08-.24v.24h-2.89v-.884c0-.12-.03-.12-.105-.135h-.105v1.036H6.067v-.48l-.21.48H4.69l-.202-.48v.465H2.235l-.256-.624H1.4l-.256.624H0V24h23.786v-7.108c-.27.135-.613.18-.973.18H21.09v-.255c-.21.165-.57.255-.914.255H14.71v-.9c0-.12-.018-.12-.12-.12h-.075v1.022h-1.8v-1.066c-.298.136-.643.15-.928.136h-.214v.915h-2.18l-.54-.617-.57.6H4.742v-3.93h3.61l.518.602.554-.6h2.412c.28 0 .74.03.942.225v-.24h2.177c.202 0 .644.045.903.225v-.24h3.265v.24c.163-.164.508-.24.803-.24h1.89v.24c.194-.15.464-.24.84-.24h1.176V0H0zM21.156 14.955c.004.005.006.012.01.016.01.01.024.01.032.02l-.042-.035zM23.828 13.082h.065v.555h-.065zM23.865 15.03v-.005c-.03-.025-.046-.048-.075-.07-.15-.153-.39-.215-.764-.225l-.36-.012c-.12 0-.194-.007-.27-.03-.09-.03-.15-.105-.15-.21 0-.09.03-.16.09-.204.076-.045.15-.05.27-.05h1.223v-.588h-1.283c-.69 0-.96.437-.96.84 0 .9.78.855 1.41.87.104 0 .18.015.224.06.046.03.076.106.076.18 0 .07-.034.138-.09.18-.045.056-.136.07-.27.07h-1.288v.605h1.287c.42 0 .734-.118.9-.36h.03c.09-.134.135-.3.135-.523 0-.24-.045-.39-.135-.526zM18.597 14.208v-.583h-2.235V16.458h2.235v-.585h-1.57v-.57h1.533v-.584h-1.532v-.51M13.51 8.787h.685V11.6h-.684zM13.126 9.543l-.007.006c0-.314-.13-.5-.34-.624-.217-.125-.47-.135-.81-.135H10.43v2.82h.674v-1.034h.72c.24 0 .39.03.487.12.122.136.107.378.107.548v.354h.677v-.553c0-.25-.016-.375-.11-.516-.09-.107-.202-.19-.33-.237.172-.07.472-.3.472-.75zm-.855.396h-.015c-.09.054-.195.056-.33.056H11.1v-.623h.825c.12 0 .24.004.33.05.09.04.15.128.15.25s-.047.22-.134.266zM15.92 9.373h.632v-.6h-.644c-.464 0-.804.105-1.02.33-.286.3-.362.69-.362 1.11 0 .512.123.833.36 1.074.232.238.645.31.97.31h.78l.255-.627h1.39l.262.627h1.36v-2.11l1.272 2.11h.95l.002.002V8.786h-.684v1.963l-1.18-1.96h-1.02V11.4L18.11 8.744h-1.004l-.943 2.22h-.3c-.177 0-.362-.03-.468-.134-.125-.15-.186-.36-.186-.662 0-.285.08-.51.194-.63.133-.135.272-.165.516-.165zm1.668-.108l.46 1.118v.002h-.93l.466-1.12zM2.38 10.97l.254.628H4V9.393l.972 2.205h.584l.973-2.202.015 2.202h.69v-2.81H6.118l-.807 1.904-.876-1.905H3.343v2.663L2.205 8.787h-.997L.01 11.597h.72l.26-.626h1.39zm-.688-1.705l.46 1.118-.003.002h-.915l.457-1.12zM11.856 13.62H9.714l-.85.923-.825-.922H5.346v2.82H8l.855-.932.824.93h1.302v-.94h.838c.6 0 1.17-.164 1.17-.945l-.006-.003c0-.78-.598-.93-1.128-.93zM7.67 15.853l-.014-.002H6.02v-.557h1.47v-.574H6.02v-.51H7.7l.733.82-.764.824zm2.642.33l-1.03-1.147 1.03-1.108v2.253zm1.553-1.258h-.885v-.717h.885c.24 0 .42.098.42.344 0 .243-.15.372-.42.372zM9.967 9.373v-.586H7.73V11.6h2.237v-.58H8.4v-.564h1.527V9.88H8.4v-.507" />
      </svg>
    </div>
  )
}

function CardDiscover() {
  return (
    <div className="w-[72px] h-[48px] bg-[#1B140E] border border-parchment/10 rounded flex items-center justify-center gap-0.5 px-1" title="Discover">
      <span className="font-sans font-bold text-[10px] tracking-tighter text-white select-none">DISC</span>
      <span className="w-2.5 h-2.5 bg-[#FF6600] rounded-full mx-0.5 select-none"></span>
      <span className="font-sans font-bold text-[10px] tracking-tighter text-white select-none">VER</span>
    </div>
  )
}

function CardDinersClub() {
  return (
    <div className="w-[72px] h-[48px] bg-[#1B140E] border border-parchment/10 rounded flex items-center justify-center px-1" title="Diners Club">
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-auto" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 4a6 6 0 0 1 4.5 5.5h-9A6 6 0 0 1 13 6zm-2 12a6 6 0 0 1-4.5-5.5h9A6 6 0 0 1 11 18z" fill="#0079C1" />
      </svg>
    </div>
  )
}

function CardApplePay() {
  return (
    <div className="w-[72px] h-[48px] bg-[#1B140E] border border-parchment/10 rounded flex items-center justify-center gap-0.5 px-1" title="Apple Pay">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z" />
      </svg>
      <span className="font-sans font-semibold text-[12px] text-white select-none">Pay</span>
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
  { href: "https://www.facebook.com/WarcraftExportsShop/", icon: IconFacebook, label: "Facebook" },
  { href: "https://www.instagram.com/warcraft_exports", icon: IconInstagram, label: "Instagram" },
  { href: "https://www.youtube.com/@warcraftexports", icon: IconYoutube, label: "YouTube" },
  { href: "https://twitter.com/warcraftexports", icon: IconX, label: "X / Twitter" },
]

const FOOTER_TITLE = "text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-gold mb-4"

export function Footer() {
  return (
    <footer className="bg-[#110C08] text-parchment/80">
      {/* Top and Bottom unified grid container */}
      <div
        className="
          max-w-7xl
          mx-auto
          px-6
          lg:px-8
          pt-12
          pb-10
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-[1.25fr_1fr_1fr_1fr_1.25fr]
          gap-x-16
          gap-y-8
          md:gap-y-10
          lg:gap-y-4
        "
      >

        {/* Top Row — Column 1: Brand */}
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

        {/* Top Row — Column 2: Shop */}
        <div>
          <p className={FOOTER_TITLE}>
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

        {/* Top Row — Column 3: Information */}
        <div>
          <p className={FOOTER_TITLE}>
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

        {/* Top Row — Column 4: Policies */}
        <div>
          <p className={FOOTER_TITLE}>
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

        {/* Top Row — Column 5: Newsletter & Available At */}
        <div className="max-w-[360px] lg:ml-auto">
          <p className={FOOTER_TITLE}>
            Newsletter
          </p>
          <p className="text-[13px] font-sans font-semibold text-parchment/80 mb-1 leading-snug">
            Regular Offers &amp; Free Deals
          </p>
          <p className="text-xs text-parchment/50 mb-3 leading-relaxed">
            New arrivals, exclusive discounts, and collector notes.
          </p>
          <NewsletterForm />

          {/* Subsection Divider & Available At storefronts */}
          <div className="mt-8 border-t border-parchment/10 pt-6">
            <p
              className="
                text-[11px]
                font-bold
                uppercase
                tracking-[0.15em]
                text-gold
                mb-4
              "
            >
              Available At
            </p>
            <div className="flex flex-row items-center gap-2 mt-2">
              <a
                href={siteConfig.social.amazon}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white px-2.5 py-1 rounded flex items-center justify-center hover:opacity-90 transition-opacity select-none"
              >
                <IconAmazon className="h-7 w-auto text-black flex-shrink-0" />
              </a>
              <a
                href={siteConfig.social.ebay}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white px-2.5 py-1 rounded flex items-center justify-center hover:opacity-90 transition-opacity select-none"
              >
                <IconEbay className="h-7 w-auto flex-shrink-0" />
              </a>
              <a
                href={siteConfig.social.walmart}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white px-2.5 py-1 rounded flex items-center justify-center hover:opacity-90 transition-opacity select-none"
              >
                <IconWalmart className="h-7 w-auto text-[#0071ce] flex-shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* Row Divider spanning all columns */}
        <div className="md:col-span-2 lg:col-span-5 border-t border-parchment/10 my-2" />

        {/* Bottom Row — Column 1: Follow Us */}
        <div>
          <h4 className={FOOTER_TITLE}>
            Follow Us
          </h4>
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

        {/* Bottom Row — Column 2: SSL Checkout */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-gold flex-shrink-0" />
            <h4
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.15em]
                text-gold
              "
            >
              100% Secured SSL Checkout
            </h4>
          </div>
          <p
            className="
              text-[12px]
              text-parchment/60
              leading-8
              max-w-[280px]
            "
          >
            Secure checkout protected by 256-bit SSL encryption and PCI-DSS compliant
            payment processing.
          </p>
        </div>

        {/* Bottom Row — Column 3: Payment Gateways */}
        <div>
          <h4 className={FOOTER_TITLE}>
            Payment Gateways
          </h4>
          <div className="flex flex-col gap-3">
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

        {/* Bottom Row — Column 4: Accepted Cards */}
        <div className="md:col-span-2 lg:col-span-2">
          <h4 className={FOOTER_TITLE}>
            Accepted Credit &amp; Debit Cards
          </h4>
          <div className="flex flex-wrap gap-2 max-w-[312px]">
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
          <p>© {new Date().getFullYear()} Warcraft Exports. All rights reserved.</p>
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


