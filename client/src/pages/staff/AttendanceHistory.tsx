import { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { Attendance } from '../../types';
import Badge from '../../components/ui/Badge';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { Clock } from '@phosphor-icons/react';

export default function AttendanceHistory() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const fetchAttendances = async (page: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance?page=${page}&limit=${limit}`);
      setAttendances(res.data.attendances);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch attendances:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendances(currentPage); }, [currentPage]);

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('vi-VN');

  const { paginationRange, goToPage, goToNextPage, goToPreviousPage, hasNextPage, hasPreviousPage } = usePagination({ totalItems: totalPages * limit, itemsPerPage: limit });

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground tracking-tight">Lịch sử chấm công</h2>

      {attendances.length === 0 ? (
        <EmptyState icon={<Clock size={40} />} message="Chưa có bản ghi chấm công" />
      ) : (
        <div className="bg-content1 rounded-xl border border-divider overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-divider">
                  <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Ngày</th>
                  <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Ca</th>
                  <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Giờ vào</th>
                  <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Giờ ra</th>
                  <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Đi trễ</th>
                  <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Giờ làm</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((att) => (
                  <tr key={att._id} className="border-b border-divider/50 last:border-b-0 hover:bg-content2/50 transition-colors">
                    <td className="px-4 py-3 text-sm">{formatDate(att.date)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={att.shift === 'morning' ? 'info' : 'secondary'}>
                        {att.shift === 'morning' ? 'Sáng' : 'Chiều'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{formatTime(att.checkIn)}</td>
                    <td className="px-4 py-3 text-sm">{formatTime(att.checkOut)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={att.isLate ? 'warning' : 'success'}>
                        {att.isLate ? 'Trễ' : 'Đúng giờ'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{att.hoursWorked}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginationRange={paginationRange}
        onPageChange={(p) => { goToPage(p); setCurrentPage(p); }}
        onPrevious={() => { goToPreviousPage(); setCurrentPage((prev) => Math.max(1, prev - 1)); }}
        onNext={() => { goToNextPage(); setCurrentPage((prev) => Math.min(totalPages, prev + 1)); }}
        hasNext={hasNextPage}
        hasPrevious={hasPreviousPage}
      />
    </div>
  );
}
