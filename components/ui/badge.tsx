import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-secondary text-foreground",
        outline: "border-border bg-transparent text-muted-foreground",
        success: "border-success/30 bg-success/10 text-success",
        danger: "border-destructive/30 bg-destructive/10 text-destructive",
        active: "border-foreground bg-foreground text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
