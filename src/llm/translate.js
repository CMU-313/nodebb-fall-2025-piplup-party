'use strict';

const nconf = require('nconf');

/**
 * LLM Translation Module
 * Detects language and translates non-English text using Ollama
 */

const llmTranslate = module.exports;

/**
 * Detect if text is English using multiple heuristics
 * 
 * Strategy:
 * 1. Check for non-ASCII characters (catches Asian languages)
 * 2. Check for common non-English words (catches European languages)
 * 3. If uncertain, translate anyway (safer to over-translate)
 * 
 * @param {string} text - The text to analyze
 * @returns {boolean} - True if text appears to be English
 */
function isEnglish(text) {
	if (!text || typeof text !== 'string') {
		return true; // Empty or invalid = assume English
	}

	const trimmed = text.trim();
	if (trimmed.length === 0) {
		return true;
	}

	// Strategy 1: Check for non-ASCII characters
	// This catches Chinese, Japanese, Arabic, etc.
	let nonAsciiCount = 0;
	for (let i = 0; i < trimmed.length; i += 1) {
		const code = trimmed.charCodeAt(i);
		if (code > 126) {
			nonAsciiCount += 1;
		}
	}
	
	// If more than 10% non-ASCII, definitely not English
	if (nonAsciiCount / trimmed.length > 0.1) {
		return false;
	}

	// Strategy 2: Check for common non-English words
	// This catches Spanish, French, German, etc.
	const lowerText = trimmed.toLowerCase();
	
	// Common Spanish words
	const spanishWords = [
		'hola', 'como', 'estas', 'que', 'muy', 'bien', 'gracias', 'por favor',
		'buenos', 'dias', 'noches', 'donde', 'cuando', 'porque', 'este', 'esta',
		'señor', 'señora', 'año', 'años',
	];
	
	// Common French words
	const frenchWords = [
		'bonjour', 'merci', 'vous', 'nous', 'dans', 'avec', 'pour', 'mais',
		'tout', 'est', 'sont', 'était', 'ça', 'où', 'être', 'avoir',
	];
	
	// Common German words
	const germanWords = [
		'der', 'die', 'das', 'und', 'ist', 'ich', 'nicht', 'sie', 'mit',
		'sich', 'auf', 'für', 'von', 'dem', 'werden', 'über', 'können',
	];
	
	// Combine all non-English words
	const nonEnglishWords = [...spanishWords, ...frenchWords, ...germanWords];
	
	// Check if text contains any non-English words
	for (const word of nonEnglishWords) {
		// Use word boundaries to avoid false matches
		const regex = new RegExp('\\b' + word + '\\b', 'i');
		if (regex.test(lowerText)) {
			console.log(`[llm/translate] Detected non-English word: "${word}"`);
			return false;
		}
	}

	// If we get here, assume English
	return true;
}

/**
 * Call Ollama API to translate text to English
 * 
 * @param {string} text - The text to translate
 * @returns {Promise<string>} - The translated text
 */
async function callOllama(text) {
	// Get Ollama API URL from config
	const ollamaUrl = nconf.get('translateApiUrl') || 'http://127.0.0.1:11434/api/generate';

	// Construct translation prompt
	const prompt = `Translate the following text into English:\n${text}`;

	const requestBody = {
		model: 'mistral',
		prompt: prompt,
		stream: false,
	};

	try {
		const response = await fetch(ollamaUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Ollama API error (${response.status}): ${errorText}`);
		}

		const data = await response.json();

		// Ollama returns the response in the 'response' field
		if (!data.response) {
			throw new Error('Ollama response missing "response" field');
		}

		return data.response.trim();
	} catch (error) {
		console.error('[llm/translate] Ollama API call failed:', error.message);
		throw error;
	}
}

/**
 * Main translation function
 * Detects language and translates if needed
 * 
 * @param {string} originalText - The text to potentially translate
 * @returns {Promise<string>} - The translated text (or original if English)
 */
llmTranslate.translateContent = async function (originalText) {
	// Input validation
	if (!originalText || typeof originalText !== 'string') {
		throw new Error('Invalid input: text must be a non-empty string');
	}

	// Detect language
	if (isEnglish(originalText)) {
		console.log('[llm/translate] Text detected as English, no translation needed');
		return originalText;
	}

	console.log('[llm/translate] Non-English text detected, calling Ollama for translation');

	// Translate using Ollama
	try {
		const translated = await callOllama(originalText);
		console.log('[llm/translate] Translation successful');
		return translated;
	} catch (error) {
		// Robust fallback: return original text with error note
		console.error('[llm/translate] Translation failed, returning fallback');
		return `[Translation unavailable] ${originalText}`;
	}
};

