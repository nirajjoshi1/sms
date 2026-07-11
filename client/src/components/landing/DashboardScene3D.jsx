import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * DashboardScene3D - Floating glassmorphic 3D dashboard built with Three.js
 * Based on Stitch MCP generated Three.js scene, enhanced for React + r3f.
 */
const DashboardScene3D = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();

    // === Main card body ===
    const cardGeo = new THREE.BoxGeometry(14, 8.5, 0.15);
    const cardMat = new THREE.MeshPhongMaterial({
      color: 0x111827,
      transparent: true,
      opacity: 0.85,
      shininess: 60,
    });
    const card = new THREE.Mesh(cardGeo, cardMat);
    group.add(card);

    // Card border glow
    const edges = new THREE.EdgesGeometry(cardGeo);
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.6,
    });
    group.add(new THREE.LineSegments(edges, edgeMat));

    // Rounded inner top bar (header)
    const headerGeo = new THREE.BoxGeometry(13.6, 0.9, 0.08);
    const headerMat = new THREE.MeshBasicMaterial({ color: 0x1e1b4b, transparent: true, opacity: 0.9 });
    const header = new THREE.Mesh(headerGeo, headerMat);
    header.position.set(0, 3.7, 0.12);
    group.add(header);

    // Header dots
    [-6.3, -5.9, -5.5].forEach((x, i) => {
      const dotGeo = new THREE.CircleGeometry(0.08, 16);
      const dotMat = new THREE.MeshBasicMaterial({
        color: [0xef4444, 0xf59e0b, 0x22c55e][i],
        transparent: true,
        opacity: 0.9
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(x, 3.7, 0.13);
      group.add(dot);
    });

    // Sidebar
    const sidebarGeo = new THREE.BoxGeometry(2.8, 7.6, 0.08);
    const sidebarMat = new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.95 });
    const sidebar = new THREE.Mesh(sidebarGeo, sidebarMat);
    sidebar.position.set(-5.6, -0.25, 0.12);
    group.add(sidebar);

    // Sidebar menu items
    const menuColors = [0x6366f1, 0x374151, 0x374151, 0x374151];
    menuColors.forEach((color, i) => {
      const itemGeo = new THREE.BoxGeometry(2.2, 0.45, 0.04);
      const itemMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
      const item = new THREE.Mesh(itemGeo, itemMat);
      item.position.set(-5.6, 2.8 - i * 0.8, 0.14);
      group.add(item);
    });

    // Stat cards on right side
    const statConfigs = [
      { x: 1.5, y: 3.0, w: 3.2, h: 1.2, color: 0x1e1b4b },
      { x: 5.3, y: 3.0, w: 3.2, h: 1.2, color: 0x1e1b4b },
      { x: 1.5, y: 1.4, w: 3.2, h: 1.2, color: 0x1e1b4b },
      { x: 5.3, y: 1.4, w: 3.2, h: 1.2, color: 0x1e1b4b },
    ];
    statConfigs.forEach(({ x, y, w, h, color }) => {
      const geo = new THREE.BoxGeometry(w, h, 0.06);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, 0.13);
      group.add(mesh);

      // Card border
      const edgeGeo = new THREE.EdgesGeometry(geo);
      const edgeMat2 = new THREE.LineBasicMaterial({ color: 0x374151, transparent: true, opacity: 0.5 });
      const edgeMesh = new THREE.LineSegments(edgeGeo, edgeMat2);
      edgeMesh.position.copy(mesh.position);
      group.add(edgeMesh);
    });

    // Main chart area (bottom)
    const chartGeo = new THREE.BoxGeometry(8.8, 2.8, 0.06);
    const chartMat = new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.8 });
    const chartCard = new THREE.Mesh(chartGeo, chartMat);
    chartCard.position.set(3.4, -1.4, 0.13);
    group.add(chartCard);

    // Chart bars
    const barHeights = [0.6, 1.2, 0.9, 1.5, 1.1, 1.8, 1.3, 2.0, 1.6, 1.9];
    barHeights.forEach((h, i) => {
      const barGeo = new THREE.BoxGeometry(0.35, h, 0.05);
      const barMat = new THREE.MeshBasicMaterial({
        color: i === 9 ? 0x6366f1 : 0x4338ca,
        transparent: true,
        opacity: 0.9
      });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(-0.85 + i * 0.55 + (3.4 - 8.8 / 2) + 0.55, -1.4 - 1.4 + h / 2 + 0.2, 0.15);
      group.add(bar);
    });

    // Glowing indigo accent line on top of chart
    const lineGeo = new THREE.BoxGeometry(8.6, 0.03, 0.05);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x6366f1 });
    const accentLine = new THREE.Mesh(lineGeo, lineMat);
    accentLine.position.set(3.4, 0.0, 0.14);
    group.add(accentLine);

    scene.add(group);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const pLight = new THREE.PointLight(0x6366f1, 2, 30);
    pLight.position.set(5, 5, 8);
    scene.add(pLight);
    const pLight2 = new THREE.PointLight(0x8b5cf6, 1, 20);
    pLight2.position.set(-5, -3, 6);
    scene.add(pLight2);

    // Initial camera & group pose
    camera.position.set(0, 0, 18);
    group.rotation.x = 0.15;
    group.rotation.y = -0.35;

    // Mouse parallax
    let targetRotY = -0.35;
    let targetRotX = 0.15;
    const handleMouseMove = (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      targetRotY = -0.35 + nx * 0.12;
      targetRotX = 0.15 - ny * 0.06;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animId;
    const clock = new THREE.Clock();
    function animate() {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Subtle float
      group.position.y = Math.sin(t * 0.7) * 0.12;

      // Smooth mouse follow
      group.rotation.y += (targetRotY - group.rotation.y) * 0.04;
      group.rotation.x += (targetRotX - group.rotation.x) * 0.04;

      renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full"
      style={{ minHeight: '420px' }}
    />
  );
};

export default DashboardScene3D;
