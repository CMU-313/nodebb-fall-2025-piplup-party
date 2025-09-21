'use strict';

define('composer-urgent', ['hooks'], function (hooks) {
	const ComposerUrgent = {};

	ComposerUrgent.init = function () {
		// Hook into the composer submission to add urgent field
		hooks.on('filter:composer.submit', function (hookData) {
			if (hookData.action === 'topics.post') {
				// Add urgent field from checkbox
				const urgentCheckbox = document.getElementById('composer-urgent');
				if (urgentCheckbox) {
					hookData.composerData.urgent = urgentCheckbox.checked || false;
				}
			}
		});
	};

	return ComposerUrgent;
});
