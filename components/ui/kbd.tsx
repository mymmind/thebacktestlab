import { cn } from "@/lib/utils";

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn("kbd-hint", className)}
      {...props}
    />
  );
}

export { Kbd };
