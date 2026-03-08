<h1 align="center">DHEBP</h1>

<p align="center">
<strong>Privacy infrastructure for the decentralized web.</strong><br>
Building the tools that make <a href="https://derofoundation.org">DERO</a> usable, accessible, and unstoppable.
</p>

<p align="center">
<a href="https://derod.org">derod.org</a> · <a href="https://tela.derod.org">tela.derod.org</a> · <a href="https://hologram.derod.org">hologram.derod.org</a> · <a href="https://deropay.derod.org">deropay.derod.org</a> · <a href="https://deropay.com">deropay.com</a>
</p>

---

<br>

<h2 align="center">HOLOGRAM</h2>

<p align="center">
<em>A native browser for the decentralized web.</em>
</p>

The web was supposed to be open. Then it got captured -- by servers you don't control, platforms that track you, and content that disappears when someone decides it should.

HOLOGRAM is the exit. A native desktop browser where content lives on-chain, privacy is default, and applications run from the blockchain itself. No extensions. No tracking. No permission needed.

```
HOLOGRAM (Wails v2)
├── Direct HTTP → derod:10102 (blockchain reads)
├── XSWD Server → 127.0.0.1:44326 (integrated wallet + dApp bridge)
├── XSWD Client → Engram (optional external wallet)
├── Gnomon Indexer (content discovery)
├── Graviton Cache (persistent storage with versioning)
└── Iframe → TELA content (sandboxed + telaHost API)
```

TELA applications run in sandboxed iframes with a native `telaHost` bridge API -- think `window.ethereum`, but for a privacy chain. Read-only blockchain queries resolve instantly. Wallet operations require explicit user approval via native modals. Apps cannot touch your keys without permission.

Block and transaction explorer with DeroProof validation. Time-travel smart contract state. Gnomon-powered search and discovery. One-click simulator with instant blocks for local development. Offline-first with Graviton-backed caching.

**Go + Wails + Svelte.** One binary. Every platform.

<p align="center">
<a href="https://github.com/DHEBP/HOLOGRAM">Source</a> · <a href="https://hologram.derod.org">Docs</a> · <a href="https://github.com/DHEBP/HOLOGRAM/releases">Download</a>
</p>

<br>

---

<br>

<h2 align="center">DeroPay</h2>

<p align="center">
<em>Accept DERO. Keep everything.</em>
</p>

Zero fees. Self-hosted. No middlemen. No KYC. No payment processor skimming a percentage off every sale.

DeroPay is a complete payment stack built on DERO smart contracts. Two models, depending on what you need:

| | Payment Router | Escrow |
|:--|:--|:--|
| **Model** | One contract per merchant, reused for all payments | One contract per transaction |
| **Settlement** | ~18 seconds (1 block) | ~54 seconds (3 transactions) |
| **Transactions** | 1 per payment | 3 (deploy + deposit + release) |
| **Buyer protection** | No | Yes -- dispute resolution with optional arbitrator |
| **Fee splitting** | Basis points, set at deploy, immutable | Platform fee on release, not on refund |

On top of that: an invoice engine with unique payment IDs and integrated addresses, HMAC-SHA256 signed webhooks, fiat conversion via CoinGecko, a 13KB embeddable widget (Shadow DOM, no dependencies), a gateway server, and drop-in plugins for WooCommerce and Medusa.

Pluggable storage -- SQLite for production, in-memory for dev, or bring your own. Your server. Your keys. Your revenue.

<p align="center">
<a href="https://github.com/DHEBP/DeroPay">Source</a> · <a href="https://deropay.derod.org">Docs</a> · <a href="https://www.npmjs.com/package/dero-pay">npm</a>
</p>

<br>

---

<br>

<h2 align="center">DeroAuth</h2>

<p align="center">
<em>Sign in with your wallet. Nothing else.</em>
</p>

No passwords. No OAuth providers. No email verification. Just a cryptographic proof that you own a DERO address.

**Schnorr signatures on BN256** (Barreto-Naehrig 254-bit curve). Messages are hashed with Keccak-256, reduced modulo the curve order, and verified in pure TypeScript using `@noble/curves` (audited by Cure53). No blockchain query needed -- verification is entirely mathematical, entirely offline.

Unlike Ethereum auth, authenticating with DERO doesn't expose your transaction history. Your on-chain activity stays invisible to the service. You prove who you are without revealing what you've done.

SIWE-style message format: domain-bound, replay-protected, human-readable. The user sees exactly what they're signing. JWT sessions handle the rest. React components, a Next.js integration, and XSWD wallet connection out of the box.

```
npm install dero-auth
```

<p align="center">
<a href="https://github.com/DHEBP/DeroAuth">Source</a> · <a href="https://www.npmjs.com/package/dero-auth">npm</a>
</p>

<br>

---

<br>

<h2 align="center">dero-docs</h2>

<p align="center">
<em>Four documentation sites. One monorepo. The reference for building on DERO.</em>
</p>

| Site | What it covers |
|:-----|:---------------|
| **[derod.org](https://derod.org)** | DERO blockchain -- nodes, mining, smart contracts, RPC API, protocol internals |
| **[tela.derod.org](https://tela.derod.org)** | TELA -- the decentralized web standard that HOLOGRAM renders |
| **[hologram.derod.org](https://hologram.derod.org)** | HOLOGRAM -- browser documentation, architecture, telaHost API |
| **[deropay.derod.org](https://deropay.derod.org)** | DeroPay -- merchant guides, widget integration, payment routing |


Built with Next.js and Nextra. Deployed on Vercel.

<p align="center">
<a href="https://github.com/DHEBP/dero-docs">Source</a>
</p>

<br>

---

<br>

<p align="center">
<strong>Go · TypeScript · Svelte · React · Next.js · Wails · Tailwind CSS</strong>
</p>

<p align="center">
Privacy by default. Self-hosted. Open source. Zero fees.<br>
If it requires trust, it's not finished yet.
</p>
