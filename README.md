# Editor de Metadatos Multimedia (FFmpeg GUI)

Una aplicación de escritorio moderna y sencilla para editar metadatos de archivos multimedia (MP3, etc.), construida con Electron, React, TypeScript y FFmpeg.

## Características

- **Edición de Metadatos**: Título, Artista, Álbum, Año, Género, Comentarios.
- **Interfaz Moderna**: Diseño limpio con soporte para arrastrar y soltar (Drag & Drop).
- **Portable**: Incluye binarios estáticos de FFmpeg y FFprobe, no requiere instalación previa de estas herramientas.
- **Localización**: Interfaz completamente en español.

## Instrucciones de Construcción (Build)

Sigue estos pasos para generar el instalador final (paquete `.deb` para Linux) desde el código fuente.

### Prerrequisitos

- **Node.js**: Versión 18 o superior.
- **npm**: Gestor de paquetes de Node.

### Pasos

1.  **Obtener la última versión del código**:
    Si ya tienes el repositorio clonado:
    ```bash
    git pull origin main
    ```
    Si es la primera vez:
    ```bash
    git clone git@github.com:aerodinamicat/ffmpeg-mp3-metaeditor.git
    cd ffmpeg-mp3-metaeditor
    ```

2.  **Instalar dependencias**:
    Esto descargará todas las librerías necesarias, incluyendo los binarios de FFmpeg.
    ```bash
    npm install
    ```

3.  **Construir el paquete**:
    Este comando compilará la aplicación y generará el instalador `.deb`.
    ```bash
    npm run build
    ```

4.  **Localizar el instalador**:
    Una vez finalizado el proceso, encontrarás el archivo instalador en la carpeta `release/`:
    ```
    release/ffmpeg-gui_0.0.0_amd64.deb
    ```

### Notas sobre Windows y macOS

El proyecto está configurado para soportar la construcción en Windows y macOS. Para generar los instaladores correspondientes (`.exe` o `.dmg`), se recomienda ejecutar los mismos pasos (`npm install` y `npm run build`) **desde el sistema operativo objetivo**. Esto asegura que se descarguen los binarios correctos de FFmpeg para esa plataforma.
