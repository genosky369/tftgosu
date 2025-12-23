import SimulatorGrid from "@/components/simulator/SimulatorGrid";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 히어로 섹션 */}
      <section className="text-center py-12 mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-accent-pink">TFT</span>
          <span className="text-text">고수</span>
        </h1>
        <p className="text-text-sub text-lg">
          TFT 시뮬레이터로 최적의 조합을 찾아보세요
        </p>
      </section>

      {/* 시뮬레이터 그리드 */}
      <SimulatorGrid />

      {/* 하단 섹션: 게시판 미리보기 */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        {/* 자유게시판 */}
        <div className="bg-background-card rounded-xl p-6 border border-accent-blue/20">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📢</span>
            <h3 className="text-lg font-bold">자유게시판</h3>
          </div>
          <ul className="space-y-2 text-text-sub">
            <li className="truncate hover:text-text cursor-pointer">• 게시글이 없습니다</li>
          </ul>
          <button className="mt-4 text-sm text-accent-pink hover:underline">
            더보기 →
          </button>
        </div>

        {/* 말랑이 게시판 */}
        <div className="bg-background-card rounded-xl p-6 border border-accent-blue/20">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🐶</span>
            <h3 className="text-lg font-bold">말랑이 근황</h3>
          </div>
          <div className="aspect-video bg-background rounded-lg flex items-center justify-center text-text-muted">
            사진이 없습니다
          </div>
          <button className="mt-4 text-sm text-accent-pink hover:underline">
            더보기 →
          </button>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="mt-16 py-8 border-t border-accent-blue/20 text-center text-text-sub text-sm">
        <p>© 2024 TFT고수. 건의사항은 오픈카톡으로 연락주세요.</p>
      </footer>
    </div>
  );
}
