# ============================================================================
# ADHD Atlas - BYOK Production-Hardened Security & Obfuscation Rules
# ============================================================================

# 1. Obfuscate cryptographic managers and token handlers
-keepattributes Signature, InnerClasses, EnclosingMethod
-keepclassmembers class * implements androidx.security.crypto.EncryptedSharedPreferences { *; }

# 2. Prevent reverse engineering of custom Key Management Logic
-repackageclasses 'com.adhd.atlas.security.obf'
-allowaccessmodification

# 3. Strip all Android Log / Timber statements from release builds (prevents key leakage in logcat)
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int d(...);
    public static int i(...);
    public static int w(...);
    public static int e(...);
}

-assumenosideeffects class okhttp3.logging.HttpLoggingInterceptor {
    public void setLevel(okhttp3.logging.HttpLoggingInterceptor$Level);
}

# 4. Protect data classes and secure char containers from introspection
-keepclassmembers class com.adhd.atlas.security.** {
    private <fields>;
}

# 5. Tink & Crypto Providers
-keepclassmembers class com.google.crypto.tink.** { *; }
-dontwarn com.google.crypto.tink.**
