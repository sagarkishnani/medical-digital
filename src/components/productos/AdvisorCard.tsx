import { PiHeadsetLight } from "react-icons/pi";

interface Props {
  advisorUrl: string;
  className?: string;
}

export default function AdvisorCard({ advisorUrl, className = "" }: Props) {
  return (
    <div className={`flex flex-col gap-2.5 rounded-2xl bg-gradient-primary p-6 text-white lg:gap-3 lg:px-6 lg:pb-6 lg:pt-7 ${className}`}>
      <PiHeadsetLight aria-hidden="true" className="h-8 w-8 lg:h-9 lg:w-9" />
      <p className="text-heading-h4">¿Necesitas ayuda?</p>
      <p className="text-body-sm text-brand-tertiary-lightest">
        <span className="lg:hidden">Te orientamos para elegir el equipo ideal.</span>
        <span className="hidden lg:inline">Nuestros asesores te orientan para elegir el equipo ideal.</span>
      </p>
      <button
        type="button"
        data-quote-name="Asesoría comercial"
        data-quote-url={advisorUrl}
        aria-haspopup="dialog"
        className="btn mt-1.5 bg-surface-raised text-body-md text-brand-secondary-dark hover:bg-surface"
      >
        Hablar con un asesor
      </button>
    </div>
  );
}
