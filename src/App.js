import React from "react";
// If you prefer BrowserRouter, keep it
import { BrowserRouter } from "react-router-dom";
// Quick fix for static hosting: you can switch to HashRouter
// import { HashRouter } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { BreedProvider } from "./context/BreedContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    // BrowserRouter works if vercel.json routes are correct
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <BreedProvider>
            <AppRoutes />
          </BreedProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>

    // Alternative quick fix for Vercel static hosting:
    // <HashRouter>
    //   <AuthProvider>
    //     <ThemeProvider>
    //       <BreedProvider>
    //         <AppRoutes />
    //       </BreedProvider>
    //     </ThemeProvider>
    //   </AuthProvider>
    // </HashRouter>
  );
}

export default App;
