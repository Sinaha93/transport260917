"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, ChevronRight, ClipboardCheck, Database, LayoutDashboard, PackageOpen, Plus, RefreshCw, Ruler, Settings2, Trash2, Truck } from "lucide-react";

type View = "overview" | "vehicles" | "pallets" | "products";
type Vehicle = { id: string; name: string; type: string; lengthMm: number; widthMm: number; heightMm: number; maxLoadKg: number; axleLimitKg: number; doorSide: string };
type Pallet = { id: string; name: string; lengthMm: number; widthMm: number; heightMm: number; tareWeightKg: number; maxGrossWeightKg: number; stackable: boolean; maxStack: number; rotatable: boolean };
type Product = { id: string; code: string; name: string; palletId: string; unitsPerPallet: number; unitWeightKg: number };

const navItems: { id: View; label: string; icon: typeof Truck }[] = [
  { id: "overview", label: "운영 개요", icon: LayoutDashboard },
  { id: "vehicles", label: "차량 기준정보", icon: Truck },
  { id: "pallets", label: "파렛트 기준정보", icon: Boxes },
  { id: "products", label: "품목 기준정보", icon: PackageOpen },
];

export default function MasterDashboard() {
  const [view, setView] = useState<View>("overview");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pallets, setPallets] = useState<Pallet[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [vehicleResponse, palletResponse, productResponse] = await Promise.all([
        fetch("/api/vehicles"), fetch("/api/pallets"), fetch("/api/products"),
      ]);
      const [vehicleData, palletData, productData] = await Promise.all([
        vehicleResponse.json() as Promise<{ vehicles?: Vehicle[]; error?: string }>,
        palletResponse.json() as Promise<{ pallets?: Pallet[]; error?: string }>,
        productResponse.json() as Promise<{ products?: Product[]; error?: string }>,
      ]);
      if (!vehicleResponse.ok || !palletResponse.ok || !productResponse.ok) {
        throw new Error(vehicleData.error || palletData.error || productData.error || "기준정보를 불러오지 못했습니다.");
      }
      setVehicles(vehicleData.vehicles ?? []);
      setPallets(palletData.pallets ?? []);
      setProducts(productData.products ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "기준정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(loadAll); }, [loadAll]);

  const notify = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2600);
  };

  const remove = async (resource: string, id: string, label: string) => {
    if (!window.confirm(`${label} 항목을 삭제하시겠습니까?`)) return;
    const response = await fetch(`/api/${resource}?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({})) as { error?: string };
      setError(data.error || "삭제하지 못했습니다.");
      return;
    }
    notify(`${label} 항목을 삭제했습니다.`);
    await loadAll();
  };

  const currentLabel = navItems.find((item) => item.id === view)?.label ?? "운영 개요";

  return (
    <div className="min-h-screen bg-[#f2f4f3] text-[#14211d]">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#dce2df] bg-white px-5 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-[#114d3e] text-white"><Truck size={19} /></div>
          <div><p className="text-[10px] font-bold tracking-[0.18em] text-[#719087]">LOGISTICS CONTROL</p><h1 className="text-base font-extrabold tracking-tight">상차 운영센터</h1></div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full bg-[#eef6f2] px-3 py-1.5 text-xs font-bold text-[#26715d] sm:flex"><span className="size-2 rounded-full bg-[#28a77d]" />1단계 구축</span>
          <button onClick={() => void loadAll()} className="grid size-9 place-items-center rounded-lg border border-[#dce2df] bg-white text-[#49645c] transition hover:bg-[#f2f6f4]" aria-label="새로고침"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="border-b border-[#dce2df] bg-[#f8faf9] p-3 lg:min-h-[calc(100vh-64px)] lg:border-b-0 lg:border-r lg:p-5">
          <nav className="flex gap-2 overflow-x-auto lg:block lg:space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return <button key={item.id} onClick={() => setView(item.id)} className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition lg:w-full ${view === item.id ? "bg-[#dceee7] text-[#114d3e]" : "text-[#60726c] hover:bg-white hover:text-[#203a32]"}`}><Icon size={17} />{item.label}</button>;
            })}
          </nav>
          <div className="mt-8 hidden rounded-xl border border-[#dce2df] bg-white p-4 lg:block">
            <div className="mb-3 flex items-center gap-2 text-xs font-extrabold text-[#60726c]"><Database size={14} />데이터 준비도</div>
            <div className="h-2 overflow-hidden rounded-full bg-[#e8eeeb]"><div className="h-full w-1/3 rounded-full bg-[#e59c34]" /></div>
            <p className="mt-2 text-xs leading-5 text-[#71817c]">기준정보 등록 후 ERP 연동과 적재계산을 시작할 수 있습니다.</p>
          </div>
        </aside>

        <main className="min-w-0 p-5 lg:p-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div><p className="mb-1 flex items-center gap-1 text-xs font-bold text-[#789087]">상차 운영센터 <ChevronRight size={13} /> {currentLabel}</p><h2 className="text-2xl font-black tracking-tight lg:text-3xl">{currentLabel}</h2></div>
            <p className="hidden text-xs font-semibold text-[#789087] sm:block">기준일 · 2026.09.17</p>
          </div>

          {message && <div className="mb-5 rounded-lg border border-[#9dd7c3] bg-[#e7f7f0] px-4 py-3 text-sm font-bold text-[#17604d]">{message}</div>}
          {error && <div className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-[#eab7ae] bg-[#fff0ed] px-4 py-3 text-sm font-bold text-[#9a3d30]"><span>{error}</span><button onClick={() => setError("")} className="underline">닫기</button></div>}

          {view === "overview" && <Overview vehicles={vehicles} pallets={pallets} products={products} loading={loading} setView={setView} />}
          {view === "vehicles" && <VehicleManager vehicles={vehicles} loading={loading} onSaved={async () => { notify("차량을 등록했습니다."); await loadAll(); }} onDelete={(id, name) => remove("vehicles", id, name)} />}
          {view === "pallets" && <PalletManager pallets={pallets} loading={loading} onSaved={async () => { notify("파렛트 규격을 등록했습니다."); await loadAll(); }} onDelete={(id, name) => remove("pallets", id, name)} />}
          {view === "products" && <ProductManager products={products} pallets={pallets} loading={loading} onSaved={async () => { notify("품목을 등록했습니다."); await loadAll(); }} onDelete={(id, name) => remove("products", id, name)} />}
        </main>
      </div>
    </div>
  );
}

function Overview({ vehicles, pallets, products, loading, setView }: { vehicles: Vehicle[]; pallets: Pallet[]; products: Product[]; loading: boolean; setView: (view: View) => void }) {
  const readiness = useMemo(() => [vehicles.length > 0, pallets.length > 0, products.length > 0].filter(Boolean).length, [vehicles, pallets, products]);
  const cards = [
    { label: "등록 차량", value: vehicles.length, suffix: "대", icon: Truck, color: "#176b56", view: "vehicles" as View },
    { label: "파렛트 규격", value: pallets.length, suffix: "종", icon: Boxes, color: "#315e87", view: "pallets" as View },
    { label: "연결 품목", value: products.length, suffix: "개", icon: PackageOpen, color: "#8a5c1e", view: "products" as View },
    { label: "기준정보 준비", value: Math.round(readiness / 3 * 100), suffix: "%", icon: ClipboardCheck, color: "#6c4f8c", view: "overview" as View },
  ];
  return <div className="space-y-6">
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, suffix, icon: Icon, color, view }) => <button key={label} onClick={() => setView(view)} className="group rounded-xl border border-[#dce2df] bg-white p-5 text-left shadow-[0_1px_2px_rgb(20_33_29/3%)] transition hover:-translate-y-0.5 hover:shadow-md"><div className="mb-5 flex items-start justify-between"><span className="grid size-10 place-items-center rounded-lg text-white" style={{ backgroundColor: color }}><Icon size={19} /></span><ChevronRight size={16} className="text-[#a8b6b1] transition group-hover:translate-x-0.5" /></div><p className="text-xs font-bold text-[#789087]">{label}</p><p className="mt-1 text-3xl font-black">{loading ? "–" : value}<span className="ml-1 text-sm font-bold text-[#789087]">{suffix}</span></p></button>)}</section>
    <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
      <div className="rounded-xl border border-[#dce2df] bg-white p-5 lg:p-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-extrabold text-[#789087]">SYSTEM ROADMAP</p><h3 className="mt-1 text-lg font-black">구축 진행 단계</h3></div><span className="rounded-md bg-[#dceee7] px-2.5 py-1 text-xs font-black text-[#17604d]">1 / 6</span></div><div className="space-y-3">{[
        ["01", "기준정보", "차량·파렛트·품목 등록", "active"], ["02", "ERP 연동", "PDA 출하정보 수신", "next"], ["03", "적재 계산", "환산·적재율·제약 검증", "later"], ["04", "3D 상차", "자동 배치 및 수동 조정", "later"], ["05", "실적 분석", "월간 계획 대비 달성률", "later"],
      ].map(([number, title, detail, status]) => <div key={number} className={`flex items-center gap-4 rounded-lg border p-3.5 ${status === "active" ? "border-[#8cc6b2] bg-[#eff8f4]" : "border-[#e4e8e6] bg-[#fafbfa]"}`}><span className={`grid size-9 shrink-0 place-items-center rounded-lg text-xs font-black ${status === "active" ? "bg-[#176b56] text-white" : "bg-[#e9eeec] text-[#778982]"}`}>{number}</span><div className="min-w-0 flex-1"><p className="text-sm font-black">{title}</p><p className="truncate text-xs text-[#789087]">{detail}</p></div>{status === "active" && <span className="text-[11px] font-black text-[#176b56]">진행 중</span>}</div>)}</div></div>
      <div className="rounded-xl border border-[#dce2df] bg-[#153d33] p-6 text-white"><Ruler className="mb-8 text-[#70c3a7]" size={25} /><p className="text-xs font-extrabold tracking-wider text-[#8fd0ba]">NEXT ACTION</p><h3 className="mt-2 text-xl font-black leading-snug">실제 제원부터<br />정확하게 등록하세요.</h3><p className="mt-3 text-sm leading-6 text-[#bdd3cc]">차량 내부 치수와 철제 파렛트 규격이 이후 적재율 계산과 3D 배치의 기준이 됩니다.</p><button onClick={() => setView("vehicles")} className="mt-8 flex w-full items-center justify-between rounded-lg bg-white px-4 py-3 text-sm font-black text-[#153d33]">차량 등록 시작 <ChevronRight size={16} /></button></div>
    </section>
  </div>;
}

