import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { Session, User } from "@supabase/supabase-js";
import { Loader2, LogOut, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CONTACT_MESSAGE_STATUSES,
  type ContactMessage,
  type ContactMessageStatus,
  emptyToNull,
  formatMessageDate,
  previewText,
} from "@/lib/contact-messages";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

const fieldClass =
  "h-11 rounded-xl border-border bg-muted/25 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring";

const selectTriggerClass =
  "h-11 w-full rounded-xl border border-border bg-muted/25 px-3 text-sm text-foreground shadow-sm outline-none transition-colors focus:ring-1 focus:ring-ring data-[placeholder]:text-muted-foreground";

const selectContentClass =
  "z-[80] rounded-xl border-border bg-card text-card-foreground shadow-lg";

const selectItemClass =
  "cursor-pointer rounded-lg text-card-foreground focus:bg-muted focus:text-card-foreground data-[highlighted]:bg-muted data-[highlighted]:text-card-foreground";

const labelClass = "text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground";

const INQUIRY_TYPES = [
  "Collaboration",
  "Business inquiry",
  "Press / media",
  "Fan message",
  "Sponsorship",
  "Other",
] as const;

const CONTACT_METHODS = ["Email", "Social DM", "Either"] as const;

const BUDGET_RANGES = [
  "Under $500",
  "$500 – $1,500",
  "$1,500 – $5,000",
  "$5,000 – $10,000",
  "$10,000+",
  "Not sure / open",
] as const;

type EditForm = {
  name: string;
  email: string;
  inquiry_type: string;
  message: string;
  social_handle: string;
  preferred_contact: string;
  brand_name: string;
  website: string;
  budget_range: string;
  campaign_goal: string;
  timeline: string;
  status: ContactMessageStatus;
};

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "The Visionary Frame" },
      {
        name: "description",
        content: "Admin sign-in for The Visionary Frame contact submissions.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "The Visionary Frame" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [configError] = useState(() =>
    isSupabaseConfigured()
      ? null
      : "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.",
  );

  useEffect(() => {
    if (configError) {
      setAuthReady(true);
      return;
    }

    const supabase = getSupabase();
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [configError]);

  if (configError) {
    return (
      <AdminShell>
        <div className="mx-auto max-w-md rounded-xl border border-border bg-card/40 p-6 text-sm leading-6">
          <h1 className="section-title text-2xl">Admin</h1>
          <p className="mt-4 text-destructive" role="alert">
            {configError}
          </p>
        </div>
      </AdminShell>
    );
  }

  // Until session is known (and whenever signed out), show only the auth screen —
  // never the message inbox.
  if (!authReady || !session || !user) {
    return (
      <AdminShell>
        <AdminSignIn checkingSession={!authReady} />
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <AdminInbox userEmail={user.email ?? "signed in"} />
    </AdminShell>
  );
}

function AdminShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.28 0.02 85 / 0.45), transparent)," +
            "radial-gradient(ellipse 60% 40% at 100% 100%, oklch(0.22 0.01 240 / 0.35), transparent)," +
            "linear-gradient(180deg, oklch(0.14 0 0), oklch(0.16 0 0))",
        }}
      />
      <div className="relative site-shell border-b border-border pb-20 pt-10 md:pb-28 md:pt-14">
        {children}
      </div>
    </main>
  );
}

function AdminSignIn({ checkingSession = false }: { checkingSession?: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (checkingSession) return;
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await getSupabase().auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (signInError) {
        const code = signInError.code ?? "";
        if (code === "invalid_credentials" || /invalid login credentials/i.test(signInError.message)) {
          setError(
            "Those credentials don’t match a user in this Supabase project. In the dashboard, open Authentication → Users and add this email with Auto Confirm turned on. Use that password, not your Supabase account or database password.",
          );
        } else if (code === "email_not_confirmed" || /email not confirmed/i.test(signInError.message)) {
          setError(
            "This user exists, but the email is not confirmed. In Authentication → Users, confirm the user or turn on Auto Confirm, then sign in again.",
          );
        } else {
          setError(signInError.message || "Sign-in failed. Check your credentials.");
        }
      }
    } catch {
      setError("Unable to reach authentication. Try again shortly.");
    } finally {
      setLoading(false);
    }
  }

  const busy = loading || checkingSession;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col">
      <div className="mb-10 text-center">
        <p className="eyebrow mb-3">The Visionary Frame</p>
        <h1 className="section-title">Admin</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-border bg-card/50 p-6 shadow-[0_0_0_1px_oklch(1_0_0_/_4%)] backdrop-blur-sm md:p-8"
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="admin-email" className={labelClass}>
            Email
          </Label>
          <Input
            id="admin-email"
            name="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
            disabled={busy}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-password" className={labelClass}>
            Password
          </Label>
          <Input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass}
            disabled={busy}
            required
          />
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={busy}
          className="h-11 w-full rounded-xl bg-foreground text-background hover:bg-foreground/85"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Signing in…
            </>
          ) : checkingSession ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Checking session…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        <Link to="/" className="underline-offset-4 hover:underline">
          Back to site
        </Link>
      </p>
    </div>
  );
}

