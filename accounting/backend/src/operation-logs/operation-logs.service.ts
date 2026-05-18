import { Injectable } from '@nestjs/common';

let idCounter = 13;

const logs: any[] = [
  { id: 1, user: '陳美玲', role: '資深會計', action: '送審', target: '案件 A001（宏達貿易）', time: '2026-05-15 16:45', ip: '192.168.1.3' },
  { id: 2, user: '林國棟', role: '老闆', action: '修改', target: '案件 A001 → 退回修改', time: '2026-05-16 11:20', ip: '192.168.1.1' },
  { id: 3, user: '陳美玲', role: '資深會計', action: '上傳', target: '宏達貿易5月進項憑證彙整.xlsx', time: '2026-05-08 10:15', ip: '192.168.1.3' },
  { id: 4, user: '王志明', role: '一般會計', action: '修改', target: '客戶 C002（新光物流）聯絡人資料', time: '2026-05-17 09:30', ip: '192.168.1.4' },
  { id: 5, user: '林佳慧', role: '一般會計', action: '新增', target: '任務 T007（松山食品勞健保）', time: '2026-05-17 09:45', ip: '192.168.1.5' },
  { id: 6, user: '張淑芬', role: '主任', action: '修改', target: '案件 A008 負責人 → 張淑芬', time: '2026-05-16 09:00', ip: '192.168.1.2' },
  { id: 7, user: '陳美玲', role: '資深會計', action: '下載', target: '客戶對帳單5月.pdf', time: '2026-05-17 10:00', ip: '192.168.1.3' },
  { id: 8, user: '吳俊宏', role: '實習生', action: '登入', target: '系統', time: '2026-05-17 08:30', ip: '192.168.1.8' },
  { id: 9, user: '黃曉玲', role: '助理', action: '新增', target: '客戶 C004（信義建設）備注', time: '2026-05-16 14:30', ip: '192.168.1.7' },
  { id: 10, user: '李建宏', role: '資深會計', action: '修改', target: '合約 CT004 金額 → NT$ 12,000', time: '2026-05-15 11:00', ip: '192.168.1.6' },
  { id: 11, user: '林國棟', role: '老闆', action: '登出', target: '系統', time: '2026-05-16 18:30', ip: '192.168.1.1' },
  { id: 12, user: '王志明', role: '一般會計', action: '刪除', target: '草稿案件 A011（草稿）', time: '2026-05-14 15:00', ip: '192.168.1.4' },
];

@Injectable()
export class OperationLogsService {
  findAll(user?: string, action?: string) {
    return logs.filter((l) => {
      if (user && l.user !== user) return false;
      if (action && l.action !== action) return false;
      return true;
    });
  }

  append(user: string, role: string, action: string, target: string, ip = '127.0.0.1') {
    const now = new Date()
      .toLocaleString('zh-TW', { hour12: false, timeZone: 'Asia/Taipei' })
      .replace(/\//g, '-');
    const log = { id: idCounter++, user, role, action, target, time: now, ip };
    logs.push(log);
    return log;
  }
}
