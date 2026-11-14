// Coordinates refer to the unchanged 1536 × 1024 scene 06 master.
const vertex = `
attribute vec2 position;
varying vec2 uv;
void main() {
  uv = vec2(position.x * .5 + .5, .5 - position.y * .5);
  gl_Position = vec4(position, 0., 1.);
}`;

const fragment = `
precision highp float;
uniform sampler2D painting;
uniform vec4 gesture;
uniform bool ensemble;
varying vec2 uv;
float area(vec2 p, vec2 center, vec2 radius) {
  vec2 q = (p - center) / radius;
  return 1. - smoothstep(.06, 1., dot(q,q));
}
void main() {
  vec2 p = uv * vec2(1536.,1024.);
  if (ensemble) {
    // Five planted singers. The waist, shoulders and mic hands follow the
    // step; the weight is zero at the shoe contact line.
    vec2 delta = vec2(0.);
    for (int i=0; i<5; i++) {
      float x = float(i);
      vec2 center = vec2(x < 3. ? 212. + 210.*x : 1042. + 266.*(x-3.), 256.);
      float weight = area(p,center,vec2(150.,225.));
      float step = i == 3 ? gesture.y : gesture.x;
      delta += weight*vec2(step * (14. + (290. - p.y)*.026), -4.5*abs(step));
    }
    gl_FragColor = texture2D(painting, (p-delta)/vec2(1536.,1024.));
    return;
  }
  // Inverse motion sampling; weights fade to zero well before the set.
  float head = area(p, vec2(846.,143.), vec2(117.,102.));
  float wrist = area(p, vec2(1134.,449.), vec2(112.,68.));
  float ribbon = area(p, vec2(1028.,570.), vec2(80.,114.));
  float hem = area(p, vec2(808.,789.), vec2(236.,116.));
  float chin = clamp((225. - p.y) / 110., 0., 1.);
  vec2 headTurn = vec2(3. + (p.y-195.)*.052, -6. - (p.x-843.)*.052);
  p -= gesture.x * head * chin * headTurn;
  p -= gesture.y * wrist * vec2(5.5, -8.5 - (p.x-1090.)*.095);
  p -= gesture.z * ribbon * vec2(13., -3.);
  p -= gesture.w * hem * vec2(4., -6.);
  gl_FragColor = texture2D(painting, p / vec2(1536.,1024.));
}`;

export function bindPaintedGesture(canvas: HTMLCanvasElement, painting: HTMLImageElement, ensemble = false) {
  const gl = canvas.getContext('webgl', {alpha:false, antialias:false});
  if (!gl) return null;
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  const shaders: WebGLShader[] = [];
  function dispose() {
    shaders.forEach(shader => gl!.deleteShader(shader));
    gl!.deleteProgram(program);
    gl!.deleteBuffer(buffer);
    gl!.deleteTexture(texture);
  }
  function compile(type: number, source: string) {
    const shader = gl!.createShader(type);
    if (!shader) return null;
    shaders.push(shader);
    gl!.shaderSource(shader, source);
    gl!.compileShader(shader);
    return gl!.getShaderParameter(shader, gl!.COMPILE_STATUS) ? shader : null;
  }
  const vert = compile(gl.VERTEX_SHADER, vertex);
  const frag = compile(gl.FRAGMENT_SHADER, fragment);
  if (!program || !buffer || !texture || !vert || !frag) {dispose(); return null;}
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {dispose(); return null;}
  canvas.width = 1152;
  canvas.height = 768;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, painting);
  const uniform = gl.getUniformLocation(program, 'gesture');
  gl.uniform1i(gl.getUniformLocation(program, 'ensemble'), Number(ensemble));
  return {
    draw(head: number, wrist: number, ribbon: number, hem: number) {
      gl.uniform4f(uniform, head, wrist, ribbon, hem);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose,
  };
}
