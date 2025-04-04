import { cn } from "@/utils/cn";
import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

export type DrawerProps = React.ComponentProps<typeof DrawerPrimitive.Root>;

export function Drawer({
  shouldScaleBackground = true,
  ...props
}: React.PropsWithChildren<DrawerProps>) {
  return <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />;
}

export type DrawerTriggerProps = React.ComponentProps<typeof DrawerPrimitive.Trigger>;

export const DrawerTrigger = DrawerPrimitive.Trigger;

export type DrawerPortalProps = React.ComponentProps<typeof DrawerPrimitive.Portal>;

export const DrawerPortal = DrawerPrimitive.Portal;

export type DrawerCloseProps = React.ComponentProps<typeof DrawerPrimitive.Close>;

export const DrawerClose = DrawerPrimitive.Close;

export type DrawerOverlayProps = React.ComponentProps<typeof DrawerPrimitive.Overlay> & {
  ref?: React.Ref<React.ElementRef<typeof DrawerPrimitive.Overlay>>;
};

export function DrawerOverlay({ ref, className, ...props }: DrawerOverlayProps) {
  return (
    <DrawerPrimitive.Overlay
      ref={ref}
      className={cn("fixed inset-0 z-50 bg-black/80", className)}
      {...props}
    />
  );
}

export type DrawerContentProps = React.ComponentProps<typeof DrawerPrimitive.Content> & {
  ref?: React.Ref<React.ElementRef<typeof DrawerPrimitive.Content>>;
};

export function DrawerContent({ ref, className, children, ...props }: DrawerContentProps) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(
          "bg-bg fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border",
          className,
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 h-2 w-[100px] rounded-full" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

export type DrawerHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function DrawerHeader({ className, ...props }: DrawerHeaderProps) {
  return <div className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)} {...props} />;
}

export type DrawerFooterProps = React.HTMLAttributes<HTMLDivElement>;

export function DrawerFooter({ className, ...props }: DrawerFooterProps) {
  return <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />;
}

export type DrawerTitleProps = React.ComponentProps<typeof DrawerPrimitive.Title> & {
  ref?: React.Ref<React.ElementRef<typeof DrawerPrimitive.Title>>;
};

export function DrawerTitle({ ref, className, ...props }: DrawerTitleProps) {
  return (
    <DrawerPrimitive.Title
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

export type DrawerDescriptionProps = React.ComponentProps<typeof DrawerPrimitive.Description> & {
  ref?: React.Ref<React.ElementRef<typeof DrawerPrimitive.Description>>;
};

export function DrawerDescription({ ref, className, ...props }: DrawerDescriptionProps) {
  return (
    <DrawerPrimitive.Description
      ref={ref}
      className={cn("text-muted-fg text-sm", className)}
      {...props}
    />
  );
}
