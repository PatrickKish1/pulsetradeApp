# AI-Powered Trading Platform

Welcome to the **AI-Powered Trading Platform** repository! This platform combines cutting-edge AI capabilities, blockchain technology, and seamless integration to deliver a state-of-the-art trading experience. It is designed to empower both individual traders and trade administrators to maximize profits, manage accounts efficiently, and execute trades with real-time intelligence.

&nbsp;
&nbsp;

```
⚠️ NOTICE

Due to build errors of a dependency this project was restarted from scratch a few times. The orignal code is available at the url below 👇. The new frontend code is a simplified version which has some features removed for the sake debugging and production build. Unfortunately the frontend developer has to go fullstack the project which cause some of the key features being reducted. Feel free to check the original code at the url below for contracts and Koii task.

```

### Original code base - https://github.com/PatrickKish1/pulsetrade

### Slide Deck with some resource links - https://github.com/PatrickKish1/pulsetradeApp/blob/main/PULSE%20TRADE.pdf

### Deployed frontend code base - https://github.com/PatrickKish1/pulsetradeApp/

&nbsp;
&nbsp;

&nbsp;
&nbsp;

## Functioinal Features

&nbsp;

Currently the features working are:

1. AI Chat - For chatting with an LLM to get trading advice. The LLM is capable of providing insight into trading and some data about the market. It is also capable of provising take profit, stop loss and lot size for trades.

2. Peer-to-Peer chat system - This chat system was designed so as to allow users to communicate with each other. It is a simple chat system that allows users to send messages and create group chats for some amusement. This chat system will provide user data based on their individual discussions and group chat creating a personality profile for the user which will be used by an AI agent to design a trading strategy based on the user's intrests, assit in portfolio management and diversification as well as recommendations.

3. Admin Panel - This is for admin traders. There are two types of users on the platform, one is a standard user and the other is a trade admin. Standard users are regular traders who can only view their own account information and trade history. Trade admins are users who have been granted the ability to manage user accounts, a standard user goes into agreement with a trade admin to trade on their behalf and by signing a zk proof forming a sort of trust link so that the trade admin can execute trades on behalf of the standard user. These trades are done using virtual balances so as not to let trade admins steal user funds or misuse them. The implementation of this is currently minimal due to the build issues. In the signage contrat both traders agree on the percentage of profits made in trades.

4. Prop firm - Prop Firms are one of the ways beginners attain capital to start trading. Here we have a pool for which users can contribute to and then the pool is used to fund accounts of traders who request for it. The pool has side benefits depending on agreements clause added, for some a user will get an interest percentage on how much they contribute and will be notified how much was used to funds another user.

5. Trade execution - This is the part of the application that makes money for users. This is supposed to b for users to create their trades to execute. The contract has been defined for this but due to build issues no integration for it was made .

6. Trading History - This just displays users trading history and how their account is fairing.

&nbsp;
&nbsp;

## Key Features

1. **AI-Driven Trading Assistance**

   - Automated trade execution with real-time decision-making.
   - Trade signal generation for manual approval or autonomous operation.
   - Configurable AI settings for risk tolerance and trade size.
   - Portfolio management with AI-based suggestions for diversification and optimization.
   - Trade signal suggestions based on technical, fundamental, and sentiment analysis.
   - Updates on market news and trends across stocks, forex, and crypto assets.

2. **Trade Admin Features**

   - Sub-account management with virtual balances to prevent direct fund access.
   - Profit-sharing mechanisms with blockchain-based smart contracts.
   - Aggregated portfolio views for all managed accounts.
   - AI-assisted sub-account trading and management.

3. **User Types**

   - **Regular Users**: Beginner, intermediate, and pro traders leveraging AI and platform tools for trading.
   - **Trade Admins**: Manage sub-accounts, use AI to optimize multiple portfolios, and earn profit shares.

