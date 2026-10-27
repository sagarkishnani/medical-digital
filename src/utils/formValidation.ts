export type FormType = "contacto" | "cotizacion" | "servicio-tecnico";
export type FormValues = Record<string, string | boolean | undefined>;
export type FieldErrors = Record<string, string>;

interface FieldRule {
  required?: boolean;
  kind?: "name" | "email" | "phone" | "message";
  minLength?: number;
  maxLength: number;
}

const firstName: FieldRule = { required: true, kind: "name", minLength: 3, maxLength: 50 };
const lastName: FieldRule = { required: true, kind: "name", minLength: 3, maxLength: 100 };
const email: FieldRule = { required: true, kind: "email", maxLength: 100 };
const phone: FieldRule = { required: true, kind: "phone", maxLength: 11 };
const institution: FieldRule = { required: true, minLength: 3, maxLength: 100 };
const optionalMessage: FieldRule = { kind: "message", minLength: 10, maxLength: 500 };

// Debe coincidir con FORMS de public/send-email.php.
export const FORM_FIELDS: Record<FormType, Record<string, FieldRule>> = {
  contacto: {
    firstName,
    lastName,
    phone,
    email,
    position: { minLength: 3, maxLength: 50 },
    institution,
    location: { required: true, maxLength: 120 },
    specialty: { maxLength: 120 },
    message: optionalMessage,
  },
  cotizacion: {
    name: { required: true, kind: "name", minLength: 3, maxLength: 100 },
    institution,
    email,
    phone,
    message: optionalMessage,
  },
  "servicio-tecnico": {
    firstName,
    lastName,
    email,
    phone,
    institution,
    brand: { required: true, minLength: 2, maxLength: 50 },
    model: { required: true, minLength: 1, maxLength: 50 },
    serial: { required: true, minLength: 1, maxLength: 50 },
    message: { ...optionalMessage, required: true },
  },
};

export const OTHER_BRAND_VALUE = "otra";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_PATTERN = /^[\p{L}\s'-]+$/u;
const PHONE_PATTERN = /^\d{7,11}$/;

export const ERROR_MESSAGES = {
  required: "Este campo es obligatorio.",
  tooShort: (min: number) => `Escribe al menos ${min} caracteres.`,
  tooLong: (max: number) => `Escribe como máximo ${max} caracteres.`,
  name: "Usa solo letras, espacios, apóstrofo o guion.",
  email: "Ingresa un correo válido, por ejemplo nombre@institucion.com.",
  phone: "Ingresa un teléfono válido, solo números, de 7 a 11 dígitos.",
  brandOther: "Escribe la marca del equipo.",
  consent: "Debes aceptar la política de datos personales.",
};

function ruleError(rule: FieldRule, rawValue: FormValues[string]): string | undefined {
  const value = typeof rawValue === "string" ? rawValue.trim() : "";

  if (!value) return rule.required ? ERROR_MESSAGES.required : undefined;
  if (rule.kind === "phone") return PHONE_PATTERN.test(value) ? undefined : ERROR_MESSAGES.phone;
  if (rule.minLength && value.length < rule.minLength) return ERROR_MESSAGES.tooShort(rule.minLength);
  if (value.length > rule.maxLength) return ERROR_MESSAGES.tooLong(rule.maxLength);
  if (rule.kind === "email" && !EMAIL_PATTERN.test(value)) return ERROR_MESSAGES.email;
  if (rule.kind === "name" && !NAME_PATTERN.test(value)) return ERROR_MESSAGES.name;
  return undefined;
}

function brandOtherError(rule: FieldRule, value: FormValues[string]): string | undefined {
  const error = ruleError(rule, value);
  return error === ERROR_MESSAGES.required ? ERROR_MESSAGES.brandOther : error;
}

export function validateField(formType: FormType, name: string, values: FormValues): string | undefined {
  if (name === "consent") return values.consent === true ? undefined : ERROR_MESSAGES.consent;

  const fields = FORM_FIELDS[formType];
  if (name === "brandOther") {
    return values.brand === OTHER_BRAND_VALUE ? brandOtherError(fields.brand, values.brandOther) : undefined;
  }
  if (name === "brand" && values.brand === OTHER_BRAND_VALUE) return undefined;

  const rule = fields[name];
  return rule ? ruleError(rule, values[name]) : undefined;
}

export function validateForm(formType: FormType, values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  const names = [...Object.keys(FORM_FIELDS[formType]), "brandOther", "consent"];

  for (const name of names) {
    const error = validateField(formType, name, values);
    if (error) errors[name] = error;
  }

  return errors;
}
