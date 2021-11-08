import React, { useState, useEffect, useCallback, useMemo } from "react";
import ReactDOM from "react-dom";
import * as ethers from "ethers";
import { getChainByChainId } from "evm-chains";
import styled, { createGlobalStyle } from "styled-components";
import microtip from "microtip/microtip.css";
import { X, ChevronRight, Upload, Eye, Edit2, Play } from "react-feather";

// DO NOT EDIT THIS
// const REPLIT_CHAIN_ID = 1919250540;
const provider = new ethers.providers.JsonRpcProvider('https://eth.replit.com');

const GlobalStyles = createGlobalStyle`
	* {
		box-sizing: border-box;
	}
  :root {
		/** color */
    --fg-default: #F5F9FC;
		--fg-dimmer: #C2C8CC;
		--fg-dimmest: #9DA2A6;
		--bg-root: #0E1525;
		--bg-default: #1C2333;
		--bg-higher: #2B3245;
		--bg-highest: #3C445C;
		--outline-default: #70788C;
		--outline-dimmer:  #5F677A;
		--outline-dimmest: #4E5569;
		--overlay: #0e1525A0;

		/**accents */
		--accent-primary-default: #0099FF;
		--accent-primary-dimmer: #0072BD;

		--accent-negative-default: #F23F3F;
		--accent-negative-dimmer: #8F2828;

		--accent-warning-default: #CCAD14;
		--accent-warning-dimmer: #756200;

		/**type */
		--font-family-default: 'IBM Plex Sans', sans-serif;
		--font-family-code: 'IBM Plex Mono', monospace;

		--font-size-header: 24px;
		--font-size-subheader: 18px;
		--font-size-medium: 16px;
		--font-size-default: 14px;
		--font-size-small: 12px;

		/**spacing */
		--space-8: 8px;
		--space-16: 16px;
		--space-24: 24px;
		--space-32: 32px;

		/**border radius */
		--br-8: 8px;


  }
	* {
		font-family: var(--font-family-default);
		font-size: var(--font-size-default);
	}

	a {
		color: var(--accent-primary-default);
	}
	button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-8);
		font-weight: 500;
		border-radius: var(--br-8);
		outline: none;
		background-color: var(--bg-higher);
		border: 1px solid var(--bg-higher);
		color: white;
		font-size: var(--font-size-default);
		line-height: var(--font-size-default);
		cursor: pointer;
	}
  button:disabled {
		background: var(--bg-highest) !important;
		border-color: var(--bg-higher) !important;
		color: var(--fg-dimmest) !important;
  }
	button.primary {
		border: 1px solid var(--accent-primary-dimmer);
		background-color: var(--accent-primary-dimmer);
		color: white;
	}
	body {
		padding: 0;
		margin: 0;
		width: 100%;
		min-height: 100vh;
	}

	h1, h2, h3, p {
		color: var(--fg-default);
	}

	h1 {
		font-size: var(--font-size-header);
		margin: 0;
		font-weight: 500;
	}
	.main-title {
		font-size: var(--font-size-subheader) !important;
	}

	h2 {
		font-size: var(--font-size-subheader);
		margin: 0;
		font-weight: 500;
	}

	p, span {
		font-size: var(--font-size-default);
	}

	code, pre {
		font-size: var(--font-size-default);
		font-family: var(--font-family-code);
		white-space: pre-wrap;
		padding: var(--space-8);
		margin: 0;
	}

	.code-error {
		color: var(--accent-negative-default);
	}

	select {
		background: var(--bg-root);
		border: 1px solid var(--outline-default);
		border-radius: var(--br-8);
		padding: var(--space-8);
		color: var(--fg-default);
		background-position-x: 2px;
	}

	select:focus, input:focus, button:focus, button:active {
		outline: none;
		border: 1px solid var(--accent-primary-default);
	}

	input {
		background: var(--bg-higher);
		color: var(--fg-default);
		padding: var(--space-8);
		border-radius: var(--br-8);
		border: 1px solid var(--outline-default);
	}

	#root {
		display: flex;
		align-items: center;
		flex-direction: column;
		background-color: var(--bg-root);
		width: 100%;
		height: 100%;
	}

	/** extra goodies for loading states */
	@keyframes flickerAnimation {
		0%   { opacity:1; }
		50%  { opacity:0; }
		100% { opacity:1; }
	}
	@-o-keyframes flickerAnimation{
		0%   { opacity:1; }
		50%  { opacity:0; }
		100% { opacity:1; }
	}
	@-moz-keyframes flickerAnimation{
		0%   { opacity:1; }
		50%  { opacity:0; }
		100% { opacity:1; }
	}
	.animate-flicker {
		-moz-animation: flickerAnimation 2s infinite;
		-o-animation: flickerAnimation 2s infinite;
			animation: flickerAnimation 2s infinite;
	}
	
	/** main media query */
	@media only screen and (max-width: 480px) {
		.deployment-header, .address-balance  {
    	flex-direction: column;
			gap: 8px;
			align-items: start !important;
			justify-content: stretch !important;
		}
		.address-balance {
			flex-direction: column-reverse;
			gap: 8px;
			align-items: flex-end !important;
		}

		.run-button {
			width: 100% !important;
		}

		.deployer, .deployer > select {
			width: 100%;
		}

		.function-list {
			width: 140px !important;
		}
		.function-state-text {
			display: none !important;
		}
  }
`;

const UnstyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  borderradius: var(--br-8);
  border: 1px solid transparent;
  background: transparent;
`;

const OutlinedButton = styled(UnstyledButton)`
  font-weight: medium;
  border: 1px solid var(--bg-highest);
  background-color: var(--bg-root);
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--bg-root);
  color: var(--fg-default);
  min-height: 100vh;
  width: 100%;
  max-width: 768px;
  padding: var(--space-16);
`;

const Card = styled.div`
  background-color: var(--bg-default);
`;

const Dot = styled.div`
  background: ${(props) => props.color};
  width: 6px;
  height: 6px;
  border-radius: 100px;
`;

const VStack = styled.div`
  display: flex;
  flex-direction: column;
`;
const HStack = styled.div`
  display: flex;
  flex-direction: row;
`;

const Overlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: var(--overlay);
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
`;

const Divider = styled.div`
  background-color: var(--outline-dimmest);
  height: 1px;
  width: 100%;
  margin: var(--space-16) 0;
`;

const HelpIndicator = ({ text, pos, filled }) => {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "20px",
        minHeight: "20px",
        backgroundColor: filled ? "var(--bg-higher)" : "transparent",
        border: "1px solid rgba(255,255,255,0.25)",
        fontFamily: "var(--font-family-default)",
        borderRadius: "100%",
        whiteSpace: "nowrap",
      }}
      aria-label={text}
      data-microtip-position={pos || "bottom"}
      role="tooltip"
      data-microtip-size="medium"
    >
      ?
    </div>
  );
};

// Copies text to clipboard with a fake input lol
function copy(text) {
  var inp = document.createElement("input");
  inp.style.position = "absolute";
  inp.style.opacity = 0;
  document.body.appendChild(inp);
  inp.value = text;
  inp.select();
  document.execCommand("copy", false);
  inp.remove();
}

function truncate(fullStr, strLen) {
    if (fullStr.length <= strLen) return fullStr;
    
    var separator = '...';
    
    var sepLen = separator.length,
        charsToShow = strLen - sepLen,
        frontChars = Math.ceil(charsToShow/2),
        backChars = Math.floor(charsToShow/2);
    
    return fullStr.substr(0, frontChars) + 
           separator + 
           fullStr.substr(fullStr.length - backChars);
};

/** Main app */
export default function App() {
  const [viewAccount, setViewAccount] = useState(null);
  const [viewTransaction, setViewTransaction] = useState(null);

  return (
    <VStack
      style={{
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "var(--space-8)",
        padding: 40,
      }}
    >
      <HStack
        className="main-header"
        style={{
          width: "100%",
          justifyContent: "space-between",
          paddingBottom: "var(--space-8)",
        }}
      >
        <VStack>
          <h1
            className="main-title"
            style={{ paddingRight: "var(--space-8)" }}
          >
            Replit Testnet Chain Explorer
          </h1>
          <h3> View transactions, accounts, and blocks on Replit's testnet.</h3>
          { (viewAccount != null || viewTransaction != null) ? 
        (
          <p onClick={() => {setViewAccount(null); setViewTransaction(null)}} style={{cursor: "pointer"}}><u>Back to latest blocks</u></p> 
        ) 
        : null }
        </VStack>
      </HStack>

      <Divider />
      
      { viewAccount != null ? (
        <VStack>
          <AccountUI accountId={viewAccount} />          
        </VStack>
      ) : viewTransaction != null ? 
        (<DetailedTransactionUI transactionId={viewTransaction} setViewAccount={setViewAccount} />)
        : 
        (<LatestBlockUI setViewAccount={setViewAccount} setViewTransaction={setViewTransaction} />)
      }
      <GlobalStyles />
    </VStack>
  );
}

function LatestBlockUI(props) {
  const [latestBlock, setLatestBlock] = useState(null);

  useEffect(() => {
    if (!latestBlock) {
      getLatestBlock();
    }
  }, []);

  const getLatestBlock = async () => {
    const num = 172414; //await provider.getBlockNumber();
    console.log(num);
    setLatestBlock(num); 
  };

  let content = [];
  if (latestBlock) {
    for (let i = 0; i < 10; i++) {
      content.push(<BlockUI blockNumber={latestBlock - i} setViewAccount={props.setViewAccount} setViewTransaction={props.setViewTransaction} />);
    }
  }

  return (
    <VStack>
      <h3>Latest Blocks (not actually right now - set specific to block for testing)</h3>
      {content}
    </VStack>
  )
}

