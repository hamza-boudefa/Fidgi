'use client'
import React, { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

interface PlasmaProps {
  colors?: string[];
  speed?: number;
  direction?: 'forward' | 'reverse' | 'pingpong';
  scale?: number;
  opacity?: number;
  mouseInteractive?: boolean;
  colorTransitionSpeed?: number;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 0.5, 0.2];
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
};

const vertex = `#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform float uColorCount;
uniform float uTransitionSpeed;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseInteractive;
out vec4 fragColor;

// Smooth color interpolation function
vec3 interpolateColors(float t) {
  t = fract(t); // Ensure t is between 0-1
  
  if (uColorCount < 1.5) return uColor1;
  
  float segment = 1.0 / (uColorCount - 1.0);
  float progress;
  int index;
  
  for(int i = 0; i < 4; i++) {
    if(float(i) * segment <= t && t <= float(i+1) * segment) {
      progress = (t - float(i) * segment) / segment;
      index = i;
      break;
    }
  }
  
  if(index == 0) return mix(uColor1, uColor2, progress);
  if(index == 1) return mix(uColor2, uColor3, progress);
  if(index == 2) return mix(uColor3, uColor4, progress);
  return uColor1;
}

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;
  
  vec2 mouseOffset = (uMouse - center) * 0.0002;
  C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);
  
  float i, d, z, T = iTime * uSpeed * uDirection;
  vec3 O, p, S;

  for (vec2 r = iResolution.xy, Q; ++i < 60.; O += o.w/d*o.xyz) {
    p = z*normalize(vec3(C-.5*r,r.y)); 
    p.z -= 4.; 
    S = p;
    d = p.y-T;
    
    p.x += .4*(1.+p.y)*sin(d + p.x*0.1)*cos(.34*d + p.x*0.05); 
    Q = p.xz *= mat2(cos(p.y+vec4(0,11,33,0)-T)); 
    z+= d = abs(sqrt(length(Q*Q)) - .25*(5.+S.y))/3.+8e-4; 
    o = 1.+sin(S.y+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
  }
  
  o.xyz = tanh(O/1e4);
}

bool finite1(float x){ return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c){
  return vec3(
    finite1(c.r) ? c.r : 0.0,
    finite1(c.g) ? c.g : 0.0,
    finite1(c.b) ? c.b : 0.0
  );
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  vec3 rgb = sanitize(o.rgb);
  
  // Calculate color transition based on time
  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  float transition = iTime * uTransitionSpeed;
  
  // Get the current color from the gradient
  vec3 currentColor = interpolateColors(transition);
  
  // Apply the color while preserving the plasma intensity
  vec3 finalColor = intensity * currentColor;
  
  float alpha = length(rgb) * uOpacity;
  fragColor = vec4(finalColor, alpha);
}`;

