import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';
import {ApiResponseModul} from './api-interfaces';
import Mangel = ApiResponseModul.Mangel;

export interface FilterStoerungenDef {
  nurOffene?: boolean;
}

@Pipe({
  name: 'failuresFilter',
  pure: false
})
export class FailuresFilterPipe implements PipeTransform {

  transform(maengel: Mangel[], filter: FilterStoerungenDef): Mangel[] {

    // sort by timestamp, the highest first
    maengel.sort((a, b) => moment(b.tstamp).unix() - moment(a.tstamp).unix());

    return maengel.filter(s => {

      // noinspection RedundantIfStatementJS
      if (filter.nurOffene && s.status != 0) {
        return false;
      }

      return true;
    });
  }

}