const BlockUI = (props) => {
  const [blockInfo, setBlockInfo] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!blockInfo) {
      getBlockInfo(props.blockNumber);
    }
  }, []);

  const getBlockInfo = async (num) => {
    const block = await provider.getBlockWithTransactions(num);
    setBlockInfo(block); 
  };

  let transactions = [];
  if (isOpen) {
    for (let i = 0; i < blockInfo.transactions.length; i++) {
      transactions.push(<TransactionUI transaction={blockInfo.transactions[i]} setViewAccount={props.setViewAccount} setViewTransaction={props.setViewTransaction} />);
    }
  }

  return(
    <VStack
      style={{
        backgroundColor: "var(--bg-root)",
        border: "1px solid var(--outline-dimmest)",
        borderRadius: "var(--br-8)",
        marginBottom: "var(--space-16)",
        overflow: "hidden",
      }}
    >
      <HStack
        style={{
          padding: "var(--space-8)",
          borderBottom: "1px solid var(--outline-dimmest)",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <HStack
          style={{
            alignItems: "center",
            width: "100%",
            cursor: "pointer",
            gap: "var(--space-8)",
          }}
        >
          { blockInfo ? (
            <div>
              <p><b>Block {blockInfo.number}</b> - {blockInfo.hash} </p>
              <p>Transactions: {blockInfo.transactions.length}, Timestamp: {blockInfo.timestamp}</p>
            </div>
           ) : (<p>Loading blocks</p>)}
        </HStack>
        <ChevronRight
          size={20}
          style={{
            transform: isOpen ? "rotate(90deg)" : "none",
            color: "white",
          }}
        />
      </HStack>
      { isOpen ? (
        <div style={{padding: "var(--space-8)"}}>
          <h3>Transactions</h3>
          {transactions}
        </div>
      ) : null}
    </VStack>
  );
}

const TransactionUI = (props) => {
  return (
    <VStack
    style={{
        backgroundColor: "var(--bg-root)",
        border: "1px solid var(--outline-dimmest)",
        borderRadius: "var(--br-8)",
        margin: "var(--space-8) var(--space-16)",
        padding: "var(--space-8)",
        overflow: "hidden",
      }}>
      <p>Transaction: {" "}
        <u 
          style={{cursor: "pointer"}}
          onClick={() => props.setViewTransaction(props.transaction.hash)}>
            {props.transaction.hash}
        </u>
      </p>
      <p> From {" "}
        <u 
          style={{cursor: "pointer"}}
          onClick={() => props.setViewAccount(props.transaction.from)}>
            {" " + truncate(props.transaction.from,20)}
        </u> to {" "} 
        <u 
          style={{cursor: "pointer"}}
          onClick={() => props.setViewAccount(props.transaction.to)}>
            {truncate(props.transaction.to,20)}
        </u>, confirmations: {props.transaction.confirmations}
      </p>
    </VStack>
  )
}

const AccountUI = (props) => {
  const [accountInfo, setAccountInfo] = useState(null);
  const divisor = 1000000000000000000;

  useEffect(() => {
    if (!accountInfo) {
      getAccountInfo();
    }
  }, []);

  const getAccountInfo = async () => {
    const balance = await provider.getBalance(props.accountId);
    setAccountInfo(balance); 
  };

  return (
    <VStack>
      <h3>Account {props.accountId}</h3>
      <h3> Balance: {accountInfo != null ? (parseInt(accountInfo._hex, 16) / divisor) : "Loading..."} RΞ</h3>
    </VStack>
  )
}

const DetailedTransactionUI = (props) => {
  const [transactionInfo, setTransactionInfo] = useState(null);
  const divisor = 1000000000000000000;

  useEffect(() => {
    if (!transactionInfo) {
      getTransactionInfo();
    }
  }, []);

  const getTransactionInfo = async () => {
    const t = await provider.getTransaction(props.transactionId);
    setTransactionInfo(t); 
  };

  return (
    <VStack>
      <h3>Transaction {props.transactionId}</h3>
      { transactionInfo != null ? (
      <VStack>
        <p> From {" "}
          <u 
            style={{cursor: "pointer"}}
            onClick={() => props.setViewAccount(transactionInfo.from)}>
              {" " + truncate(transactionInfo.from,20)}
          </u> to {" "} 
          <u 
            style={{cursor: "pointer"}}
            onClick={() => props.setViewAccount(transactionInfo.to)}>
              {truncate(transactionInfo.to,20)}
          </u>
        </p>
        <p> value: {(parseInt(transactionInfo.value._hex, 16) / divisor)} RΞ</p>
        <p> gas limit: {(parseInt(transactionInfo.gasLimit._hex, 16) / divisor)} RΞ, gas price: {(parseInt(transactionInfo.gasPrice._hex, 16) / divisor)} RΞ</p>
        <p> confirmations: {transactionInfo.confirmations} </p>
      </VStack>
      ) : (<p>Loading...</p>)}
    </VStack>
      
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);