'use strict';

define('urgentFilter', ['utils', 'hooks'], function (utils, hooks) {
	const urgentFilter = {};

	urgentFilter.init = function () {
		const urgentDropdown = $('[component="urgent/dropdown"]');
		if (!urgentDropdown.length) {
			return;
		}

		// Update UI state based on current filter
		urgentFilter.updateUI();

		// Handle dropdown item clicks
		$('[component="urgent/filter"]').on('click', function (e) {
			e.preventDefault();
			const href = $(this).attr('href');
			if (href && href !== '#') {
				window.location.href = href;
			}
		});
	};

	urgentFilter.updateUI = function () {
		// Check if urgent filter is active
		const urlParams = new URLSearchParams(window.location.search);
		const isUrgentActive = urlParams.get('filter') === 'urgent';
		
		const buttonIcon = $('[component="urgent/button/icon"]');
		const buttonLabel = $('[component="urgent/button/label"]');
		const allCheck = $('[component="urgent/select/all"]');
		const urgentCheck = $('[component="urgent/select/urgent"]');
		
		if (isUrgentActive) {
			// Update button to show urgent state
			buttonIcon.removeClass('fa-list').addClass('fa-exclamation-triangle');
			buttonLabel.text('Urgent Only');
			
			// Update checkmarks
			allCheck.hide();
			urgentCheck.show();
		} else {
			// Update button to show all topics state
			buttonIcon.removeClass('fa-exclamation-triangle').addClass('fa-list');
			buttonLabel.text('All Topics');
			
			// Update checkmarks
			allCheck.show();
			urgentCheck.hide();
		}
	};

	return urgentFilter;
});
