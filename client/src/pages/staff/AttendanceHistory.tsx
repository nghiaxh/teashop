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
    <div>
      <h2 className="text-2xl font-bold mb-6">Lịch sử chấm công</h2>

      <div className="overflow-x-auto bg-base-100 rounded-box shadow">
        <table className="table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Ca</th>
              <th>Giờ vào</th>
              <th>Giờ ra</th>
              <th>Đi trễ</th>
              <th>Giờ làm</th>
            </tr>
          </thead>
          <tbody>
            {attendances.map((att) => (
              <tr key={att._id}>
                <td>{formatDate(att.date)}</td>
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
                    <span className="badge badge-success">Đúng giờ</span>
                  )}
                </td>
                <td>{att.hoursWorked}h</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {attendances.length === 0 && (
        <div className="text-center py-8 text-base-content/60">
          Chưa có bản ghi chấm công
        </div>
      )}
    </div>
  );
}
