import Link from "next/link";

const KAKAO_OPEN_CHAT_URL = "https://open.kakao.com/o/spn5XZ7h";

export default function ComingSoonCard() {
  return (
    <div
      className="
        relative overflow-hidden rounded-xl p-6 h-48
        bg-background-card border-2 border-dashed border-text-muted/30
        flex flex-col justify-center items-center text-center
      "
    >
      {/* 제목 */}
      <h3 className="text-lg font-bold text-text-sub mb-2">Coming Soon</h3>

      {/* 설명 */}
      <p className="text-sm text-text-sub mb-1">
        새로운 기능을 준비하고 있어요!
      </p>
      <p className="text-xs text-text-muted mb-4">
        원하는 기능이 있다면 건의해주세요
      </p>

      {/* 건의하기 버튼 */}
      <Link
        href={KAKAO_OPEN_CHAT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="
          px-4 py-2 rounded-lg text-sm font-medium
          bg-[#FEE500] text-[#000000] hover:bg-[#FDD800]
          transition-colors duration-200
        "
      >
        건의하기
      </Link>
    </div>
  );
}
