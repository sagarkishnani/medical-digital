import { withBase } from "./url";
import type { FieldErrors, FormType, FormValues } from "./formValidation";

export interface SubmitResult {
  success: boolean;
  correlativo?: string;
  error?: string;
  fields?: FieldErrors;
}

interface SubmitOptions {
  formType: FormType;
  values: FormValues;
  honeypot: string;
  captchaToken?: string;
}

function formsEndpoint(): string {
  return import.meta.env.PUBLIC_FORMS_ENDPOINT || withBase("/send-email.php");
}

export async function submitForm({ formType, values, honeypot, captchaToken }: SubmitOptions): Promise<SubmitResult> {
  try {
    const response = await fetch(formsEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, formType, website: honeypot, captchaToken: captchaToken || "" }),
    });
    const result = await response.json();
    if (!result || typeof result !== "object") return { success: false };
    return {
      success: response.ok && result.success === true,
      correlativo: typeof result.correlativo === "string" ? result.correlativo : undefined,
      error: typeof result.error === "string" ? result.error : undefined,
      fields: result.fields && typeof result.fields === "object" ? result.fields : undefined,
    };
  } catch {
    return { success: false };
  }
}
