import type { IconType } from "react-icons";
import {
  PiAmbulanceLight,
  PiBedLight,
  PiCertificateLight,
  PiFirstAidLight,
  PiGraduationCapLight,
  PiHandshakeLight,
  PiHeadsetLight,
  PiHeartLight,
  PiHospitalLight,
  PiLightbulbLight,
  PiMedalLight,
  PiMicroscopeLight,
  PiMonitorLight,
  PiShieldCheckLight,
  PiShieldPlusLight,
  PiStethoscopeLight,
  PiTruckLight,
  PiUserLight,
} from "react-icons/pi";
import { AmbulanceSirenIcon, HeartPulseIcon, LungsIcon } from "./designIcons";

const ICONS: Record<string, IconType> = {
  heart: PiHeartLight,
  "heart-pulse": HeartPulseIcon,
  ambulance: PiAmbulanceLight,
  "ambulance-siren": AmbulanceSirenIcon,
  stethoscope: PiStethoscopeLight,
  hospital: PiHospitalLight,
  "kit-medical": PiFirstAidLight,
  monitor: PiMonitorLight,
  lungs: LungsIcon,
  bed: PiBedLight,
  "user-doctor": PiUserLight,
  microscope: PiMicroscopeLight,
  handshake: PiHandshakeLight,
  certificate: PiCertificateLight,
  shield: PiShieldPlusLight,
  "shield-check": PiShieldCheckLight,
  lightbulb: PiLightbulbLight,
  headset: PiHeadsetLight,
  medal: PiMedalLight,
  truck: PiTruckLight,
  "graduation-cap": PiGraduationCapLight,
};

interface Props {
  name?: string | null;
  fallback?: string;
  className?: string;
}

export default function Icon({ name, fallback, className }: Props) {
  const Glyph = (name && ICONS[name]) || (fallback && ICONS[fallback]);
  if (!Glyph) return null;
  return <Glyph aria-hidden="true" className={className} />;
}
