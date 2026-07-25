import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Chip, Spinner } from '@heroui/react';
import { Pencil, CalendarCheck } from '@phosphor-icons/react';
import api from '../../api/axios';
import type { Attendance } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0 },
};

export default function AttendanceManagement() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
  const [editData, setEditData] = useState({ checkIn: '', checkOut: '', shift: 'morning' as 'morning' | 'afternoon' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { showToast } = useToast();
  const limit = 20;

  const fetchAttendances = async (page: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance?page=${page}&limit=${limit}`);
      setAttendances(res.data.attendances);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      showToast('Không thể tải dữ liệu chấm công', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendances(currentPage); }, [currentPage]);

  const handleUpdate = async () => {
    if (!editingAttendance) return;
    try {
      await api.put(`/attendance/${editingAttendance._id}`, editData);
      fetchAttendances(currentPage);
      setEditingAttendance(null);
      showToast('Cập nhật thành công', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Cập nhật thất bại', 'error');
    }
  };

  const startEdit = (att: Attendance) => {
    setEditingAttendance(att);
    setEditData({
      checkIn: new Date(att.checkIn).toISOString().slice(0, 16),
      checkOut: att.checkOut ? new Date(att.checkOut).toISOString().slice(0, 16) : '',
      shift: att.shift,
    });
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const { paginationRange, goToPage, goToNextPage, goToPreviousPage, hasNextPage, hasPreviousPage } = usePagination({ totalItems: totalPages * limit, itemsPerPage: limit });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Quản lý Chấm công</h2>

      {attendances.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <CalendarCheck size={40} className="text-foreground/30 mb-3" />
          <p className="text-foreground/50">Chưa có bản ghi chấm công</p>
        </Card>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-divider">
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Nhân viên</th>
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Ngày</th>
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Ca</th>
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Giờ vào</th>
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Giờ ra</th>
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Đi trễ</th>
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Giờ làm</th>
                    <th scope="col" className="text-left px-4 py-3 text-foreground/60 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.map((att) => (
                    <motion.tr
                      key={att._id}
                      variants={item}
                      className="border-b border-divider/50 last:border-b-0 hover:bg-content2/50 transition-colors"
                    >
                      <td className="px-4 py-3">{att.userId?.name || 'N/A'}</td>
                      <td className="px-4 py-3">{new Date(att.date).toLocaleDateString('vi-VN')}</td>
                      <td className="px-4 py-3">
                        <Chip size="sm" variant="soft" color={att.shift === 'morning' ? 'accent' : 'default'}>
                          {att.shift === 'morning' ? 'Sáng' : 'Chiều'}
                        </Chip>
                      </td>
                      <td className="px-4 py-3">{formatTime(att.checkIn)}</td>
                      <td className="px-4 py-3">{formatTime(att.checkOut)}</td>
                      <td className="px-4 py-3">
                        <Chip size="sm" variant="soft" color={att.isLate ? 'warning' : 'success'}>
                          {att.isLate ? 'Trễ' : 'OK'}
                        </Chip>
                      </td>
                      <td className="px-4 py-3">{att.hoursWorked}h</td>
                      <td className="px-4 py-3">
                        <Button isIconOnly size="sm" variant="ghost" onClick={() => startEdit(att)} aria-label="Sửa">
                          <Pencil size={14} />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
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

      <Modal
        open={!!editingAttendance}
        onClose={() => setEditingAttendance(null)}
        title="Chỉnh sửa chấm công"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditingAttendance(null)}>Hủy</Button>
            <Button variant="primary" onClick={handleUpdate}>Cập nhật</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Ca</label>
            <select
              className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              value={editData.shift}
              onChange={(e) => setEditData({ ...editData, shift: e.target.value as 'morning' | 'afternoon' })}
            >
              <option value="morning">Sáng</option>
              <option value="afternoon">Chiều</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Giờ vào</label>
            <input
              type="datetime-local"
              className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              value={editData.checkIn}
              onChange={(e) => setEditData({ ...editData, checkIn: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Giờ ra</label>
            <input
              type="datetime-local"
              className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              value={editData.checkOut}
              onChange={(e) => setEditData({ ...editData, checkOut: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
