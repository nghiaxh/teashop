import { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { Attendance } from '../../types';
import { X, Pencil } from '@phosphor-icons/react';

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
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-base-content">Quản lý Chấm công</h2>

      <div className="bg-white rounded-xl border border-base-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th className="text-base-content/60">Nhân viên</th>
                <th className="text-base-content/60">Ngày</th>
                <th className="text-base-content/60">Ca</th>
                <th className="text-base-content/60">Giờ vào</th>
                <th className="text-base-content/60">Giờ ra</th>
                <th className="text-base-content/60">Đi trễ</th>
                <th className="text-base-content/60">Giờ làm</th>
                <th className="text-base-content/60">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map(att => (
                <tr key={att._id} className="hover">
                  <td className="text-sm">{att.userId?.name || 'N/A'}</td>
                  <td className="text-sm">{new Date(att.date).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <span className={`badge badge-sm ${att.shift === 'morning' ? 'badge-info' : 'badge-secondary'}`}>
                      {att.shift === 'morning' ? 'Sáng' : 'Chiều'}
                    </span>
                  </td>
                  <td className="text-sm">{formatTime(att.checkIn)}</td>
                  <td className="text-sm">{formatTime(att.checkOut)}</td>
                  <td>
                    {att.isLate ? (
                      <span className="badge badge-warning badge-sm">Trễ</span>
                    ) : (
                      <span className="badge badge-success badge-sm">OK</span>
                    )}
                  </td>
                  <td className="text-sm">{att.hoursWorked}h</td>
                  <td>
                    <button className="btn btn-ghost btn-xs btn-square" onClick={() => startEdit(att)}>
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
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Chỉnh sửa chấm công</h3>
              <button
                className="btn btn-ghost btn-sm btn-square"
                onClick={() => setEditingAttendance(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-base-content mb-1.5">
                  Ca
                </label>
                <select
                  className="select select-bordered w-full"
                  value={editData.shift}
                  onChange={(e) => setEditData({ ...editData, shift: e.target.value as 'morning' | 'afternoon' })}
                >
                  <option value="morning">Sáng</option>
                  <option value="afternoon">Chiều</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-base-content mb-1.5">
                  Giờ vào
                </label>
                <input
                  type="datetime-local"
                  className="input input-bordered w-full"
                  value={editData.checkIn}
                  onChange={(e) => setEditData({ ...editData, checkIn: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-base-content mb-1.5">
                  Giờ ra
                </label>
                <input
                  type="datetime-local"
                  className="input input-bordered w-full"
                  value={editData.checkOut}
                  onChange={(e) => setEditData({ ...editData, checkOut: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setEditingAttendance(null)}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleUpdate}>
                Cập nhật
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setEditingAttendance(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
