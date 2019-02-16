import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrewChartComponent } from './brew-chart.component';

describe('BrewChartComponent', () => {
  let component: BrewChartComponent;
  let fixture: ComponentFixture<BrewChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrewChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrewChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
