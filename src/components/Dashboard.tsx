import { motion } from "motion/react";
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ArrowLeftRight
} from "lucide-react";
import { Wine, Transaction } from "../types";

interface DashboardProps {
  wines: Wine[];
  transactions: Transaction[];
  onViewAll: () => void;
}

export function Dashboard({ wines, transactions, onViewAll }: DashboardProps) {
  const formatKoreanCurrency = (value: number) => {
    if (value === 0) return "₩0";
    
    const units = [
      { value: 100000000, label: "억" },
      { value: 10000, label: "만" },
    ];

    let result = "";
    let remaining = value;

    for (const unit of units) {
      const count = Math.floor(remaining / unit.value);
      if (count > 0) {
        result += `${count}${unit.label} `;
        remaining %= unit.value;
      }
    }

    if (remaining > 0 || result === "") {
      result += `${remaining.toLocaleString()}`;
    }

    return `₩${result.trim()}`;
  };

  const totalValue = wines.reduce((acc, wine) => acc + (wine.priceB2B * wine.quantity), 0);
  const totalBottles = wines.reduce((acc, wine) => acc + wine.quantity, 0);
  const lowStockCount = wines.filter(w => w.quantity < 3).length;

  // Revenue and Profit calculations
  const outboundTransactions = transactions.filter(t => t.type === "Outbound");
  const totalRevenue = outboundTransactions.reduce((acc, t) => acc + (t.totalPrice || 0), 0);
  
  // Profit calculation: (Selling Price - Cost Price) * Quantity
  const totalProfit = outboundTransactions.reduce((acc, t) => {
    const wine = wines.find(w => w.id === t.wineId);
    const costPrice = wine?.price || 0;
    const profit = (t.unitPrice - costPrice) * t.quantity;
    return acc + profit;
  }, 0);

  const widgets = [
    { 
      label: "B2B 재고", 
      value: formatKoreanCurrency(totalValue), 
      icon: DollarSign, 
      color: "bg-blue-500",
    },
    { 
      label: "보유 총 병 수", 
      value: `${totalBottles.toLocaleString()}병`, 
      icon: Package, 
      color: "bg-wine-primary",
    },
    { 
      label: "누적 매출액", 
      value: formatKoreanCurrency(totalRevenue), 
      icon: TrendingUp, 
      color: "bg-green-500",
    },
    { 
      label: "누적 영업 이익", 
      value: formatKoreanCurrency(totalProfit), 
      icon: DollarSign, 
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-wine-dark mb-1">대시보드</h1>
        <p className="text-sm text-gray-500">실시간 재고 현황 및 주요 지표를 확인하세요.</p>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {widgets.map((widget, i) => (
          <motion.div
            key={widget.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${widget.color} text-white`}>
                <widget.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-wine-dark mb-1">{widget.value}</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">{widget.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-wine-dark">최근 입출고 내역</h3>
            <button 
              onClick={onViewAll}
              className="text-xs font-semibold text-wine-accent hover:underline"
            >
              전체 보기
            </button>
          </div>
          <div className="space-y-4">
            {transactions.slice(0, 5).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-wine-light transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === "Inbound" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
                    <ArrowLeftRight className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-wine-dark">{t.wineName}</div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase">
                      {t.partnerName}{t.notes ? ` · ${t.notes}` : ""}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${t.type === "Inbound" ? "text-green-600" : "text-blue-600"}`}>
                    {t.type === "Inbound" ? "+" : "-"}{t.quantity}병
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium">
                    {new Date(t.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-wine-dark">재고 부족 알림</h3>
          </div>
          <div className="space-y-4">
            {wines.filter(w => w.quantity < 3).map((w) => (
              <div key={w.id} className="p-4 rounded-2xl border border-red-100 bg-red-50/30">
                <div className="text-sm font-bold text-wine-dark mb-1">{w.name} {w.vintage}</div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-red-600 font-bold">현재 재고: {w.quantity}병</span>
                </div>
              </div>
            ))}
          </div>
          {/* No Footer */}
        </div>
      </div>
    </div>
  );
}
