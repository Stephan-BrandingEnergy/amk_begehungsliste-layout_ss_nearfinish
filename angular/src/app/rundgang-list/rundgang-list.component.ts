import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {FilterModulenDef} from "../rundgang-filter.pipe";
import {Subscription} from "rxjs";
import {ApiService} from "../api.service";
import {CordovaService} from "../cordova.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthenticationService} from "../authentication.service";
import {environment} from "../../environments/environment";
import {ApiResponseModul} from "../api-interfaces";
import {Sort} from "@angular/material/sort";
import Rundgang = ApiResponseModul.Rundgang;

@Component({
  selector: 'app-rundgang-list',
  templateUrl: './rundgang-list.component.html',
  styleUrls: ['./rundgang-list.component.scss']
})
export class RundgangListComponent implements OnInit, OnDestroy {

  rundgaenge: Rundgang[];
  rundgaengeSorted: Rundgang[];

  viewstate = {
    loading: false,
  };


  filter: FilterModulenDef = {};


  private _subscription = new Subscription();

  constructor(private apiService: ApiService,
              private cordova: CordovaService,
              private router: Router,
              private route: ActivatedRoute,
              private ngZone: NgZone,
              private auth: AuthenticationService) {
  }

  get numQueuedRequestParams() {
    return this.apiService.getQueuedRequestParams().length;
  }

  /**
   * methods for API request queue
   */
  sendQueuedRequests() {
    this.apiService.trySendQueuedRequests();
  }

  // basis url für bilder
  baseHref: string = environment.apiUrl;


  ngOnInit() {
    this.viewstate.loading = true;

    // if there is stuff in the unsent request queue, do not fetch the data from server, just use the locally stored
    let refreshFromServer = true;
    if (refreshFromServer)
   //   refreshFromServer = false;
    // TODO: we could also just try to send the queue here before request the Amkbegehungsliste

    this._subscription.add(this.apiService.getRundgaenge(this.auth.currentLogin.user.uid, refreshFromServer).subscribe(
      response => {
        if (!response) {
          // bisher nichts geladen, und cache ist auch leer, hier nicht weitermachen
          return;
        }

        this.rundgaenge = response.rundgaenge;

        this.viewstate.loading = false;
      }));
  }

  /** To prevent memory leaks, unsubscribe from all subscriptions made while the activity is alive. */
  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  sortData(sort: Sort) {
    const data = this.rundgaenge.slice();
    if (!sort.active || sort.direction === '') {
      this.rundgaengeSorted = data;
      return;
    }

    this.rundgaengeSorted = data.sort((a, b) => {
      const compare = (a: number | string, b: number | string, isAsc: boolean) => (a < b ? -1 : 1) * (isAsc ? 1 : -1);
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'datum':
          return compare(a.uid, b.uid, isAsc);
        case 'ort':
          return compare(a.ort, b.ort, isAsc);
        case 'maengel':
          return compare(a.maengel?.[0]?.text, b.maengel?.[0]?.text, isAsc);
        case 'verantwortlicher':
          return compare(a.verantwortlicher?.lastName, b.verantwortlicher?.lastName, isAsc);
        default:
          return 0;
      }
    });
  }
}
