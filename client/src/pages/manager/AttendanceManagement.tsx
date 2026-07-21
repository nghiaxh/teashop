import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Attendance } from '../../types';

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
    <div>
      <h2 className="text-2xl font-bold mb-6">Quản lý Chấm công</h2>

      <div className="overflow-x-auto bg-base-100 rounded-box shadow">
        <table className="table">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Ngày</th>
              <th>Ca</th>
              <th>Giờ vào</th>
              <th>Giờ ra</th>
              <th>Đi trễ</th>
              <th>Giờ làm</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {attendances.map(att => (
              <tr key={att._id}>
                <td>{att.userId?.name || 'N/A'}</td>
                <td>{new Date(att.date).toLocaleDateString('vi-VN')}</td>
                <td>
                  <span className={`badge ${att.shift === 'morning' ? 'badge-info' : 'badge-secondary'}`}>
                    {att.shift === 'morning' ? 'Sáng' : 'Chiều'}
                  </span>
                </td>
                <td>{formatTime(att.checkIn)}</td>
                <td>{formatTime(att.checkOut)}</td>
                <td>
                  {att.isLate ? (
                    <span className="badge badge-warning">Trễ</span>
                  ) : (
                    <span className="badge badge-success">OK</span>
                  )}
                </td>
                <td>{att.hoursWorked}h</td>
                <td>
                  <button className="btn btn-ghost btn-xs" onClick={() => startEdit(att)}>
                    Sửa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingAttendance && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Chỉnh sửa chấm công</h3>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Ca</span>
              </label>
              <select
                className="select select-bordered"
                value={editData.shift}
                onChange={(e) => setEditData({ ...editData, shift: e.target.value as 'morning' | 'afternoon' })}
              >
                <option value="morning">Sáng</option>
                <option value="afternoon">Chiều</option>
              </select>
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Giờ vào</span>
              </label>
              <input
                type="datetime-local"
                className="input input-bordered"
                value={editData.checkIn}
                onChange={(e) => setEditData({ ...editData, checkIn: e.target.value })}
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Giờ ra</span>
              </label>
              <input
                type="datetime-local"
                className="input input-bordered"
                value={editData.checkOut}
                onChange={(e) => setEditData({ ...editData, checkOut: e.target.value })}
              />
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
