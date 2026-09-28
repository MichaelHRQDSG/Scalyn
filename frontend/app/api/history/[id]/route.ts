import { NextResponse } from "next/server";

import { getHistory } from "@/lib/history";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const record = await getHistory(id);
  if (!record) {
    return NextResponse.json({ detail: "历史记录不存在" }, { status: 404 });
  }
  return NextResponse.json(record);
}
