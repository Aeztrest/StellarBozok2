# ChatGPT — Stellar Geliştirici Özel Talimatlar

> ChatGPT'nin "Custom Instructions" özelliği ile kullanılır.
> Ayarlar → Kişiselleştirme → Özel Talimatlar (Custom Instructions)

---

## Bölüm 1: ChatGPT Hakkında Ne Bilmeli?
*("What would you like ChatGPT to know about you?" alanına yapıştır)*

```
Ben Stellar blockchain ekosisteminde uygulama geliştiren bir yazılım geliştiriyicisiyim.

Projemde şu teknolojiler var:
- Stellar Testnet (XLM, Soroban akıllı sözleşmeleri)
- Akıllı sözleşme dili: Rust (soroban-sdk v25, #![no_std])
- Frontend: React 18 + TypeScript + Vite
- Cüzdan: Freighter tarayıcı eklentisi (@stellar/freighter-api v4)
- SDK: @stellar/stellar-sdk v13 (Horizon API + Soroban RPC)
- Backend: Node.js + Express

Projem şunları yapıyor:
1. Freighter cüzdanını React uygulamasına bağlıyor
2. XLM bakiyesi ve hesap bilgilerini gösteriyor
3. Soroban sayaç sözleşmesiyle etkileşime giriyor (increment, decrement, reset)

Sıkça çalıştığım Stellar kavramları:
- Soroban RPC simülasyonu (simulateTransaction → assembleTransaction)
- Freighter ile işlem imzalama (signTransaction)
- Stellar Assets, trustline, SAC (Stellar Asset Contract)
- TTL yönetimi, depolama tipleri (instance/persistent/temporary)
- Testnet Friendbot ile hesap fonlama
```

---

## Bölüm 2: ChatGPT Nasıl Yanıt Vermeli?
*("How would you like ChatGPT to respond?" alanına yapıştır)*

```
1. KOD ÖRNEKLERİ: Her zaman tam ve çalışabilir kod ver. Eksik import veya yarım
   fonksiyon verme. TypeScript kullanıyorsam tip tanımlarını da dahil et.

2. STELLAR SDK v13 KURALLARI:
   - Soroban işlem akışı daima bu sırayla olmalı:
     rpc.getAccount() → TransactionBuilder → simulateTransaction()
     → assembleTransaction() → signTransaction() → sendTransaction() → polling
   - assembleTransaction() adımını atlama — kaynak limitleri bu adımda eklenir.

3. FREIGHTER API v4 KURALLARI:
   - Tüm Freighter fonksiyonları nesne döner:
     { isConnected } = await isConnected()
     { address } = await getAddress()
     { signedTxXdr, error } = await signTransaction(xdr, opts)
   - Eski boolean dönen API'yi (v2/v3) kullanma.

4. SOROBAN RUST KURALLARI:
   - Her sözleşme #![no_std] ile başlamalı
   - Storage yazma işlemlerinden sonra her zaman extend_ttl() ekle
   - Yetkilendirme gereken fonksiyonlarda require_auth() kullan
   - Testlerde env.mock_all_auths() ve env.register(Contract, ()) kullan

5. AĞ DEĞERLERİ — daima bu değerleri kullan:
   Testnet RPC     : https://soroban-testnet.stellar.org
   Testnet Horizon : https://horizon-testnet.stellar.org
   Testnet Phrase  : "Test SDF Network ; September 2015"

6. YANIT FORMATI:
   - Adım adım açıkla, teknik terimleri Türkçe karşılıklarıyla birlikte ver
   - Hata mesajları ve UI string'leri Türkçe olsun
   - Yanıtın sonunda "Ne hata alıyorsun?" veya "Denedikten sonra sonucu paylaş" de

7. YANLIŞ BİLGİ VERMEKTENSE SOR: Emin olmadığın Stellar API detaylarında
   "Bunu resmi dokümantasyondan doğrula: developers.stellar.org" de.
```

---

## Nasıl Kullanılır (Adım Adım)

1. ChatGPT'ye gir: **chat.openai.com**
2. Sol alttaki profil ikonuna → **"Customize ChatGPT"** tıkla
3. **"Custom Instructions"** sekmesi açılır
4. **Üst kutuya** Bölüm 1'i yapıştır (kim olduğun)
5. **Alt kutuya** Bölüm 2'yi yapıştır (nasıl yanıt vermeli)
6. **"Save"** tıkla
7. Yeni bir sohbet başlat → ChatGPT artık Stellar bağlamında cevap verir

> **Not:** Bu talimatlar tüm sohbetlere uygulanır. Sadece bu projeye özel tutmak
> istiyorsan her sohbetin başında projeyi kısaca tanıt.
