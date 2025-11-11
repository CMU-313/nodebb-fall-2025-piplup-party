'use strict';

const nconf = require('nconf');

/**
 * Translates text using the external LLM translation microservice
 * @param {string} text - The text to translate
 * @returns {Promise<string>} The translated text
 */
async function translateText(text) {
	if (!text || typeof text !== 'string') {
		console.error('[api/translator.js] Invalid input - text must be a non-empty string');
		throw new Error('[[error:invalid-data]]');
	}

	// Get the translation API URL from config only
	const translateApiUrl = nconf.get('translateApiUrl') || 'http://127.0.0.1:11434/api/generate';
	
	console.log('[api/translator.js] Translation API URL:', translateApiUrl);
	console.log('[api/translator.js] Sending POST request with payload:', JSON.stringify({
		model: 'mistral',
		prompt: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
		stream: false,
	}));

	try {
		const requestBody = {
			model: 'mistral',
			prompt: text,
			stream: false,
		};
		
		const response = await fetch(translateApiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestBody),
		});

		console.log('[api/translator.js] Response status:', response.status, response.statusText);

		if (!response.ok) {
			const errorText = await response.text();
			console.error('[api/translator.js] HTTP error response body:', errorText);
			throw new Error(`Translation service responded with status ${response.status}: ${errorText}`);
		}

		const data = await response.json();
		console.log('[api/translator.js] Response data keys:', Object.keys(data));
		console.log('[api/translator.js] Response data.response preview:', data.response ? data.response.substring(0, 100) : '(missing)');

		// Return only the translated text from the response field
		if (!data.response) {
			console.error('[api/translator.js] Response data structure:', JSON.stringify(data));
			throw new Error('Translation service returned invalid response format - missing "response" field');
		}
		
		console.log('[api/translator.js] Successfully returning translated text');
		return data.response;
	} catch (error) {
		console.error('[api/translator.js] Translation request failed:', error.message);
		console.error('[api/translator.js] Error stack:', error.stack);
		throw new Error(`Translation failed: ${error.message}`);
	}
}

module.exports = {
	translateText,
};

