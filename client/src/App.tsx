import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { getAuthToken } from "./lib/auth.ts";
import { HomePage } from "./pages/HomePage.tsx";
import { SignInPage } from "./pages/SignInPage.tsx";
import { SignUpPage } from "./pages/SignUpPage.tsx";
import { TradingPage } from "./pages/TradingPage.tsx";

function RequireAuth({ children }: { children: ReactNode }) {
  if (!getAuthToken()) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}

function OnlyGuests({ children }: { children: ReactNode }) {
  if (getAuthToken()) {
    return <Navigate to="/trading" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/signin"
        element={
          <OnlyGuests>
            <SignInPage />
          </OnlyGuests>
        }
      />
      <Route
        path="/signup"
        element={
          <OnlyGuests>
            <SignUpPage />
          </OnlyGuests>
        }
      />
      <Route
        path="/trading"
        element={
          <RequireAuth>
            <TradingPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
