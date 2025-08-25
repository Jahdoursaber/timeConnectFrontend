import { Component, Input } from '@angular/core';
import { routes } from '../../../shared/routes/routes';

@Component({
    selector: 'app-breadcrumbs',
    templateUrl: './breadcrumbs.component.html',
    styleUrls: ['./breadcrumbs.component.scss'],
    standalone: false
})

/**
 * Bread Crumbs Component
 */
export class BreadcrumbsComponent {
routes = routes
  @Input() title: string | undefined;
  @Input()
  breadcrumbItems!: {
    active?: boolean;
    label?: string;
  }[];

  Item!: {
    label?: string;
  }[];




}
