import React, { useState } from "react";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Calendar,
  MoreVertical,
  History
} from "lucide-react";
import { Wine, Partner, Transaction, CurrencyType, PaymentMethod } from "../types";
import { cn } from "../lib/utils";
import { Modal } from "./Modal";

interface TransactionHistoryProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => Promise<void>;
  onUpdateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  wines: Wine[];
  partners: Partner[];
}

export function TransactionHistory({ 
  transactions, 
  onDeleteTransaction, 
  onUpdateTransaction,
  wines,
  partners 
}: TransactionHistoryProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Inbound" | "Outbound">("All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCashReceipt = async (transaction: Transaction) => {
    try {
      await onUpdateTransaction(transaction.id, { 
        cashReceiptIssued: !transaction.cashReceiptIssued 
      });
    } catch (error) {
      console.error("Failed to update cash receipt status:", error);
    }
  };

  const getPaymentMethodLabel = (method?: PaymentMethod) => {
    switch (method) {
      case "Bank Transfer": return "계좌이체";
      case "Card": return "카드";
      case "Cash": return "현금";
      case "Company Expense": return "자사부담";
      default: return "-";
    }
  };

  const getPriceTypeLabel = (type: string) => {
    switch (type) {
      case "Cost": return "수입단가";
      case "B2B": return "B2B";
      case "B2C": return "B2C";
      case "Custom": return "Custom";
      case "Staff": return "임직원가";
      case "Business": return "업무용";
      default: return type;
    }
  };

  const filteredTransactions = transactions
    .filter(t => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        t.wineName.toLowerCase().includes(searchLower) || 
        t.partnerName.toLowerCase().includes(searchLower) ||
        (t.notes || "").toLowerCase().includes(searchLower);
      const matchesType = filterType === "All" || t.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });

  const handleDelete = async (id: string) => {
    if (confirm("이 거래 내역을 삭제하시겠습니까? 재고 수량은 자동으로 복구되지 않으니 주의하세요.")) {
      await onDeleteTransaction(id);
    }
  };

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setEditForm({ ...transaction });
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransaction) return;
    setIsSubmitting(true);
    try {
      await onUpdateTransaction(selectedTransaction.id, editForm);
      setIsEditModalOpen(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error("Update transaction error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-wine-dark mb-1">전체 입출고 내역</h1>
          <p className="text-sm text-gray-500">시스템에 기록된 모든 거래 내역을 확인하고 관리합니다.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="와인명 또는 거래처 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            {sortOrder === "asc" ? "오래된순 ↑" : "최신순 ↓"}
          </button>
          <button
            onClick={() => setFilterType("All")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === "All" ? "bg-wine-primary text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilterType("Inbound")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === "Inbound" ? "bg-green-500 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            입고
          </button>
          <button
            onClick={() => setFilterType("Outbound")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === "Outbound" ? "bg-blue-500 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            출고
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">날짜</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">구분</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">와인 / 거래처</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">수량</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">단가 / 총액</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">결제 / 현금영수증</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">비고</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[10px] font-medium text-gray-600">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {new Date(t.date).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}
                    </div>
                    {t.createdByEmail && (
                      <div className="text-[9px] text-gray-400 mt-0.5 ml-5 font-medium truncate max-w-[120px]">
                        {t.createdByEmail}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      t.type === "Inbound" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                    }`}>
                      {t.type === "Inbound" ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      {t.type === "Inbound" ? "입고" : "출고"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-wine-dark">{t.wineName}</div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase">{t.partnerName} · {getPriceTypeLabel(t.priceType)}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-bold text-wine-dark">{t.quantity}병</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-bold text-wine-dark">
                      {t.currency === "KRW" ? "₩" : t.currency}{(t.unitPrice || 0).toLocaleString()}
                    </div>
                    <div className={`text-[10px] font-bold ${t.type === "Inbound" ? "text-green-600" : "text-blue-600"}`}>
                      총 {t.currency === "KRW" ? "₩" : t.currency}{t.totalPrice.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {t.type === "Outbound" ? (
                      <div className="flex flex-col gap-1">
                        <div className="text-[10px] font-bold text-gray-600">
                          {getPaymentMethodLabel(t.paymentMethod)}
                        </div>
                        {(t.paymentMethod === "Bank Transfer" || t.paymentMethod === "Cash") ? (
                          <button
                            onClick={() => toggleCashReceipt(t)}
                            className={cn(
                              "w-fit px-2 py-0.5 rounded-full text-[9px] font-bold transition-colors",
                              t.cashReceiptIssued 
                                ? "bg-green-100 text-green-600 hover:bg-green-200" 
                                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                            )}
                          >
                            현금영수증: {t.cashReceiptIssued ? "O" : "X"}
                          </button>
                        ) : (
                          <div className="text-[9px] text-gray-300 font-medium">현금영수증 해당없음</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-300">-</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500 max-w-[150px] truncate" title={t.notes}>
                      {t.notes || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center relative">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === t.id ? null : t.id)}
                        className="p-2 text-gray-400 hover:text-wine-accent hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {openMenuId === t.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenMenuId(null)}
                          ></div>
                          <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20">
                            <button
                              onClick={() => handleEditClick(t)}
                              className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              수정하기
                            </button>
                            <button
                              onClick={() => {
                                handleDelete(t.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                            >
                              삭제하기
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <History className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-sm text-gray-400 font-medium">거래 내역이 없습니다.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Transaction Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="거래 내역 수정"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">날짜</label>
              <input
                required
                type="date"
                value={editForm.date || ""}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">수량 (병)</label>
              <input
                required
                type="number"
                value={editForm.quantity || 0}
                onChange={(e) => {
                  const qty = Number(e.target.value);
                  setEditForm({ 
                    ...editForm, 
                    quantity: qty,
                    totalPrice: (editForm.unitPrice || 0) * qty
                  });
                }}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">단가</label>
              <div className="flex gap-2">
                <select
                  value={editForm.currency || "KRW"}
                  onChange={(e) => setEditForm({ ...editForm, currency: e.target.value as CurrencyType })}
                  className="w-20 px-2 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                >
                  <option value="KRW">₩</option>
                  <option value="USD">$</option>
                  <option value="EUR">€</option>
                  <option value="JPY">¥</option>
                  <option value="GBP">£</option>
                </select>
                <input
                  required
                  type="number"
                  value={editForm.unitPrice || 0}
                  onChange={(e) => {
                    const price = Number(e.target.value);
                    setEditForm({ 
                      ...editForm, 
                      unitPrice: price,
                      totalPrice: price * (editForm.quantity || 0)
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">총액</label>
              <div className="w-full px-4 py-2 bg-gray-100 border border-gray-100 rounded-xl text-sm font-bold text-wine-dark">
                {editForm.currency === "KRW" ? "₩" : 
                 editForm.currency === "USD" ? "$" : 
                 editForm.currency === "EUR" ? "€" : 
                 editForm.currency === "JPY" ? "¥" : "£"}
                {(editForm.totalPrice || 0).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">비고</label>
            <textarea
              value={editForm.notes || ""}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-wine-primary text-white rounded-xl font-bold hover:bg-wine-accent transition-all disabled:opacity-50 shadow-lg shadow-wine-primary/20"
          >
            {isSubmitting ? "수정 중..." : "수정 완료"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
