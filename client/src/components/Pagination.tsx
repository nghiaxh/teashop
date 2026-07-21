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
        className="btn btn-sm"
        onClick={onPrevious}
        disabled={!hasPrevious}
      >
        ←
      </button>

      {paginationRange.map((page, index) => (
        <button
          key={index}
          className={`btn btn-sm ${page === currentPage ? 'btn-primary' : ''}`}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
        >
          {page}
        </button>
      ))}

      <button
        className="btn btn-sm"
        onClick={onNext}
        disabled={!hasNext}
      >
        →
      </button>
    </div>
  );
}
