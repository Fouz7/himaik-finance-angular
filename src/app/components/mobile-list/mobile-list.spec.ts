import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileList } from './mobile-list';

describe('MobileList', () => {
  let component: MobileList;
  let fixture: ComponentFixture<MobileList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
