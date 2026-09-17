# 상차 운영센터

자동차 부품 물류팀의 상차·출하 정보를 공유하고 분석하기 위한 내부 웹 프로그램입니다.

## 현재 구현 범위 — 1단계

- 차량 기준정보: 차량 구분, 적재함 내부 치수, 최대 적재중량, 축하중
- 철제 파렛트 기준정보: 외곽 치수, 자체/최대중량, 적층·회전 규칙
- 품목 기준정보: ERP 품목코드, 파렛트 규격, 파렛트당 수량, 단위중량
- Cloudflare D1 기반 영구 저장과 입력 검증
- 기준정보 등록 현황 대시보드

ERP/PDA 연동, 적재율 계산, 3D 상차, 월간 실적 분석은 후속 단계입니다.

전체 구현 계획, 현재 상태, 다른 PC 인수인계 내용은 [`HANDOFF.md`](./HANDOFF.md)를 확인하세요.

## 다른 PC에서 실행

Node.js 22.13 이상과 Git을 설치한 뒤 실행합니다.

```powershell
git clone https://github.com/Sinaha93/transport260917.git
cd transport260917
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_giant_zuras.sql
npm start
```

위 마이그레이션 명령은 새 PC에서 최초 한 번만 실행합니다.

## 검증

```powershell
npm test
npm run lint
npm run build
```
