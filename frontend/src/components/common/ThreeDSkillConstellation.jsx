import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function ThreeDSkillConstellation({ className = '', height = 380 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const currentHeight = height;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / currentHeight, 0.1, 1000);
    camera.position.z = 180;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, currentHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // 1. Skill Nodes Data
    const skillNodes = [
      { name: 'Python / AI', x: -60, y: 30, z: 20, color: 0x10b981 },
      { name: 'Data Science', x: -20, y: 55, z: -10, color: 0x34d399 },
      { name: 'Software Engineering', x: -40, y: -20, z: 30, color: 0x06b6d4 },
      { name: 'Pre-Medical', x: 50, y: 40, z: -20, color: 0xec4899 },
      { name: 'MBBS / Health', x: 70, y: 0, z: 10, color: 0xf43f5e },
      { name: 'Pre-Engineering', x: 10, y: -45, z: 25, color: 0xf59e0b },
      { name: 'Cyber Security', x: -70, y: -40, z: -15, color: 0x8b5cf6 },
      { name: 'BBA / Finance', x: 40, y: -50, z: -30, color: 0x3b82f6 },
    ];

    const spheres = [];
    skillNodes.forEach((node) => {
      const geo = new THREE.SphereGeometry(4.5, 16, 16);
      const mat = new THREE.MeshPhongMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: 0.4,
        specular: 0xffffff,
        shininess: 30,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(node.x, node.y, node.z);
      group.add(mesh);
      spheres.push(mesh);
    });

    // 2. Connecting Laser Beams (Constellation Lines)
    const lineMat = new THREE.LineBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.35 });
    for (let i = 0; i < skillNodes.length; i++) {
      for (let j = i + 1; j < skillNodes.length; j++) {
        const dist = new THREE.Vector3(skillNodes[i].x, skillNodes[i].y, skillNodes[i].z)
          .distanceTo(new THREE.Vector3(skillNodes[j].x, skillNodes[j].y, skillNodes[j].z));
        
        if (dist < 95) {
          const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(skillNodes[i].x, skillNodes[i].y, skillNodes[i].z),
            new THREE.Vector3(skillNodes[j].x, skillNodes[j].y, skillNodes[j].z)
          ]);
          const line = new THREE.Line(lineGeo, lineMat);
          group.add(line);
        }
      }
    }

    // 3. Ambient & Direct Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x10b981, 2, 300);
    pointLight.position.set(0, 0, 100);
    scene.add(pointLight);

    // 4. Mouse Rotation Interactivity
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;

      group.rotation.y += dx * 0.006;
      group.rotation.x += dy * 0.006;

      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => { isDragging = false; };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 5. Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        group.rotation.y += 0.004;
        group.rotation.x += 0.001;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 500;
      camera.aspect = w / currentHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(w, currentHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
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
      <div className="absolute bottom-2 right-4 px-3 py-1 rounded-full bg-slate-900/80 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 font-bold backdrop-blur-md">
        3D Skill Graph Visualizer
      </div>
    </div>
  );
}
