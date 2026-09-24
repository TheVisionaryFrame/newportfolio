import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { ContactMessage, ContactMessageInsert, ContactMessageUpdate } from "@/lib/contact-messages";

function readServerEnv(name: string): string {
  let value = process.env[name]?.trim() ?? "";
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }
  return value;
}

function serverSupabase(accessToken?: string): SupabaseClient {
  const url = readServerEnv("SUPABASE_URL").replace(/\/+$/, "");
  const key = readServerEnv("SUPABASE_ANON_KEY");
  if (!url || !key) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    ...(accessToken ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } } : {}),
  });
}

export const getSupabaseConfigured = createServerFn({ method: "GET" }).handler(async () => {
  return Boolean(readServerEnv("SUPABASE_URL") && readServerEnv("SUPABASE_ANON_KEY"));
});

export const signInAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; password: string }) => input)
  .handler(async ({ data }) => {
    const supabase = serverSupabase();
    const { data: auth, error } = await supabase.auth.signInWithPassword({
      email: data.email.trim().toLowerCase(),
      password: data.password,
    });
    if (error || !auth.session) {
      return { ok: false as const, message: error?.message ?? "Sign-in failed." };
    }
    return {
      ok: true as const,
      accessToken: auth.session.access_token,
      email: auth.user.email ?? data.email,
    };
  });

export const signOutAdmin = createServerFn({ method: "POST" })
  .inputValidator((accessToken: string) => accessToken)
  .handler(async ({ data: accessToken }) => {
    const supabase = serverSupabase(accessToken);
    await supabase.auth.signOut();
    return { ok: true as const };
  });

export const listContactMessages = createServerFn({ method: "POST" })
  .inputValidator((accessToken: string) => accessToken)
  .handler(async ({ data: accessToken }) => {
    const supabase = serverSupabase(accessToken);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const, messages: (data ?? []) as ContactMessage[] };
  });

export const updateContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input: { accessToken: string; id: string; patch: ContactMessageUpdate }) => input)
  .handler(async ({ data }) => {
    const supabase = serverSupabase(data.accessToken);
    const { data: row, error } = await supabase
      .from("contact_messages")
      .update(data.patch)
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const, message: row as ContactMessage };
  });

export const deleteContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input: { accessToken: string; id: string }) => input)
  .handler(async ({ data }) => {
    const supabase = serverSupabase(data.accessToken);
    const { error } = await supabase.from("contact_messages").delete().eq("id", data.id);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input: ContactMessageInsert) => input)
  .handler(async ({ data }) => {
    const supabase = serverSupabase();
    const { error } = await supabase.from("contact_messages").insert(data);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });
