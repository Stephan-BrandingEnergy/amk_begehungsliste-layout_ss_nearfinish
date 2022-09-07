import {Pipe, PipeTransform} from '@angular/core';
import {ApiResponseModul} from "./api-interfaces";
import Rundgang = ApiResponseModul.Rundgang;


export interface FilterModulenDef {
  nurOffeneMaengel?: boolean;
}

@Pipe({
  name: 'RundgangFilter',
  pure: false
})
export class RundgangFilterPipe implements PipeTransform {

  transform(rundgaenge: Rundgang[], filter?: FilterModulenDef): Rundgang[] {

    return rundgaenge?.filter(r => {
      // tslint:disable-next-line:triple-equals
      if (filter?.nurOffeneMaengel && !(r.maengel?.find(m => m.status != 0))) {
        return false;
      }

      return true;
    });
  }
}
