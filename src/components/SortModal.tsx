import BaseModal from "./BaseModal";
import { useTranslations } from "@/context/I18nContext";
import { SortModalProps } from "@/types/components";
import { Stagger, StaggerItem } from "./motion";

export default function SortModal({
  isOpen,
  onClose,
  currentSort,
  onSortChange,
}: SortModalProps) {
  const t = useTranslations("modal");

  const sortOptions = [
    { value: "recent", label: t("sort.recent") },
    { value: "oldest", label: t("sort.oldest") },
    { value: "name-asc", label: t("sort.nameAsc") },
    { value: "name-desc", label: t("sort.nameDesc") },
    { value: "artist", label: t("sort.artist") },
    { value: "release-year-asc", label: t("sort.releaseYearAsc") },
    { value: "release-year-desc", label: t("sort.releaseYearDesc") },
  ];

  const handleSortSelect = (value: string) => {
    onSortChange(value);
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={t("sort.title")}>
      <Stagger className="space-y-2" stagger={0.04} onMount>
        {sortOptions.map((option) => (
          <StaggerItem key={option.value} y={10}>
            <button
              onClick={() => handleSortSelect(option.value)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                currentSort === option.value
                  ? "bg-green-900/50 text-green-400 border border-green-400"
                  : "bg-[var(--surface-3)] text-[var(--collectify-muted)] hover:bg-[var(--surface-3)] border border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{option.label}</span>
                {currentSort === option.value && (
                  <span className="text-green-400">✓</span>
                )}
              </div>
            </button>
          </StaggerItem>
        ))}
      </Stagger>
    </BaseModal>
  );
}
