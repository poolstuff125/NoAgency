import { sql } from "drizzle-orm";

import { db } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ status: "ok", db: "up" });
  } catch (error) {
    console.error("health check: database unreachable", error);
    return Response.json({ status: "degraded", db: "down" }, { status: 503 });
  }
}
