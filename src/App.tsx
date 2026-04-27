/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Auth } from "./components/Auth";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { WineList } from "./components/WineList";
import { TransactionForm } from "./components/TransactionForm";
import { PartnerList } from "./components/PartnerList";
import { Modal } from "./components/Modal";
import { mockWines, mockPartners, mockTransactions } from "./mockData";
import { fetchGoogleSheetData } from "./services/googleSheets";
import { Wine, Partner, Transaction } from "./types";
import { AlertCircle, CheckCircle2 } from "lucide-react";

// Firebase imports
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, increment, deleteDoc } from "firebase/firestore";

import { TransactionHistory } from "./components/TransactionHistory";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [wines, setWines] = useState<Wine[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Sync Modal State
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [sheetIdInput, setSheetIdInput] = useState("");
  
  // Notification State
  const [notification, setNotification] = useState<{ type: "success" | "error", message: string } | null>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

// Shared Organization ID logic
  const getGroupId = (user: User | null) => {
    if (!user) return null;
    const email = user.email || "";
    const domain = email.split('@')[1]?.toLowerCase();
    
    // List of common personal domains to exclude from sharing
    const personalDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'naver.com', 'daum.net', 'kakao.com', 'yahoo.com', 'me.com'];
    
    if (domain && !personalDomains.includes(domain)) {
      return domain;
    }
    return user.uid;
  };

  const groupId = getGroupId(user);

  // Firestore Listeners
  useEffect(() => {
    if (!user || !groupId) {
      setWines([]);
      setPartners([]);
      setTransactions([]);
      return;
    }

    const domain = user.email?.split('@')[1]?.toLowerCase();
    const isGpUser = domain === 'gp-vc.com';
    
    const groupIds = [user.uid];
    if (user.email) groupIds.push(user.email);
    
    if (isGpUser) {
      groupIds.push('gp-vc.com');
    } else if (domain && !['gmail.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'naver.com', 'daum.net', 'kakao.com', 'yahoo.com', 'me.com'].includes(domain)) {
      groupIds.push(domain);
    }

    console.log(`User logged in: ${user.email} (Domain: ${domain}), using groupIds:`, groupIds);

    const winesQuery = query(collection(db, "wines"), where("ownerId", "in", groupIds));
    const partnersQuery = query(collection(db, "partners"), where("ownerId", "in", groupIds));
    const transactionsQuery = query(collection(db, "transactions"), where("ownerId", "in", groupIds));

    const unsubWines = onSnapshot(winesQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Wine));
      console.log(`Wines fetched: ${data.length} items`);
      setWines(data); // No fallback to mock
    }, (err) => {
      console.error("Wines fetch error:", err);
      setNotification({ type: "error", message: "와인 데이터를 불러오지 못했습니다: " + err.message });
    });

    const unsubPartners = onSnapshot(partnersQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Partner));
      console.log(`Partners fetched: ${data.length} items`);
      setPartners(data); // No fallback to mock
    }, (err) => {
      console.error("Partners fetch error:", err);
    });

    const unsubTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      console.log(`Transactions fetched: ${data.length} items`);
      setTransactions(data); // No fallback to mock
    }, (err) => {
      console.error("Transactions fetch error:", err);
    });

    return () => {
      unsubWines();
      unsubPartners();
      unsubTransactions();
    };
  }, [user]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAddWine = async (wineData: Omit<Wine, "id">) => {
    if (!user || !groupId) return;
    try {
      await addDoc(collection(db, "wines"), {
        ...wineData,
        ownerId: groupId
      });
      setNotification({ type: "success", message: "와인이 성공적으로 등록되었습니다." });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "wines");
    }
  };

  const handleAddPartner = async (partnerData: Omit<Partner, "id">) => {
    if (!user || !groupId) return;
    try {
      await addDoc(collection(db, "partners"), {
        ...partnerData,
        ownerId: groupId
      });
      setNotification({ type: "success", message: "거래처가 성공적으로 등록되었습니다." });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "partners");
    }
  };

  const handleUpdatePartner = async (id: string, partnerData: Partial<Partner>) => {
    if (!user) return;
    try {
      const partnerRef = doc(db, "partners", id);
      await updateDoc(partnerRef, partnerData);
      setNotification({ type: "success", message: "거래처 정보가 수정되었습니다." });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "partners");
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "partners", id));
      setNotification({ type: "success", message: "거래처가 삭제되었습니다." });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "partners");
    }
  };

  const handleAddTransaction = async (transactionData: Omit<Transaction, "id">) => {
    if (!user || !groupId) return;
    try {
      // 1. Check if outbound quantity exceeds current inventory
      if (transactionData.type === "Outbound") {
        const wine = wines.find(w => w.id === transactionData.wineId);
        if (wine && wine.quantity < transactionData.quantity) {
          setNotification({ 
            type: "error", 
            message: `재고가 부족합니다. (현재 재고: ${wine.quantity}병)` 
          });
          return;
        }
      }

      // 2. Add transaction record
      await addDoc(collection(db, "transactions"), {
        ...transactionData,
        ownerId: groupId
      });

      // 3. Update wine quantity
      const wineRef = doc(db, "wines", transactionData.wineId);
      const qtyChange = transactionData.type === "Inbound" ? transactionData.quantity : -transactionData.quantity;
      await updateDoc(wineRef, {
        quantity: increment(qtyChange)
      });

      setNotification({ type: "success", message: "처리가 완료되었습니다." });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "transactions");
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    try {
      const transaction = transactions.find(t => t.id === id);
      if (!transaction) return;

      // 1. Delete transaction
      await deleteDoc(doc(db, "transactions", id));

      // 2. Revert wine quantity
      const wineRef = doc(db, "wines", transaction.wineId);
      const qtyRevert = transaction.type === "Inbound" ? -transaction.quantity : transaction.quantity;
      await updateDoc(wineRef, {
        quantity: increment(qtyRevert)
      });

      setNotification({ type: "success", message: "거래 내역이 삭제되고 재고가 복구되었습니다." });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "transactions");
    }
  };

  const handleUpdateTransaction = async (id: string, transactionData: Partial<Transaction>) => {
    if (!user) return;
    try {
      const oldTransaction = transactions.find(t => t.id === id);
      if (!oldTransaction) return;

      // 1. Calculate net quantity change for the wine
      const newType = transactionData.type || oldTransaction.type;
      const newQty = transactionData.quantity !== undefined ? transactionData.quantity : oldTransaction.quantity;
      
      const oldChange = oldTransaction.type === "Inbound" ? oldTransaction.quantity : -oldTransaction.quantity;
      const newChange = newType === "Inbound" ? newQty : -newQty;
      const netChange = newChange - oldChange;

      // 2. Check if net change would result in negative inventory
      const wine = wines.find(w => w.id === oldTransaction.wineId);
      if (wine && (wine.quantity + netChange) < 0) {
        setNotification({ 
          type: "error", 
          message: `재고가 부족하여 수정할 수 없습니다. (현재 재고: ${wine.quantity}병)` 
        });
        return;
      }

      // 3. Update transaction
      const transactionRef = doc(db, "transactions", id);
      await updateDoc(transactionRef, transactionData);

      // 4. Update inventory if quantity or type changed
      if (netChange !== 0) {
        const wineRef = doc(db, "wines", oldTransaction.wineId);
        await updateDoc(wineRef, {
          quantity: increment(netChange)
        });
      }

      setNotification({ type: "success", message: "거래 내역 및 재고가 수정되었습니다." });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "transactions");
    }
  };

  const handleUpdateWine = async (id: string, wineData: Partial<Wine>) => {
    if (!user) return;
    try {
      const wineRef = doc(db, "wines", id);
      await updateDoc(wineRef, wineData);
      setNotification({ type: "success", message: "와인 정보가 수정되었습니다." });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "wines");
    }
  };

  const handleSync = async () => {
    if (!sheetIdInput.trim() || !user || !groupId) return;

    setIsSyncing(true);
    setIsSyncModalOpen(false);
    try {
      const data = await fetchGoogleSheetData(sheetIdInput.trim());
      
      // Save to Firestore
      for (const wine of data) {
        await addDoc(collection(db, "wines"), {
          ...wine,
          ownerId: groupId,
          id: undefined // Let Firestore generate ID
        });
      }

      setNotification({
        type: "success",
        message: `${data.length}개의 와인 데이터를 성공적으로 동기화하고 DB에 저장했습니다.`
      });
      setSheetIdInput("");
    } catch (error) {
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "동기화 중 오류가 발생했습니다."
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-wine-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wine-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={() => {}} />; // Auth component handles login via Firebase
  }

  return (
    <div className="min-h-screen bg-wine-light">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        onSync={() => setIsSyncModalOpen(true)}
        isSyncing={isSyncing}
      />
      
      <main className="lg:ml-64 p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard 
                  wines={wines} 
                  transactions={transactions} 
                  onViewAll={() => setActiveTab("history")}
                />
              </motion.div>
            )}
            
            {activeTab === "inventory" && (
              <motion.div
                key="inventory"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <WineList 
                  wines={wines} 
                  onAddWine={handleAddWine} 
                  onUpdateWine={handleUpdateWine}
                />
              </motion.div>
            )}
            
            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TransactionHistory 
                  transactions={transactions} 
                  onDeleteTransaction={handleDeleteTransaction}
                  onUpdateTransaction={handleUpdateTransaction}
                  wines={wines}
                  partners={partners}
                />
              </motion.div>
            )}
            
            {activeTab === "transactions" && (
              <motion.div
                key="transactions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TransactionForm wines={wines} partners={partners} onAddTransaction={handleAddTransaction} />
              </motion.div>
            )}
            
            {activeTab === "partners" && (
              <motion.div
                key="partners"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <PartnerList 
                  partners={partners} 
                  transactions={transactions}
                  onAddPartner={handleAddPartner} 
                  onUpdatePartner={handleUpdatePartner}
                  onDeletePartner={handleDeletePartner}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Sync Modal */}
      <Modal 
        isOpen={isSyncModalOpen} 
        onClose={() => setIsSyncModalOpen(false)} 
        title="구글 스프레드시트 동기화"
      >
        <div className="space-y-4">
          <div className="p-4 bg-wine-primary/10 rounded-2xl border border-wine-primary/20">
            <p className="text-[11px] text-wine-dark leading-relaxed">
              <span className="font-bold">💡 연결 전 확인사항:</span><br />
              1. 시트 우측 상단 <span className="font-bold">[공유]</span> 클릭<br />
              2. 일반 액세스를 <span className="font-bold">'링크가 있는 모든 사용자'</span>로 변경<br />
              3. 아래에 <span className="font-bold">시트 URL 전체</span>를 붙여넣으세요.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">시트 URL 또는 ID</label>
            <input
              type="text"
              value={sheetIdInput}
              onChange={(e) => setSheetIdInput(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-wine-primary/50 text-sm"
            />
          </div>
          <button
            onClick={handleSync}
            disabled={!sheetIdInput.trim() || isSyncing}
            className="w-full py-3 bg-wine-primary text-white rounded-xl font-bold hover:bg-wine-accent transition-all disabled:opacity-50 shadow-lg shadow-wine-primary/20"
          >
            동기화 시작하기
          </button>
        </div>
      </Modal>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-8 left-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 bg-white border border-gray-100 min-w-[320px]"
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="text-sm font-medium text-wine-dark">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}