export const Plasma: React.FC<PlasmaProps> = ({
  colors = ['#ff0080', '#8000ff', '#0080ff', '#00ff80'],
  speed = 1,
  direction = 'forward',
  scale = 1,
  opacity = 1,
  mouseInteractive = true,
  colorTransitionSpeed = 0.2
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const programRef = useRef<Program | null>(null);
  const meshRef = useRef<Mesh | null>(null);
  const rafRef = useRef<number>(0);

  // Store previous props for comparison
  const prevPropsRef = useRef({
    colors,
    speed,
    direction,
    scale,
    opacity,
    mouseInteractive,
    colorTransitionSpeed
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const setupWebGL = () => {
      const validColors = colors.length > 0 ? colors : ['#ffffff'];
      const colorCount = Math.min(validColors.length, 4);
      const colorRgbs = validColors.slice(0, 4).map(hexToRgb);
      
      while (colorRgbs.length < 4) {
        colorRgbs.push([1, 1, 1]);
      }

      const renderer = new Renderer({
        webgl: 2,
        alpha: true,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, 2)
      });
      
      const gl = renderer.gl;
      const canvas = gl.canvas as HTMLCanvasElement;
      canvas.style.display = 'block';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      containerRef.current!.appendChild(canvas);

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: new Float32Array([1, 1]) },
          uColor1: { value: new Float32Array(colorRgbs[0]) },
          uColor2: { value: new Float32Array(colorRgbs[1]) },
          uColor3: { value: new Float32Array(colorRgbs[2]) },
          uColor4: { value: new Float32Array(colorRgbs[3]) },
          uColorCount: { value: colorCount },
          uTransitionSpeed: { value: colorTransitionSpeed },
          uSpeed: { value: speed * 0.4 },
          uDirection: { value: direction === 'reverse' ? -1.0 : 1.0 },
          uScale: { value: scale },
          uOpacity: { value: opacity },
          uMouse: { value: new Float32Array([0, 0]) },
          uMouseInteractive: { value: mouseInteractive ? 1.0 : 0.0 }
        }
      });

      const mesh = new Mesh(gl, { geometry, program });

      rendererRef.current = renderer;
      programRef.current = program;
      meshRef.current = mesh;

      return { renderer, program, mesh };
    };

    const { program } = setupWebGL();

    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseInteractive || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = rect.height - (e.clientY - rect.top); // Flip Y for WebGL
      
      if (programRef.current) {
        const mouseUniform = programRef.current.uniforms.uMouse.value as Float32Array;
        mouseUniform[0] = x;
        mouseUniform[1] = y;
      }
    };

    if (mouseInteractive && containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
    }

    const setSize = () => {
      if (!containerRef.current || !rendererRef.current || !programRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      
      rendererRef.current.setSize(width, height);
      
      const res = programRef.current.uniforms.iResolution.value as Float32Array;
      res[0] = rendererRef.current.gl.drawingBufferWidth;
      res[1] = rendererRef.current.gl.drawingBufferHeight;
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(containerRef.current);
    setSize();

    let t0 = performance.now();
    const loop = (t: number) => {
      if (!rendererRef.current || !meshRef.current) return;
      
      const timeValue = (t - t0) * 0.001;

      // Update time uniform
      if (programRef.current) {
        (programRef.current.uniforms.iTime as any).value = timeValue;
        
        // Handle pingpong direction
        if (direction === 'pingpong') {
          const cycle = Math.sin(timeValue * 0.5);
          (programRef.current.uniforms.uDirection as any).value = cycle;
        }
      }

      rendererRef.current.render({ scene: meshRef.current });
      rafRef.current = requestAnimationFrame(loop);
    };
    
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      
      if (mouseInteractive && containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
      
      try {
        if (containerRef.current && rendererRef.current) {
          containerRef.current.removeChild(rendererRef.current.gl.canvas);
        }
      } catch {}
      
      rendererRef.current = null;
      programRef.current = null;
      meshRef.current = null;
    };
  }, []); // Empty dependency array - setup only once

  // Update uniforms when props change
  useEffect(() => {
    if (!programRef.current) return;

    const currentProps = { colors, speed, direction, scale, opacity, mouseInteractive, colorTransitionSpeed };
    const prevProps = prevPropsRef.current;

    // Update colors if they changed
    if (colors !== prevProps.colors) {
      const validColors = colors.length > 0 ? colors : ['#ffffff'];
      const colorCount = Math.min(validColors.length, 4);
      const colorRgbs = validColors.slice(0, 4).map(hexToRgb);
      
      while (colorRgbs.length < 4) {
        colorRgbs.push([1, 1, 1]);
      }

      (programRef.current.uniforms.uColor1 as any).value.set(colorRgbs[0]);
      (programRef.current.uniforms.uColor2 as any).value.set(colorRgbs[1]);
      (programRef.current.uniforms.uColor3 as any).value.set(colorRgbs[2]);
      (programRef.current.uniforms.uColor4 as any).value.set(colorRgbs[3]);
      (programRef.current.uniforms.uColorCount as any).value = colorCount;
    }

    // Update other uniforms if they changed
    if (speed !== prevProps.speed) {
      (programRef.current.uniforms.uSpeed as any).value = speed * 0.4;
    }

    if (direction !== prevProps.direction) {
      const directionMultiplier = direction === 'reverse' ? -1.0 : 1.0;
      (programRef.current.uniforms.uDirection as any).value = directionMultiplier;
    }

    if (scale !== prevProps.scale) {
      (programRef.current.uniforms.uScale as any).value = scale;
    }

    if (opacity !== prevProps.opacity) {
      (programRef.current.uniforms.uOpacity as any).value = opacity;
    }

    if (mouseInteractive !== prevProps.mouseInteractive) {
      (programRef.current.uniforms.uMouseInteractive as any).value = mouseInteractive ? 1.0 : 0.0;
    }

    if (colorTransitionSpeed !== prevProps.colorTransitionSpeed) {
      (programRef.current.uniforms.uTransitionSpeed as any).value = colorTransitionSpeed;
    }

    prevPropsRef.current = currentProps;
  }, [colors, speed, direction, scale, opacity, mouseInteractive, colorTransitionSpeed]);

  return <div ref={containerRef} className="w-full h-full relative overflow-hidden" />;
};

export default Plasma;