<script>
    import { browser } from '$app/environment';
    import * as THREE from 'three';
    import { theme } from '$lib/stores/theme';
    import { numPoints, numRings, speed, size, ringSize, color, isRainbow } from '$lib/stores/tunnel';

    let renderer;
    let scene;
    let material;
    let tube;
    let path;
    let camera;

    // Reactive statement to update the background color
    $: if (renderer && $theme) {
        renderer.setClearColor(0x000000); // Dark theme background color
        scene.fog = new THREE.Fog(0x000000, 20, 40); // Dark theme fog
    } else if (renderer) {
        renderer.setClearColor(0xffffff); // Light theme background color
        scene.fog = new THREE.Fog(0xffffff, 20, 40); // Light theme fog
    }

    // Reactive statement to recreate the geometry
    $: {
        if (scene && $numRings && $ringSize && $numPoints) {
            // Remove existing tube if it exists
            if (tube) {
                scene.remove(tube);
            }
            // Hard coded array of points
            const points = [
                [68.5, 185.5],
                [1, 262.5],
                [270.9, 281.9],
                [345.5, 212.8],
                [178, 155.7],
                [240.3, 72.3],
                [153.4, 0.6],
                [52.6, 53.3],
                [68.5, 185.5]
            ];
            // Convert the array of points into vertices
            const vertices = [];
            for (let i = 0; i < points.length; i++) {
                const x = points[i][0];
                const y = 0;
                const z = points[i][1];
                vertices.push(new THREE.Vector3(x, y, z));
            }
            path = new THREE.CatmullRomCurve3(vertices);
            const geometry = new THREE.TubeGeometry(path, $numRings, $ringSize, $numPoints, false);

            // Generate rainbow colors for each vertex
            const colors = [];
            const verticesPerRing = geometry.attributes.position.count / $numRings;
            for (let i = 0; i < geometry.attributes.position.count; i++) {
                const ringIndex = Math.floor(i / verticesPerRing);
                const color = new THREE.Color();
                color.setHSL(ringIndex / $numRings, 1.0, 0.5);
                colors.push(color.r, color.g, color.b);
            }
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

            // Update material to use vertex colors
            material = new THREE.PointsMaterial({
                size: $size,
                vertexColors: true
            });

            if (!$isRainbow) {
                material.vertexColors = false;
                material.color.set($color);
            }

            // Create a points cloud from the geometry
            tube = new THREE.Points(geometry, material);
            scene.add(tube);
        }
    }

    if (browser) {
        
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        // Add this event listener for the resize event
        window.addEventListener('resize', onWindowResize, false);


        scene = new THREE.Scene();
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 100;

        document.body.appendChild(renderer.domElement);

        let percentage = 0;

        function render() {
            percentage += $speed;
            let p1 = path.getPointAt(percentage % 1);
            let p2 = path.getPointAt((percentage + 0.01) % 1);
            camera.position.set(p1.x, p1.y, p1.z);
            camera.lookAt(p2);
            renderer.render(scene, camera);
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
    }
</script>

<svelte:head>
    <style>
        body {
            overflow: hidden;
            margin: 0;
        }
        canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
    </style>
</svelte:head>

<body>
    <canvas></canvas>
</body>
