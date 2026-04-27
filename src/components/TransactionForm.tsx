import React, { useState, useEffect } from "react";
import { 
  ArrowLeftRight, 
  Plus, 
  Minus, 
  Search,
  Calendar,
  Building2,
  Wine as WineIcon
} from "lucide-react";
import { Wine, Partner, Transaction, CurrencyType, PaymentMethod } from "../types";

interface TransactionFormProps {
  wines: Wine[];
  partners: Partner[];
  onAddTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
}

export function TransactionForm({ wines, partners, onAddTransaction }: TransactionFormProps) {
  const [type, setType] = useState<"Inbound" | "Outbound">("Inbound");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    wineId: "",
    partnerId: "",
    quantity: 0,
    date: new Date().toISOString().split('T')[0],
    notes: "",
    priceType: "B2B" as Transaction["priceType"],
    unitPrice: 0,
    currency: "KRW" as CurrencyType,
    paymentMethod: "Bank Transfer" as PaymentMethod
  });

  const [wineSearch, setWineSearch] = useState("");
  const [partnerSearch, setPartnerSearch] = useState("");
  const [showWineResults, setShowWineResults] = useState(false);
  const [showPartnerResults, setShowPartnerResults] = useState(false);

  const selectedWine = wines.find(w => w.id === formData.wineId);
  const selectedPartner = partners.find(p => p.id === formData.partnerId);

  // Filtered and Sorted Lists
  const sortedWinesList = [...wines].sort((a, b) => {
    const nameCompare = a.name.localeCompare(b.name);
    if (nameCompare !== 0) return nameCompare;
    return b.vintage.localeCompare(a.vintage);
  });

  const filteredWinesList = wineSearch 
    ? sortedWinesList.filter(w => 
        w.name.toLowerCase().includes(wineSearch.toLowerCase()) || 
        w.vintage.toString().includes(wineSearch)
      )
    : sortedWinesList;

  const sortedPartnersList = [...partners]
    .filter(p => p.type === (type === "Inbound" ? "Supplier" : "Client"))
    .sort((a, b) => a.name.localeCompare(b.name));

  const filteredPartnersList = partnerSearch 
    ? sortedPartnersList.filter(p => p.name.toLowerCase().includes(partnerSearch.toLowerCase()))
    : sortedPartnersList;

  const handlePriceTypeChange = (newPriceType: Transaction["priceType"]) => {
    if (!selectedWine) {
      setFormData(prev => ({ ...prev, priceType: newPriceType }));
      return;
    }

    let newUnitPrice = 0;
    let newCurrency: CurrencyType = "KRW";
    let newPaymentMethod = formData.paymentMethod;

    switch (newPriceType) {
      case "B2B": newUnitPrice = selectedWine.priceB2B || 0; break;
      case "B2C": newUnitPrice = selectedWine.priceB2C || 0; break;
      case "Staff": newUnitPrice = selectedWine.priceStaff || 0; break;
      case "Custom": newUnitPrice = formData.unitPrice; break;
      case "Business": 
        newUnitPrice = 0; 
        newPaymentMethod = "Company Expense";
        break;
      case "Cost": 
        newUnitPrice = selectedWine.price || 0; 
        newCurrency = selectedWine.currency || "KRW";
        break;
    }

    setFormData(prev => ({ 
      ...prev, 
      priceType: newPriceType,
      unitPrice: newUnitPrice,
      currency: newCurrency,
      paymentMethod: newPaymentMethod
    }));
  };

  const handleWineChange = (wine: Wine) => {
    let initialPriceType: Transaction["priceType"] = type === "Inbound" ? "Cost" : "B2B";
    let initialUnitPrice = 0;
    let initialCurrency: CurrencyType = "KRW";
    
    if (type === "Inbound") {
      initialUnitPrice = wine.price || 0;
      initialCurrency = wine.currency || "KRW";
    } else {
      initialUnitPrice = wine.priceB2B || 0;
    }

    setFormData(prev => ({
      ...prev,
      wineId: wine.id,
      priceType: initialPriceType,
      unitPrice: initialUnitPrice,
      currency: initialCurrency
    }));
    setWineSearch(`${wine.name} (${wine.vintage})`);
    setShowWineResults(false);
  };

  const handlePartnerChange = (partner: Partner) => {
    setFormData(prev => ({ ...prev, partnerId: partner.id }));
    setPartnerSearch(partner.name);
    setShowPartnerResults(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setShowWineResults(false);
        setShowPartnerResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.wineId || !formData.partnerId || formData.quantity <= 0) {
      alert("모든 필드를 올바르게 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedPartner = partners.find(p => p.id === formData.partnerId);

      // Use current time for the transaction to ensure precise ordering
      const now = new Date();
      const [year, month, day] = formData.date.split('-').map(Number);
      now.setFullYear(year, month - 1, day);

      const transactionData: any = {
        wineId: formData.wineId,
        wineName: selectedWine?.name || "",
        partnerId: formData.partnerId,
        partnerName: selectedPartner?.name || "",
        type,
        quantity: formData.quantity,
        date: now.toISOString(),
        unitPrice: formData.unitPrice,
        currency: formData.currency,
        totalPrice: formData.unitPrice * formData.quantity,
        priceType: formData.priceType,
        notes: formData.notes,
        ownerId: "" // Handled in App.tsx
      };

      if (type === "Outbound") {
        transactionData.paymentMethod = formData.paymentMethod;
        if (formData.paymentMethod === "Bank Transfer" || formData.paymentMethod === "Cash") {
          transactionData.cashReceiptIssued = false;
        }
      }

      await onAddTransaction(transactionData);

      setFormData(prev => ({
        ...prev,
        wineId: "",
        partnerId: "",
        quantity: 0,
        date: new Date().toISOString().split('T')[0],
        notes: "",
        priceType: "B2B",
        unitPrice: 0,
        currency: "KRW",
        paymentMethod: "Bank Transfer"
      }));
      setWineSearch("");
      setPartnerSearch("");
    } catch (error) {
      console.error("Transaction error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-wine-dark mb-1">입출고 등록</h1>
        <p className="text-sm text-gray-500">새로운 와인 입고 또는 거래처 출고 내역을 입력하세요.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            type="button"
            onClick={() => {
              setType("Inbound");
              setFormData(prev => ({ ...prev, wineId: "", partnerId: "" }));
              setWineSearch("");
              setPartnerSearch("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all ${
              type === "Inbound" ? "bg-green-50 text-green-600 border-b-2 border-green-600" : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            <Plus className="w-4 h-4" />
            입고 등록 (Inbound)
          </button>
          <button
            type="button"
            onClick={() => {
              setType("Outbound");
              setFormData(prev => ({ ...prev, wineId: "", partnerId: "" }));
              setWineSearch("");
              setPartnerSearch("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all ${
              type === "Outbound" ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            <Minus className="w-4 h-4" />
            출고 등록 (Outbound)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wine Selection (Autocomplete) */}
            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">와인 선택</label>
              <div className="relative">
                <WineIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="text"
                  placeholder="와인 이름을 입력하세요"
                  value={wineSearch}
                  onChange={(e) => {
                    setWineSearch(e.target.value);
                    setShowWineResults(true);
                  }}
                  onFocus={() => setShowWineResults(true)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                />
              </div>
              {showWineResults && filteredWinesList.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {filteredWinesList.map(w => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => handleWineChange(w)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-wine-light transition-colors border-b border-gray-50 last:border-0"
                    >
                      <div className="font-bold text-wine-dark">{w.name}</div>
                      <div className="text-[10px] text-gray-400">빈티지: {w.vintage} | 재고: {w.quantity}병</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Partner Selection (Autocomplete) */}
            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                {type === "Inbound" ? "공급사(와이너리)" : "고객사(레스토랑/소매점)"}
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="text"
                  placeholder="거래처를 입력하세요"
                  value={partnerSearch}
                  onChange={(e) => {
                    setPartnerSearch(e.target.value);
                    setShowPartnerResults(true);
                  }}
                  onFocus={() => setShowPartnerResults(true)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                />
              </div>
              {showPartnerResults && filteredPartnersList.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {filteredPartnersList.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePartnerChange(p)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-wine-light transition-colors border-b border-gray-50 last:border-0"
                    >
                      <div className="font-bold text-wine-dark">{p.name}</div>
                      <div className="text-[10px] text-gray-400">{p.category} | {p.location}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">수량 (병)</label>
              <input
                required
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                placeholder="0"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">날짜</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                />
              </div>
            </div>

            {/* Price Type Selection (Only for Outbound) */}
            {type === "Outbound" && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">가격 정책</label>
                  <select 
                    value={formData.priceType}
                    onChange={(e) => handlePriceTypeChange(e.target.value as any)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                  >
                    <option value="B2B">B2B가</option>
                    <option value="B2C">B2C가</option>
                    <option value="Staff">임직원가</option>
                    <option value="Business">업무용 (0원)</option>
                    <option value="Custom">커스텀 가격</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">결제 방법</label>
                  <select 
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                  >
                    <option value="Bank Transfer">계좌이체</option>
                    <option value="Card">신용카드/체크카드</option>
                    <option value="Cash">현금</option>
                    <option value="Company Expense">자사부담</option>
                  </select>
                </div>
              </>
            )}

            {/* Unit Price */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                {type === "Inbound" ? "입고 단가" : "출고 단가"}
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value as CurrencyType})}
                  disabled={type === "Outbound"}
                  className="w-24 px-3 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm disabled:opacity-50"
                >
                  <option value="KRW">KRW (₩)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
                <input
                  required
                  type="number"
                  disabled={type === "Outbound" && formData.priceType !== "Custom"}
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({...formData, unitPrice: Number(e.target.value)})}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div className="text-sm font-medium text-gray-500">총 합계 금액</div>
            <div className="text-xl font-bold text-wine-dark">
              {formData.currency === "KRW" ? "₩" : 
               formData.currency === "USD" ? "$" : 
               formData.currency === "EUR" ? "€" : 
               formData.currency === "JPY" ? "¥" : "£"}
              {(formData.unitPrice * formData.quantity).toLocaleString()}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">비고</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="특이사항을 입력하세요..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm resize-none"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 ${
              type === "Inbound" ? "bg-green-500 shadow-green-500/20" : "bg-blue-500 shadow-blue-500/20"
            }`}>
              {isSubmitting ? "처리 중..." : (type === "Inbound" ? "입고 처리 완료" : "출고 처리 완료")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
