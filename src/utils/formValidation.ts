export type FormType = "contacto" | "cotizacion" | "servicio-tecnico";
export type FormValues = Record<string, string | boolean | undefined>;
export type FieldErrors = Record<string, string>;

interface FieldRule {
  required?: boolean;
  kind?: "email" | "phone" | "message";
}

export const FORM_FIELDS: Record<FormType, Record<string, FieldRule>> = {
  contacto: {
    firstName: { required: true },
    lastName: { required: true },
    phone: { required: true, kind: "phone" },
    email: { required: true, kind: "email" },
    position: {},
    institution: { required: true },
    location: { required: true },
    specialty: {},
    message: { kind: "message" },
  },
  cotizacion: {
    name: { required: true },
    institution: { required: true },
    email: { required: true, kind: "email" },
    phone: { required: true, kind: "phone" },
    message: { kind: "message" },
  },
  "servicio-tecnico": {
    firstName: { required: true },
    lastName: { required: true },
    email: { required: true, kind: "email" },
    phone: { required: true, kind: "phone" },
    institution: { required: true },
    brand: { required: true },
    model: { required: true },
    serial: { required: true },
    message: { required: true, kind: "message" },
  },
};

export const MAX_TEXT_LENGTH = 120;
export const MAX_MESSAGE_LENGTH = 3000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARACTERS = /^[+\d\s()-]+$/;

export const ERROR_MESSAGES = {
  required: "Este campo es obligatorio.",
  email: "Ingresa un correo válido, por ejemplo nombre@institucion.com.",
  phone: "Ingresa un teléfono válido, de 7 a 15 dígitos.",
  tooLong: (max: number) => `Escribe como máximo ${max} caracteres.`,
  consent: "Debes aceptar la política de datos personales.",
};

function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "").length;
  return PHONE_CHARACTERS.test(value) && digits >= 7 && digits <= 15;
}

export function validateForm(formType: FormType, values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  for (const [name, rule] of Object.entries(FORM_FIELDS[formType])) {
    const value = typeof values[name] === "string" ? (values[name] as string).trim() : "";
    const maxLength = rule.kind === "message" ? MAX_MESSAGE_LENGTH : MAX_TEXT_LENGTH;

    if (!value) {
      if (rule.required) errors[name] = ERROR_MESSAGES.required;
    } else if (value.length > maxLength) {
      errors[name] = ERROR_MESSAGES.tooLong(maxLength);
    } else if (rule.kind === "email" && !EMAIL_PATTERN.test(value)) {
      errors[name] = ERROR_MESSAGES.email;
    } else if (rule.kind === "phone" && !isValidPhone(value)) {
      errors[name] = ERROR_MESSAGES.phone;
    }
  }

  if (values.consent !== true) errors.consent = ERROR_MESSAGES.consent;

  return errors;
}
