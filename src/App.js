import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { BreedProvider } from "./context/BreedContext";
import { HorseAttributeProvider } from "./context/HorseAttributeContext";
import { ShipperProvider } from "./context/ShipperContext";
import { CustomerProvider } from "./context/CustomerContext";
import { ShipmentProvider } from "./context/ShipmentContext";
import { PlatformSettingsProvider } from "./context/PlatformSettingsContext";
import { StripeAdminProvider } from "./context/StripeAdminContext";

// New contexts
import { TermsProvider } from "./context/TermsContext";
import { PrivacyPolicyProvider } from "./context/PrivacyPolicyContext";

// Newsletter Admin context
import { NewsletterAdminProvider } from "./context/NewsletterAdminContext";
import { AdminNotificationProvider } from "./context/AdminNotificationContext";
import AdminRealtimeBridge from "./components/realtime/AdminRealtimeBridge";

import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
   <BrowserRouter>
  <AuthProvider>
    <ThemeProvider>
      <BreedProvider>
        <HorseAttributeProvider>
          <PlatformSettingsProvider>
            <StripeAdminProvider>
              <ShipperProvider>
                <CustomerProvider>
                  <ShipmentProvider>
                    <TermsProvider>
                      <PrivacyPolicyProvider>
                        <NewsletterAdminProvider>
                          <AdminNotificationProvider>
                            <AdminRealtimeBridge />
                            <AppRoutes />
                          </AdminNotificationProvider>
                        </NewsletterAdminProvider>
                      </PrivacyPolicyProvider>
                    </TermsProvider>
                  </ShipmentProvider>
                </CustomerProvider>
              </ShipperProvider>
            </StripeAdminProvider>
          </PlatformSettingsProvider>
        </HorseAttributeProvider>
      </BreedProvider>
    </ThemeProvider>
  </AuthProvider>
</BrowserRouter>
  );
}

export default App;
