import { Pagination as HeroPagination } from '@heroui/react';

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
  hasPrevious,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <HeroPagination className="justify-center">
      <HeroPagination.Content>
        <HeroPagination.Item>
          <HeroPagination.Previous isDisabled={!hasPrevious} onPress={onPrevious}>
            <HeroPagination.PreviousIcon />
          </HeroPagination.Previous>
        </HeroPagination.Item>
        {paginationRange.map((page, index) =>
          typeof page === 'string' ? (
            <HeroPagination.Item key={`ellipsis-${index}`}>
              <HeroPagination.Ellipsis />
            </HeroPagination.Item>
          ) : (
            <HeroPagination.Item key={page}>
              <HeroPagination.Link isActive={page === currentPage} onPress={() => onPageChange(page)}>
                {page}
              </HeroPagination.Link>
            </HeroPagination.Item>
          )
        )}
        <HeroPagination.Item>
          <HeroPagination.Next isDisabled={!hasNext} onPress={onNext}>
            <HeroPagination.NextIcon />
          </HeroPagination.Next>
        </HeroPagination.Item>
      </HeroPagination.Content>
    </HeroPagination>
  );
}
