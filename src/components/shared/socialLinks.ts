import type { IconType } from "react-icons";
import { PiTiktokLogoLight, PiWhatsappLogoLight, PiXLogoLight } from "react-icons/pi";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa6";

export const SOCIAL_NAMES: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  x: "X",
  youtube: "YouTube",
};

export const SOCIAL_ICONS: Record<string, IconType> = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  tiktok: PiTiktokLogoLight,
  whatsapp: PiWhatsappLogoLight,
  x: PiXLogoLight,
  youtube: FaYoutube,
};
