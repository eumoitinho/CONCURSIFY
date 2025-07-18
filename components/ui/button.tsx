import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold border-2 border-gray-800 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-orange-500 text-white shadow-[3px_3px_0px_0px_#2d2d2d] hover:bg-orange-600 hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-0.5 hover:translate-y-0.5",
        destructive:
          "bg-red-500 text-white shadow-[3px_3px_0px_0px_#2d2d2d] hover:bg-red-600 hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-0.5 hover:translate-y-0.5",
        outline:
          "bg-white text-gray-900 shadow-[3px_3px_0px_0px_#2d2d2d] hover:bg-gray-50 hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-0.5 hover:translate-y-0.5",
        secondary:
          "bg-orange-200 text-gray-900 shadow-[3px_3px_0px_0px_#2d2d2d] hover:bg-orange-300 hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-0.5 hover:translate-y-0.5",
        ghost: "border-transparent shadow-none hover:bg-orange-100 hover:text-orange-600",
        link: "border-transparent shadow-none text-orange-500 underline-offset-4 hover:underline hover:text-orange-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
