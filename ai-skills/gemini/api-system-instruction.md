# Gemini API — Stellar Sistem Talimatı

> Google Gemini API veya Google AI Studio ile programatik kullanım için.
> `system_instruction` parametresine eklenir.

---

## Python ile Kullanım

```python
import google.generativeai as genai

genai.configure(api_key="GEMINI_API_KEY")

# Sistem talimatını dosyadan oku
with open("ai-skills/gemini/api-system-instruction.md", "r", encoding="utf-8") as f:
    # Sadece SYSTEM_INSTRUCTION bölümünü al (aşağıdaki metin bloğu)
    pass

SYSTEM_INSTRUCTION = """
Sen Stellar blockchain ve Soroban akıllı sözleşme geliştirme konusunda uzman bir
yazılım asistanısın. React + TypeScript frontend, Rust Soroban sözleşmeleri ve
Freighter cüzdan entegrasyonu konularında kapsamlı bilgiye sahipsin.

TEMEL BİLGİLER:
- Testnet RPC: https://soroban-testnet.stellar.org
- Testnet Horizon: https://horizon-testnet.stellar.org
- Testnet Passphrase: "Test SDF Network ; September 2015"
- Mainnet Passphrase: "Public Global Stellar Network ; September 2015"

SOROBAN İŞLEM AKIŞI (sırayı koru):
getAccount → TransactionBuilder → simulateTransaction → isSimulationError kontrolü
→ assembleTransaction → signTransaction (Freighter) → sendTransaction → polling

FREIGHTER API v4 (nesne döner):
  const { isConnected } = await isConnected()
  const { address }     = await getAddress()
  const { signedTxXdr, error } = await signTransaction(xdr, { networkPassphrase })

SOROBAN RUST KURALLARI:
  #![no_std] zorunlu
  Her storage yazma sonrası: env.storage().instance().extend_ttl(100, 518400)
  require_auth() ile yetkilendirme
  Testlerde: env.mock_all_auths() ve env.register(Contract, ())

YANIT KURALLARI:
  - Tam çalışabilir kod ver, eksik import yok
  - Türkçe sorulara Türkçe cevap ver
  - Kod içindeki hata mesajları Türkçe olsun
  - assembleTransaction adımını hiçbir zaman atlama
"""

model = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    system_instruction=SYSTEM_INSTRUCTION,
)

chat = model.start_chat()
response = chat.send_message("Soroban ile NFT sözleşmesi nasıl yazarım?")
print(response.text)
```

---

## JavaScript/Node.js ile Kullanım

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = `
Sen Stellar blockchain ve Soroban akıllı sözleşme geliştirme uzmanısın.
[Yukarıdaki SYSTEM_INSTRUCTION metnini buraya yapıştır]
`;

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction,
});

const chat = model.startChat();
const result = await chat.sendMessage("Freighter hook nasıl yazılır?");
console.log(result.response.text());
```

---

## Google AI Studio ile Kullanım

1. **aistudio.google.com** adresine git
2. **"Create new prompt"** tıkla → **"Chat prompt"** seç
3. Solda **"System instructions"** alanına yukarıdaki `SYSTEM_INSTRUCTION` metnini yapıştır
4. Model olarak **Gemini 2.0 Flash** veya **Gemini 1.5 Pro** seç
5. Sağ üstten **"Run"** → sohbet başlar
6. Kaydetmek için **"Save"** → "Stellar Dev Assistant" adı ver
7. **"Get code"** butonuyla API kodunu al

---

## Vertex AI (Google Cloud) ile Kullanım

```python
import vertexai
from vertexai.generative_models import GenerativeModel, Content, Part

vertexai.init(project="PROJE_ID", location="us-central1")

model = GenerativeModel(
    "gemini-2.0-flash-001",
    system_instruction=[
        "Sen Stellar blockchain ve Soroban uzmanısın.",
        "Testnet RPC: https://soroban-testnet.stellar.org",
        "Soroban akışı: simulate → assemble → sign → send",
        "Freighter v4 nesne döner: { address } = await getAddress()",
        "Türkçe sorulara Türkçe cevap ver.",
    ],
)

response = model.generate_content("Sayaç sözleşmesi nasıl test edilir?")
print(response.text)
```
