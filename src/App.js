import { HashRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { BreedProvider } from "./context/BreedContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ThemeProvider>
          <BreedProvider>
            <AppRoutes />
          </BreedProvider>
        </ThemeProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
