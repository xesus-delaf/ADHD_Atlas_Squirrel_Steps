package com.adhd.atlas.ui.components

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.TextUnit

/**
 * Custom Compose Bionic Reading text component.
 * Highlights the first 2-3 letters of each word in bold, accelerating eye fixation
 * and minimizing cognitive fatigue for ADHD users.
 */
@Composable
fun BionicText(
    text: String,
    modifier: Modifier = Modifier,
    color: Color = Color.Unspecified,
    fontSize: TextUnit = TextUnit.Unspecified,
    lineHeight: TextUnit = TextUnit.Unspecified
) {
    val annotatedString = buildAnnotatedString {
        val words = text.split(" ")
        words.forEachIndexed { index, word ->
            if (word.isNotEmpty()) {
                val boldLength = when {
                    word.length <= 3 -> 1
                    word.length <= 6 -> 2
                    else -> 3
                }.coerceAtMost(word.length)

                val boldPart = word.substring(0, boldLength)
                val normalPart = word.substring(boldLength)

                withStyle(style = SpanStyle(fontWeight = FontWeight.ExtraBold)) {
                    append(boldPart)
                }
                withStyle(style = SpanStyle(fontWeight = FontWeight.Normal)) {
                    append(normalPart)
                }

                if (index < words.size - 1) {
                    append(" ")
                }
            }
        }
    }

    Text(
        text = annotatedString,
        modifier = modifier,
        color = color,
        fontSize = fontSize,
        lineHeight = lineHeight
    )
}
