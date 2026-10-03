import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function ThreeDCareerGlobe({ className = '', height = 450 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const currentHeight = height;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / currentHeight, 0.1, 1000);
    camera.position.z = 220;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, currentHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Main 3D Wireframe & Inner Sphere (Globe)
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Inner Glowing Core
    const sphereGeo = new THREE.SphereGeometry(60, 36, 36);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x06110d,
      emissive: 0x042014,
      specular: 0x10b981,
      shininess: 40,
      transparent: true,
      opacity: 0.85,
    });
    const innerSphere = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(innerSphere);

    // Outer Wireframe Grid
    const wireGeo = new THREE.SphereGeometry(60.8, 28, 28);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const wireframe = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireframe);

    // Atmospheric Halo Ring
    const haloGeo = new THREE.RingGeometry(64, 76, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15,
    });
    const haloRing = new THREE.Mesh(haloGeo, haloMat);
    haloRing.rotation.x = Math.PI / 2.4;
    globeGroup.add(haloRing);

    // 3. Orbiting Career Particle Ring
    const particleCount = 450;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const emeraldColor = new THREE.Color(0x10b981);
    const cyanColor = new THREE.Color(0x06b6d4);
    const goldColor = new THREE.Color(0xf59e0b);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const radius = 62 + Math.random() * 25;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const mixedColor = i % 3 === 0 ? emeraldColor : i % 3 === 1 ? cyanColor : goldColor;
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMat = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    globeGroup.add(particleSystem);

    // 4. Hub Satellite Pins (Tech & University Cities in Pakistan)
    const hubs = [
      { name: 'Islamabad (NUST/QAU/COMSATS)', lat: 33.6844, lon: 73.0479, color: 0x10b981 },
      { name: 'Lahore (UET/LUMS/FAST/PU)', lat: 31.5204, lon: 74.3587, color: 0x34d399 },
      { name: 'Karachi (IBA/KU/NED/Aga Khan)', lat: 24.8607, lon: 67.0011, color: 0x06b6d4 },
      { name: 'Peshawar (UET Peshawar/KMU)', lat: 34.0151, lon: 71.5249, color: 0xf59e0b },
      { name: 'Quetta (BUITEMS/UOB)', lat: 30.1798, lon: 66.9750, color: 0xec4899 },
      { name: 'Faisalabad (UAF/GCUF)', lat: 31.4504, lon: 73.1350, color: 0xa855f7 },
    ];

    const convertLatLonToVector = (lat, lon, radius) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    hubs.forEach((hub) => {
      const pos = convertLatLonToVector(hub.lat, hub.lon, 61.5);
      
      // Pin Sphere
      const pinGeo = new THREE.SphereGeometry(1.8, 12, 12);
      const pinMat = new THREE.MeshBasicMaterial({ color: hub.color });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      globeGroup.add(pinMesh);

      // Pin Pulsing Beacon Line
      const beamGeo = new THREE.CylinderGeometry(0.3, 0.3, 14, 8);
      const beamMat = new THREE.MeshBasicMaterial({ color: hub.color, transparent: true, opacity: 0.7 });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      
      const normal = pos.clone().normalize();
      beamMesh.position.copy(pos.clone().add(normal.clone().multiplyScalar(7)));
      beamMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      globeGroup.add(beamMesh);
    });

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x10b981, 1.8);
    dirLight1.position.set(150, 100, 150);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 1.2);
    dirLight2.position.set(-150, -100, -150);
    scene.add(dirLight2);

    // 6. Interactive Mouse Drag & Parallax
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => { isDragging = false; };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 7. Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isDragging) {
        globeGroup.rotation.y += 0.003;
        wireframe.rotation.y -= 0.001;
        particleSystem.rotation.y += 0.0015;
        particleSystem.rotation.x += 0.0005;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 8. Responsive Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      camera.aspect = w / currentHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(w, currentHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [height]);

  return (
    <div className={`relative w-full flex items-center justify-center ${className}`}>
      <div ref={mountRef} className="w-full cursor-grab active:cursor-grabbing" style={{ height }} />
      {/* 3D Badge Overlay */}
      <div className="absolute bottom-3 left-4 px-3 py-1.5 rounded-full bg-slate-950/80 border border-emerald-500/30 backdrop-blur-md flex items-center gap-2 pointer-events-none shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-[11px] font-mono font-bold text-emerald-300 uppercase tracking-widest">
          Interactive WebGL 3D Pakistan Career Map
        </span>
      </div>
    </div>
  );
}
