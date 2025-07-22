declare module 'dom-to-image-more' {
  interface Options {
    filter?: (node: Node) => boolean
    bgColor?: string
    width?: number
    height?: number
    style?: Record<string, string>
    quality?: number
    imagePlaceholder?: string
    cacheBust?: boolean
  }

  export function toPng(node: Node, options?: Options): Promise<string>
  export function toJpeg(node: Node, options?: Options): Promise<string>
  export function toSvg(node: Node, options?: Options): Promise<string>
  export function toPixelData(
    node: Node,
    options?: Options,
  ): Promise<Uint8ClampedArray>
  export function toCanvas(
    node: Node,
    options?: Options,
  ): Promise<HTMLCanvasElement>
  export function toBlob(node: Node, options?: Options): Promise<Blob>
}