function VehicleManager({ vehicles, loading, onSaved, onDelete }: { vehicles: Vehicle[]; loading: boolean; onSaved: () => Promise<void>; onDelete: (id: string, name: string) => void }) {
  return <MasterSection title="차량 제원" description="명목 톤수가 아닌 실제 적재함 내부 치수와 허용중량을 등록합니다." form={<VehicleForm onSaved={onSaved} />}><DataTable loading={loading} empty="등록된 차량이 없습니다." headers={["차량명", "구분", "내부 치수 (L×W×H)", "최대 적재", "축하중", ""]} rows={vehicles.map((v) => [v.name, v.type, `${formatMm(v.lengthMm)} × ${formatMm(v.widthMm)} × ${formatMm(v.heightMm)}`, `${formatNumber(v.maxLoadKg)} kg`, v.axleLimitKg ? `${formatNumber(v.axleLimitKg)} kg` : "미등록", <DeleteButton key={v.id} onClick={() => onDelete(v.id, v.name)} />])} /></MasterSection>;
}

function PalletManager({ pallets, loading, onSaved, onDelete }: { pallets: Pallet[]; loading: boolean; onSaved: () => Promise<void>; onDelete: (id: string, name: string) => void }) {
  return <MasterSection title="철제 파렛트 규격" description="실제 외곽 치수와 적층·회전 조건을 규격별로 관리합니다." form={<PalletForm onSaved={onSaved} />}><DataTable loading={loading} empty="등록된 파렛트 규격이 없습니다." headers={["규격명", "외곽 치수 (L×W×H)", "자체/최대중량", "적층", "90° 회전", ""]} rows={pallets.map((p) => [p.name, `${formatMm(p.lengthMm)} × ${formatMm(p.widthMm)} × ${formatMm(p.heightMm)}`, `${formatNumber(p.tareWeightKg)} / ${formatNumber(p.maxGrossWeightKg)} kg`, p.stackable ? `최대 ${p.maxStack}단` : "적층 불가", p.rotatable ? "가능" : "불가", <DeleteButton key={p.id} onClick={() => onDelete(p.id, p.name)} />])} /></MasterSection>;
}

