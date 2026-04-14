import React, { useState } from "react";
import { 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink,
  Plus,
  History,
  Info,
  Save,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";
import { Partner, Transaction } from "../types";
import { Modal } from "./Modal";

interface PartnerListProps {
  partners: Partner[];
  transactions: Transaction[];
  onAddPartner: (partner: Omit<Partner, "id">) => Promise<void>;
  onUpdatePartner: (id: string, partner: Partial<Partner>) => Promise<void>;
  onDeletePartner: (id: string) => Promise<void>;
}

import { Trash2, Search } from "lucide-react";

export function PartnerList({ partners, transactions, onAddPartner, onUpdatePartner, onDeletePartner }: PartnerListProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPartnerForDetails, setSelectedPartnerForDetails] = useState<Partner | null>(null);
  const [selectedPartnerForHistory, setSelectedPartnerForHistory] = useState<Partner | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partner | null>(null);
  const [filterType, setFilterType] = useState<"All" | "Supplier" | "Client">("All");
  const [search, setSearch] = useState("");

  const [newPartner, setNewPartner] = useState<Omit<Partner, "id" | "ownerId">>({
    name: "",
    type: "Supplier",
    category: "",
    contact: "",
    email: "",
    location: ""
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAddPartner(newPartner as any);
      setIsAddModalOpen(false);
      setNewPartner({
        name: "",
        type: "Supplier",
        category: "",
        contact: "",
        email: "",
        location: ""
      });
    } catch (error) {
      console.error("Add partner error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    setIsSubmitting(true);
    try {
      await onUpdatePartner(editForm.id, editForm);
      setSelectedPartnerForDetails(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error("Update partner error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const partnerTransactions = selectedPartnerForHistory 
    ? transactions.filter(t => t.partnerId === selectedPartnerForHistory.id)
    : [];

  const filteredPartners = partners.filter(p => {
    const matchesType = filterType === "All" || p.type === filterType;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.category.toLowerCase().includes(search.toLowerCase()) ||
                         p.location.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleDeletePartner = async (id: string) => {
    if (confirm("이 거래처를 삭제하시겠습니까? 관련 거래 내역은 유지되지만 거래처 정보가 사라집니다.")) {
      setIsSubmitting(true);
      try {
        await onDeletePartner(id);
        setSelectedPartnerForDetails(null);
        setIsEditing(false);
      } catch (error) {
        console.error("Delete partner error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-wine-dark mb-1">거래처 관리</h1>
          <p className="text-sm text-gray-500">공급사 및 고객사 정보를 체계적으로 관리합니다.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-wine-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-wine-accent transition-all shadow-lg shadow-wine-primary/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> 거래처 추가
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="거래처명, 카테고리, 위치 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType("All")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === "All" ? "bg-wine-primary text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilterType("Supplier")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === "Supplier" ? "bg-purple-500 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            공급사
          </button>
          <button
            onClick={() => setFilterType("Client")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === "Client" ? "bg-blue-500 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            고객사
          </button>
        </div>
      </div>

      {/* Add Partner Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="신규 거래처 등록"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">거래처명</label>
            <input
              required
              type="text"
              value={newPartner.name}
              onChange={(e) => setNewPartner({...newPartner, name: e.target.value})}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">구분</label>
              <select
                value={newPartner.type}
                onChange={(e) => setNewPartner({...newPartner, type: e.target.value as any})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
              >
                <option value="Supplier">공급사 (Supplier)</option>
                <option value="Client">고객사 (Client)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">카테고리</label>
              <input
                type="text"
                value={newPartner.category}
                onChange={(e) => setNewPartner({...newPartner, category: e.target.value})}
                placeholder="e.g. Winery, Restaurant"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">연락처</label>
            <input
              type="text"
              value={newPartner.contact}
              onChange={(e) => setNewPartner({...newPartner, contact: e.target.value})}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">이메일</label>
            <input
              type="email"
              value={newPartner.email}
              onChange={(e) => setNewPartner({...newPartner, email: e.target.value})}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">위치</label>
            <input
              type="text"
              value={newPartner.location}
              onChange={(e) => setNewPartner({...newPartner, location: e.target.value})}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-wine-primary text-white rounded-xl font-bold hover:bg-wine-accent transition-all disabled:opacity-50 shadow-lg shadow-wine-primary/20 mt-4"
          >
            {isSubmitting ? "저장 중..." : "거래처 등록 완료"}
          </button>
        </form>
      </Modal>

      {/* Partner Details Modal */}
      <Modal
        isOpen={!!selectedPartnerForDetails}
        onClose={() => {
          setSelectedPartnerForDetails(null);
          setIsEditing(false);
        }}
        title={isEditing ? "거래처 정보 수정" : "거래처 상세 정보"}
      >
        {selectedPartnerForDetails && (
          <form onSubmit={handleUpdateSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">거래처명</label>
                <input
                  disabled={!isEditing}
                  required
                  type="text"
                  value={isEditing ? editForm?.name : selectedPartnerForDetails.name}
                  onChange={(e) => setEditForm(prev => prev ? {...prev, name: e.target.value} : null)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm disabled:opacity-70"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">구분</label>
                  <select
                    disabled={!isEditing}
                    value={isEditing ? editForm?.type : selectedPartnerForDetails.type}
                    onChange={(e) => setEditForm(prev => prev ? {...prev, type: e.target.value as any} : null)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm disabled:opacity-70"
                  >
                    <option value="Supplier">공급사</option>
                    <option value="Client">고객사</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">카테고리</label>
                  <input
                    disabled={!isEditing}
                    type="text"
                    value={isEditing ? editForm?.category : selectedPartnerForDetails.category}
                    onChange={(e) => setEditForm(prev => prev ? {...prev, category: e.target.value} : null)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm disabled:opacity-70"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">연락처</label>
                <input
                  disabled={!isEditing}
                  type="text"
                  value={isEditing ? editForm?.contact : selectedPartnerForDetails.contact}
                  onChange={(e) => setEditForm(prev => prev ? {...prev, contact: e.target.value} : null)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm disabled:opacity-70"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">이메일</label>
                <input
                  disabled={!isEditing}
                  type="email"
                  value={isEditing ? editForm?.email : selectedPartnerForDetails.email}
                  onChange={(e) => setEditForm(prev => prev ? {...prev, email: e.target.value} : null)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm disabled:opacity-70"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">위치</label>
                <input
                  disabled={!isEditing}
                  type="text"
                  value={isEditing ? editForm?.location : selectedPartnerForDetails.location}
                  onChange={(e) => setEditForm(prev => prev ? {...prev, location: e.target.value} : null)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm disabled:opacity-70"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-wine-primary text-white rounded-xl font-bold hover:bg-wine-accent transition-all flex items-center justify-center gap-2 shadow-lg shadow-wine-primary/20"
                  >
                    <Save className="w-4 h-4" /> {isSubmitting ? "저장 중..." : "저장하기"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(true);
                      setEditForm(selectedPartnerForDetails);
                    }}
                    className="flex-[2] py-3 bg-wine-primary text-white rounded-xl font-bold hover:bg-wine-accent transition-all flex items-center justify-center gap-2 shadow-lg shadow-wine-primary/20"
                  >
                    <Info className="w-4 h-4" /> 정보 수정하기
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePartner(selectedPartnerForDetails.id)}
                    className="flex-1 py-3 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-100"
                  >
                    <Trash2 className="w-4 h-4" /> 삭제
                  </button>
                </>
              )}
            </div>
          </form>
        )}
      </Modal>

      {/* Partner History Modal */}
      <Modal
        isOpen={!!selectedPartnerForHistory}
        onClose={() => setSelectedPartnerForHistory(null)}
        title={`${selectedPartnerForHistory?.name} 거래 내역`}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {partnerTransactions.length > 0 ? (
            <div className="space-y-3">
              {partnerTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((t) => (
                <div key={t.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      t.type === "Inbound" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                    }`}>
                      {t.type === "Inbound" ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-wine-dark">{t.wineName}</div>
                      <div className="text-[10px] text-gray-400 font-medium">{t.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${
                      t.type === "Inbound" ? "text-green-600" : "text-blue-600"
                    }`}>
                      {t.type === "Inbound" ? "+" : "-"}{t.quantity}병
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">
                      ₩{t.totalPrice.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <History className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-sm text-gray-400">거래 내역이 없습니다.</p>
            </div>
          )}
        </div>
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((partner) => (
          <div key={partner.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                partner.type === "Supplier" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
              }`}>
                {partner.type === "Supplier" ? "공급사" : "고객사"}
              </div>
              <button className="text-gray-400 hover:text-wine-accent">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-lg font-bold text-wine-dark mb-1">{partner.name}</h3>
            <p className="text-xs text-gray-400 font-medium mb-6">{partner.category}</p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-gray-400" />
                </div>
                {partner.contact}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
                <span className="truncate">{partner.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>
                {partner.location}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-50 flex gap-2">
              <button 
                onClick={() => setSelectedPartnerForDetails(partner)}
                className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors"
              >
                상세 정보
              </button>
              <button 
                onClick={() => setSelectedPartnerForHistory(partner)}
                className="flex-1 py-2 bg-wine-primary/10 text-wine-accent rounded-xl text-xs font-bold hover:bg-wine-primary/20 transition-colors"
              >
                거래 내역
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
