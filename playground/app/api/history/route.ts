import { NextResponse } from "next/server";

import { listHistory } from "@/lib/history";

export const runtime = "nodejs";

export async function GET() {
  const items = await listHistory();
  return NextResponse.json({
    items: items.map((item) => {
      const response = item.response as
        | { report?: { report_title?: string } }
        | undefined;
      return {
        id: item.id,
        createdAt: item.createdAt,
        status: item.status,
        preview: item.preview,
        reportTitle: response?.report?.report_title ?? null,
        error: item.error ?? null,
      };
    }),
  });
}