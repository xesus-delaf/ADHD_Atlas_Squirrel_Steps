package com.adhd.atlas

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import com.adhd.atlas.security.HardenedApiKeyManager
import com.adhd.atlas.ui.byok.ApiKeyConfigScreen
import com.adhd.atlas.ui.byok.ApiKeyViewModel

class MainActivity : ComponentActivity() {

    private val apiKeyManager by lazy {
        HardenedApiKeyManager(applicationContext)
    }

    private val apiKeyViewModel: ApiKeyViewModel by viewModels {
        ApiKeyViewModel.Factory(apiKeyManager)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ApiKeyConfigScreen(
                viewModel = apiKeyViewModel
            )
        }
    }
}
