import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  MoreVertical,
  Wine as WineIcon,
  MapPin,
  Calendar,
  Plus
} from "lucide-react";
import { Wine, WineType, CurrencyType } from "../types";
import { cn } from "../lib/utils";
import { Modal } from "./Modal";

interface WineListProps {
  wines: Wine[];
  onAddWine: (wine: Omit<Wine, "id">) => Promise<void>;
  onUpdateWine: (id: string, wine: Partial<Wine>) => Promise<void>;
}

export function WineList({ wines, onAddWine, onUpdateWine }: WineListProps) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<WineType | "All">("All");
  const [selectedVintage, setSelectedVintage] = useState<string>("All");
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWineForEdit, setSelectedWineForEdit] = useState<Wine | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Wine Form State
  const [newWine, setNewWine] = useState<Omit<Wine, "id" | "ownerId">>({
    name: "",
    producer: "",
    region: "",
    country: "",
    type: "Red",
    vintage: new Date().getFullYear().toString(),
    quantity: 0,
    price: 0,
    currency: "KRW",
    priceB2B: 0,
    priceB2C: 0,
    priceStaff: 0,
    location: "",
    importDate: new Date().toISOString().split('T')[0],
  });

  const [editForm, setEditForm] = useState<Wine | null>(null);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAddWine(newWine as any);
      setIsAddModalOpen(false);
      setNewWine({
        name: "",
        producer: "",
        region: "",
        country: "",
        type: "Red",
        vintage: new Date().getFullYear().toString(),
        quantity: 0,
        price: 0,
        currency: "KRW",
        priceB2B: 0,
        priceB2C: 0,
        priceStaff: 0,
        location: "",
        importDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error("Add wine error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    setIsSubmitting(true);
    try {
      await onUpdateWine(editForm.id, editForm);
      setIsEditModalOpen(false);
      setSelectedWineForEdit(null);
    } catch (error) {
      console.error("Edit wine error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredWines = wines.filter((wine) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = wine.name.toLowerCase().includes(searchLower) || 
                         wine.producer.toLowerCase().includes(searchLower);
    const matchesType = selectedType === "All" || wine.type === selectedType;
    const matchesVintage = selectedVintage === "All" || wine.vintage === selectedVintage;
    const matchesCountry = selectedCountry === "All" || wine.country === selectedCountry;
    return matchesSearch && matchesType && matchesVintage && matchesCountry;
  });

  const sortedWines = [...filteredWines].sort((a, b) => {
    const nameCompare = a.name.localeCompare(b.name);
    if (nameCompare !== 0) return nameCompare;
    return b.vintage.localeCompare(a.vintage);
  });

  const uniqueVintages = Array.from(new Set(wines.map(w => w.vintage))).sort((a, b) => b.localeCompare(a));
  const uniqueCountries = Array.from(new Set(wines.map(w => w.country))).sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-wine-dark mb-1">와인 목록</h1>
          <p className="text-sm text-gray-500">전체 {wines.length}종의 와인을 관리합니다.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-wine-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-wine-accent transition-all shadow-lg shadow-wine-primary/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> 신규 와인 등록
        </button>
      </div>

      {/* Add Wine Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="신규 와인 등록"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">와인명 (English)</label>
              <input
                required
                type="text"
                value={newWine.name}
                onChange={(e) => setNewWine({...newWine, name: e.target.value})}
                placeholder="e.g. Château Margaux"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">생산자</label>
                <input
                  type="text"
                  value={newWine.producer}
                  onChange={(e) => setNewWine({...newWine, producer: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">종류</label>
                <select
                  value={newWine.type}
                  onChange={(e) => setNewWine({...newWine, type: e.target.value as WineType})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                >
                  <option value="Red">Red</option>
                  <option value="White">White</option>
                  <option value="Sparkling">Sparkling</option>
                  <option value="Rosé">Rosé</option>
                  <option value="Dessert">Dessert</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">국가</label>
                <input
                  type="text"
                  value={newWine.country}
                  onChange={(e) => setNewWine({...newWine, country: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">지역 (Region)</label>
                <input
                  type="text"
                  value={newWine.region}
                  onChange={(e) => setNewWine({...newWine, region: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">빈티지</label>
                <input
                  type="text"
                  value={newWine.vintage}
                  onChange={(e) => setNewWine({...newWine, vintage: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">수량 (병)</label>
                <input
                  required
                  type="number"
                  value={newWine.quantity}
                  onChange={(e) => setNewWine({...newWine, quantity: Number(e.target.value)})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">수입 단가 (₩)</label>
              <input
                type="number"
                value={newWine.price}
                onChange={(e) => setNewWine({...newWine, price: Number(e.target.value)})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">B2B가 (₩)</label>
                <input
                  type="number"
                  value={newWine.priceB2B}
                  onChange={(e) => setNewWine({...newWine, priceB2B: Number(e.target.value)})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">B2C가 (₩)</label>
                <input
                  type="number"
                  value={newWine.priceB2C}
                  onChange={(e) => setNewWine({...newWine, priceB2C: Number(e.target.value)})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">임직원가 (₩)</label>
                <input
                  type="number"
                  value={newWine.priceStaff}
                  onChange={(e) => setNewWine({...newWine, priceStaff: Number(e.target.value)})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">창고 위치</label>
              <input
                type="text"
                value={newWine.location}
                onChange={(e) => setNewWine({...newWine, location: e.target.value})}
                placeholder="e.g. Warehouse A-1"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-wine-primary text-white rounded-xl font-bold hover:bg-wine-accent transition-all disabled:opacity-50 shadow-lg shadow-wine-primary/20 mt-4"
          >
            {isSubmitting ? "저장 중..." : "와인 등록 완료"}
          </button>
        </form>
      </Modal>

      {/* Edit Wine Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="와인 정보 수정"
      >
        {editForm && (
          <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">와인명 (English)</label>
                <input
                  required
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">생산자</label>
                  <input
                    type="text"
                    value={editForm.producer}
                    onChange={(e) => setEditForm({...editForm, producer: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">종류</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({...editForm, type: e.target.value as WineType})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                  >
                    <option value="Red">Red</option>
                    <option value="White">White</option>
                    <option value="Sparkling">Sparkling</option>
                    <option value="Rosé">Rosé</option>
                    <option value="Dessert">Dessert</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">국가</label>
                  <input
                    type="text"
                    value={editForm.country}
                    onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">지역 (Region)</label>
                  <input
                    type="text"
                    value={editForm.region}
                    onChange={(e) => setEditForm({...editForm, region: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">빈티지</label>
                  <input
                    type="text"
                    value={editForm.vintage}
                    onChange={(e) => setEditForm({...editForm, vintage: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">수량 (병)</label>
                  <input
                    required
                    type="number"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({...editForm, quantity: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                  />
                </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">수입 단가</label>
                <div className="flex gap-2">
                  <select
                    value={editForm.currency}
                    onChange={(e) => setEditForm({...editForm, currency: e.target.value as CurrencyType})}
                    className="w-24 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                  >
                    <option value="KRW">KRW (₩)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: Number(e.target.value)})}
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">B2B가 (₩)</label>
                  <input
                    type="number"
                    value={editForm.priceB2B}
                    onChange={(e) => setEditForm({...editForm, priceB2B: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">B2C가 (₩)</label>
                  <input
                    type="number"
                    value={editForm.priceB2C}
                    onChange={(e) => setEditForm({...editForm, priceB2C: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">임직원가 (₩)</label>
                  <input
                    type="number"
                    value={editForm.priceStaff}
                    onChange={(e) => setEditForm({...editForm, priceStaff: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">창고 위치</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-wine-primary text-white rounded-xl font-bold hover:bg-wine-accent transition-all disabled:opacity-50 shadow-lg shadow-wine-primary/20 mt-4"
            >
              {isSubmitting ? "저장 중..." : "정보 수정 완료"}
            </button>
          </form>
        )}
      </Modal>
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="와인 이름, 생산자 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wine-primary/50"
          >
            <option value="All">모든 종류</option>
            <option value="Red">Red</option>
            <option value="White">White</option>
            <option value="Sparkling">Sparkling</option>
            <option value="Rosé">Rosé</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={selectedVintage}
            onChange={(e) => setSelectedVintage(e.target.value)}
            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-gray-500 font-medium"
          >
            <option value="All">빈티지 전체</option>
            {uniqueVintages.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-gray-500 font-medium"
          >
            <option value="All">국가 전체</option>
            {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Wine List Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">와인 정보</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">지역/빈티지</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">재고</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">판매 단가 (B2B/B2C/Staff)</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">창고 위치</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedWines.map((wine) => (
                <tr key={wine.id} className="hover:bg-wine-light/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        wine.type === "Red" ? "bg-red-50 text-red-600" :
                        wine.type === "White" ? "bg-yellow-50 text-yellow-600" :
                        wine.type === "Sparkling" ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600"
                      )}>
                        <WineIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-wine-dark group-hover:text-wine-accent transition-colors">{wine.name}</div>
                        <div className="text-[10px] text-gray-400 font-medium uppercase">{wine.producer}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                        <MapPin className="w-3 h-3" /> {wine.country}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                        <Calendar className="w-3 h-3" /> {wine.vintage}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-bold text-wine-dark">{wine.quantity}병</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-bold text-wine-dark">
                      ₩{(wine.priceB2B || 0).toLocaleString()} / ₩{(wine.priceB2C || 0).toLocaleString()} / ₩{(wine.priceStaff || 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">
                      수입가: {wine.currency === "KRW" ? "₩" : 
                               wine.currency === "USD" ? "$" : 
                               wine.currency === "EUR" ? "€" : 
                               wine.currency === "JPY" ? "¥" : "£"}{wine.price.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-600">{wine.location}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        setEditForm(wine);
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 text-gray-400 hover:text-wine-accent transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
