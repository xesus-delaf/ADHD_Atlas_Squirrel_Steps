# ADHD Atlas - Android BYOK (Bring Your Own Key)

Production-hardened, Play Store-compliant Android security architecture for managing user API keys in a Bring Your Own Key (BYOK) paradigm with neurodivergent accessibility.

---

## 🛡️ Key Security Capabilities

1. **Hardware-Backed Cryptography**:
   - `EncryptedSharedPreferences` with `AES256-GCM` key and `AES256-SIV` value scheme.
   - StrongBox Keymaster hardware support dynamically detected for Titan M / Knox-backed hardware chips.
2. **Mitigation for Heap Dumps**:
   - `useApiKey(block: (CharArray) -> T)` zeroing mechanism using `Arrays.fill(charArray, '\u0000')` immediately after request dispatch.
3. **Corrupted Keystore Auto-Recovery**:
   - Captures `KeyPermanentlyInvalidatedException` and re-initializes corrupted vaults without app crashes.
4. **Scoped `FLAG_SECURE` Protection**:
   - `ScopedScreenProtection` ties `WindowManager.LayoutParams.FLAG_SECURE` strictly to the Composable's lifecycle via `DisposableEffect`, preventing complete app blackout in the Android Recent Apps switcher for ADHD accessibility.
5. **Network Layer Redaction**:
   - `ApiKeyAuthInterceptor` injects `Authorization: Bearer <key>` and `x-goog-api-key`.
   - `HttpLoggingInterceptor` redacts all sensitive credential headers from Logcat.

---

## 📁 Package Architecture

```
android/app/src/main/java/com/adhd/atlas/
├── MainActivity.kt
├── security/
│   └── ApiKeyManager.kt            # HardenedApiKeyManager & zeroing implementation
├── network/
│   └── ApiKeyAuthInterceptor.kt    # OkHttp interceptor & header redaction
└── ui/byok/
    ├── ApiKeyViewModel.kt          # MVI/MVVM ViewModel
    └── ApiKeyConfigScreen.kt       # Jetpack Compose UI with ScopedScreenProtection
```

---

## 🚀 Building in Android Studio

1. Open Android Studio (Ladybug / Koala or newer).
2. Select **Open an Existing Project** and navigate to `ADHD_Atlas/android`.
3. Allow Gradle to sync dependencies.
4. Run on an Android Device or Emulator (API 26+).
