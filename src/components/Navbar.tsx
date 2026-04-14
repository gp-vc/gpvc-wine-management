import { motion } from "motion/react";
import { Sparkles, LayoutDashboard, MessageSquare, Settings } from "lucide-react";
import { cn } from "../lib/utils";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const tabs = [
    { id: "hero", label: "Home", icon: Sparkles },
    { id: "dashboard", label: "Studio", icon: LayoutDashboard },
    { id: "chat", label: "Assistant", icon: MessageSquare },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <div className="glass px-2 py-2 rounded-full flex items-center gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative px-4 py-2 rounded-full flex items-center gap-2 transition-colors duration-300",
                isActive ? "text-white" : "text-white/50 hover:text-white/80"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-white/10 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
        <div className="w-px h-4 bg-white/10 mx-2" />
        <button className="p-2 text-white/50 hover:text-white transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