function toEditForm(message: ContactMessage): EditForm {
  return {
    name: message.name,
    email: message.email,
    inquiry_type: message.inquiry_type,
    message: message.message,
    social_handle: message.social_handle ?? "",
    preferred_contact: message.preferred_contact ?? "",
    brand_name: message.brand_name ?? "",
    website: message.website ?? "",
    budget_range: message.budget_range ?? "",
    campaign_goal: message.campaign_goal ?? "",
    timeline: message.timeline ?? "",
    status: message.status,
  };
}

function AdminInbox({ userEmail }: { userEmail: string }) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const selected = messages.find((m) => m.id === selectedId) ?? null;

  async function loadMessages() {
    setLoading(true);
    setListError(null);
    try {
      const { data, error } = await getSupabase()
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setListError(error.message || "Could not load submissions.");
        setMessages([]);
        return;
      }

      const rows = (data ?? []) as ContactMessage[];
      setMessages(rows);
      setSelectedId((current) => {
        if (current && rows.some((row) => row.id === current)) return current;
        return rows[0]?.id ?? null;
      });
    } catch {
      setListError("Unable to load submissions. Check your connection.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMessages();
  }, []);

  useEffect(() => {
    if (!selected) {
      setEditForm(null);
      return;
    }
    setEditForm(toEditForm(selected));
    setSaveError(null);
    setSaveOk(false);
  }, [selectedId, selected?.updated_at]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await getSupabase().auth.signOut();
    } finally {
      setSigningOut(false);
    }
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!selected || !editForm) return;

    setSaving(true);
    setSaveError(null);
    setSaveOk(false);

    const payload = {
      name: editForm.name.trim(),
      email: editForm.email.trim().toLowerCase(),
      inquiry_type: editForm.inquiry_type,
      message: editForm.message.trim(),
      social_handle: emptyToNull(editForm.social_handle),
      preferred_contact: emptyToNull(editForm.preferred_contact),
      brand_name: emptyToNull(editForm.brand_name),
      website: emptyToNull(editForm.website),
      budget_range: emptyToNull(editForm.budget_range),
      campaign_goal: emptyToNull(editForm.campaign_goal),
      timeline: emptyToNull(editForm.timeline),
      status: editForm.status,
    };

    if (!payload.name || !payload.email || !payload.message || !payload.inquiry_type) {
      setSaveError("Name, email, inquiry type, and message are required.");
      setSaving(false);
      return;
    }

    try {
      const { data, error } = await getSupabase()
        .from("contact_messages")
        .update(payload)
        .eq("id", selected.id)
        .select("*")
        .single();

      if (error) {
        setSaveError(error.message || "Save failed.");
        return;
      }

      const updated = data as ContactMessage;
      setMessages((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
      setSaveOk(true);
    } catch {
      setSaveError("Unable to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const { error } = await getSupabase().from("contact_messages").delete().eq("id", deleteId);
      if (error) {
        setListError(error.message || "Delete failed.");
        return;
      }
      setMessages((prev) => prev.filter((row) => row.id !== deleteId));
      if (selectedId === deleteId) setSelectedId(null);
    } catch {
      setListError("Unable to delete that submission.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-3">Inbox</p>
          <h1 className="section-title">Admin</h1>
          <p className="mt-3 text-sm text-muted-foreground">Signed in as {userEmail}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => void loadMessages()}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => void handleSignOut()}
            disabled={signingOut}
          >
            <LogOut className="size-4" aria-hidden="true" />
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </div>

      {listError ? (
        <p className="mb-6 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-destructive" role="alert">
          {listError}
        </p>
      ) : null}

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading submissions…
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/30 px-6 py-16 text-center">
          <p className="text-base font-medium text-foreground">No submissions yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Messages from the contact page will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card/40">
            {messages.map((row) => {
              const active = row.id === selectedId;
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(row.id)}
                    className={
                      "w-full px-4 py-4 text-left transition-colors sm:px-5 " +
                      (active ? "bg-muted/50" : "hover:bg-muted/25")
                    }
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate font-medium text-foreground">{row.name}</p>
                      <time
                        className="shrink-0 text-[11px] uppercase tracking-[0.08em] text-muted-foreground"
                        dateTime={row.created_at}
                      >
                        {formatMessageDate(row.created_at)}
                      </time>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{row.email}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.1em] text-muted-foreground">
                      {row.inquiry_type}
                      <span className="mx-2 text-border">·</span>
                      {row.status}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-foreground/80">
                      {previewText(row.message, 140)}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="rounded-xl border border-border bg-card/40 p-5 md:p-6">
            {editForm && selected ? (
              <form onSubmit={handleSave} className="space-y-5" noValidate>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">Edit submission</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Received {formatMessageDate(selected.created_at)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(selected.id)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Delete
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="Name" htmlFor="edit-name">
                    <Input
                      id="edit-name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className={fieldClass}
                      required
                    />
                  </AdminField>
                  <AdminField label="Email" htmlFor="edit-email">
                    <Input
                      id="edit-email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className={fieldClass}
                      required
                    />
                  </AdminField>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="Inquiry type" htmlFor="edit-inquiry">
                    <Select
                      value={editForm.inquiry_type}
                      onValueChange={(value) => setEditForm({ ...editForm, inquiry_type: value })}
                    >
                      <SelectTrigger id="edit-inquiry" className={selectTriggerClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={selectContentClass}>
                        {INQUIRY_TYPES.map((type) => (
                          <SelectItem key={type} value={type} className={selectItemClass}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </AdminField>
                  <AdminField label="Status" htmlFor="edit-status">
                    <Select
                      value={editForm.status}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, status: value as ContactMessageStatus })
                      }
                    >
                      <SelectTrigger id="edit-status" className={selectTriggerClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={selectContentClass}>
                        {CONTACT_MESSAGE_STATUSES.map((status) => (
                          <SelectItem key={status} value={status} className={selectItemClass}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </AdminField>
                </div>

                <AdminField label="Message" htmlFor="edit-message">
                  <Textarea
                    id="edit-message"
                    rows={6}
                    value={editForm.message}
                    onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                    className={`${fieldClass} min-h-[9rem] py-3`}
                    required
                  />
                </AdminField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="Social handle" htmlFor="edit-social">
                    <Input
                      id="edit-social"
                      value={editForm.social_handle}
                      onChange={(e) => setEditForm({ ...editForm, social_handle: e.target.value })}
                      className={fieldClass}
                    />
                  </AdminField>
                  <AdminField label="Preferred contact" htmlFor="edit-method">
                    <Select
                      value={editForm.preferred_contact || "none"}
                      onValueChange={(value) =>
                        setEditForm({
                          ...editForm,
                          preferred_contact: value === "none" ? "" : value,
                        })
                      }
                    >
                      <SelectTrigger id="edit-method" className={selectTriggerClass}>
                        <SelectValue placeholder="No preference" />
                      </SelectTrigger>
                      <SelectContent className={selectContentClass}>
                        <SelectItem value="none" className={selectItemClass}>
                          No preference
                        </SelectItem>
                        {CONTACT_METHODS.map((method) => (
                          <SelectItem key={method} value={method} className={selectItemClass}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </AdminField>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="Brand / company" htmlFor="edit-brand">
                    <Input
                      id="edit-brand"
                      value={editForm.brand_name}
                      onChange={(e) => setEditForm({ ...editForm, brand_name: e.target.value })}
                      className={fieldClass}
                    />
                  </AdminField>
                  <AdminField label="Website" htmlFor="edit-website">
                    <Input
                      id="edit-website"
                      value={editForm.website}
                      onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                      className={fieldClass}
                    />
                  </AdminField>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="Budget range" htmlFor="edit-budget">
                    <Select
                      value={editForm.budget_range || "none"}
                      onValueChange={(value) =>
                        setEditForm({
                          ...editForm,
                          budget_range: value === "none" ? "" : value,
                        })
                      }
                    >
                      <SelectTrigger id="edit-budget" className={selectTriggerClass}>
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent className={selectContentClass}>
                        <SelectItem value="none" className={selectItemClass}>
                          —
                        </SelectItem>
                        {BUDGET_RANGES.map((range) => (
                          <SelectItem key={range} value={range} className={selectItemClass}>
                            {range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </AdminField>
                  <AdminField label="Timeline" htmlFor="edit-timeline">
                    <Input
                      id="edit-timeline"
                      value={editForm.timeline}
                      onChange={(e) => setEditForm({ ...editForm, timeline: e.target.value })}
                      className={fieldClass}
                    />
                  </AdminField>
                </div>

                <AdminField label="Campaign goal" htmlFor="edit-campaign">
                  <Textarea
                    id="edit-campaign"
                    rows={3}
                    value={editForm.campaign_goal}
                    onChange={(e) => setEditForm({ ...editForm, campaign_goal: e.target.value })}
                    className={`${fieldClass} min-h-[5.5rem] py-3`}
                  />
                </AdminField>

                {saveError ? (
                  <p className="text-sm text-destructive" role="alert">
                    {saveError}
                  </p>
                ) : null}
                {saveOk ? (
                  <p className="text-sm text-muted-foreground" role="status">
                    Changes saved.
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-foreground px-6 text-background hover:bg-foreground/85"
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Saving…
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">Select a submission to edit.</p>
            )}
          </div>
        </div>
      )}

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-xl border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this submission?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the message from the inbox. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl" disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AdminField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className={labelClass}>
        {label}
      </Label>
      {children}
    </div>
  );
}
