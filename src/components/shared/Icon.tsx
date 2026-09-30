import type { IconType } from "react-icons";
import {
  FaBed,
  FaCertificate,
  FaDesktop,
  FaHandshake,
  FaHeadset,
  FaHeart,
  FaHeartPulse,
  FaHospital,
  FaKitMedical,
  FaLightbulb,
  FaLungs,
  FaMedal,
  FaMicroscope,
  FaShieldHalved,
  FaStethoscope,
  FaTruckMedical,
  FaUserDoctor,
} from "react-icons/fa6";

const ICONS: Record<string, IconType> = {
  heart: FaHeart,
  "heart-pulse": FaHeartPulse,
  ambulance: FaTruckMedical,
  stethoscope: FaStethoscope,
  hospital: FaHospital,
  "kit-medical": FaKitMedical,
  monitor: FaDesktop,
  lungs: FaLungs,
  bed: FaBed,
  "user-doctor": FaUserDoctor,
  microscope: FaMicroscope,
  handshake: FaHandshake,
  certificate: FaCertificate,
  shield: FaShieldHalved,
  lightbulb: FaLightbulb,
  headset: FaHeadset,
  medal: FaMedal,
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