4. **Blockchain Integration**

   - Smart contracts for profit sharing and virtual balance management.
   - Decentralized wallet connectivity with support for MetaMask and StarkNet's Argent Wallet.

5. **Rich Analytics and Reporting**

   - Performance insights with charts and metrics.
   - Comparative analysis of AI-driven vs. manual trades.

6. **Learning and Rewards**
   - Tutorials for beginner traders as Koii tasks, rewarding users with platform tokens upon completion.
   - Tokens created on Koii are used to incentivize engagement and learning.

&nbsp;
&nbsp;

&nbsp;
&nbsp;

## Technologies Used

### **Core Technologies**

- **iExec**: Provides decentralized computing power for AI model execution, data sharing, and secure data access through Data Protectors and Web3Mail. With iExec the platform provides a means to onboard users from web2 using emails or other socials providing them with an on-chain address.

  Through iExec the platform will setup a trading strategy analysis signal sharing where users can share their trading strategy with other users and get rewarded by users subscribing to their strategies. This will be done through a decentralized marketplace where users can buy and sell trading strategies.

  iExec will faciliate a base layer security by protecting the data and the AI models from being copied or stolen. For data such as historical trades, chats summary, trading strategies, trading hostory, admin accounts management and other platform data, iExec will be used to protect these data and leveraging ZK most of these data can be shared without revealing the data itself or its source.

&nbsp;
&nbsp;

- **Citrea**: Manages complex workflows, ensuring AI and user actions are synchronized effectively. The solidty smart contract was deployed on Citrea and the smart contract handles:
  Sub-Account Management: Creation, storage, and management of sub-accounts with associated admins, along with profit-sharing between users and admins.

  1. Trade Execution and Completion: Tracks individual trades, ensures admins manage specific accounts and trades, and distributes profits from completed trades.

  2. Profit Distribution: Shares profits according to a predefined percentage between sub-account owners and admins, and transfers funds securely.

  3. User Balances: Allows deposits and withdrawals for sub-account owners.

  4. Transparency and Access Control: Enforces authorization for admins and sub-account owners, and provides transparency through public mappings and functions.

&nbsp;
&nbsp;

- **Koii**: Facilitates decentralized content validation and distribution for learning modules and rewards with platform tokens. On Koii, users can create, share, and monetize on the platform.

  Here are some of the ways users can earn and how Koii helps us:

  1. With Koii we have deployed AI tasks that run out predictive models. The predictive models are used to predict the performance of a trading strategy, price of market intruments from stocks, crypto, forex, indexes and so on. Looking at the number of instruments out there it is significant that a lot of tasks will be available for users and earn a lot. Although there is a required metric that will be checked so we ensure we are getting good results.

  2. Users will also be able to create tasks for their own use cases. A user can create a task to test a trading strategy and other users can participate in the task and earn tokens. This will be a great way for users to earn tokens especially for beginner traders who need capital to start trading.

&nbsp;
&nbsp;

- **StarkNet**: Offers scalable and secure Layer 2 solutions for faster blockchain interactions, supporting smart contracts for specific services like profit sharing. For starkent the contract centralizes around these main functions:

  1. Confidential Agreement Handling: Use StarkNet's zk-proof capabilities for private agreement handling, complementing Solidity's references to confidential agreements.

  2. High-Frequency Trading Logic: Optimize high-frequency trade computations with Cairo and StarkNet for better performance.

  3. Workflow Orchestration: Implement complex workflows for trade allocation, profit distribution, and balance updates using StarkNet's zk capabilities.

  4. Enhanced Privacy for Sub-Accounts: Utilize zk-proofs to manage private data for sub-accounts without public exposure.

  5. Cross-Chain Communication: Implement data synchronization between Citrea and StarkNet if both platforms are used.

  &nbsp;
  &nbsp;

  StarkNet Contract System Components:

  1. Main Contract (main.cairo): Manages contract state, core interfaces, event emissions, module coordination, and access control.

  2. Identity & Trust Module (identity_manager.cairo): Handles trust agreement implementation, zk-proof identity verification, privacy-preserving credentials, and trust score calculation.

  3. Voting & Prop Firm Module (governance.cairo): Manages voting mechanisms, vote validation, external data integration, warning/ban systems, prop firm pool management, fund allocation for beginners, and statistics tracking.

