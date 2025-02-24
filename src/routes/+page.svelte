<script>
	import { 
		numPoints,
		speed,
		numRings,
		size,
		ringSize,
		color,
		isRainbow,
		isAnimating,
		animationSpeed,
		isPointSizeAnimating,
		pointSizeAnimatingSpeed,
		isRingCountAnimating,
		ringCountAnimatingSpeed,
		isPointCountAnimating,
		pointCountAnimatingSpeed,
		processAudioFile,
		isAudioAnalyzing,
		audioContext
	} from '$lib/stores/tunnel';
	
	let showSliders = true;
	let fileInput;
	
	async function handleFileChange(event) {
		const file = event.target.files[0];
		if (file && file.type === 'audio/mpeg') {
			await processAudioFile(file);
		} else {
			alert('Please upload a valid MP3 file');
		}
	}
	
	function toggleAudio() {
		audioContext.subscribe(context => {
			if (!context) return;
			
			if ($isAudioAnalyzing) {
				context.suspend();
				isAudioAnalyzing.set(false);
			} else {
				context.resume();
				isAudioAnalyzing.set(true);
			}
		});
	}
	</script>
	
	<label>
		<input type="checkbox" bind:checked={showSliders} /> Show Sliders
	</label>
	<br>
	
	<!-- Audio Upload Section -->
	<div>
		<label>
			Upload MP3:
			<input 
				type="file" 
				accept=".mp3" 
				on:change={handleFileChange} 
				bind:this={fileInput}
			/>
		</label>
		{#if $audioContext}  <!-- Changed from isAudioAnalyzing to check if audio is loaded -->
			<span>Audio: </span>
			<button on:click={toggleAudio}>
				{#if $isAudioAnalyzing}
					Pause
				{:else}
					Play
				{/if}
			</button>
		{/if}
	</div>
	<br>
	
	{#if showSliders}
		<div>
			<p>Current speed: {$speed}</p>
			<input type="range" bind:value={$speed} min="0.0000075" max="0.00100" step="0.000001" />
			<br>
			<br>
			<br>
			<p>Current num points: {$numPoints}</p>
			<input type="range" bind:value={$numPoints} min="8" max="50" />
			<p>animate</p> <input type="checkbox" bind:checked={$isPointCountAnimating} />
			<br>
			<br>
			<p>animation speed({$pointCountAnimatingSpeed}ms)</p><input type="range" bind:value={$pointCountAnimatingSpeed} min="10" max="1000" step="1" disabled={!$isPointCountAnimating} />
			<br>
			<br>
			<br>
			<p>Current number of rings: {$numRings}</p>
			<input type="range" bind:value={$numRings} min="100" max="1000" step="1"/>
			<p>animate</p> <input type="checkbox" bind:checked={$isRingCountAnimating} />
			<br>
			<br>
			<p>animation speed({$ringCountAnimatingSpeed}ms)</p><input type="range" bind:value={$ringCountAnimatingSpeed} min="10" max="1000" step="1" disabled={!$isRingCountAnimating} />
			<br>
			<br>
			<br>
			<p>Current point size: {$size}</p>
			<input type="range" bind:value={$size} min="0.1" max="1.5" step="0.1" disabled={$isAudioAnalyzing} />
			<p>animate</p> <input type="checkbox" bind:checked={$isPointSizeAnimating} disabled={$isAudioAnalyzing} />
			<br>
			<br>
			<p>animation speed({$pointSizeAnimatingSpeed}ms)</p><input type="range" bind:value={$pointSizeAnimatingSpeed} min="10" max="1000" step="1" disabled={!$isPointSizeAnimating || $isAudioAnalyzing} />
			<br>
			<br>
			<br>
			<p>Current ring size: {$ringSize}</p>
			<input type="range" bind:value={$ringSize} min="1" max="20" step="1" />
			<p>animate</p> <input type="checkbox" bind:checked={$isAnimating} />
			<br>
			<br>
			<p>animation speed({$animationSpeed}ms)</p><input type="range" bind:value={$animationSpeed} min="10" max="1000" step="1" disabled={!$isAnimating} />
			<br>
			<br>
			<br>
			<p>Current color:</p>
			<input type="color" bind:value={$color} />
			<p>Rainbow</p> <input type="checkbox" bind:checked={$isRainbow} /> 
			<br>        
			<br>
		</div>
	{/if}
	
	<style>
		div {
			padding-left: 15px;
		}
		button {
			margin-left: 10px;
			padding: 5px 10px;
		}
		p, label, span, button {
			color: grey;
		}
	</style>