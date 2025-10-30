import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgZorroAntdModule } from '../../DemoNgZorroAntdModule';
import { SessionStatus } from '../../shared/components/session-status/session-status';




@NgModule({
  declarations: [],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterOutlet,RouterLink,NgZorroAntdModule, SessionStatus],
  exports:[CommonModule, FormsModule, ReactiveFormsModule, RouterOutlet,RouterLink,NgZorroAntdModule, SessionStatus]
})
export class SharedModule { }
