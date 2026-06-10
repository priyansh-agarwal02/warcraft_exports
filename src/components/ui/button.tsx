import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-sans font-semibold uppercase tracking-widest text-xs transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Heritage primary — olive green CTA
        default:
          "bg-olive text-parchment border border-olive hover:bg-olive-light hover:border-olive-light shadow-sm",
        // Leather outline — secondary action
        outline:
          "bg-transparent text-leather border border-leather hover:bg-leather hover:text-parchment",
        // Ghost — subtle tertiary
        secondary:
          "bg-parchment-dark text-leather-dark border border-khaki hover:bg-canvas",
        ghost:
          "bg-transparent text-leather-dark border border-transparent hover:bg-parchment-dark hover:border-khaki",
        destructive:
          "bg-red-700 text-white border border-red-700 hover:bg-red-800",
        link: "bg-transparent text-leather underline-offset-4 hover:underline p-0 h-auto border-0 normal-case tracking-normal text-sm font-normal",
      },
      size: {
        default: "h-10 px-6",
        xs:      "h-7 px-3 text-[10px]",
        sm:      "h-8 px-4 text-[10px]",
        lg:      "h-12 px-8 text-xs",
        xl:      "h-14 px-10 text-sm",
        icon:    "size-10 p-0",
        "icon-sm": "size-8 p-0",
        "icon-lg": "size-12 p-0",
        "icon-xs": "size-6 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
