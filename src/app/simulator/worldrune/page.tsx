import Link from "next/link";

export default function WorldRuneSimulatorPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 뒤로가기 */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-text-sub hover:text-text mb-6"
      >
        <span>←</span>
        <span>홈으로</span>
      </Link>

      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🌍</span>
          <h1 className="text-3xl font-bold">월드룬 시뮬레이터</h1>
        </div>
        <p className="text-text-sub">
          &quot;지역 룬&quot; 증강 선택 시, 지역 4개를 가장 빠르게 활성화하는 조합을 찾습니다.
        </p>
      </div>

      {/* Coming Soon */}
      <div className="bg-background-card rounded-xl p-12 text-center border border-accent-worldrune/30">
        <span className="text-6xl mb-4 block">🚧</span>
        <h2 className="text-2xl font-bold text-accent-worldrune mb-2">준비 중</h2>
        <p className="text-text-sub">
          월드룬 시뮬레이터는 현재 개발 중입니다.
        </p>
        <p className="text-text-sub mt-2">
          브론즈 시뮬레이터를 먼저 이용해보세요!
        </p>
        <Link
          href="/simulator/bronze"
          className="inline-block mt-6 px-6 py-3 bg-accent-bronze text-background rounded-lg font-bold hover:opacity-90 transition-opacity"
        >
          브론즈 시뮬레이터 이용하기
        </Link>
      </div>
    </div>
  );
}
