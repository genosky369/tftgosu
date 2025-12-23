import { SIMULATORS } from "@/config/simulators";
import SimulatorCard from "./SimulatorCard";

export default function SimulatorGrid() {
  return (
    <section className="py-8">
      {/* 섹션 제목 */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🎯</span>
        <h2 className="text-2xl font-bold">시뮬레이터</h2>
      </div>

      {/* 시뮬레이터 그리드 - 자동 확장 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SIMULATORS.map((simulator) => (
          <SimulatorCard key={simulator.id} simulator={simulator} />
        ))}
      </div>
    </section>
  );
}
