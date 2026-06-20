# evm-voting-dapp
EVM Voting Dapp
# 30-Day Software Development Internship Plan

## Project: On-Chain Voting WebApp (EVM Testnet)

This internship project is designed to help the intern learn real-world software development fundamentals through building a small blockchain-enabled web application.

The application will allow users to:

- Connect MetaMask wallet
- Create proposals
- Vote on proposals
- View proposal results

The focus of this internship is:

- Learning by building
- Understanding fullstack architecture
- Working with Git workflows
- Understanding blockchain fundamentals
- Shipping a functioning demo

This is **not** intended to be a production-grade DAO or governance platform. Nobody needs another “revolutionary governance protocol” with 14 users and a Discord server held together by caffeine and denial.

---

# Project Stack

## Frontend

- React
- Vite
- TypeScript
- TailwindCSS
- ethers.js

## Backend

- Node.js
- Express.js

## Blockchain

- Solidity
- Hardhat
- MetaMask
- Sepolia/Base Sepolia

## Tools

- Git
- GitHub
- VS Code
- Postman
- MongoDB (optional)

---

# What You Will Learn

## Software Development

- Git & GitHub workflows
- Frontend architecture
- Backend APIs
- Async programming
- Error handling
- State management
- Deployment workflows
- Debugging

## Blockchain Development

- Smart contracts
- Wallet authentication
- EVM basics
- Testnets
- Gas fees
- Smart contract deployment
- Reading/writing blockchain data

## Professional Workflow

- Branching strategies
- Pull requests
- Code reviews
- Documentation
- Feature planning
- Debugging production-like issues

---

# Internship Rules

- Commit code daily
- Push changes regularly
- Use feature branches
- Never commit private keys or `.env` secrets
- Ask questions early
- Focus on understanding over copying
- Small consistent progress > unfinished ambitious features

---

# DAILY PLAN

---

# WEEK 1 - Setup, Git & Frontend Foundations

---

# Day 1

## Goals

- Understand internship scope
- Setup development environment

## Tasks

Install:

- VS Code
- Git
- Node.js
- MetaMask
- Postman

Create:

- GitHub account
- MetaMask wallet
- GitHub repository

Read:

- What is blockchain?
- What is Ethereum?
- What is a smart contract?

## Learning Resources

### Articles

- https://ethereum.org/en/developers/docs/
- https://www.atlassian.com/git/tutorials

### Videos

- https://www.youtube.com/watch?v=gyMwXuJrbJQ

## Deliverables

- Development environment installed
- GitHub repo created
- MetaMask wallet setup complete

---

# Day 2

## Goals

- Learn Git basics

## Tasks

Learn:

- git init
- git clone
- git status
- git add
- git commit
- git push
- git pull

Practical:

- Clone repository locally
- Create README.md
- Push first commit

## Learning Resources

### Articles

- https://docs.github.com/en/get-started
- https://git-scm.com/doc

### Videos

- https://www.youtube.com/watch?v=RGOj5yH7evk

## Deliverables

- First successful Git commit pushed to GitHub

---

# Day 3

## Goals

- Learn branching workflow

## Tasks

Learn:

- git checkout -b
- feature branches
- pull requests
- merge conflicts

Create:

- `dev` branch
- `feature/setup` branch

Practical:

- Create a pull request
- Merge PR into dev branch

## Learning Resources

### Articles

- https://www.atlassian.com/git/tutorials/using-branches

### Videos

- https://www.youtube.com/watch?v=e2IbNHi4uCI

## Deliverables

- Proper branch workflow completed

---

# Day 4

## Goals

- Learn React fundamentals

## Tasks

Setup:

- React + Vite + TypeScript project

Learn:

- Components
- JSX
- Props
- State
- Folder structure

Practical:

- Build simple homepage
- Create navbar component

## Learning Resources

### Docs

- https://react.dev/learn

### Videos

- https://www.youtube.com/watch?v=bMknfKXIFA8

## Deliverables

- React app running locally

---

