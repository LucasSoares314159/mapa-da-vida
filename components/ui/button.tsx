import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Botão no padrão do .btn-cta da LP /trilha: pílula (999px, não 50%, que vira
// elipse no botão largo do mobile), DM Sans 500 16px, sem caixa alta. Branco
// sobre --verde é direcionamento de marca assumido na LP: não "corrija" para
// preto sem conversar. Foco por outline de 3px com recuo, como na LP.
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-sans text-base font-medium leading-tight transition-[opacity,background-color,color,border-color] active:translate-y-px focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-mt-green-dark disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-mt-green text-white hover:opacity-90',
        destructive: 'bg-mt-red text-white hover:opacity-90',
        outline:
          'border-[1.5px] border-mt-green-dark bg-transparent text-mt-green-dark hover:bg-mt-green-dark hover:text-mt-off-white',
        secondary: 'bg-mt-green-sup text-mt-green-dark hover:bg-mt-border/60',
        ghost: 'text-mt-green-dark hover:bg-mt-green-sup',
        link: 'rounded-none text-mt-green-dark underline decoration-mt-green underline-offset-4 hover:decoration-2',
      },
      size: {
        default: 'min-h-11 px-6 py-3',
        sm: 'min-h-9 px-4 py-2 text-sm',
        lg: 'min-h-12 px-10 py-[18px]',
        icon: 'size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
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
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
