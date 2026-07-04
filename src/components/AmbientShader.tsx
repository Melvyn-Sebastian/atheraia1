/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';

interface AmbientShaderProps {
  className?: string;
  intensity?: number; // Adjust speed/intensity
}

export default function AmbientShader({ className = "fixed inset-0 -z-10", intensity = 1.0 }: AmbientShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    } catch (e) {
      console.error("WebGL not supported", e);
    }

    if (!gl) return;

    // Sync drawing buffer with container size
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width || canvas.clientWidth || 1280);
        const h = Math.floor(entry.contentRect.height || canvas.clientHeight || 720);
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          if (gl) {
            gl.viewport(0, 0, w, h);
          }
        }
      }
    });
    resizeObserver.observe(canvas);

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_intensity;

      // Simplex noise helper
      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                 -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
          dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = v_texCoord;
        vec2 mouse = u_mouse / u_resolution;
        
        // Organic fluid drifting movement
        float n1 = snoise(uv * 3.0 + u_time * 0.15 * u_intensity);
        float n2 = snoise(uv * 5.0 - u_time * 0.08 * u_intensity + n1);
        
        // Shift UVs based on noise output
        vec2 shiftedUv = uv + vec2(n1, n2) * 0.12;
        
        // Holographic & Pearlescent color palette (Soft Pastels)
        vec3 color1 = vec3(0.85, 0.72, 0.99); // Soft Lucid Purple
        vec3 color2 = vec3(0.74, 0.88, 0.99); // Holographic Blue
        vec3 color3 = vec3(0.98, 0.82, 0.92); // Soft Pearl Pink
        
        // Blend colors dynamically based on shifted UV coordinates and u_time
        vec3 color = mix(color1, color2, shiftedUv.x + sin(u_time * 0.2) * 0.4);
        color = mix(color, color3, shiftedUv.y + cos(u_time * 0.25) * 0.4);
        
        // Soft mouse-driven interactive glow
        float dist = distance(uv, mouse);
        float glow = smoothstep(0.45, 0.0, dist) * 0.15;
        color += glow;
        
        // Shimmer highlights
        float shimmer = pow(abs(n2), 4.0) * 0.08;
        color += shimmer;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function compileShader(type: number, src: string) {
      const s = gl!.createShader(type);
      if (!s) return null;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl!.getShaderInfoLog(s));
        gl!.deleteShader(s);
        return null;
      }
      return s;
    }

    const prog = gl.createProgram();
    if (!prog) return;

    const compiledVs = compileShader(gl.VERTEX_SHADER, vs);
    const compiledFs = compileShader(gl.FRAGMENT_SHADER, fs);

    if (!compiledVs || !compiledFs) return;

    gl.attachShader(prog, compiledVs);
    gl.attachShader(prog, compiledFs);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(prog));
      return;
    }

    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uIntensity = gl.getUniformLocation(prog, 'u_intensity');

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (e.clientX - rect.left) / rect.width;
        const ny = 1.0 - (e.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animFrame: number;
    const render = (t: number) => {
      if (!gl || !canvas) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      if (uIntensity) gl.uniform1f(uIntensity, intensity);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrame);
      if (gl) {
        gl.deleteBuffer(buf);
        gl.deleteProgram(prog);
        gl.deleteShader(compiledVs);
        gl.deleteShader(compiledFs);
      }
    };
  }, [intensity]);

  return (
    <div className={className} id="ambient-shader-container">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
