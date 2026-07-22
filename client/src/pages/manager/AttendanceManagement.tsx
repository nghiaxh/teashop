import { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { Attendance } from '../../types';
import { X, Pencil } from '@phosphor-icons/react';
import { Spinner } from '@heroui/react';

export default function AttendanceManagement() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
  const [editData, setEditData] = useState({
    checkIn: '',
    checkOut: '',
    shift: 'morning' as 'morning' | 'afternoon'
  });

  useEffect(() => {
    fetchAttendances();
  }, []);

  const fetchAttendances = async () => {
    try {
      const res = await api.get('/attendance');
      setAttendances(res.data.attendances);
    } catch (error) {
      console.error('Failed to fetch attendances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingAttendance) return;
    try {
      await api.put(`/attendance/${editingAttendance._id}`, editData);
      fetchAttendances();
      setEditingAttendance(null);
    } catch (error) {
      console.error('Failed to update attendance:', error);
    }
  };

  const startEdit = (att: Attendance) => {
    setEditingAttendance(att);
    setEditData({
      checkIn: new Date(att.checkIn).toISOString().slice(0, 16),
      checkOut: att.checkOut ? new Date(att.checkOut).toISOString().slice(0, 16) : '',
      shift: att.shift
    });
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">Quản lý Chấm công</h2>

      <div className="bg-white rounded-xl border border-divider overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider">
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Nhân viên</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Ngày</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Ca</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Giờ vào</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Giờ ra</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Đi trễ</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Giờ làm</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map(att => (
                <tr key={att._id} className="border-b border-divider/50 hover:bg-content2/50 transition-colors">
                  <td className="px-4 py-3 text-sm">{att.userId?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">{new Date(att.date).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center h-5 px-2 rounded-full text-xs font-medium ${
                      att.shift === 'morning' ? 'bg-info/10 text-info' : 'bg-secondary/10 text-secondary'
                    }`}>
                      {att.shift === 'morning' ? 'Sáng' : 'Chiều'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{formatTime(att.checkIn)}</td>
                  <td className="px-4 py-3 text-sm">{formatTime(att.checkOut)}</td>
                  <td className="px-4 py-3">
                    {att.isLate ? (
                      <span className="inline-flex items-center h-5 px-2 rounded-full text-xs font-medium bg-warning/10 text-warning">Trễ</span>
                    ) : (
                      <span className="inline-flex items-center h-5 px-2 rounded-full text-xs font-medium bg-success/10 text-success">OK</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{att.hoursWorked}h</td>
                  <td className="px-4 py-3">
                    <button className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-content2 transition-colors" onClick={() => startEdit(att)}>
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingAttendance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditingAttendance(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-foreground">Chỉnh sửa chấm công</h3>
              <button
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-content2 transition-colors"
                onClick={() => setEditingAttendance(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Ca
                </label>
                <select
                  className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={editData.shift}
                  onChange={(e) => setEditData({ ...editData, shift: e.target.value as 'morning' | 'afternoon' })}
                >
                  <option value="morning">Sáng</option>
                  <option value="afternoon">Chiều</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Giờ vào
                </label>
                <input
                  type="datetime-local"
                  className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={editData.checkIn}
                  onChange={(e) => setEditData({ ...editData, checkIn: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Giờ ra
                </label>
                <input
                  type="datetime-local"
                  className="w-full h-10 px-3 rounded-lg border border-divider bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={editData.checkOut}
                  onChange={(e) => setEditData({ ...editData, checkOut: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                className="h-10 px-4 rounded-lg border border-divider bg-white text-foreground text-sm font-medium hover:bg-content2 transition-colors"
                onClick={() => setEditingAttendance(null)}
              >
                Hủy
              </button>
              <button
                className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                onClick={handleUpdate}
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
