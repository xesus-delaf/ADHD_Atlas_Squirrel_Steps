package com.adhd.atlas.network

import com.adhd.atlas.security.ApiKeyManager
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import java.io.IOException
import java.util.concurrent.TimeUnit

/**
 * Dynamically injects the decrypted BYOK API Key into HTTP requests.
 */
class ApiKeyAuthInterceptor(
    private val apiKeyManager: ApiKeyManager
) : Interceptor {

    @Throws(IOException::class)
    override fun intercept(chain: Interceptor.Chain): Response {
        val rawKey = apiKeyManager.getApiKey()

        if (rawKey.isNullOrBlank()) {
            throw MissingApiKeyException(
                "API Key is missing. Please configure your key in Settings."
            )
        }

        val authenticatedRequest = chain.request().newBuilder()
            // Standard Authorization Bearer header
            .header("Authorization", "Bearer $rawKey")
            // Google Gemini Direct Header standard
            .header("x-goog-api-key", rawKey)
            .build()

        return chain.proceed(authenticatedRequest)
    }
}

class MissingApiKeyException(message: String) : IOException(message)

/**
 * Factory for creating a security-hardened OkHttpClient with redacted logging.
 */
object NetworkClientFactory {

    fun create(apiKeyManager: ApiKeyManager, isDebug: Boolean): OkHttpClient {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = if (isDebug) HttpLoggingInterceptor.Level.HEADERS else HttpLoggingInterceptor.Level.NONE
            // CRITICAL: Redact all sensitive authentication headers in Logcat
            redactHeader("Authorization")
            redactHeader("x-goog-api-key")
            redactHeader("Proxy-Authorization")
        }

        return OkHttpClient.Builder()
            .connectTimeout(20, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .addInterceptor(ApiKeyAuthInterceptor(apiKeyManager))
            .addInterceptor(loggingInterceptor)
            .build()
    }
}
