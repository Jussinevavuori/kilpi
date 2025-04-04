import { cn } from "@/utils/cn";
import { Command as CommandPrimitive } from "cmdk";
import { Loader2Icon, SearchIcon } from "lucide-react";
import * as React from "react";
import { Dialog, DialogContent } from "./Dialog";

export type CommandProps = React.ComponentProps<typeof CommandPrimitive>;

export function Command({ className, ref, ...props }: CommandProps) {
  return (
    <CommandPrimitive
      ref={ref}
      className={cn("bg-bg text-fg flex h-full w-full flex-col overflow-hidden", className)}
      {...props}
    />
  );
}

export type CommandInputProps = React.ComponentProps<typeof CommandPrimitive.Input> & {
  isLoading?: boolean;
};

export function CommandInput({ className, ref, isLoading, ...props }: CommandInputProps) {
  return (
    <div className="flex items-center gap-2 border-b px-3" cmdk-input-wrapper="">
      {isLoading ? <Loader2Icon className="opacity-50" /> : <SearchIcon className="opacity-50" />}
      <CommandPrimitive.Input
        ref={ref}
        className={cn(
          "placeholder:text-muted-fg flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export type CommandDialogProps = React.ComponentProps<typeof Dialog> & {
  CommandProps?: CommandProps;
};

export function CommandDialog({ children, CommandProps, ...props }: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command
          className="[&_[cmdk-group-heading]]:text-muted-fg [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
          {...CommandProps}
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export type CommandListProps = React.ComponentProps<typeof CommandPrimitive.List>;

export function CommandList({ className, ref, ...props }: CommandListProps) {
  return (
    <CommandPrimitive.List
      ref={ref}
      className={cn("max-h-[min(600px,_70vh)] overflow-y-auto overflow-x-hidden", className)}
      {...props}
    />
  );
}

export type CommandEmptyProps = React.ComponentProps<typeof CommandPrimitive.Empty>;

export function CommandEmpty({ ref, ...props }: CommandEmptyProps) {
  return (
    <CommandPrimitive.Empty
      ref={ref}
      className="text-muted-fg py-12 text-center text-sm"
      {...props}
    />
  );
}

export type CommandGroupProps = React.ComponentProps<typeof CommandPrimitive.Group>;

export function CommandGroup({ className, ref, ...props }: CommandGroupProps) {
  return (
    <CommandPrimitive.Group
      ref={ref}
      className={cn(
        "text-fg [&_[cmdk-group-heading]]:text-muted-fg overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export type CommandSeparatorProps = React.ComponentProps<typeof CommandPrimitive.Separator>;

export function CommandSeparator({ ref, className, ...props }: CommandSeparatorProps) {
  return (
    <CommandPrimitive.Separator
      ref={ref}
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  );
}

export type CommandItemProps = React.ComponentProps<typeof CommandPrimitive.Item>;

export function CommandItem({ ref, className, ...props }: CommandItemProps) {
  return (
    <CommandPrimitive.Item
      ref={ref}
      className={cn(
        "data-[selected=true]:text-accent-foreground data-[selected='true']:bg-fg/10 relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

export type CommandShortcutProps = React.HTMLAttributes<HTMLSpanElement>;

export function CommandShortcut({ className, ...props }: CommandShortcutProps) {
  return (
    <span className={cn("text-muted-fg ml-auto text-xs tracking-widest", className)} {...props} />
  );
}
