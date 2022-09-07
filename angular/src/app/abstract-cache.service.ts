import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import * as moment from "moment";

@Injectable({
  providedIn: 'root'
})
export class AbstractCacheService<T> {

  readonly CACHE_DURATION_IN_MINUTES = 5;
  readonly DEFAULT_KEY = 'DEFAULT';

  private cache: Map<any, {
    expires: Date,
    value: Observable<T>
  }> = new Map();


  getValue(cacheKey?: any): Observable<T> {
    const item = this.cache.get(cacheKey ?? this.DEFAULT_KEY);
    if (!item) {
      return null;
    }

    if (moment().isAfter(item.expires)) {
      return null;
    }

    return item.value;
  }

  setValue(value: Observable<T>, cacheKey?: any) {
    const expires = moment()
      .add(this.CACHE_DURATION_IN_MINUTES, 'minutes')
      .toDate();
    this.cache.set(cacheKey ?? this.DEFAULT_KEY, {expires, value});
  }

  clearCache() {
    this.cache.clear();
  }
}
