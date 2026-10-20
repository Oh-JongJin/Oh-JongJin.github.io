import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 배포 시 하위 경로에서도 정적 에셋이 잘 로드되도록 상대 경로 './' 지정
  base: './',
});
