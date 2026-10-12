const PANEL_TRANSITION = "duration-300 ease-out";

export function panelMotion(open: boolean, closedOffset = "") {
  return open
    ? `visible translate-y-0 opacity-100 transition-[opacity,transform] ${PANEL_TRANSITION}`
    : `pointer-events-none invisible opacity-0 transition-[opacity,transform,visibility] ${closedOffset} ${PANEL_TRANSITION}`;
}
