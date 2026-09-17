import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { vehicles } from "@/db/schema";
import { validateVehicle } from "@/lib/master-data.mjs";

export async function GET() {
  try {
    const rows = await getDb().select().from(vehicles).orderBy(desc(vehicles.createdAt));
    return Response.json({ vehicles: rows });
  } catch (error) {
    return storageError(error);
  }
}

export async function POST(request: Request) {
  try {
    const result = validateVehicle(await request.json());
    if (!result.ok || !("value" in result)) {
      const error = "error" in result ? result.error : "차량 입력값을 확인하세요.";
      return Response.json({ error }, { status: 400 });
    }
    const value = result.value as Omit<typeof vehicles.$inferInsert, "id" | "createdAt">;
    const [vehicle] = await getDb().insert(vehicles).values({ id: crypto.randomUUID(), ...value }).returning();
    return Response.json({ vehicle }, { status: 201 });
  } catch (error) {
    return storageError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return Response.json({ error: "삭제할 차량 ID가 필요합니다." }, { status: 400 });
    await getDb().delete(vehicles).where(eq(vehicles.id, id));
    return new Response(null, { status: 204 });
  } catch (error) {
    return storageError(error);
  }
}

function storageError(error: unknown) {
  console.error("vehicle master storage error", error);
  return Response.json({ error: "차량 기준정보 저장소를 사용할 수 없습니다." }, { status: 500 });
}