function ProductManager({ products, pallets, loading, onSaved, onDelete }: { products: Product[]; pallets: Pallet[]; loading: boolean; onSaved: () => Promise<void>; onDelete: (id: string, name: string) => void }) {
  const palletNames = new Map(pallets.map((p) => [p.id, p.name]));
  return <MasterSection title="품목 연결정보" description="ERP 품목을 파렛트 규격 및 파렛트당 적재수량과 연결합니다." form={<ProductForm pallets={pallets} onSaved={onSaved} />}><DataTable loading={loading} empty={pallets.length ? "등록된 품목이 없습니다." : "먼저 파렛트 규격을 등록하세요."} headers={["품목코드", "품목명", "파렛트 규격", "파렛트당 수량", "단위중량", ""]} rows={products.map((p) => [p.code, p.name, palletNames.get(p.palletId) ?? "연결 오류", `${formatNumber(p.unitsPerPallet)}개`, `${formatNumber(p.unitWeightKg)} kg`, <DeleteButton key={p.id} onClick={() => onDelete(p.id, p.name)} />])} /></MasterSection>;
}

function MasterSection({ title, description, form, children }: { title: string; description: string; form: React.ReactNode; children: React.ReactNode }) {
  return <div className="grid items-start gap-5 xl:grid-cols-[360px_minmax(0,1fr)]"><section className="rounded-xl border border-[#dce2df] bg-white p-5"><div className="mb-5 flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#dceee7] text-[#17604d]"><Plus size={17} /></span><div><h3 className="font-black">{title} 등록</h3><p className="mt-1 text-xs leading-5 text-[#789087]">{description}</p></div></div>{form}</section><section className="min-w-0 overflow-hidden rounded-xl border border-[#dce2df] bg-white"><div className="flex items-center justify-between border-b border-[#e5e9e7] px-5 py-4"><h3 className="font-black">등록 목록</h3><span className="text-xs font-bold text-[#789087]">기준정보</span></div>{children}</section></div>;
}

