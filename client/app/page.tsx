"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhyWeCreatedSection from "@/components/WhyWeCreatedSection";
import ValueProposition from "@/components/ValueProposition";
import BusinessNicheShowcase from "@/components/BusinessNicheShowcase";
import InteractiveLiveDemo from "@/components/InteractiveLiveDemo";
import RoiCalculator from "@/components/RoiCalculator";
import BusinessSetupWizard from "@/components/BusinessSetupWizard";
import LoginModal from "@/components/LoginModal";
import BusinessWorkspace from "@/components/BusinessWorkspace";
import PageLoader from "@/components/PageLoader";
import Footer from "@/components/Footer";

import { BusinessAccount, BusinessCategory } from "@/lib/types";
import { 
  subscribeToAccountStore, 
  getActiveAccountSnapshot, 
  getServerSnapshot,
  setActiveAccountId,
  logoutAccount,
  saveCurrentView
} from "@/lib/storage";

export default function Home() {
  const [isClientReady, setIsClientReady] = useState(false);
  const [currentView, setCurrentView] = useState<"landing" | "workspace">("landing");
  const storedActiveAccount = useSyncExternalStore(
    subscribeToAccountStore,
    getActiveAccountSnapshot,
    getServerSnapshot
  );
  const [activeAccountOverride, setActiveAccountOverride] = useState<BusinessAccount | null>(null);

  const activeAccount = activeAccountOverride || storedActiveAccount;

  // Sticky view state: restore from localStorage on client mount if user has an active session
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("messageapi_current_view_v3");
    const activeId = localStorage.getItem("messageapi_active_account_id_v2");
    
    // If active account exists and saved view is workspace, keep workspace
    if (activeId && (saved === "workspace" || saved === null || window.location.hash)) {
      setCurrentView("workspace");
      saveCurrentView("workspace");
      // Brief smooth transition to show category loader while workspace initializes
      const timer = setTimeout(() => {
        setIsClientReady(true);
      }, 280);
      return () => clearTimeout(timer);
    } else {
      setCurrentView("landing");
      setIsClientReady(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (activeAccount) {
      const saved = localStorage.getItem("messageapi_current_view_v3");
      if (saved === "workspace" || (saved !== "landing" && window.location.hash)) {
        setCurrentView("workspace");
      }
    }
  }, [activeAccount]);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [wizardCategory, setWizardCategory] = useState<BusinessCategory>("custom");
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleOpenWizard = (cat?: BusinessCategory) => {
    if (cat) setWizardCategory(cat);
    setWizardOpen(true);
  };

  const handleAccountCreated = (newAcc: BusinessAccount) => {
    setActiveAccountOverride(newAcc);
    setActiveAccountId(newAcc.id);
    saveCurrentView("workspace");
    setCurrentView("workspace");
    setSuccessBanner(`🎉 ${newAcc.businessName} account created! Master API Token: ${newAcc.apiKey}`);
    setTimeout(() => setSuccessBanner(null), 10000);
  };

  const handleLoginSuccess = (account: BusinessAccount) => {
    setActiveAccountOverride(account);
    setActiveAccountId(account.id);
    saveCurrentView("workspace");
    setCurrentView("workspace");
    setSuccessBanner(`👋 Welcome back to ${account.businessName} (${account.domain || 'Domain Authenticated'})!`);
    setTimeout(() => setSuccessBanner(null), 8000);
  };

  const handleGoToDashboard = () => {
    saveCurrentView("workspace");
    setCurrentView("workspace");
  };

  const handleBackToLanding = () => {
    saveCurrentView("landing");
    if (typeof window !== "undefined") {
      try {
        window.history.replaceState(null, "", window.location.pathname);
      } catch (e) {
        window.location.hash = "";
      }
    }
    setCurrentView("landing");
  };

  const handleLogout = () => {
    logoutAccount();
    setActiveAccountOverride(null);
    saveCurrentView("landing");
    if (typeof window !== "undefined") {
      try {
        window.history.replaceState(null, "", window.location.pathname);
      } catch (e) {
        window.location.hash = "";
      }
    }
    setCurrentView("landing");
    setSuccessBanner(`👋 You have logged out successfully.`);
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  const handleUpdateAccount = (updated: BusinessAccount) => {
    setActiveAccountOverride(updated);
  };

  const handleScrollToDemo = () => {
    const el = document.getElementById("demo-simulator");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  // Dedicated Category Brand Loader during initial load / refresh to prevent home page flicker
  if (!isClientReady) {
    const previewAccount = activeAccount;
    return (
      <PageLoader
        category={previewAccount?.category}
        businessName={previewAccount?.businessName}
        domain={previewAccount?.domain}
        message={previewAccount?.businessName ? `Opening ${previewAccount.businessName}...` : "Opening workspace..."}
      />
    );
  }

  return (
    <div className={`bg-white text-slate-900 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between ${currentView === "workspace" ? "h-screen max-h-screen overflow-hidden" : "min-h-screen"}`}>
      {/* Top Banner Alert when account created */}
      {successBanner && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 text-center sticky top-0 z-50 shadow-md flex items-center justify-center gap-2">
          <span className="truncate max-w-2xl">{successBanner}</span>
          <button
            onClick={() => setSuccessBanner(null)}
            className="ml-2 underline text-emerald-100 hover:text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navbar Header (Rendered on Landing page only) */}
      {currentView === "landing" && (
        <Navbar
          onOpenWizard={handleOpenWizard}
          onOpenLogin={() => setLoginOpen(true)}
          activeAccount={activeAccount}
          currentView={currentView}
          onGoToDashboard={handleGoToDashboard}
          onBackToLanding={handleBackToLanding}
        />
      )}

      {/* Conditional View: Dashboard Workspace vs Master Landing Page */}
      {currentView === "workspace" && activeAccount ? (
        <main className="flex-1 w-full h-full min-h-0 overflow-hidden">
          <BusinessWorkspace
            key={activeAccount.id}
            account={activeAccount}
            onUpdateAccount={handleUpdateAccount}
            onBackToLanding={handleBackToLanding}
            onOpenWizard={() => handleOpenWizard()}
            onOpenLogin={() => setLoginOpen(true)}
            onLogout={handleLogout}
          />
        </main>
      ) : (
        <main className="flex-1">
          {/* 1. Hero Section with Universal Selector */}
          <HeroSection
            onOpenWizard={(cat) => handleOpenWizard(cat)}
            onScrollToDemo={handleScrollToDemo}
          />

          {/* 2. Educational Section: Why MessageAPI was created for all businesses & products */}
          <WhyWeCreatedSection onOpenWizard={(cat) => handleOpenWizard(cat)} />

          {/* 3. Value Proposition & Meta API Reality Check */}
          <ValueProposition onOpenWizard={() => handleOpenWizard()} />

          {/* 4. Deep Dive for Medicine, Gym, Grocery, Electronics, Custom, etc. */}
          <BusinessNicheShowcase onOpenWizard={(cat) => handleOpenWizard(cat)} />

          {/* 5. Interactive Live WhatsApp Simulator */}
          <InteractiveLiveDemo onOpenWizard={(cat) => handleOpenWizard(cat)} />

          {/* 6. Cost Savings ROI Calculator */}
          <RoiCalculator onOpenWizard={() => handleOpenWizard()} />
        </main>
      )}

      {/* Footer (Rendered on Landing page only) */}
      {currentView === "landing" && (
        <Footer onOpenWizard={() => handleOpenWizard()} />
      )}

      {/* 5-Step Business Setup Wizard Modal */}
      <BusinessSetupWizard
        initialCategory={wizardCategory}
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onAccountCreated={handleAccountCreated}
      />

      {/* Domain Authentication Login Modal */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setWizardOpen(true);
        }}
      />
    </div>
  );
}
