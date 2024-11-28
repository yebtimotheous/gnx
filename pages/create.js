import { withAuth } from "../components/withAuth";
import { useWallet } from "../context/WalletContext";

function CreatePage() {
  const { account } = useWallet();

  return (
    <div>
      <h1>Create NFT</h1>
      <p>Connected Account: {account}</p>
      {/* Rest of your create page content */}
    </div>
  );
}

export default withAuth(CreatePage);
