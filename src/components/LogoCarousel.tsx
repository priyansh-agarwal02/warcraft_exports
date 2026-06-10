"use client";

import Image from "next/image";

type Logo = {
  src: string;
  alt: string;
  href?: string;
};

export default function LogoCarousel({
  title,
  logos,
}: {
  title: string;
  logos: Logo[];
}) {
  return (
    <section className="w-full bg-[#f2f2f2] pt-3 pb-5 border-y border-khaki/40">
      {/* Heading */}
      <h2 className="text-center text-[16px] font-semibold tracking-[0.2em] text-neutral-800 mb-6">
        {title}
      </h2>

      <div className="relative overflow-hidden">
        {/* Fade Edges */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#f2f2f2] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#f2f2f2] to-transparent z-10" />

        {/* Carousel Track */}
        <div className="flex w-max animate-logo-scroll hover:[animation-play-state:paused]">
          {[...logos, ...logos].map((logo, i) => {
            const content = (
              <div className="h-[60px] w-[160px] flex items-center justify-center flex-shrink-0">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={160}
                  height={60}
                  className="
                    object-contain
                    opacity-95
                    hover:scale-105
                    transition-all duration-300
                  "
                />
              </div>
            );

            return (
              <div key={i} className="mx-10 flex items-center">
                {logo.href ? (
                  <a href={logo.href} target="_blank" rel="noopener noreferrer">
                    {content}
                  </a>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
