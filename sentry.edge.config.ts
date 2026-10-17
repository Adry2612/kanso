import * as Sentry from "@sentry/nextjs";
import { buildSentryOptions } from "@/lib/sentry";

Sentry.init(
  buildSentryOptions(
    process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
  ),
);
