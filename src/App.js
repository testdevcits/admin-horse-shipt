import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { BreedProvider } from "./context/BreedContext";
import AppRoutes from "./routes/AppRoutes";
import { ShipperProvider } from "./context/ShipperContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <BreedProvider>
            <ShipperProvider>
              <AppRoutes />
            </ShipperProvider>
          </BreedProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
