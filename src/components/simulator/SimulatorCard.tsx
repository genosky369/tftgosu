import Link from "next/link";
import type { Simulator } from "@/config/simulators";

interface SimulatorCardProps {
  simulator: Simulator;
}

export default function SimulatorCard({ simulator }: SimulatorCardProps) {
  const isActive = simulator.status === "active";
  const isComingSoon = simulator.status === "coming-soon";

  const cardContent = (
    <div
      className={`
        relative overflow-hidden rounded-xl p-6 h-48
        bg-background-card border-2 transition-all duration-300
        ${isActive
          ? "border-transparent hover:border-accent-pink hover:scale-105 cursor-pointer"
          : "border-text-muted/30 opacity-60 cursor-not-allowed"
        }
      `}
      style={{
        boxShadow: isActive ? `0 4px 20px ${simulator.color}20` : undefined,
      }}
    >
      {/* 상단 아이콘 & 색상 포인트 */}
      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: simulator.color }}
      />

      {/* 아이콘 */}
      <div className="text-5xl mb-3">{simulator.icon}</div>

      {/* 이름 */}
      <h3 className="text-lg font-bold text-text mb-1">{simulator.name}</h3>

      {/* 설명 */}
      <p className="text-sm text-text-sub">{simulator.description}</p>

      {/* Coming Soon 뱃지 */}
      {isComingSoon && (
        <div className="absolute top-4 right-4 bg-text-muted/50 text-xs px-2 py-1 rounded">
          Coming Soon
        </div>
      )}

      {/* 시작 버튼 (Active일 때만) */}
      {isActive && (
        <div className="absolute bottom-4 right-4">
          <span
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: simulator.color, color: "#0f0f1a" }}
          >
            시작하기
          </span>
        </div>
      )}
    </div>
  );

  if (isActive) {
    return <Link href={simulator.path}>{cardContent}</Link>;
  }

  return cardContent;
}
