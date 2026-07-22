interface PaginationProps {
  currentPage: number;
  totalPages: number;
  paginationRange: (number | string)[];
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  paginationRange,
  onPageChange,
  onPrevious,
  onNext,
  hasNext,
  hasPrevious
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        className="h-8 min-w-8 px-2 rounded-lg border border-divider bg-white text-foreground text-sm hover:bg-content2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        onClick={onPrevious}
        disabled={!hasPrevious}
      >
        ←
      </button>

      {paginationRange.map((page, index) => (
        <button
          key={index}
          className={`h-8 min-w-8 px-2 rounded-lg border text-sm transition-colors ${
            page === currentPage
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-foreground border-divider hover:bg-content2'
          } ${page === '...' ? 'cursor-default' : ''}`}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
        >
          {page}
        </button>
      ))}

      <button
        className="h-8 min-w-8 px-2 rounded-lg border border-divider bg-white text-foreground text-sm hover:bg-content2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        onClick={onNext}
        disabled={!hasNext}
      >
        →
      </button>
    </div>
  );
}
