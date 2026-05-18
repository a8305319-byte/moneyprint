import { Injectable } from '@nestjs/common';

const today = '2026-05-18';

const casesData = [
  { id: 'A001', clientName: '宏達貿易', owner: '陳美玲', status: '退回修改', dueDate: '2026-05-20', month: '2026-05' },
  { id: 'A002', clientName: '新光物流', owner: '王志明', status: '退回修改', dueDate: '2026-05-18', month: '2026-05' },
  { id: 'A003', clientName: '全台科技', owner: '林佳慧', status: '處理中', dueDate: '2026-05-25', month: '2026-05' },
  { id: 'A004', clientName: '宏達貿易', owner: '陳美玲', status: '已申報', dueDate: '2026-04-30', month: '2026-04' },
  { id: 'A005', clientName: '信義建設', owner: '李建宏', status: '歸檔', dueDate: '2026-03-31', month: '2026-03' },
  { id: 'A007', clientName: '松山食品', owner: '林佳慧', status: '等待資料', dueDate: '2026-05-22', month: '2026-05' },
  { id: 'A008', clientName: '大安診所', owner: '張淑芬', status: '收到資料', dueDate: '2026-05-19', month: '2026-05' },
  { id: 'A009', clientName: '全台科技', owner: '陳美玲', status: '待申報', dueDate: '2026-05-31', month: '2026-05' },
  { id: 'A010', clientName: '信義建設', owner: '李建宏', status: '指派', dueDate: '2026-05-28', month: '2026-05' },
];

const tasksData = [
  { id: 'T001', title: '整理宏達貿易5月進項憑證', assignee: '陳美玲', status: '進行中', dueDate: '2026-05-17', priority: '高' },
  { id: 'T002', title: '補件：新光物流扣繳憑單', assignee: '王志明', status: '進行中', dueDate: '2026-05-17', priority: '高' },
  { id: 'T003', title: '全台科技5月薪資計算', assignee: '林佳慧', status: '待處理', dueDate: '2026-05-22', priority: '中' },
  { id: 'T004', title: '整理信義建設固定資產折舊', assignee: '李建宏', status: '待處理', dueDate: '2026-05-28', priority: '低' },
  { id: 'T005', title: '大安診所5月銷項對帳', assignee: '張淑芬', status: '逾期', dueDate: '2026-05-15', priority: '高' },
  { id: 'T007', title: '松山食品員工勞健保加退保', assignee: '林佳慧', status: '待處理', dueDate: '2026-05-20', priority: '中' },
];

const paymentsData = [
  { clientName: '新光物流', month: '2026-05', amount: 5000, status: '未收款', dueDate: '2026-05-10' },
  { clientName: '信義建設', month: '2026-05', amount: 12000, status: '未收款', dueDate: '2026-05-10' },
  { clientName: '宏達貿易', month: '2026-02', amount: 8000, status: '逾期未收', dueDate: '2026-02-10' },
];

const notificationsData = [
  { recipientId: 'E003', read: false },
  { recipientId: 'E003', read: false },
  { recipientId: 'E002', read: false },
  { recipientId: 'E006', read: false },
  { recipientId: null, read: false },
];

@Injectable()
export class DashboardService {
  getStats(employeeId?: string) {
    const overdueCases = casesData.filter(
      (c) => !['已申報', '歸檔', '結案'].includes(c.status) && c.dueDate < today,
    );

    const pendingReview = casesData.filter((c) => c.status === '送主管覆核');
    const pendingFiling = casesData.filter((c) => c.status === '待申報');
    const waitingData = casesData.filter((c) => c.status === '等待資料');

    const myTasks = employeeId
      ? tasksData.filter((t) => t.status !== '完成')
      : tasksData.filter((t) => t.status !== '完成');

    const overdueTasks = tasksData.filter((t) => t.status === '逾期' || (t.dueDate < today && t.status !== '完成'));

    const pendingPayments = paymentsData.filter((p) => p.status !== '已收款');

    const unreadNotifications = employeeId
      ? notificationsData.filter((n) => !n.read && (n.recipientId === employeeId || n.recipientId === null))
      : notificationsData.filter((n) => !n.read);

    return {
      overview: {
        totalActiveCases: casesData.filter((c) => !['歸檔', '結案'].includes(c.status)).length,
        overdueCases: overdueCases.length,
        pendingReview: pendingReview.length,
        pendingFiling: pendingFiling.length,
        waitingData: waitingData.length,
        overdueTasks: overdueTasks.length,
        pendingPayments: pendingPayments.length,
        pendingPaymentAmount: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
        unreadNotifications: unreadNotifications.length,
      },
      myTasks: myTasks.slice(0, 5).map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        overdue: t.dueDate < today && t.status !== '完成',
      })),
      overdueCasesList: overdueCases.slice(0, 5).map((c) => ({
        id: c.id,
        clientName: c.clientName,
        owner: c.owner,
        status: c.status,
        dueDate: c.dueDate,
      })),
      pendingReviewList: pendingReview.map((c) => ({
        id: c.id,
        clientName: c.clientName,
        owner: c.owner,
        month: c.month,
      })),
      pendingFilingList: pendingFiling.map((c) => ({
        id: c.id,
        clientName: c.clientName,
        owner: c.owner,
        dueDate: c.dueDate,
      })),
      pendingPaymentList: pendingPayments.map((p) => ({
        clientName: p.clientName,
        month: p.month,
        amount: p.amount,
        status: p.status,
        dueDate: p.dueDate,
      })),
    };
  }
}