# Day 5

## Goals

- Learn TailwindCSS basics

## Tasks

Install:

- TailwindCSS

Learn:

- Utility classes
- Flexbox
- Grid
- Responsive layouts

Practical:

- Style homepage
- Create proposal card UI

## Learning Resources

### Docs

- https://tailwindcss.com/docs

### Videos

- https://www.youtube.com/watch?v=ft30zcMlFao

## Deliverables

- Basic styled frontend

---

# Day 6 (Weekend Learning Day)

## Topics

- What is MetaMask?
- How wallets work
- Public/private keys
- Transactions & gas fees
- EVM basics

## Videos

- https://www.youtube.com/watch?v=YVgfHZMFFFQ
- https://www.youtube.com/watch?v=coQ5dg8wM2o

## Reading

- https://ethereum.org/en/wallets/
- https://ethereum.org/en/developers/docs/evm/

## Deliverables

- Written notes summarizing learnings

---

# Day 7 (Weekend Learning Day)

## Topics

- Introduction to Solidity
- Smart contract lifecycle
- What is Hardhat?

## Reading

- https://soliditylang.org/
- https://docs.soliditylang.org/
- https://hardhat.org/docs

## Videos

- https://www.youtube.com/watch?v=M576WGiDBdQ

## Deliverables

- Notes on Solidity basics

---

# WEEK 2 - Smart Contract Development

---

# Day 8

## Goals

- Setup Hardhat

## Tasks

Install:

- Hardhat
- ethers
- dotenv

Create:

- Hardhat project

Learn:

- Hardhat folder structure
- contracts/
- scripts/
- test/

Practical:

- Compile sample contract

## Learning Resources

- https://hardhat.org/tutorial

## Deliverables

- Hardhat project setup complete

---

# Day 9

## Goals

- Learn Solidity fundamentals

## Topics

- Variables
- Structs
- Arrays
- Mappings
- Functions
- Events

## Practical

Build:

- Simple storage contract

## Videos

- https://www.youtube.com/watch?v=ipwxYa-F1uY

## Deliverables

- First Solidity contract completed

---

# Day 10

## Goals

- Build proposal smart contract

## Tasks

Create:

- Proposal struct
- createProposal()

Store:

- title
- description
- vote counts

## Deliverables

- Proposal creation working

---

# Day 11

## Goals

- Add voting functionality

## Tasks

Implement:

- vote()
- prevent double voting
- yes/no voting
- proposal deadline checks

## Learning Topics

- require()
- mappings
- validation

## Deliverables

- Voting functionality complete

---

# Day 12

## Goals

- Read blockchain data

## Tasks

Implement:

- getProposal()
- getAllProposals()

Learn:

- view functions
- gas-free reads

## Deliverables

- Proposal retrieval working

---

# Day 13 (Weekend Learning Day)

## Topics

- Smart contract security
- Common Solidity mistakes
- Reentrancy basics
- Gas optimization basics

## Reading

- https://ethereum.org/en/developers/docs/smart-contracts/security/
- https://consensys.io/blog

## Videos

- https://www.youtube.com/watch?v=wXFVTY0R6sw

## Deliverables

- Security notes

# Day 14 (Weekend Cleanup Day)

## Tasks

- Refactor contract
- Add comments
- Improve naming conventions
- Remove unused code
- Add basic tests

## Deliverables

- Cleaner contract structure

---

# WEEK 3 - Frontend + Smart Contract Integration

---

# Day 15

## Goals

- Connect frontend to blockchain

## Tasks

Learn:

- Providers
- Signers
- Contract instances

Practical:

- Connect MetaMask wallet
- Display wallet address

## Deliverables

- Wallet connection functional

---

# Day 16

## Goals

- Integrate proposal creation

## Tasks

Build:

- Proposal creation form

Connect:

- Frontend → Smart contract

Handle:

- Loading states
- Errors

## Deliverables

- Users can create proposals

---

# Day 17

## Goals

- Fetch proposals from blockchain

## Tasks

