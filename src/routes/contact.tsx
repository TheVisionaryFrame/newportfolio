import { type FormEvent, type ReactNode, useState } from "react";
import { Check } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { profanityError, validateEmail, validateName } from "@/lib/contact-validation";

const INQUIRY_TYPES = [
  "Collaboration",
  "Business inquiry",
  "Press / media",
  "Fan message",
  "Sponsorship",
  "Other",
] as const;

type InquiryType = (typeof INQUIRY_TYPES)[number];

const BUDGET_RANGES = [
  "Under $500",
  "$500 – $1,500",
  "$1,500 – $5,000",
  "$5,000 – $10,000",
  "$10,000+",
  "Not sure / open",
] as const;

const CONTACT_METHODS = ["Email", "Social DM", "Either"] as const;

const fieldClass =
  "h-11 rounded-xl border-border bg-muted/25 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring aria-invalid:border-destructive";

const selectTriggerClass =
  "h-11 w-full rounded-xl border border-border bg-muted/25 px-3 text-sm text-foreground shadow-sm outline-none transition-colors focus:ring-1 focus:ring-ring data-[placeholder]:text-muted-foreground aria-invalid:border-destructive";

const selectContentClass = "z-[80] rounded-xl border-border bg-card text-card-foreground shadow-lg";

const selectItemClass =
  "cursor-pointer rounded-lg text-card-foreground focus:bg-muted focus:text-card-foreground data-[highlighted]:bg-muted data-[highlighted]:text-card-foreground";

const labelClass = "text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground";

const FIELD_IDS: Record<keyof FormState, string> = {
  name: "contact-name",
  email: "contact-email",
  inquiryType: "contact-inquiry",
  message: "contact-message",
  socialHandle: "contact-social",
  preferredContact: "contact-method",
  brandName: "contact-brand",
  website: "contact-website",
  budgetRange: "contact-budget",
  campaignGoal: "contact-campaign",
  timeline: "contact-timeline",
};

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "The Visionary Frame" },
      {
        name: "description",
        content:
          "Get in touch with The Visionary Frame for collaborations, sponsorships, press, and messages.",
      },
      { property: "og:title", content: "The Visionary Frame" },
      {
        property: "og:description",
        content:
          "Get in touch with The Visionary Frame for collaborations, sponsorships, press, and messages.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ContactPage,
});

type FormState = {
  name: string;
  email: string;
  inquiryType: InquiryType | "";
  message: string;
  socialHandle: string;
  preferredContact: (typeof CONTACT_METHODS)[number] | "";
  brandName: string;
  website: string;
  budgetRange: (typeof BUDGET_RANGES)[number] | "";
  campaignGoal: string;
  timeline: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  inquiryType: "",
  message: "",
  socialHandle: "",
  preferredContact: "",
  brandName: "",
  website: "",
  budgetRange: "",
  campaignGoal: "",
  timeline: "",
};

function ContactPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const isSponsorship = form.inquiryType === "Sponsorship";

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validate() {
    const next: Partial<Record<keyof FormState, string>> = {};

    const nameError = validateName(form.name);
    const emailError = validateEmail(form.email);

    if (nameError) next.name = nameError;
    if (emailError) next.email = emailError;
    if (!form.inquiryType) next.inquiryType = "Choose an inquiry type.";
    if (!form.message.trim()) {
      next.message = "Message is required.";
    } else {
      const messageError = profanityError(form.message);
      if (messageError) next.message = messageError;
    }

    const socialHandleError = profanityError(form.socialHandle);
    if (socialHandleError) next.socialHandle = socialHandleError;

    if (isSponsorship) {
      const websiteError = profanityError(form.website);
      if (websiteError) next.website = websiteError;

      if (!form.brandName.trim()) {
        next.brandName = "Brand / company name is required.";
      } else {
        const brandNameError = profanityError(form.brandName);
        if (brandNameError) next.brandName = brandNameError;
      }
      if (!form.budgetRange) next.budgetRange = "Select a budget range.";
      if (!form.campaignGoal.trim()) {
        next.campaignGoal = "Tell us what you want to sponsor.";
      } else {
        const campaignGoalError = profanityError(form.campaignGoal);
        if (campaignGoalError) next.campaignGoal = campaignGoalError;
      }
      if (!form.timeline.trim()) {
        next.timeline = "Timeline is required.";
      } else {
        const timelineError = profanityError(form.timeline);
        if (timelineError) next.timeline = timelineError;
      }
    }

    return next;
  }

  function focusFirstError(nextErrors: Partial<Record<keyof FormState, string>>) {
    const firstErrorKey = (Object.keys(nextErrors) as Array<keyof FormState>)[0];
    if (!firstErrorKey) return;

    window.setTimeout(() => {
      document.getElementById(FIELD_IDS[firstErrorKey])?.focus();
    }, 0);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      focusFirstError(nextErrors);
      return;
    }

    setForm((prev) => ({
      ...prev,
      name: prev.name.trim(),
      email: prev.email.trim().toLowerCase(),
    }));

    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader awayFromHome />

      <section className="site-shell border-b border-border pb-20 pt-10 md:pb-28 md:pt-14">
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <p className="eyebrow mb-3">Get in touch</p>
          <h1 className="section-title">Contact</h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-7 text-muted-foreground">
            Collaborations, sponsorships, press, or a note from the community — send a message
            below.
          </p>
        </div>

        {submitted ? (
          <div
            className="mx-auto flex max-w-xl items-start gap-3 rounded-xl border border-border bg-muted/45 p-6 text-sm leading-6"
            role="status"
          >
            <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium text-foreground">Message received</p>
              <p className="mt-2 text-muted-foreground">
                Thanks for getting in touch. Your message has been noted.
              </p>
              <Button
                type="button"
                variant="link"
                className="mt-4 h-auto p-0 text-xs uppercase tracking-[0.12em] text-foreground"
                onClick={() => {
                  setSubmitted(false);
                  setForm(initialForm);
                  setErrors({});
                }}
              >
                Send another message
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mx-auto max-w-2xl space-y-8 rounded-xl border border-border bg-card/40 p-6 md:p-8"
            aria-describedby="contact-form-note"
          >
            <p id="contact-form-note" className="sr-only">
              Required fields are marked. Choosing Sponsorship reveals additional brand fields.
            </p>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="contact-name" label="Name" required error={errors.name}>
                <Input
                  id="contact-name"
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={fieldClass}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                />
              </Field>

              <Field id="contact-email" label="Email" required error={errors.email}>
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={fieldClass}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "contact-email-error" : undefined}
                />
              </Field>
            </div>

            <Field id="contact-inquiry" label="Inquiry type" required error={errors.inquiryType}>
              <Select
                {...(form.inquiryType ? { value: form.inquiryType } : {})}
                onValueChange={(value) => update("inquiryType", value as InquiryType)}
              >
                <SelectTrigger
                  id="contact-inquiry"
                  className={selectTriggerClass}
                  aria-invalid={Boolean(errors.inquiryType)}
                  aria-describedby={errors.inquiryType ? "contact-inquiry-error" : undefined}
                >
                  <SelectValue placeholder="Select one…" />
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
                  {INQUIRY_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className={selectItemClass}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {isSponsorship ? (
              <fieldset className="space-y-6 rounded-xl border border-border bg-muted/20 p-5 md:p-6">
                <legend className="px-1 text-xs font-medium uppercase tracking-[0.12em] text-foreground">
                  Sponsorship details
                </legend>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field
                    id="contact-brand"
                    label="Brand / company"
                    required
                    error={errors.brandName}
                  >
                    <Input
                      id="contact-brand"
                      name="brandName"
                      autoComplete="organization"
                      value={form.brandName}
                      onChange={(e) => update("brandName", e.target.value)}
                      className={fieldClass}
                      aria-invalid={Boolean(errors.brandName)}
                      aria-describedby={errors.brandName ? "contact-brand-error" : undefined}
                    />
                  </Field>

                  <Field id="contact-website" label="Website" error={errors.website}>
                    <Input
                      id="contact-website"
                      name="website"
                      type="url"
                      inputMode="url"
                      placeholder="https://"
                      value={form.website}
                      onChange={(e) => update("website", e.target.value)}
                      className={fieldClass}
                      aria-invalid={Boolean(errors.website)}
                      aria-describedby={errors.website ? "contact-website-error" : undefined}
                    />
                  </Field>
                </div>

                <Field id="contact-budget" label="Budget range" required error={errors.budgetRange}>
                  <Select
                    {...(form.budgetRange ? { value: form.budgetRange } : {})}
                    onValueChange={(value) =>
                      update("budgetRange", value as FormState["budgetRange"])
                    }
                  >
                    <SelectTrigger
                      id="contact-budget"
                      className={selectTriggerClass}
                      aria-invalid={Boolean(errors.budgetRange)}
                      aria-describedby={errors.budgetRange ? "contact-budget-error" : undefined}
                    >
                      <SelectValue placeholder="Select a range…" />
                    </SelectTrigger>
                    <SelectContent className={selectContentClass}>
                      {BUDGET_RANGES.map((range) => (
                        <SelectItem key={range} value={range} className={selectItemClass}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field
                  id="contact-campaign"
                  label="Campaign goal / what to sponsor"
                  required
                  error={errors.campaignGoal}
                >
                  <Textarea
                    id="contact-campaign"
                    name="campaignGoal"
                    rows={3}
                    value={form.campaignGoal}
                    onChange={(e) => update("campaignGoal", e.target.value)}
                    className={`${fieldClass} min-h-[5.5rem] py-3`}
                    aria-invalid={Boolean(errors.campaignGoal)}
                    aria-describedby={errors.campaignGoal ? "contact-campaign-error" : undefined}
                  />
                </Field>

                <Field id="contact-timeline" label="Timeline" required error={errors.timeline}>
                  <Input
                    id="contact-timeline"
                    name="timeline"
                    placeholder="e.g. Q3 launch, next 4–6 weeks"
                    value={form.timeline}
                    onChange={(e) => update("timeline", e.target.value)}
                    className={fieldClass}
                    aria-invalid={Boolean(errors.timeline)}
                    aria-describedby={errors.timeline ? "contact-timeline-error" : undefined}
                  />
                </Field>
              </fieldset>
            ) : null}

            <Field id="contact-message" label="Message" required error={errors.message}>
              <Textarea
                id="contact-message"
                name="message"
                rows={6}
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                className={`${fieldClass} min-h-[9rem] py-3`}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "contact-message-error" : undefined}
              />
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="contact-social" label="Social handle" error={errors.socialHandle}>
                <Input
                  id="contact-social"
                  name="socialHandle"
                  placeholder="@handle"
                  value={form.socialHandle}
                  onChange={(e) => update("socialHandle", e.target.value)}
                  className={fieldClass}
                  aria-invalid={Boolean(errors.socialHandle)}
                  aria-describedby={errors.socialHandle ? "contact-social-error" : undefined}
                />
              </Field>

              <Field id="contact-method" label="Preferred contact">
                <Select
                  value={form.preferredContact || "none"}
                  onValueChange={(value) =>
                    update(
                      "preferredContact",
                      value === "none" ? "" : (value as FormState["preferredContact"]),
                    )
                  }
                >
                  <SelectTrigger id="contact-method" className={selectTriggerClass}>
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
              </Field>
            </div>

            <div className="border-t border-border pt-6">
              <Button
                type="submit"
                className="rounded-xl bg-foreground px-6 text-background hover:bg-foreground/80"
              >
                Send message
              </Button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={labelClass}>
        {label}
        {required ? (
          <span className="text-foreground" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
