import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./config/queryClient.js";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from "./theme/index.js";
import { HelmetProvider } from "react-helmet-async";
import { WindowNavbarProvider } from "@/context/WindowNavbarContext.jsx";
import "./styles/split.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <HelmetProvider>
            <WindowNavbarProvider>
              <App />
            </WindowNavbarProvider>
          </HelmetProvider>
          <ReactQueryDevtools position="bottom" initialIsOpen={false} />
        </BrowserRouter>
      </QueryClientProvider>
    </ChakraProvider>
  </StrictMode>,
);
