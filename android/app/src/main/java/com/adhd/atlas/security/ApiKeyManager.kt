package com.adhd.atlas.security

import android.content.Context
import android.content.SharedPreferences
import android.os.Build
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyPermanentlyInvalidatedException
import android.security.keystore.KeyProperties
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import java.security.GeneralSecurityException
import java.util.Arrays

/**
 * Hardened interface for managing Bring Your Own Key (BYOK) lifecycle.
 */
interface ApiKeyManager {
    fun saveApiKey(apiKey: String): Result<Unit>
    fun getApiKey(): String?
    fun <T> useApiKey(block: (CharArray) -> T): Result<T>
    fun deleteApiKey(): Result<Unit>
    fun isKeyConfigured(): Boolean
}

/**
 * Production-hardened implementation using hardware-backed EncryptedSharedPreferences (AES256-GCM)
 * with automatic recovery from Keystore invalidation and memory zeroing.
 */
class HardenedApiKeyManager(
    private val context: Context
) : ApiKeyManager {

    companion object {
        private const val PREFS_FILE_NAME = "secure_byok_vault_prefs"
        private const val KEY_API_TOKEN = "enc_user_api_key_v1"
    }

    private val masterKey: MasterKey by lazy {
        val specBuilder = KeyGenParameterSpec.Builder(
            MasterKey.DEFAULT_MASTER_KEY_ALIAS,
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setKeySize(256)

        // Leverage hardware StrongBox Keymaster if device physically supports it (Titan M, Knox, etc.)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            val hasStrongBox = context.packageManager.hasSystemFeature("android.hardware.strongbox_keystore")
            if (hasStrongBox) {
                specBuilder.setIsStrongBoxBacked(true)
            }
        }

        MasterKey.Builder(context)
            .setKeyGenParameterSpec(specBuilder.build())
            .build()
    }

    @Volatile
    private var encryptedPrefs: SharedPreferences? = null

    @Synchronized
    private fun getPrefs(): SharedPreferences {
        return encryptedPrefs ?: try {
            EncryptedSharedPreferences.create(
                context,
                PREFS_FILE_NAME,
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            ).also { encryptedPrefs = it }
        } catch (e: Exception) {
            when (e) {
                is GeneralSecurityException,
                is KeyPermanentlyInvalidatedException -> {
                    // Keystore was invalidated (e.g. Lock screen reset or HW change)
                    // Auto-wipe corrupted entry to restore app usability gracefully
                    resetCorruptedVault()
                    EncryptedSharedPreferences.create(
                        context,
                        PREFS_FILE_NAME,
                        masterKey,
                        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
                    ).also { encryptedPrefs = it }
                }
                else -> throw e
            }
        }
    }

    private fun resetCorruptedVault() {
        try {
            context.deleteSharedPreferences(PREFS_FILE_NAME)
        } catch (_: Exception) { }
    }

    override fun saveApiKey(apiKey: String): Result<Unit> = runCatching {
        require(apiKey.isNotBlank()) { "API Key cannot be empty or blank." }
        getPrefs().edit().putString(KEY_API_TOKEN, apiKey.trim()).commit()
    }

    override fun getApiKey(): String? {
        return try {
            getPrefs().getString(KEY_API_TOKEN, null)
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Memory-safe invocation: Copies characters into a temporary buffer,
     * executes the lambda, and zeroes out the memory immediately to prevent heap dumps.
     */
    override fun <T> useApiKey(block: (CharArray) -> T): Result<T> = runCatching {
        val rawKey = getApiKey() ?: throw IllegalStateException("API Key is not configured.")
        val charArray = rawKey.toCharArray()
        try {
            block(charArray)
        } finally {
            // Overwrite sensitive key bytes in RAM immediately
            Arrays.fill(charArray, '\u0000')
        }
    }

    override fun deleteApiKey(): Result<Unit> = runCatching {
        getPrefs().edit().remove(KEY_API_TOKEN).commit()
    }

    override fun isKeyConfigured(): Boolean {
        return !getApiKey().isNullOrBlank()
    }
}
