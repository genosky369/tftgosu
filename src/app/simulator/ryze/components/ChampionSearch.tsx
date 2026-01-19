"use client";

import { useState, useRef, useEffect } from "react";
import { CHAMPIONS } from "@/data/champions";
import { UNLOCK_CHAMPIONS } from "@/data/unlockChampions";

interface ChampionSearchProps {
  selectedChampions: string[];
  excludedChampions: string[];
  maxSelections: number;
  onSelect: (championName: string) => void;
  onRemove: (championName: string) => void;
}

export default function ChampionSearch({
  selectedChampions,
  excludedChampions,
  maxSelections,
  onSelect,
  onRemove
}: ChampionSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 검색 결과 필터링
  const searchResults = query.trim()
    ? CHAMPIONS.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) &&
        c.cost <= 5 &&
        c.name !== "라이즈" &&
        !selectedChampions.includes(c.name) &&
        !excludedChampions.includes(c.name)
      ).slice(0, 8)
    : [];

  // 해금 챔피언인지 확인
  const isUnlockChampion = (name: string) => UNLOCK_CHAMPIONS.includes(name);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (championName: string) => {
    if (selectedChampions.length >= maxSelections) return;
    onSelect(championName);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      handleSelect(searchResults[0].name);
    }
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // 코스트별 색상
  const getCostColor = (cost: number) => {
    switch (cost) {
      case 1: return "text-gray-400";
      case 2: return "text-green-400";
      case 3: return "text-blue-400";
      case 4: return "text-purple-400";
      case 5: return "text-yellow-400";
      default: return "text-white";
    }
  };

  return (
    <div className="space-y-3">
      {/* 검색 입력 */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="챔피언 이름 검색..."
          disabled={selectedChampions.length >= maxSelections}
          className={`
            w-full px-4 py-3 rounded-lg bg-background border border-accent-blue/30
            text-text placeholder-text-muted
            focus:outline-none focus:border-accent-ryze/50
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
          🔍
        </span>

        {/* 드롭다운 결과 */}
        {isOpen && searchResults.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 bg-background-card border border-accent-blue/30 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {searchResults.map(champion => (
              <button
                key={champion.name}
                onClick={() => handleSelect(champion.name)}
                className="w-full px-4 py-2 text-left hover:bg-background-header flex items-center gap-2 transition-colors"
              >
                {isUnlockChampion(champion.name) && (
                  <span className="text-yellow-500">🔒</span>
                )}
                <span className={getCostColor(champion.cost)}>
                  {champion.cost}코
                </span>
                <span className="text-text">{champion.name}</span>
                <span className="text-text-muted text-xs ml-auto">
                  {champion.traits.join(", ")}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 선택된 챔피언 */}
      {selectedChampions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedChampions.map(name => {
            const champion = CHAMPIONS.find(c => c.name === name);
            return (
              <span
                key={name}
                onClick={() => onRemove(name)}
                className="px-3 py-1.5 bg-accent-ryze/20 text-accent-ryze rounded-lg text-sm cursor-pointer hover:bg-accent-ryze/30 flex items-center gap-2 transition-colors"
              >
                {isUnlockChampion(name) && <span className="text-yellow-500">🔒</span>}
                {champion && (
                  <span className={`text-xs ${getCostColor(champion.cost)}`}>
                    {champion.cost}코
                  </span>
                )}
                {name}
                <span className="text-accent-ryze/70">✕</span>
              </span>
            );
          })}
        </div>
      )}

      {/* 선택 현황 */}
      <p className="text-xs text-text-muted">
        {selectedChampions.length}/{maxSelections}명 선택됨
        {selectedChampions.length >= maxSelections && (
          <span className="text-yellow-400 ml-2">최대 선택 완료</span>
        )}
      </p>
    </div>
  );
}
