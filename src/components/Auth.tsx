import { useState } from "react";
import React from "react";
import { motion } from "motion/react";
import { Lock, Mail, ShieldCheck, LogIn } from "lucide-react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";

interface AuthProps {
  onLogin: () => void;
}

export function Auth({ onLogin }: AuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      if (user.email && !user.email.endsWith("@gp-vc.com")) {
        await signOut(auth);
        setError("gp-vc.com 도메인 계정만 로그인 가능합니다.");
        return;
      }
      
      onLogin();
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === "auth/popup-blocked") {
        setError("팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("승인되지 않은 도메인입니다. Firebase 콘솔에서 localhost를 승인된 도메인에 추가해주세요.");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("Google 로그인이 활성화되지 않았습니다. Firebase 콘솔에서 활성화해주세요.");
      } else {
        setError(`로그인 중 오류가 발생했습니다: ${err.message || "다시 시도해주세요."}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-wine-light p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="bg-wine-primary p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-1">GPVC</h1>
          <p className="text-white/80 text-sm">와인 수입사 전용 재고 관리 시스템</p>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-lg font-bold text-wine-dark mb-2">환영합니다</h2>
            <p className="text-sm text-gray-500">회사 계정으로 로그인하여 시스템을 이용하세요.</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              {isLoading ? "로그인 중..." : "Google 계정으로 로그인"}
            </button>

            {error && (
              <p className="text-xs text-red-500 text-center mt-2">{error}</p>
            )}

            <div className="p-4 bg-wine-primary/5 rounded-2xl border border-wine-primary/10 mt-6">
              <p className="text-[10px] text-wine-accent leading-relaxed italic text-center">
                * 회사 공식 이메일 도메인으로 로그인해 주세요.<br />
                보안을 위해 승인된 사용자만 접근이 가능합니다.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-50 text-center">
            <p className="text-xs text-gray-400">
              보안을 위해 공용 네트워크에서의 사용을 자제해 주세요.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
