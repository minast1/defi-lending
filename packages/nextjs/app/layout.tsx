import "@rainbow-me/rainbowkit/styles.css";
import "@scaffold-ui/components/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
//import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Overcollateralized Lending App",
  description: "Built with 🏗 Scaffold-ETH 2",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning className={``}>
      <body className="bg-skybg dark:bg-background min-h-screen transition-colors duration-300">
        {/* <ThemeProvider enableSystem> */}
        <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
