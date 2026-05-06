import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LayoutComponent } from './layout/layout.component';
import { AmPmTimePipe } from './am-pm-time.pipe';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    LayoutComponent,
    AmPmTimePipe,
  ],
  imports: [CommonModule, RouterModule],
  exports: [LayoutComponent, HeaderComponent, FooterComponent, AmPmTimePipe],
})
export class SahredModule {}
