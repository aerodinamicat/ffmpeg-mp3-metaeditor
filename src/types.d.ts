declare module 'ffmpeg-static' {
  const path: string;
  export default path;
}

declare module 'ffprobe-static' {
  const path: string;
  export default { path };
}

declare module 'electron-is-dev' {
  const isDev: boolean;
  export default isDev;
}
