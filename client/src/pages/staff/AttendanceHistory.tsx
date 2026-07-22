import { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { Attendance } from '../../types';
import { Spinner } from '@heroui/react';

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
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">Lịch sử chấm công</h2>

      <div className="bg-white rounded-xl border border-divider overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider">
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Ngày</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Ca</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Giờ vào</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Giờ ra</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Đi trễ</th>
                <th className="text-left px-4 py-3 text-foreground/60 font-medium">Giờ làm</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map((att) => (
                <tr key={att._id} className="border-b border-divider/50 hover:bg-content2/50 transition-colors">
                  <td className="px-4 py-3 text-sm">{formatDate(att.date)}</td>
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
                      <span className="inline-flex items-center h-5 px-2 rounded-full text-xs font-medium bg-success/10 text-success">Đúng giờ</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{att.hoursWorked}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {attendances.length === 0 && (
        <div className="text-center py-12 text-foreground/40">
          Chưa có bản ghi chấm công
        </div>
      )}
    </div>
  );
}
