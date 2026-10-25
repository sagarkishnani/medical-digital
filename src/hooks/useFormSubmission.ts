import { useCallback, useId, useState } from "react";
import type { FocusEvent, FormEvent } from "react";
import { turnstileEnabled } from "../components/shared/Turnstile";
import { OTHER_BRAND_VALUE, validateField, validateForm } from "../utils/formValidation";
import type { FieldErrors, FormType, FormValues } from "../utils/formValidation";
import { submitForm } from "../utils/submitForm";

export type FormStatus = "idle" | "sending" | "success" | "error";

const CAPTCHA_MESSAGE = "Completa la verificación de seguridad.";

function readValues(form: HTMLFormElement): { values: FormValues; honeypot: string } {
  const values: FormValues = {};
  let honeypot = "";
  for (const [name, value] of new FormData(form).entries()) {
    if (typeof value !== "string") continue;
    if (name === "website") honeypot = value;
    else values[name] = value.trim();
  }
  const consent = form.elements.namedItem("consent");
  values.consent = consent instanceof HTMLInputElement && consent.checked;
  return { values, honeypot };
}

function withChosenBrand(values: FormValues): FormValues {
  const { brandOther, ...rest } = values;
  return rest.brand === OTHER_BRAND_VALUE ? { ...rest, brand: brandOther } : rest;
}

function focusFirstInvalid(form: HTMLFormElement, errors: FieldErrors) {
  for (const element of Array.from(form.elements)) {
    if (element instanceof HTMLElement && "name" in element && errors[element.name as string]) {
      element.focus();
      return;
    }
  }
}

export function useFormSubmission(formType: FormType, extraValues: FormValues = {}) {
  const formId = useId();
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);
  const [attempted, setAttempted] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const { values, honeypot } = readValues(form);
    Object.assign(values, extraValues);
    setAttempted(true);

    const fieldErrors = validateForm(formType, values);
    if (turnstileEnabled && !captchaToken) fieldErrors.captcha = CAPTCHA_MESSAGE;
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      focusFirstInvalid(form, fieldErrors);
      return;
    }

    setErrors({});
    setStatus("sending");
    const result = await submitForm({ formType, values: withChosenBrand(values), honeypot, captchaToken });
    if (result.success) {
      setStatus("success");
      return;
    }
    if (result.fields && Object.keys(result.fields).length > 0) {
      setErrors(result.fields);
      focusFirstInvalid(form, result.fields);
    }
    setStatus("error");
    if (turnstileEnabled) setCaptchaResetSignal((signal) => signal + 1);
  };

  const clearFieldError = (event: FormEvent<HTMLFormElement>) => {
    const name = (event.target as HTMLInputElement).name;
    if (!name || !errors[name]) return;
    setErrors(({ [name]: _cleared, ...rest }) => rest);
  };

  const handleBlur = (event: FocusEvent<HTMLFormElement>) => {
    const name = (event.target as EventTarget as HTMLInputElement).name;
    if (!attempted || !name) return;
    const { values } = readValues(event.currentTarget);
    const error = validateField(formType, name, { ...values, ...extraValues });
    setErrors(({ [name]: _previous, ...rest }) => (error ? { ...rest, [name]: error } : rest));
  };

  const reset = useCallback(() => {
    setStatus("idle");
    setAttempted(false);
    setErrors({});
    setCaptchaToken("");
  }, []);

  return {
    formId,
    status,
    errors,
    handleSubmit,
    clearFieldError,
    handleBlur,
    reset,
    captcha: { onToken: setCaptchaToken, resetSignal: captchaResetSignal },
  };
}
