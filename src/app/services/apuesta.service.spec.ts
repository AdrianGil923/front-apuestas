import { TestBed } from '@angular/core/testing';

import { ApuestaService } from './apuesta.service';

describe('ApuestaService', () => {
  let service: ApuestaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApuestaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
