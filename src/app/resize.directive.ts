import { Directive, HostListener, Input, ElementRef } from '@angular/core';

@Directive({
  selector: '[appResize]'
})
export class ResizeDirective {
  @Input() resizeThreshold = 10; // 边缘触发阈值（像素）
  @Input() targetButton!: {
    width: number;
    height: number;
    isResizing: boolean;
    resizeDirection: 'right' | 'bottom' | null;
  }; // 传入当前按钮的尺寸和状态

  private startX = 0; // 鼠标按下时的X坐标
  private startY = 0; // 鼠标按下时的Y坐标
  private startWidth = 0; // 鼠标按下时的按钮宽度
  private startHeight = 0; // 鼠标按下时的按钮高度

  constructor(private el: ElementRef<HTMLElement>) { }

  // 鼠标悬停时判断是否在可调整边缘
  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: MouseEvent) {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left; // 鼠标相对于按钮的X坐标
    const y = event.clientY - rect.top; // 鼠标相对于按钮的Y坐标

    // 右侧边缘（宽度 - 阈值范围内）
    if (x >= rect.width - this.resizeThreshold) {
      this.el.nativeElement.style.cursor = 'ew-resize';
      this.targetButton.resizeDirection = 'right';
    }
    // 底部边缘（高度 - 阈值范围内）
    else if (y >= rect.height - this.resizeThreshold) {
      this.el.nativeElement.style.cursor = 'ns-resize';
      this.targetButton.resizeDirection = 'bottom';
    }
    // 非边缘区域
    else {
      this.el.nativeElement.style.cursor = 'default';
      this.targetButton.resizeDirection = null;
    }
  }

  // 鼠标离开时重置样式和状态
  @HostListener('mouseleave')
  onMouseLeave() {
    this.el.nativeElement.style.cursor = 'default';
    this.targetButton.resizeDirection = null;
  }


  // 鼠标移动时调整大小（全局监听，避免鼠标移出按钮外失效）
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.targetButton.isResizing || !this.targetButton.resizeDirection) return;

    // 获取画布容器（需通过注入或父组件传递，此处假设通过ElementRef获取）
    const canvas = this.el.nativeElement.closest('.canvasContainer');  // 找到最近的画布容器

    // @ts-ignore
    const canvasRect = canvas.getBoundingClientRect();

    // 计算鼠标相对于画布容器的局部坐标
    const localX = event.clientX - canvasRect.left;
    const localY = event.clientY - canvasRect.top;

    // 计算相对于缩放起点的局部坐标差
    // @ts-ignore
    const dx = localX - this.startLocalX;
    // @ts-ignore
    const dy = localY - this.startLocalY;

    switch (this.targetButton.resizeDirection) {
      case 'right':
        this.targetButton.width = Math.max(20, this.startWidth + dx);  // 限制最小宽度
        break;
      case 'bottom':
        this.targetButton.height = Math.max(20, this.startHeight + dy);  // 限制最小高度
        break;
    }
  }

  // 新增：在mousedown时记录初始局部坐标
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (!this.targetButton.resizeDirection) return;

    this.targetButton.isResizing = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startWidth = this.targetButton.width;
    this.startHeight = this.targetButton.height;

    // 记录鼠标按下时的局部坐标（相对于画布容器）
    const canvas = this.el.nativeElement.closest('.canvasContainer');
    // @ts-ignore
    const canvasRect = canvas.getBoundingClientRect();
    // @ts-ignore
    this.startLocalX = event.clientX - canvasRect.left;
    // @ts-ignore
    this.startLocalY = event.clientY - canvasRect.top;

    event.preventDefault();
  }

  // 鼠标松开时停止拖拽
  @HostListener('document:mouseup')
  onMouseUp() {
    this.targetButton.isResizing = false;
    this.targetButton.resizeDirection = null;
  }
}