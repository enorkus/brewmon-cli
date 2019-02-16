import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrewDetailsComponent } from './brew-details.component';

describe('BrewDetailsComponent', () => {
  let component: BrewDetailsComponent;
  let fixture: ComponentFixture<BrewDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrewDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrewDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
