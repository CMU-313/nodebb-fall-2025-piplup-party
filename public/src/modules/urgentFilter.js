'use strict';

define('urgentFilter', ['utils', 'hooks'], function (utils, hooks) {
	const urgentFilter = {};

	urgentFilter.init = function () {
		const urgentToggle = $('[component="urgent/toggle"]');
		if (!urgentToggle.length) {
			return;
		}

		// Check if urgent filter is currently active
		const urlParams = new URLSearchParams(window.location.search);
		const isUrgentActive = urlParams.get('filter') === 'urgent';
		
		// Update button state
		urgentFilter.updateButtonState(isUrgentActive);

		// Handle button clicks
		urgentToggle.on('click', function (e) {
			e.preventDefault();
			urgentFilter.toggleUrgentFilter();
		});
	};

	urgentFilter.updateButtonState = function (isActive) {
		const urgentToggle = $('[component="urgent/toggle"]');
		const urgentLabel = $('[component="urgent/label"]');
		
		if (isActive) {
			urgentToggle.addClass('active-filter');
			urgentLabel.text('All Topics');
		} else {
			urgentToggle.removeClass('active-filter');
			urgentLabel.text('Urgent Only');
		}
	};

	urgentFilter.toggleUrgentFilter = function () {
		const urlParams = new URLSearchParams(window.location.search);
		const isUrgentActive = urlParams.get('filter') === 'urgent';
		
		if (isUrgentActive) {
			// Remove urgent filter
			urlParams.delete('filter');
		} else {
			// Add urgent filter
			urlParams.set('filter', 'urgent');
		}
		
		// Remove page parameter to go to first page
		urlParams.delete('page');
		
		// Build new URL
		const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
		
		// Navigate to new URL
		window.location.href = newUrl;
	};

	return urgentFilter;
});
