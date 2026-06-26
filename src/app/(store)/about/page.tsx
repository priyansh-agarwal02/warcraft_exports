import type { Metadata } from "next"
import { siteConfig } from "@/config/site.config"

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


export const metadata: Metadata = {
  title: "About Us — Warcraft Exports",
  description:
    "RAAS Enterprises — manufacturing WW1 & WW2 historical reproduction gear in Kanpur, India since 2014. Factory-direct, hand-crafted, shipped to 20+ countries.",
}

const STATS = [
  { value: siteConfig.brand.yearsInBusiness, label: "Years in Business" },
  { value: siteConfig.brand.countriesServed, label: "Countries Served" },
  { value: siteConfig.brand.ordersFulfilled, label: "Orders Fulfilled" },
  { value: siteConfig.brand.products, label: "Products" },
]

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Hand-Cutting",
    desc: "Every piece begins with artisan leather workers hand-cutting hides to pattern. No shortcuts, no laser cutting — the same method used in original wartime production.",
  },
  {
    step: "02",
    title: "Brass Fittings",
    desc: "We source solid brass buckles, rivets, and hardware. Each fitting is hand-set and checked for correct placement against period documentation.",
  },
  {
    step: "03",
    title: "Expert Stitching",
    desc: "Load-bearing seams are saddle-stitched by hand for durability. Decorative stitching follows original patterns documented from museum specimens.",
  },
  {
    step: "04",
    title: "Finishing & Quality Check",
    desc: "Every item is edge-finished, burnished, and inspected before packaging. Rejected pieces are recycled — they never leave the factory.",
  },
]

