<!-- Urgent Filter Dropdown -->
<div component="urgent/dropdown" class="btn-group dropdown-left urgent-dropdown-container bottom-sheet">
	<button type="button" class="btn btn-ghost btn-sm d-flex align-items-center ff-secondary d-flex gap-2 dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
		<i component="urgent/button/icon" class="fa fa-fw fa-list text-primary"></i>
		<span component="urgent/button/label" class="d-none d-md-inline fw-semibold">[[topic:all-topics]]</span>
	</button>

	<div class="dropdown-menu p-1">
		<ul component="urgent/list" class="list-unstyled mb-0 text-sm" role="menu">
			<li role="presentation" data-filter="all">
				<a class="dropdown-item rounded-1 d-flex align-items-center gap-2" role="menuitem" href="{{{ if template.category }}}{url}{{{ else }}}{config.relative_path}/recent{{{ end }}}" component="urgent/filter" data-filter="all">
					<i class="fa fa-fw fa-list text-primary"></i>
					<span class="flex-grow-1">[[topic:all-topics]]</span>
					<i component="urgent/select/all" class="flex-shrink-0 fa fa-fw fa-check"></i>
				</a>
			</li>
			<li role="presentation" data-filter="urgent">
				<a class="dropdown-item rounded-1 d-flex align-items-center gap-2" role="menuitem" href="{{{ if template.category }}}{url}?filter=urgent{{{ else }}}{config.relative_path}/recent?filter=urgent{{{ end }}}" component="urgent/filter" data-filter="urgent">
					<i class="fa fa-fw fa-exclamation-triangle text-primary"></i>
					<span class="flex-grow-1">[[topic:urgent-only]]</span>
					<i component="urgent/select/urgent" class="flex-shrink-0 fa fa-fw fa-check" style="display: none;"></i>
				</a>
			</li>
		</ul>
	</div>
</div>
