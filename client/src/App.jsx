import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CacheProvider } from "./context/CacheContext";
import { ConfirmProvider } from "./context/ConfirmContext";
import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import { Toaster } from 'sonner';
import FormKeyboardNavigation from './components/common/FormKeyboardNavigation';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <FormKeyboardNavigation />
          <CacheProvider>
            <AuthProvider>
              <ConfirmProvider>
                <AppRoutes />
              <Toaster
              position="top-right"
              closeButton
              duration={3000}
              expand={false}
              toastOptions={{
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                  fontSize: '13px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
                success: {
                  style: {
                    border: '1px solid hsl(142 76% 45%)',
                  },
                },
                error: {
                  style: {
                    border: '1px solid hsl(0 84% 55%)',
                  },
                },
                warning: {
                  style: {
                    border: '1px solid hsl(38 92% 55%)',
                  },
                },
                info: {
                  style: {
                    border: '1px solid hsl(199 89% 50%)',
                  },
                },
              }}
            />
              </ConfirmProvider>
            </AuthProvider>
          </CacheProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
