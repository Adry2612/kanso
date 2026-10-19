import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function describe(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      code: (error as { code?: string }).code,
      stack: error.stack?.split("\n").slice(0, 4),
    };
  }
  return { value: String(error) };
}

/** Diagnóstico temporal: se elimina en cuanto identifiquemos el 500. */
export async function GET() {
  const result: Record<string, unknown> = {
    node: process.version,
    env: {
      inline: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT),
      path: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_PATH),
    },
  };

  try {
    await import("firebase-admin/app");
    result.app = "ok";
  } catch (error) {
    result.app = describe(error);
  }

  try {
    await import("firebase-admin/firestore");
    result.firestore = "ok";
  } catch (error) {
    result.firestore = describe(error);
  }

  try {
    await import("firebase-admin/auth");
    result.auth = "ok";
  } catch (error) {
    result.auth = describe(error);
  }

  try {
    const { authenticate } = await import("@/lib/apiAuth");
    const response = await authenticate(
      new Request("https://example.com", {
        headers: { authorization: "Bearer abc.def.ghi" },
      }),
    );
    result.authenticate =
      response instanceof Response
        ? { status: response.status, body: await response.text() }
        : response;
  } catch (error) {
    result.authenticate = describe(error);
  }

  try {
    const mod = await import("@/lib/firebaseAdmin");
    result.configured = mod.isAdminConfigured();
    mod.getAdminApp();
    result.adminApp = "ok";
  } catch (error) {
    result.adminApp = describe(error);
  }

  return NextResponse.json(result);
}
