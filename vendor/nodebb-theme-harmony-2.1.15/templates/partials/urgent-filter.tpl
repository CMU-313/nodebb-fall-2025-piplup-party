<!-- Urgent Filter Toggle -->
<div class="btn-group bottom-sheet" component="urgent/filter">
	<button class="btn btn-ghost btn-sm ff-secondary d-flex gap-2 align-items-center {{{ if filters.urgent }}}active-filter{{{ end }}}" 
			component="urgent/toggle" 
			type="button" 
			aria-label="[[topic:urgent-filter]]">
		<i class="fa fa-fw fa-exclamation-triangle text-primary"></i>
		<span class="visible-md-inline visible-lg-inline fw-semibold" component="urgent/label">Urgent Only</span>
	</button>
</div>