function VehicleForm({ onSaved }: { onSaved: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  return <form onSubmit={(event) => submitForm(event, "/api/vehicles", setSaving, onSaved)} className="space-y-3"><Field label="차량명" name="name" placeholder="예: 5t 정규차량" required /><SelectField label="차량 구분" name="type" options={["5T", "5T축", "11T"]} /><div className="grid grid-cols-3 gap-2"><Field label="길이(mm)" name="lengthMm" type="number" required /><Field label="폭(mm)" name="widthMm" type="number" required /><Field label="높이(mm)" name="heightMm" type="number" required /></div><div className="grid grid-cols-2 gap-2"><Field label="최대 적재(kg)" name="maxLoadKg" type="number" required /><Field label="축하중 한도(kg)" name="axleLimitKg" type="number" /></div><input type="hidden" name="doorSide" value="REAR" /><SubmitButton saving={saving} /></form>;
}

function PalletForm({ onSaved }: { onSaved: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  return <form onSubmit={(event) => submitForm(event, "/api/pallets", setSaving, onSaved)} className="space-y-3"><Field label="규격명" name="name" placeholder="예: A형 철제 파렛트" required /><div className="grid grid-cols-3 gap-2"><Field label="길이(mm)" name="lengthMm" type="number" required /><Field label="폭(mm)" name="widthMm" type="number" required /><Field label="높이(mm)" name="heightMm" type="number" required /></div><div className="grid grid-cols-2 gap-2"><Field label="자체중량(kg)" name="tareWeightKg" type="number" required /><Field label="최대 총중량(kg)" name="maxGrossWeightKg" type="number" required /></div><div className="grid grid-cols-2 gap-2"><CheckField label="적층 가능" name="stackable" /><CheckField label="90° 회전 가능" name="rotatable" defaultChecked /></div><Field label="최대 적층 수" name="maxStack" type="number" defaultValue="2" required /><SubmitButton saving={saving} /></form>;
}

function ProductForm({ pallets, onSaved }: { pallets: Pallet[]; onSaved: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  return <form onSubmit={(event) => submitForm(event, "/api/products", setSaving, onSaved)} className="space-y-3"><div className="grid grid-cols-2 gap-2"><Field label="품목코드" name="code" placeholder="ERP 코드" required /><Field label="품목명" name="name" required /></div><label className="block"><span className="mb-1.5 block text-[11px] font-extrabold text-[#61766f]">파렛트 규격</span><select name="palletId" required disabled={!pallets.length} className="h-10 w-full rounded-lg border border-[#d7dfdc] bg-white px-3 text-sm outline-none focus:border-[#3a8b72] focus:ring-2 focus:ring-[#cce9df]"><option value="">선택하세요</option>{pallets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><div className="grid grid-cols-2 gap-2"><Field label="파렛트당 수량" name="unitsPerPallet" type="number" required /><Field label="단위중량(kg)" name="unitWeightKg" type="number" step="0.01" required /></div><SubmitButton saving={saving} disabled={!pallets.length} /></form>;
}

async function submitForm(event: FormEvent<HTMLFormElement>, endpoint: string, setSaving: (value: boolean) => void, onSaved: () => Promise<void>) {
  event.preventDefault();
  const form = event.currentTarget;
  setSaving(true);
  const raw = Object.fromEntries(new FormData(form));
  const numericFields = ["lengthMm", "widthMm", "heightMm", "maxLoadKg", "axleLimitKg", "tareWeightKg", "maxGrossWeightKg", "maxStack", "unitsPerPallet", "unitWeightKg"];
  const payload: Record<string, unknown> = Object.fromEntries(Object.entries(raw).map(([key, value]) => numericFields.includes(key) ? [key, Number(value)] : [key, value]));
  for (const checkbox of ["stackable", "rotatable"]) {
    const element = form.elements.namedItem(checkbox);
    if (element instanceof HTMLInputElement) payload[checkbox] = element.checked;
  }
  try {
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json() as { error?: string };
    if (!response.ok) throw new Error(data.error || "저장하지 못했습니다.");
    form.reset();
    await onSaved();
  } catch (caught) {
    window.alert(caught instanceof Error ? caught.message : "저장하지 못했습니다.");
  } finally { setSaving(false); }
}

function Field({ label, name, type = "text", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) { return <label className="block"><span className="mb-1.5 block text-[11px] font-extrabold text-[#61766f]">{label}</span><input name={name} type={type} {...props} className="h-10 w-full rounded-lg border border-[#d7dfdc] bg-white px-3 text-sm outline-none placeholder:text-[#b2bfba] focus:border-[#3a8b72] focus:ring-2 focus:ring-[#cce9df]" /></label>; }
function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) { return <label className="block"><span className="mb-1.5 block text-[11px] font-extrabold text-[#61766f]">{label}</span><select name={name} className="h-10 w-full rounded-lg border border-[#d7dfdc] bg-white px-3 text-sm outline-none focus:border-[#3a8b72] focus:ring-2 focus:ring-[#cce9df]">{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
function CheckField({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) { return <label className="flex h-10 items-center gap-2 rounded-lg border border-[#d7dfdc] px-3 text-xs font-bold text-[#536b63]"><input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-[#176b56]" />{label}</label>; }
function SubmitButton({ saving, disabled }: { saving: boolean; disabled?: boolean }) { return <button disabled={saving || disabled} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#176b56] text-sm font-black text-white transition hover:bg-[#115442] disabled:cursor-not-allowed disabled:bg-[#a9b9b4]"><Plus size={16} />{saving ? "저장 중…" : "기준정보 등록"}</button>; }
function DeleteButton({ onClick }: { onClick: () => void }) { return <button onClick={onClick} className="grid size-8 place-items-center rounded-md text-[#9aaaa5] transition hover:bg-[#fff0ed] hover:text-[#a34335]" aria-label="삭제"><Trash2 size={15} /></button>; }

function DataTable({ loading, empty, headers, rows }: { loading: boolean; empty: string; headers: string[]; rows: React.ReactNode[][] }) {
  if (loading) return <div className="grid min-h-64 place-items-center text-sm font-bold text-[#789087]"><div className="text-center"><RefreshCw className="mx-auto mb-3 animate-spin" size={20} />불러오는 중</div></div>;
  if (!rows.length) return <div className="grid min-h-64 place-items-center px-6 text-center"><div><Settings2 className="mx-auto mb-3 text-[#a9b7b2]" size={28} /><p className="text-sm font-bold text-[#71817c]">{empty}</p><p className="mt-1 text-xs text-[#9aa8a3]">왼쪽 입력란에서 첫 항목을 등록하세요.</p></div></div>;
  return <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead><tr className="bg-[#f7f9f8]">{headers.map((header) => <th key={header} className="border-b border-[#e5e9e7] px-4 py-3 text-[11px] font-extrabold text-[#71817c]">{header}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex} className="border-b border-[#edf0ef] last:border-0 hover:bg-[#fbfcfb]">{row.map((cell, cellIndex) => <td key={cellIndex} className={`px-4 py-3 text-sm ${cellIndex === 0 ? "font-extrabold" : "font-medium text-[#566a63]"}`}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

const formatNumber = (value: number) => new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 }).format(value);
const formatMm = (value: number) => `${formatNumber(value)}mm`;
