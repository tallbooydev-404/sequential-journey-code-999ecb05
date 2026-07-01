import { createServerFn } from "@tanstack/react-start";

/**
 * Resolves a user-facing login (email, raw Telegram user_id, "tg<chatId>", or telegram username)
 * to the actual auth email used in Supabase. Returns the email or null.
 *
 * Public function — only returns synthetic emails (no PII).
 */
export const resolveLoginEmail = createServerFn({ method: "POST" })
  .inputValidator((data: { login: string }) => ({
    login: String(data?.login ?? "").trim(),
  }))
  .handler(async ({ data }) => {
    const login = data.login;
    if (!login) return { email: null as string | null };

    // 1) Already an email
    if (login.includes("@")) return { email: login };

    // 2) Raw Telegram user_id or tg<digits> pattern
    const rawUserId = login.match(/^(\d+)$/);
    if (rawUserId) return { email: `tg${rawUserId[1]}@telegram.local` };
    const m = login.match(/^tg(\d+)$/i);
    if (m) return { email: `tg${m[1]}@telegram.local` };

    // 3) Telegram username lookup
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const cleaned = login.replace(/^@/, "");
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("telegram_id")
      .ilike("telegram_username", cleaned)
      .maybeSingle();

    if (profile?.telegram_id) {
      return { email: `tg${profile.telegram_id}@telegram.local` };
    }
    return { email: null };
  });
