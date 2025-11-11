'use strict';

const llmTranslate = require('../llm/translate');

const translatorApi = module.exports;

/**
 * Translate post content using LLM
 * Returns [isEnglish, translatedContent] tuple
 * 
 * @param {Object} postData - Post data containing content to translate
 * @returns {Promise<Array>} - [isEnglish (string), translatedContent (string|null)]
 */
translatorApi.translate = async function (postData) {
	if (!postData || !postData.content) {
		console.log('[translate/index] No content to translate');
		return ['true', null];
	}

	try {
		const translatedText = await llmTranslate.translateContent(postData.content);
		
		// If translation returns the original text (was English), mark as English
		if (translatedText === postData.content) {
			console.log('[translate/index] Content is English');
			return ['true', null];
		}
		
		// Non-English content was translated
		console.log('[translate/index] Content translated successfully');
		return ['false', translatedText];
	} catch (error) {
		// On error, assume English (safe fallback)
		console.error('[translate/index] Translation error:', error.message);
		return ['true', null];
	}
};
