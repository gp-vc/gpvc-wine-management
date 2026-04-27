import { 
  LayoutDashboard, 
  Wine, 
  ArrowLeftRight, 
  Users, 
  Settings, 
  LogOut,
  History,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import { auth } from "../firebase";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onSync: () => void;
  isSyncing: boolean;
}

export function Sidebar({ activeTab, setActiveTab, onLogout, onSync, isSyncing }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSyncInput, setShowSyncInput] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "대시보드", icon: LayoutDashboard },
    { id: "inventory", label: "재고 현황", icon: Wine },
    { id: "transactions", label: "입출고 등록", icon: ArrowLeftRight },
    { id: "history", label: "입출고 내역", icon: History },
    { id: "partners", label: "거래처 관리", icon: Users },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md text-wine-dark"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-wine-primary rounded-xl flex items-center justify-center text-white">
              <Wine className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-wine-dark tracking-tight">GPVC</span>
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  activeTab === item.id 
                    ? "bg-wine-primary text-white shadow-md shadow-wine-primary/20" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-wine-dark"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-gray-50 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-wine-dark transition-all">
              <Settings className="w-5 h-5" />
              설정
            </button>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              로그아웃
            </button>
          </div>

          {auth.currentUser && (
            <div className="mt-4 px-2">
              <p className="text-[10px] text-gray-400 truncate">
                {auth.currentUser.email}
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
