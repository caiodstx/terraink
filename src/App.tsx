import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProviders } from "@/core/AppProviders";
import AppShell from "@/shared/ui/AppShell";
import LandingPage from "@/features/landing/ui/LandingPage";
import ThankYouPage from "@/features/checkout/ui/ThankYouPage";
import CancelledPage from "@/features/checkout/ui/CancelledPage";
import LegalModalHost from "@/features/legal/ui/LegalModalHost";

function Editor() {
  return (
    <AppProviders>
      <AppShell />
    </AppProviders>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/crear" element={<Editor />} />
        <Route path="/pedido/gracias" element={<ThankYouPage />} />
        <Route path="/pedido/cancelado" element={<CancelledPage />} />
      </Routes>
      <LegalModalHost />
    </BrowserRouter>
  );
}
