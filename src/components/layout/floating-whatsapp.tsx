"use client";

import { usePathname } from "@/i18n/navigation";
import { buildWhatsAppUrl } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

interface FloatingWhatsAppProps {
  phone: string;
  defaultMessage: string;
  label: string;
  enabled?: boolean;
}

export function FloatingWhatsApp({
  phone,
  defaultMessage,
  label,
  enabled = true,
}: FloatingWhatsAppProps) {
  const pathname = usePathname();

  if (!enabled || !phone) return null;

  const contextualMessage = `${defaultMessage} (Context: ${pathname})`;
  const href = buildWhatsAppUrl(phone, contextualMessage);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-emerald-400"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-30" />
      <MessageCircle className="relative h-6 w-6" />
    </a>
  );
}
