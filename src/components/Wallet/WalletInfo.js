import {useWeb3React} from '@web3-react/core';
import styles from './wallet.module.css'


const WalletInfo = (props) => {
  const {active, chainId, account, error} = useWeb3React();
  return (

  <div className={styles.walletInfo}>
    <p><h4 style={{ fontFamily: "cursive" }}>KryptoMinters</h4></p>
    <p><h4 style={{ fontFamily: "cursive" }}>Account Active: {active.toString()}</h4></p>
    {active && (
    <div >
      <p><h4 style={{ fontFamily: "cursive" }}>Account: {account.slice(0, 5)}...{account.slice(account.length - 4)}</h4></p>
      <p><h4 style={{ fontFamily: "cursive" }}>ChainID: {chainId}</h4></p>
    </div>
    )}
    {error && <p className="text-error">error: {error.message}</p>}
  </div>
  );
};

export default WalletInfo;
