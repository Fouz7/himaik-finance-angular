import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the hamburger glyph in menu mode', () => {
    component.isMenuButton = true;
    component.isMenuExpanded = false;
    fixture.detectChanges();

    const bars = fixture.nativeElement.querySelectorAll('.menu-glyph__bar');
    expect(fixture.nativeElement.querySelector('.header-action-button--menu')).toBeTruthy();
    expect(bars.length).toBe(3);
    expect(fixture.nativeElement.querySelector('.header-action-button--menu-open')).toBeFalsy();
  });

  it('should apply the open state class when the menu is expanded', () => {
    component.isMenuButton = true;
    component.isMenuExpanded = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.header-action-button--menu-open')).toBeTruthy();
  });

  it('should emit buttonClick when the action button is pressed', () => {
    spyOn(component.buttonClick, 'emit');

    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();

    expect(component.buttonClick.emit).toHaveBeenCalled();
  });
});