Read:

- Smart contract proposal data

Build:

- Proposal cards/list

Handle:

- Empty states
- Loading states

## Deliverables

- Proposal listing functional

---

# Day 18

## Goals

- Voting UI integration

## Tasks

Build:

- Vote buttons
- Transaction confirmation UI

Handle:

- Failed transactions
- Wallet rejection

## Deliverables

- Voting working end-to-end

---

# Day 19

## Goals

- Improve UI/UX

## Tasks

Add:

- Better spacing
- Responsive layout
- Notifications/toasts
- Loading spinners

Learn:

- Basic UI/UX principles

## Deliverables

- Cleaner frontend experience

---

# Day 20 (Weekend Learning Day)

## Topics

- React state management
- Async programming
- API calls
- useEffect & hooks

## Resources

- https://react.dev/learn/managing-state

## Videos

- https://www.youtube.com/watch?v=TNhaISOUy6Q

## Deliverables

- Notes + small practice examples

---

# Day 21 (Weekend Cleanup Day)

## Tasks

- Refactor frontend components
- Improve folder structure
- Organize imports
- Cleanup CSS/classes

## Deliverables

- Cleaner frontend architecture

---

# WEEK 4 - Backend, Deployment & Finalization

---

# Day 22

## Goals

- Learn backend fundamentals

## Tasks

Setup:

- Express.js backend

Learn:

- Routes
- Controllers
- Middleware

Practical:

- Create health-check API

## Resources

- https://expressjs.com/

## Deliverables

- Backend server running

---

# Day 23

## Goals

- Create proposal APIs

## Tasks

Build:

- GET proposals API
- POST proposal metadata API

Learn:

- Request/response lifecycle
- JSON APIs

## Deliverables

- Proposal APIs functional

---

# Day 24

## Goals

- Database basics

## Tasks

Learn:

- CRUD operations
- MongoDB basics

Optional:

- Store proposal metadata

## Resources

- https://www.mongodb.com/docs/

## Deliverables

- Optional DB integration complete

---

# Day 25

## Goals

- Deploy smart contract

## Tasks

Deploy:

- Contract to Sepolia/Base Sepolia

Learn:

- RPC URLs
- Private keys
- Deployment scripts

## Deliverables

- Live deployed contract

---

# Day 26

## Goals

- Deploy frontend

## Tasks

Deploy:

- Frontend on Vercel

Configure:

- Environment variables

## Resources

- https://vercel.com/docs

## Deliverables

- Public frontend URL

---

# Day 27 (Weekend Learning Day)

## Topics

- CI/CD basics
- Deployment pipelines
- Environment variables
- Production vs development environments

## Videos

- https://www.youtube.com/watch?v=scEDHsr3APg

## Deliverables

- Notes on deployment workflow

---

# Day 28 (Weekend Testing Day)

## Tasks

Test:

- Wallet connection
- Proposal creation
- Voting
- Error handling
- Responsive design

Fix:

- Bugs
- UI inconsistencies

## Deliverables

- Stable working demo

---

# Day 29

## Goals

- Final polish

## Tasks

Add:

- README
- Screenshots
- Setup instructions
- Architecture overview

Clean:

- Repository
- Unused files
- Console logs

## Deliverables

- Submission-ready repository

---

# Day 30

# FINAL SUBMISSION

## Deliverables

- GitHub repository
- Smart contract
- Frontend application
- Backend API
- Deployment links
- README documentation

## Final Demo Requirements

Demonstrate:

- MetaMask connection
- Proposal creation
- Voting flow
- Proposal listing
- Blockchain transaction flow
- Testnet deployment

---

# Final Expected Outcome

By the end of this internship, the intern should:

- Understand fullstack application basics
- Understand Git workflows
- Understand blockchain fundamentals
- Build and deploy a simple dApp
- Gain confidence debugging real systems
- Learn how frontend, backend, and blockchain systems connect together

The goal is not perfection.

The goal is:

> Learn, build, debug, improve, and ship something functional.
>
