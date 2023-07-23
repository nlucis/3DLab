import { Ticker } from 'pixi.js';

export default class UIComponent {
  constructor(targetElement: SVGGElement | SVGPathElement) {
    this.domElement = targetElement;
    this._opacity = this.domElement.style.opacity !== "" ? parseFloat(this.domElement.style.opacity) : 1;
    
    if (targetElement.nodeName === 'path') {
      this._fill = parseInt(targetElement.getAttribute('fill') || '-Infinity');
      this._stroke = parseInt(targetElement.getAttribute('stroke') || '-Infinity');
      this._lineWidth = parseInt(targetElement.getAttribute('stroke-width') || '-Infinity'); 
    }

    Ticker.shared.add(this.update.bind(this));
  }

  protected domElement: SVGGElement | SVGPathElement;

  private _fill: number;
  private _stroke: number;
  private _opacity: number;
  private _lineWidth: number;

  public onHold: () => void;
  public onClick: () => void;
  public onRelease: () => void;
  public onDoubleTap: () => void;

  public getFill(): number {return this._fill};
  public getStroke(): number {return this._stroke};
  public getOpacity(): number {return this._opacity};
  public getLineWidth(): number {return this._lineWidth};
  public getDomElement(): SVGGElement | SVGPathElement {return this.domElement};

  public setFill(newFill: number): void {this._fill = newFill};
  public setStroke(newStroke: number): void {this._stroke = newStroke};
  public setOpacity(newOpacity: number): void {this._opacity = newOpacity};
  public setLineWidth(newLineWidth: number): void {this._lineWidth = newLineWidth};

  private update(): void {
    this.domElement.style.opacity = `${this._opacity}`;
  }
}