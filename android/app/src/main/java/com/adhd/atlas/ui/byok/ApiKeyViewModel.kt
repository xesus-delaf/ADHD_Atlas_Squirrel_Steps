package com.adhd.atlas.ui.byok

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.adhd.atlas.security.ApiKeyManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class ApiKeyUiState(
    val currentKeyMasked: String = "",
    val inputKeyText: String = "",
    val isKeySaved: Boolean = false,
    val isKeyVisible: Boolean = false,
    val isLoading: Boolean = false,
    val userFeedbackMessage: String? = null,
    val isError: Boolean = false
)

class ApiKeyViewModel(
    private val apiKeyManager: ApiKeyManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(ApiKeyUiState())
    val uiState: StateFlow<ApiKeyUiState> = _uiState.asStateFlow()

    init {
        loadKeyStatus()
    }

    private fun loadKeyStatus() {
        val savedKey = apiKeyManager.getApiKey()
        if (!savedKey.isNullOrBlank()) {
            val masked = if (savedKey.length > 8) {
                "${savedKey.take(4)}••••••••${savedKey.takeLast(4)}"
            } else {
                "••••••••••••"
            }
            _uiState.update {
                it.copy(
                    isKeySaved = true,
                    currentKeyMasked = masked,
                    inputKeyText = ""
                )
            }
        } else {
            _uiState.update { it.copy(isKeySaved = false, currentKeyMasked = "") }
        }
    }

    fun onKeyInputChanged(newValue: String) {
        _uiState.update {
            it.copy(
                inputKeyText = newValue,
                userFeedbackMessage = null,
                isError = false
            )
        }
    }

    fun toggleKeyVisibility() {
        _uiState.update { it.copy(isKeyVisible = !it.isKeyVisible) }
    }

    fun saveApiKey() {
        val keyToSave = _uiState.value.inputKeyText.trim()
        if (keyToSave.length < 10) {
            _uiState.update {
                it.copy(
                    userFeedbackMessage = "La clave parece incompleta o demasiado corta. Verifica que la hayas copiado completa.",
                    isError = true
                )
            }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            val result = apiKeyManager.saveApiKey(keyToSave)
            result.fold(
                onSuccess = {
                    loadKeyStatus()
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            userFeedbackMessage = "¡Clave guardada y cifrada con éxito!",
                            isError = false
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            userFeedbackMessage = "No se pudo almacenar la clave de forma segura: ${error.localizedMessage}",
                            isError = true
                        )
                    }
                }
            )
        }
    }

    fun deleteApiKey() {
        viewModelScope.launch {
            apiKeyManager.deleteApiKey()
            _uiState.update {
                it.copy(
                    isKeySaved = false,
                    currentKeyMasked = "",
                    inputKeyText = "",
                    userFeedbackMessage = "Clave eliminada del dispositivo.",
                    isError = false
                )
            }
        }
    }

    fun dismissFeedback() {
        _uiState.update { it.copy(userFeedbackMessage = null) }
    }

    class Factory(private val apiKeyManager: ApiKeyManager) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return ApiKeyViewModel(apiKeyManager) as T
        }
    }
}
