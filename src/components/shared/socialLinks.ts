import type { IconType } from "react-icons";
import {
  PiFacebookLogoLight,
  PiInstagramLogoLight,
  PiLinkedinLogoLight,
  PiTiktokLogoLight,
  PiWhatsappLogoLight,
  PiXLogoLight,
  PiYoutubeLogoLight,
} from "react-icons/pi";

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
  facebook: PiFacebookLogoLight,
  instagram: PiInstagramLogoLight,
  linkedin: PiLinkedinLogoLight,
  tiktok: PiTiktokLogoLight,
  whatsapp: PiWhatsappLogoLight,
  x: PiXLogoLight,
  youtube: PiYoutubeLogoLight,
};
