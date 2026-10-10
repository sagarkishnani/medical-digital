import type { APIRoute } from "astro";
import client from "../../tina/__generated__/client";

export const GET: APIRoute = async () => {
  const result = await client.queries.formConfig({ relativePath: "index.json" });
  const forms = (result.data.formConfig.forms ?? []).filter(Boolean).map((form) => ({
    formType: form?.formType ?? "",
    enabled: form?.enabled !== false,
    recipients: (form?.recipients ?? []).filter((email): email is string => Boolean(email?.trim())).map((email) => email.trim()),
  }));

  return new Response(JSON.stringify({ forms }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
};