- **Particle**: Ensures seamless user onboarding and interaction with blockchain networks for executing trades and smart contract functionalities. (currently now in use)

&nbsp;
&nbsp;

&nbsp;
&nbsp;

### **Frontend**

- **Next.js**: For building a responsive and dynamic user interface.
- **Chart.js**: For visualizing trade data and performance metrics.
- **Tailwind CSS**: For a consistent and modern design system.

### **Backend**

- **Node.js**: Provides APIs for communication between the frontend and services.
- **Firebase/Firestore**: For real-time notifications and updates for chats, storing user data as well as aplication data updates.

&nbsp;
&nbsp;

### **AI Engine**

- **LangChain/Groq**: This is the main chat system that users intract with and handles the analysis of market data and user data to generate user data summary for training other models. Handles natural language understanding for sentiment analysis and trade-related news.

#### Pulse Trade will run a Mixture of Agents (MOA) system which leverages multiple AI models to make predictions and process user data, news data, predicted prices from predictive models and utilize both fundamental + technical analysis in making trading decisions.

- **Open Source LLMs**:

  - **GPT-J**: It analyzes market trends, social media sentiments, and financial news to influence trading decisions. Also to be used for
  - **Falcon**: Focuses on technical data analysis and trade signal generation. It processes technical indicators like moving averages, RSI, and MACD to create actionable trade signals.
  - **LLaMA**: Synthesizes technical, fundamental, and sentiment data to generate a final trade recommendation. This model integrates inputs from both Falcon’s technical analysis and GPT-J’s sentiment insights for holistic decision-making.

&nbsp;
&nbsp;

- **AI Functionality**:
  - Technical analysis of trading indicators (e.g., RSI, MACD, moving averages).
  - Fundamental analysis, including earnings reports and economic data.
  - Sentiment analysis using news and social media trends.
  - Dynamic trade signal generation tailored to user profiles (e.g., beginner, intermediate, pro).
  - Chat system for beginners to make inquiries about the market and information relating to trading.
  - Make predictions on future market trends based on historical data and current market conditions.
  - Trade admin assistant in trade, accounts management.

&nbsp;
&nbsp;

### **Blockchain**

- **Currently the platform used a custom wallet connection system but below are future prospects**

- **Ethereum**: For deploying general smart contracts that handle profit sharing and virtual balances.
- **StarkNet**: Used specifically for faster, secure Layer 2 smart contracts, including those for trust agreements and trade-related services.
- **Web3.js**: Facilitates interactions between the app and blockchain networks.
- **Wallet Integration**:
  - **MetaMask**: Standard wallet for Ethereum-based interactions.
  - **Argent Wallet**: A StarkNet-compatible wallet for decentralized transactions, providing an additional layer of scalability and security for StarkNet-based interactions.

&nbsp;
&nbsp;

### **Database**

- **Firebase/Firestore**: For storing user data, trade history, chats and performance metrics.

- **Future Developments**:
- **PostgreSQL**: For storing user data, trade history, and performance metrics.
- **Redis**: For caching frequently accessed data, such as live trade signals.

&nbsp;
&nbsp;

## System Architecture

### **Workflow Overview**

1. **User Registration & Onboarding**:

   - Users create accounts, configure AI settings, link wallets (MetaMask) or signup with email.
   - Users who use email address are provided an on-chain address.

2. **AI-Driven Operations**:

   - AI chat bot for information and support.
   - Portfolio management and diversification.
   - User account analysis to provide personalized recommendations.
   - AI analyzes market data and generates trade signals.
   - Signals are sent to users for approval or executed autonomously.

