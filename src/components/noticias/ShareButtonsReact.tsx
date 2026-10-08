import { useEffect, useRef, useState } from "react";
import { FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";
import { PiLinkLight, PiShareNetworkLight } from "react-icons/pi";

interface Props {
  url: string;
  title: string;
}

const COPIED_MS = 2000;
const circleClassName =
  "flex h-11 w-11 items-center justify-center rounded-full border border-line text-brand-secondary-dark transition-colors duration-200 can-hover:hover:bg-greyscale-lightest";

export default function ShareButtonsReact({ url, title }: Props) {
  const [copied, setCopied] = useState(false);
  const [canCopy, setCanCopy] = useState(true);
  const [canShare, setCanShare] = useState(true);
  const timer = useRef<number>();

  useEffect(() => {
    setCanCopy(Boolean(navigator.clipboard?.writeText));
    setCanShare(Boolean(navigator.share) || Boolean(navigator.clipboard?.writeText));
    return () => window.clearTimeout(timer.current);
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      setCopied(false);
    }
  };

  const shareNative = async () => {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({ title, url });
    } catch {
      return;
    }
  };

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;

  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="hidden items-center gap-2 md:flex">
        <a href={linkedinUrl} target="_blank" rel="noopener" aria-label="Compartir en LinkedIn" className={circleClassName}>
          <FaLinkedinIn aria-hidden="true" className="h-[18px] w-[18px]" />
        </a>
        <a href={whatsappUrl} target="_blank" rel="noopener" aria-label="Compartir por WhatsApp" className={circleClassName}>
          <FaWhatsapp aria-hidden="true" className="h-5 w-5" />
        </a>
        {canCopy && (
          <button type="button" onClick={copyLink} aria-label="Copiar enlace" className={circleClassName}>
            <PiLinkLight aria-hidden="true" className="h-5 w-5" />
          </button>
        )}
      </div>
      {canShare && (
        <button
          type="button"
          onClick={shareNative}
          aria-label="Compartir"
          className="-mr-2.5 flex h-11 w-11 items-center justify-center text-brand-secondary-dark md:hidden"
        >
          <PiShareNetworkLight aria-hidden="true" className="h-6 w-6" />
        </button>
      )}
      <span role="status" aria-live="polite" className={copied ? "text-caption text-content-subtle md:text-[13px]" : "sr-only"}>
        {copied ? "Enlace copiado" : ""}
      </span>
    </div>
  );
}
