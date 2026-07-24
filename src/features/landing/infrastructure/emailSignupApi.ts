import { fetchAdapter } from "@/core/http/fetchAdapter";
import { API_BASE_URL } from "@/core/config";

export async function submitEmailSignup(email: string): Promise<string> {
  const res = await fetchAdapter.post(
    `${API_BASE_URL}/email-signups`,
    JSON.stringify({ email, consent: true }),
    { headers: { "Content-Type": "application/json" } },
  );
  if (!res.ok) {
    throw new Error(`No se pudo registrar el email (${res.status}).`);
  }
  const { code } = (await res.json()) as { code: string };
  return code;
}
