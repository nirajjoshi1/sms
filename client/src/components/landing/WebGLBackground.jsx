import { useEffect, useRef } from 'react';

/**
 * CinematicBackground — full-screen atmospheric WebGL shader background.
 * Adapted from Stitch MCP design session. Mouse-reactive.
 * section: 'hero' | 'platform' | 'features'
 */
const CinematicBackground = ({ section = 'hero', className = '' }) => {
  const canvasRef = useRef(null);

  const configs = {
    hero: {
      // Deep space — indigo + violet orbs
      orb1Color: [0.388, 0.4, 0.945],
      orb2Color: [0.545, 0.361, 0.965],
      orb3Color: [0.925, 0.282, 0.6],
      baseColor: [0.012, 0.016, 0.039],
    },
    platform: {
      // Deep teal-green scientific feel
      orb1Color: [0.1, 0.6, 0.8],
      orb2Color: [0.0, 0.4, 0.65],
      orb3Color: [0.1, 0.8, 0.6],
      baseColor: [0.0, 0.02, 0.04],
    },
    features: {
      // Pure dark with subtle amber
      orb1Color: [0.6, 0.3, 1.0],
      orb2Color: [0.9, 0.4, 0.2],
      orb3Color: [0.4, 0.2, 0.9],
      baseColor: [0.012, 0.01, 0.02],
    },
  };

  const cfg = configs[section] || configs.hero;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
      }
    }
    const ro = new ResizeObserver(syncSize);
    ro.observe(canvas);
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vs = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() { v_uv = a_pos*0.5+0.5; gl_Position = vec4(a_pos,0,1); }
    `;

    // Cinematic fragment shader
    const fs = `
      precision highp float;
      varying vec2 v_uv;
      uniform float u_t;
      uniform vec2 u_res;
      uniform vec2 u_mouse;
      uniform vec3 u_base;
      uniform vec3 u_c1;
      uniform vec3 u_c2;
      uniform vec3 u_c3;

      float hash(vec2 p){ p=fract(p*vec2(127.1,311.7)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
      float noise(vec2 p){
        vec2 i=floor(p), f=fract(p);
        f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }
      float fbm(vec2 p){
        float v=0.0, a=0.5;
        for(int i=0;i<4;i++){ v+=a*noise(p); p*=2.1; a*=0.5; }
        return v;
      }

      void main(){
        vec2 uv = v_uv;
        vec2 mouse = u_mouse/u_res;
        vec2 aspect = vec2(u_res.x/u_res.y, 1.0);

        vec3 col = u_base;

        // Slow nebula noise
        float n = fbm(uv*2.5 + vec2(u_t*0.03, u_t*0.018));
        float n2 = fbm(uv*1.8 - vec2(u_t*0.02, u_t*0.025));
        col += u_c1 * n * 0.12;
        col += u_c2 * n2 * 0.08;

        // Dot grid
        vec2 g = fract(uv * 40.0 * aspect);
        float d = length(g - 0.5);
        col += smoothstep(0.06, 0.03, d) * 0.045 * u_c1;

        // Orbs with mouse influence
        vec2 pa = uv*aspect;
        vec2 o1 = vec2((0.2 + 0.12*sin(u_t*0.38)) + (mouse.x-0.5)*0.06, (0.35+0.1*cos(u_t*0.3))+(mouse.y-0.5)*0.06)*aspect;
        vec2 o2 = vec2((0.8 + 0.1*cos(u_t*0.44)) - (mouse.x-0.5)*0.06, (0.65+0.12*sin(u_t*0.35)) - (mouse.y-0.5)*0.06)*aspect;
        vec2 o3 = vec2(0.5 + 0.05*sin(u_t*0.2), 0.18 + 0.05*cos(u_t*0.28))*aspect;

        float g1 = 0.055 / (length(pa-o1)+0.001);
        float g2 = 0.045 / (length(pa-o2)+0.001);
        float g3 = 0.025 / (length(pa-o3)+0.001);

        col += u_c1 * pow(clamp(g1,0.,1.),1.3) * 0.55;
        col += u_c2 * pow(clamp(g2,0.,1.),1.3) * 0.45;
        col += u_c3 * pow(clamp(g3,0.,1.),1.5) * 0.3;

        // Stars
        vec2 sv = uv * vec2(90.,55.);
        float sn = hash(floor(sv));
        if(sn>0.975){
          float blink = 0.4+0.6*sin(u_t*2.5+sn*12.0);
          float sp = pow(max(0.,1.-length(fract(sv)-0.5)*14.),6.);
          col += sp * blink * 0.6;
        }

        // Vignette
        col *= 1.0 - 0.75*pow(length((uv-0.5)*1.6),2.0);

        // Tone map
        col = col/(col+0.7);
        col = pow(col,vec3(0.88));

        gl_FragColor = vec4(col,1.0);
      }
    `;

    function mkShader(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uT     = gl.getUniformLocation(prog, 'u_t');
    const uRes   = gl.getUniformLocation(prog, 'u_res');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uBase  = gl.getUniformLocation(prog, 'u_base');
    const uC1    = gl.getUniformLocation(prog, 'u_c1');
    const uC2    = gl.getUniformLocation(prog, 'u_c2');
    const uC3    = gl.getUniformLocation(prog, 'u_c3');

    gl.uniform3fv(uBase, cfg.baseColor);
    gl.uniform3fv(uC1,   cfg.orb1Color);
    gl.uniform3fv(uC2,   cfg.orb2Color);
    gl.uniform3fv(uC3,   cfg.orb3Color);

    let mouse = { x: canvas.width/2, y: canvas.height/2 };
    let lastMouseTime = 0;
    const onMove = (e) => {
      // Throttle to ~60fps max to reduce CPU on mouse move
      const now = Date.now();
      if (now - lastMouseTime < 16) return;
      lastMouseTime = now;
      const r = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX-r.left)/r.width)*canvas.width;
      mouse.y = (1-(e.clientY-r.top)/r.height)*canvas.height;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    let raf;
    let paused = false;
    const onVisibility = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);
    const render = (t) => {
      raf = requestAnimationFrame(render);
      if (paused) return;
      gl.viewport(0,0,canvas.width,canvas.height);
      gl.uniform1f(uT, t*0.001);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    render(0);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('visibilitychange', onVisibility);
      ro.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};

export default CinematicBackground;