3. **Trade Execution**:

   - Trades initiated by AI or users are executed via integrated APIs and reflected on the platform dashboard.

4. **Profit Sharing**:

   - Smart contracts ensure automatic profit distribution between trade admins and sub-accounts.
   - Virtual balances are updated after each trade.

5. **Analytics & Reporting**:

   - Users view performance metrics, trade history, and profit/loss reports.
   - Admins monitor sub-account activities and overall portfolio performance.

6. **Learning and Rewards**:
   - Tutorials on Koii educate beginners about trading strategies.
   - Completing tasks rewards users with platform tokens.

### **Integration Overview**

| Component      | Technology                                        | Functionality                                              |
| -------------- | ------------------------------------------------- | ---------------------------------------------------------- |
| **Frontend**   | Next.js                                           | User interface, dashboards, and data visualization.        |
| **Backend**    | Node.js, Express                                  | API management, user authentication, and trade sync logic. |
| **AI Engine**  | LangChain/Groq (mixtral model)                    | Multi-LLM collaboration for trade insights and decisions.  |
| **Blockchain** | Solidity, Web3.js                                 | Smart contracts for profit sharing and virtual balances.   |
| **Database**   | PostgreSQL, Firebase                              | Persistent and cached data storage.                        |
| **DevOps**     | Docker, Kubernetes                                | Scalable deployment and container orchestration.           |
| **Core Tech**  | Particle, iExec, Spectral, Citrea, Koii, StarkNet | Decentralized workflows, risk assessment, and performance. |

---

---

## Smart Contracts Overview

The following table outlines the smart contracts required for the platform, their deployment platforms, and functionality:

| **Contract Name**              | **Platform**        | **Purpose**                                                                                   |
| ------------------------------ | ------------------- | --------------------------------------------------------------------------------------------- |
| User Management Contract       | Ethereum (Solidity) | Manage users, roles, and wallet connections.                                                  |
| Profit-Sharing Contract        | Ethereum (Solidity) | Handle profit distribution between trade admins and sub-accounts.                             |
| Token Contract                 | Ethereum (Solidity) | Manage platform tokens for rewards and transactions.                                          |
| Reward Distribution Contract   | Ethereum (Solidity) | Incentivize users for completing tasks (can merge with token contract).                       |
| Trade Execution Contract       | Ethereum (Solidity) | Record trade details and ensure transparency.                                                 |
| Virtual Balance Contract       | Ethereum (Solidity) | Manage virtual balances for trade admins and sub-accounts.                                    |
| Data Protection Contract       | iExec (Off-chain)   | Store encrypted data references and enable secure communication via iExec.                    |
| Workflow Management Contract   | StarkNet (Cairo)    | Facilitates task orchestration and manages AI-driven or user-driven workflows through Citrea. |
| Wallet Compatibility Contracts | Ethereum, StarkNet  | Support MetaMask and StarkNet Argent wallets for decentralized transactions.                  |

---

## Installation and Setup

### Prerequisites

- **Node.js** (v14+)
- **MetaMask**
- **Polygon API Key from https://polygon.io** (for stocks, crypto, forex data)

### Local Development

1. Clone the repository:

   ```bash
   git clone https://github.com/PatrickKish1/pulsetrade.git
   cd pulsetrade
   ```

2. Install dependencies:

   ```bash
   npm install
   cd ai-engine && pip install -r requirements.txt
   ```

3. Start the services:

   - **Frontend**:
     ```bash
     npm run start
     ```

4. Access the platform at `https://pulsetrade-app.vercel.app/`.

---

&nbsp;
&nbsp;

&nbsp;
&nbsp;

## Contributing

We welcome contributions! Please follow the standard GitHub workflow:

1. Fork the repository.
2. Create a new feature branch.
3. Submit a pull request with detailed notes on the changes.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
