declare module 'jspdf' {
  export default class jsPDF {
    constructor(options?: any);
    setFontSize(size: number): void;
    setTextColor(r: number, g: number, b: number): void;
    text(text: string, x: number, y: number, options?: any): void;
    save(filename: string): void;
    addImage(image: any, format: string, x: number, y: number, width: number, height: number): void;
    setDrawColor(r: number, g: number, b: number): void;
    setLineWidth(width: number): void;
    line(x1: number, y1: number, x2: number, y2: number): void;
    rect(x: number, y: number, width: number, height: number): void;
    internal: {
      pageSize: {
        height: number;
        width: number;
      };
      getCurrentPageInfo(): {
        pageNumber: number;
      };
    };
  }
}

declare module 'jspdf-autotable' {
  function autoTable(doc: any, options: any): void;
  export default autoTable;
}
