import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [metaMask(), injected()],
  transports: {
    [sepolia.id]: http("https://eth-sepolia.g.alchemy.com/v2/_-N3uej4LaYmJhRTG-Ci0"),
  },
  ssr: true,
});