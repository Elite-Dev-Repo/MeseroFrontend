"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, Check, Circle, X } from "lucide-react";

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  children: React.ReactElement;
  asChild?: boolean;
}

interface DropdownMenuContentProps {
  className?: string;
  children: React.ReactNode;
  align?: "start" | "end";
  sideOffset?: number;
  forceMount?: boolean;
}

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  inset?: boolean;
  onSelect?: () => void;
  asChild?: boolean;
}

interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const DropdownMenuContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
} | null>(null);

function useDropdownMenu() {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error("DropdownMenu components must be used within DropdownMenu");
  }
  return context;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        const content = document.querySelector("[data-dropdown-menu-content]");
        if (content && !content.contains(event.target as Node)) {
          setOpen(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  asChild = false,
}: DropdownMenuTriggerProps) {
  const { open, setOpen, triggerRef } = useDropdownMenu();

  const child = React.Children.only(children);
  const childProps =
    child.props as React.ButtonHTMLAttributes<HTMLButtonElement>;

  return React.cloneElement(child as React.ReactElement<any>, {
    ref: triggerRef,
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      setOpen(!open);
      childProps.onClick?.(e);
    },
    "aria-haspopup": "menu",
    "aria-expanded": open,
  });
}

export function DropdownMenuContent({
  className,
  children,
  align = "end",
  sideOffset = 4,
}: DropdownMenuContentProps) {
  const { open, setOpen, triggerRef } = useDropdownMenu();

  if (!open) return null;

  return (
    <div
      data-dropdown-menu-content
      className={cn(
        "fixed z-50 min-w-[12rem] overflow-hidden rounded-lg border border-neutral-200 bg-white p-1 text-neutral-900 shadow-lg animate-in fade-in-0 zoom-in-95",
        align === "end" ? "right-0" : "left-0",
        className,
      )}
      style={{ marginTop: sideOffset }}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  className,
  inset,
  onSelect,
  asChild = false,
  children,
  ...props
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenu();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onSelect?.();
    setOpen(false);
    props.onClick?.(e);
  };

  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement;
    return React.cloneElement(child, {
      onClick: handleClick,
      ...props,
    });
  }

  return (
    <button
      className={cn(
        "flex w-full items-center px-2 py-1.5 text-sm outline-none transition-colors",
        "focus:bg-primary-50/60 focus:text-primary-900",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: DropdownMenuSeparatorProps) {
  return (
    <div className={cn("-mx-1 my-1 h-px bg-neutral-100", className)} {...props} />
  );
}

export function DropdownMenuLabel({
  className,
  inset,
  children,
  ...props
}: DropdownMenuLabelProps) {
  return (
    <div
      className={cn(
        "px-2 py-1.5 text-sm font-semibold text-neutral-900",
        inset && "pl-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("", className)}>{children}</div>;
}

export const DropdownMenuPortal = ({
  children,
}: {
  children: React.ReactNode;
}) => <>{children}</>;
export const DropdownMenuSub = ({
  children,
}: {
  children: React.ReactNode;
}) => <>{children}</>;
export const DropdownMenuSubContent = ({
  children,
}: {
  children: React.ReactNode;
}) => <>{children}</>;
export const DropdownMenuSubTrigger = ({
  children,
}: {
  children: React.ReactNode;
}) => <>{children}</>;
export const DropdownMenuRadioGroup = ({
  children,
}: {
  children: React.ReactNode;
}) => <>{children}</>;
export const DropdownMenuCheckboxItem = ({
  children,
}: {
  children: React.ReactNode;
}) => <>{children}</>;
export const DropdownMenuRadioItem = ({
  children,
}: {
  children: React.ReactNode;
}) => <>{children}</>;
export const DropdownMenuShortcut = ({
  children,
}: {
  children: React.ReactNode;
}) => <>{children}</>;