export default function AboutPage() {
  return (
    <div className="bg-parchment min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Hero */}
        <div className="text-center mb-16">
          <p className="text-[10px] font-sans font-700 uppercase tracking-[0.2em] text-leather mb-2">
            Our Story
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl text-leather-dark mb-5">
            Crafted in Kanpur Since 2014
          </h1>
          <p className="font-sans text-leather/80 max-w-2xl mx-auto text-base leading-relaxed">
            RAAS Enterprises began as a small leather workshop in the heart of Fazalgunj, Kanpur —
            India&apos;s oldest leather-working district. Today we ship to over 20 countries, but
            every item is still made by hand, in the same factory, by the same craftspeople.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="bg-leather-dark text-parchment rounded-sm p-6 text-center"
            >
              <div className="font-heading text-3xl sm:text-4xl text-gold mb-1">{s.value}</div>
              <div className="font-sans text-xs uppercase tracking-widest text-parchment/60">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Story section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <p className="text-[10px] font-sans font-700 uppercase tracking-[0.2em] text-leather mb-3">
              Factory-Direct
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl text-leather-dark mb-5">
              No Middlemen. No Compromises.
            </h2>
            <div className="space-y-4 font-serif text-leather/80 text-sm leading-relaxed">
              <p>
                Warcraft Exports is the direct retail brand of RAAS Enterprises, Fazalgunj, Kanpur,
                Uttar Pradesh. We are not a reseller — we are the manufacturer. When you order from
                us, you are ordering directly from the workshop where your item was made.
              </p>
              <p>
                Kanpur has been India&apos;s leather capital for over two centuries, supplying
                Allied forces during both World Wars. Our craftspeople carry that tradition forward,
                producing historical reproductions that meet the expectations of museum curators,
                film armourers, and serious collectors worldwide.
              </p>
              <p>
                We serve reenactment groups across the United States, Germany, the United Kingdom,
                Japan, Australia, and beyond — shipping via DHL, FedEx, and Ship Global with full
                export documentation.
              </p>
            </div>
          </div>

          {/* Factory info card */}
          <div className="bg-leather-dark/5 border border-khaki/40 rounded-sm p-8">
            <h3 className="font-heading text-xl text-leather-dark mb-5">Company Details</h3>
            <dl className="space-y-4">
              {[
                { term: "Registered Name", detail: "RAAS Enterprises" },
                { term: "Location", detail: "Fazalgunj, Kanpur, Uttar Pradesh 208012, India" },
                { term: "Established", detail: "2018" },
                { term: "Specialisation", detail: "WW1 & WW2 Historical Reproduction Leather Gear" },
                { term: "Export Markets", detail: "20+ Countries across USA, Canada, Mexico, Europe, Japan, Australia, Asia-Pacific" },
                { term: "Contact", detail: siteConfig.email },
              ].map(({ term, detail }) => (
                <div key={term} className="flex flex-col sm:flex-row sm:gap-4">
                  <dt className="font-sans text-[10px] uppercase tracking-widest text-khaki min-w-[140px] mb-0.5 sm:mb-0">
                    {term}
                  </dt>
                  <dd className="font-sans text-sm text-leather-dark">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Marketplace Storefronts */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-leather mb-2">
              Our Marketplaces
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl text-leather-dark">
              Our Global Storefronts
            </h2>
            <p className="font-sans text-leather/80 max-w-2xl mx-auto text-sm leading-relaxed mt-2">
              To offer the most flexible shipping, regional pricing, and convenient buying options, 
              we maintain official stores on the world&apos;s leading platforms in addition to our direct workshop site.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Amazon Storefront",
                tagline: "Prime Shipping & Global Fulfilment",
                desc: "Purchase our museum-grade WWII and WWI leather gear with Amazon's familiar checkout, Prime eligibility, and reliable customer service.",
                url: siteConfig.social.amazon,
                buttonText: "Shop on Amazon",
                color: "hover:border-[#FF9900]/60",
                badge: "bg-[#FF9900]/10 text-[#FF9900]",
                Icon: IconAmazon,
                iconColor: "text-black",
              },
              {
                name: "eBay Outlet",
                tagline: "Specialized Auctions & Direct Lots",
                desc: "Bid on special auction batches, unique militaria items, and bundle deals directly through our authorized eBay storefront.",
                url: siteConfig.social.ebay,
                buttonText: "Shop on eBay",
                color: "hover:border-[#0064D2]/60",
                badge: "bg-[#0064D2]/10 text-[#0064D2]",
                Icon: IconEbay,
                iconColor: "",
              },
              {
                name: "Walmart Marketplace",
                tagline: "Walmart Certified Partner",
                desc: "Shop our reproductions on Walmart's marketplace platform, integrated directly with your Walmart account and domestic support.",
                url: siteConfig.social.walmart,
                buttonText: "Shop on Walmart",
                color: "hover:border-[#0071CE]/60",
                badge: "bg-[#0071CE]/10 text-[#0071CE]",
                Icon: IconWalmart,
                iconColor: "text-[#0071ce]",
              },
            ].map((store) => (
              <div
                key={store.name}
                className={`flex flex-col justify-between bg-white border border-khaki/30 rounded-sm p-6 hover:shadow-md transition-all duration-300 ${store.color} hover:translate-y-[-2px]`}
              >
                <div>
                  {/* Platform Logo Preview Header */}
                  <div className="bg-[#f2f2f2] px-4 py-2.5 rounded-sm flex items-center justify-center mb-5 border border-khaki/20 h-12 w-full select-none">
                    <store.Icon className={`h-7 w-auto flex-shrink-0 ${store.iconColor}`} />
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-heading text-lg text-leather-dark">{store.name}</h3>
                    <span className={`text-[9px] font-sans font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${store.badge}`}>
                      Active
                    </span>
                  </div>
                  <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-khaki mb-4">
                    {store.tagline}
                  </p>
                  <p className="font-sans text-xs text-leather/70 leading-relaxed mb-6">
                    {store.desc}
                  </p>
                </div>
                <a
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 w-full bg-[#33450D] text-white py-2.5 text-xs font-sans font-bold uppercase tracking-[0.1em] hover:bg-[#4A5D23] transition-colors rounded-sm shadow-sm"
                >
                  <store.Icon className={`h-4 w-auto flex-shrink-0 bg-white p-0.5 rounded ${store.iconColor}`} />
                  <span>{store.buttonText}</span>
                  <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Manufacturing process */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <p className="text-[10px] font-sans font-700 uppercase tracking-[0.2em] text-leather mb-2">
              How We Make It
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl text-leather-dark">
              The Manufacturing Process
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.step}
                className="border border-khaki/40 rounded-sm p-6 bg-white/50"
              >
                <div className="font-heading text-4xl text-khaki/50 mb-3">{step.step}</div>
                <h3 className="font-heading text-base text-leather-dark mb-2">{step.title}</h3>
                <p className="font-sans text-xs text-leather/70 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quality */}
        <div className="bg-leather-dark rounded-sm p-10 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl text-parchment mb-4">
            Museum-Standard Quality
          </h2>
          <p className="font-sans text-parchment/70 max-w-2xl mx-auto text-sm leading-relaxed mb-6">
            Every product we make is researched against period documentation, surviving original
            specimens, and collector archives. We produce items for reenactors who demand accuracy,
            collectors who prize authenticity, and institutions that require durability. Our quality
            standard is simple: if it would not pass inspection in 1942, it does not leave our factory.
          </p>
          <a
            href="/shop"
            className="inline-block bg-gold text-leather-dark font-sans font-semibold text-xs uppercase tracking-widest px-8 py-3 rounded-sm hover:bg-gold/90 transition-colors"
          >
            Browse the Collection
          </a>
        </div>

      </div>
    </div>
  )
}
