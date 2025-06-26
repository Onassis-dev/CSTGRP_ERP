<script lang="ts">
	import { createBubbler, passive } from 'svelte/legacy';

	const bubble = createBubbler();
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { InputEvents } from './index.js';
	import { cn } from '$lib/utils.js';

	type $$Props = HTMLInputAttributes & { files: FileList | undefined };
	type $$Events = InputEvents;

	interface Props {
		class?: $$Props['class'];
		files?: $$Props['files'];
		[key: string]: any;
	}

	let { class: className = undefined, files = $bindable(undefined), ...rest }: Props = $props();
</script>

<input
	class={cn(
		'file border-input bg-background ring-offset-background file:text-muted-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-8 w-full cursor-pointer rounded-sm border px-3 py-1 text-sm file:cursor-pointer file:border-0 file:bg-transparent file:text-sm focus-visible:outline-none focus-visible:ring-1  disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	bind:files
	type="file"
	onblur={bubble('blur')}
	onchange={bubble('change')}
	onclick={bubble('click')}
	onfocus={bubble('focus')}
	onfocusin={bubble('focusin')}
	onfocusout={bubble('focusout')}
	onkeydown={bubble('keydown')}
	onkeypress={bubble('keypress')}
	onkeyup={bubble('keyup')}
	onmouseover={bubble('mouseover')}
	onmouseenter={bubble('mouseenter')}
	onmouseleave={bubble('mouseleave')}
	onmousemove={bubble('mousemove')}
	onpaste={bubble('paste')}
	oninput={bubble('input')}
	use:passive={['wheel', () => bubble('wheel')]}
	{...rest}
/>
