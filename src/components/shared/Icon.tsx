import type { IconType } from "react-icons";
import {
  PiAmbulanceLight,
  PiBedLight,
  PiCertificateLight,
  PiFirstAidLight,
  PiHandshakeLight,
  PiHeadsetLight,
  PiHeartbeatLight,
  PiHeartLight,
  PiHospitalLight,
  PiLightbulbLight,
  PiMedalLight,
  PiMicroscopeLight,
  PiMonitorLight,
  PiShieldCheckLight,
  PiShieldPlusLight,
  PiStethoscopeLight,
  PiUserLight,
  PiWindLight,
} from "react-icons/pi";

const ICONS: Record<string, IconType> = {
  heart: PiHeartLight,
  "heart-pulse": PiHeartbeatLight,
  ambulance: PiAmbulanceLight,
  stethoscope: PiStethoscopeLight,
  hospital: PiHospitalLight,
  "kit-medical": PiFirstAidLight,
  monitor: PiMonitorLight,
  lungs: PiWindLight,
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
