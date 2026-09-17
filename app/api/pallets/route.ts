import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { pallets } from "@/db/schema";
import { validatePallet } from "@/lib/master-data.mjs";

export async function GET() {
  try {
    const rows = await getDb().select().from(pallets).orderBy(desc(pallets.createdAt));
    return Response.json({ pallets: rows });
  } catch (error) {
    return storageError(error);
  }
}

export async function POST(request: Request) {
  try {
    const result = validatePallet(await request.json());
    if (!result.ok || !("value" in result)) {
      const error = "error" in result ? result.error : "파렛트 입력값을 확인하세요.";
      return Response.json({ error }, { status: 400 });
    }
    const value = result.value as Omit<typeof pallets.$inferInsert, "id" | "createdAt">;
    const [pallet] = await getDb().insert(pallets).values({ id: crypto.randomUUID(), ...value }).returning();
    return Response.json({ pallet }, { status: 201 });
  } catch (error) {
    return storageError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return Response.json({ error: "삭제할 파렛트 ID가 필요합니다." }, { status: 400 });
    await getDb().delete(pallets).where(eq(pallets.id, id));
    return new Response(null, { status: 204 });
  } catch (error) {
    return storageError(error);
  }
}

function storageError(error: unknown) {
  console.error("pallet master storage error", error);
  return Response.json({ error: "파렛트 기준정보 저장소를 사용할 수 없습니다." }, { status: 500 });
}
