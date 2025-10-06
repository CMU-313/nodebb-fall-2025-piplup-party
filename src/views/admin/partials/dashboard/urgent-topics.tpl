<div class="card mb-3 urgent-topics-widget">
	<div class="card-header d-flex justify-content-between align-items-center">
		<span><i class="fa fa-exclamation-triangle text-danger me-2"></i>[[admin/dashboard:urgent-topics]]</span>
		<span class="badge bg-danger" id="urgent-topics-count">{urgentTopicsCount}</span>
	</div>
	<div class="card-body">
		{{{ if !urgentTopics.length }}}
		<div class="text-center text-muted py-3">
			<i class="fa fa-check-circle fa-2x text-success mb-2"></i>
			<p class="mb-0">[[admin/dashboard:no-urgent-topics]]</p>
		</div>
		{{{ else }}}
		<div class="urgent-topics-list">
			{{{ each urgentTopics }}}
			<div class="urgent-topic-item d-flex align-items-start gap-2 mb-3 p-2 border rounded">
				<div class="flex-shrink-0">
					<span class="badge bg-danger">
						<i class="fa fa-exclamation-triangle"></i>
					</span>
				</div>
				<div class="flex-grow-1 min-width-0">
					<h6 class="mb-1">
						<a href="{config.relative_path}/topic/{./slug}" class="text-decoration-none" target="_blank">
							{./title}
						</a>
					</h6>
					<div class="text-muted small">
						<span class="me-2">
							<i class="fa fa-user me-1"></i>
							<a href="{config.relative_path}/user/{./user.userslug}" class="text-decoration-none">{./user.displayname}</a>
						</span>
						<span class="me-2">
							<i class="fa fa-folder me-1"></i>
							<a href="{config.relative_path}/category/{./category.slug}" class="text-decoration-none">{./category.name}</a>
						</span>
						<span class="timeago" title="{./timestampISO}"></span>
					</div>
					<div class="mt-1">
						<span class="badge bg-light text-dark me-1">
							<i class="fa fa-comments me-1"></i>{./postcount} [[admin/dashboard:posts]]
						</span>
						<span class="badge bg-light text-dark">
							<i class="fa fa-eye me-1"></i>{./viewcount} [[admin/dashboard:views]]
						</span>
					</div>
				</div>
			</div>
			{{{ end }}}
		</div>
		{{{ if urgentTopics.length >= 5 }}}
		<div class="text-center mt-3">
			<a href="{config.relative_path}/admin/manage/topics?filter=urgent" class="btn btn-outline-primary btn-sm">
				[[admin/dashboard:view-all-urgent-topics]]
			</a>
		</div>
		{{{ end }}}
		{{{ end }}}
	</div>
</div>
