import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddQuestionInTest } from './add-question-in-test';

describe('AddQuestionInTest', () => {
  let component: AddQuestionInTest;
  let fixture: ComponentFixture<AddQuestionInTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddQuestionInTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddQuestionInTest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
