import { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { Attendance } from '../../types';

export default function AttendanceHistory() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

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

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
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
      <h2 className="text-xl font-bold text-base-content">Lịch sử chấm công</h2>

      <div className="bg-white rounded-xl border border-base-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th className="text-base-content/60">Ngày</th>
                <th className="text-base-content/60">Ca</th>
                <th className="text-base-content/60">Giờ vào</th>
                <th className="text-base-content/60">Giờ ra</th>
                <th className="text-base-content/60">Đi trễ</th>
                <th className="text-base-content/60">Giờ làm</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map((att) => (
                <tr key={att._id} className="hover">
                  <td className="text-sm">{formatDate(att.date)}</td>
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
                      <span className="badge badge-success badge-sm">Đúng giờ</span>
                    )}
                  </td>
                  <td className="text-sm">{att.hoursWorked}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {attendances.length === 0 && (
        <div className="text-center py-12 text-base-content/40">
          Chưa có bản ghi chấm công
        </div>
      )}
    </div>
  );
}
