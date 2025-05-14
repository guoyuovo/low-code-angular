import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';


interface CanvasItem {
  id: number;
  text: string;
  width: number;
  height: number;
  left: number;
  top: number;
  rotation: number;
  isResizing: boolean;
  resizeDirection: 'right' | 'bottom' | null;
  isDragging: boolean;
  dragStartX: number;
  dragStartY: number;
  initialWidth: number;
  initialHeight: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [MatFormFieldModule, MatInputModule, FormsModule,],
})
export class AppComponent {
  @ViewChild('canvasContainer') canvasContainer!: ElementRef;
  canvasItems: CanvasItem[] = [];
  selectedItem: CanvasItem | null = null;
  nextId = 1;

  // 添加新物料到画布中心
  addNewItem() {
    const canvas = this.canvasContainer.nativeElement.getBoundingClientRect();
    const newItem: CanvasItem = {
      id: this.nextId++,
      text: '按钮',
      width: 80,
      height: 40,
      left: (canvas.width - 80) / 2,
      top: (canvas.height - 40) / 2,
      rotation: 0,
      isResizing: false,
      resizeDirection: null,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      initialWidth: 80,
      initialHeight: 40
    };
    this.canvasItems.push(newItem);
    this.selectedItem = newItem;
  }

  // 开始交互（拖动/调整大小）
  startInteraction(event: MouseEvent, item: CanvasItem) {
    event.preventDefault();
    this.selectedItem = item;

    // 判断是否点击调整区域
    const target = event.target as HTMLElement;
    if (target.classList.contains('right')) {
      this.startResizing(item, 'right', event);
    } else if (target.classList.contains('bottom')) {
      this.startResizing(item, 'bottom', event);
    } else {
      this.startDragging(item, event);
    }
  }

  // 开始调整大小
  startResizing(item: CanvasItem, direction: 'right' | 'bottom', event: MouseEvent) {
    item.isResizing = true;
    item.resizeDirection = direction;
    item.initialWidth = item.width;
    item.initialHeight = item.height;
    item.dragStartX = event.clientX;
    item.dragStartY = event.clientY;

    // 绑定全局事件
    document.addEventListener('mousemove', this.handleResize);
    document.addEventListener('mouseup', this.stopInteraction);
  }

  // 开始拖动位置
  startDragging(item: CanvasItem, event: MouseEvent) {
    item.isDragging = true;
    item.dragStartX = event.clientX - item.left;
    item.dragStartY = event.clientY - item.top;

    // 绑定全局事件
    document.addEventListener('mousemove', this.handleDrag);
    document.addEventListener('mouseup', this.stopInteraction);
  }

  // 处理调整大小
  handleResize = (event: MouseEvent) => {
    if (!this.selectedItem?.isResizing) return;
    const item = this.selectedItem;
    const deltaX = event.clientX - item.dragStartX;
    const deltaY = event.clientY - item.dragStartY;

    switch (item.resizeDirection) {
      case 'right':
        item.width = Math.max(20, item.initialWidth + deltaX);
        break;
      case 'bottom':
        item.height = Math.max(20, item.initialHeight + deltaY);
        break;
    }
  };

  // 处理位置拖动
  handleDrag = (event: MouseEvent) => {
    if (!this.selectedItem?.isDragging) return;
    const item = this.selectedItem;
    item.left = event.clientX - item.dragStartX;
    item.top = event.clientY - item.dragStartY;
  };

  // 停止交互
  stopInteraction = () => {
    if (this.selectedItem) {
      this.selectedItem.isResizing = false;
      this.selectedItem.isDragging = false;
      this.selectedItem.resizeDirection = null;
    }
    document.removeEventListener('mousemove', this.handleResize);
    document.removeEventListener('mousemove', this.handleDrag);
    document.removeEventListener('mouseup', this.stopInteraction);
  };

  // 旋转元素
  rotateItem(item: CanvasItem) {
    item.rotation += 15;
  }

  // 更新属性（用于双向绑定同步）
  updateItemProperties() {
    // 无需额外逻辑，双向绑定自动更新视图
  }

  // 鼠标悬停处理样式
  onItemHover(item: CanvasItem) {
    // 可添加悬停样式（如边框高亮）
  }

  // 鼠标离开处理样式
  onItemLeave(item: CanvasItem) {
    // 恢复默认样式
  }
}
