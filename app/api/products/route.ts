import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { validateProduct } from "@/lib/master-data.mjs";

export async function GET() {
  try {
    const rows = await getDb().select().from(products).orderBy(desc(products.createdAt));
    return Response.json({ products: rows });
  } catch (error) {
    return storageError(error);
  }
}

export async function POST(request: Request) {
  try {
    const result = validateProduct(await request.json());
    if (!result.ok || !("value" in result)) {
      const error = "error" in result ? result.error : "품목 입력값을 확인하세요.";
      return Response.json({ error }, { status: 400 });
    }
    const value = result.value as Omit<typeof products.$inferInsert, "id" | "createdAt">;
    const [product] = await getDb().insert(products).values({ id: crypto.randomUUID(), ...value }).returning();
    return Response.json({ product }, { status: 201 });
  } catch (error) {
    return storageError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return Response.json({ error: "삭제할 품목 ID가 필요합니다." }, { status: 400 });
    await getDb().delete(products).where(eq(products.id, id));
    return new Response(null, { status: 204 });
  } catch (error) {
    return storageError(error);
  }
}

function storageError(error: unknown) {
  console.error("product master storage error", error);
  return Response.json({ error: "품목 기준정보 저장소를 사용할 수 없습니다. 중복 품목코드 또는 파렛트 연결을 확인하세요." }, { status: 500 });
}
