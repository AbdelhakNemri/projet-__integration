import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';

/**
 * Loading Interceptor
 * Manages global loading state (can be extended with a loading service)
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // TODO: Inject loading service when created
  // const loadingService = inject(LoadingService);
  // loadingService.setLoading(true);

  return next(req).pipe(
    finalize(() => {
      // loadingService.setLoading(false);
    })
  );
};

