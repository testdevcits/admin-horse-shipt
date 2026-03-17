import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { BreedProvider } from "./context/BreedContext";
import { ShipperProvider } from "./context/ShipperContext";
import { PlatformSettingsProvider } from "./context/PlatformSettingsContext";
import { StripeAdminProvider } from "./context/StripeAdminContext";

// New contexts
import { TermsProvider } from "./context/TermsContext";
import { PrivacyPolicyProvider } from "./context/PrivacyPolicyContext";

import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <BreedProvider>
            <PlatformSettingsProvider>
              <StripeAdminProvider>
                <ShipperProvider>
                  <TermsProvider>
                    <PrivacyPolicyProvider>
                      <AppRoutes />
                    </PrivacyPolicyProvider>
                  </TermsProvider>
                </ShipperProvider>
              </StripeAdminProvider>
            </PlatformSettingsProvider>
          </BreedProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
