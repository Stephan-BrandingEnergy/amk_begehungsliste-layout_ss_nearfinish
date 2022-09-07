import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {ApiResponseModul} from "../api-interfaces";
import {ApiService} from "../api.service";
import {of, Subscription} from "rxjs";
import {CordovaService} from "../cordova.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthenticationService} from "../authentication.service";
import {concatMap, map, tap} from "rxjs/operators";
import Rundgang = ApiResponseModul.Rundgang;
import User = ApiResponseModul.User;
import Schwerpunkt = ApiResponseModul.Schwerpunkt;


@Component({
  selector: 'app-rundgang-overview',
  templateUrl: './rundgang-overview.component.html',
  styleUrls: ['./rundgang-overview.component.scss']
})
export class RundgangOverviewComponent implements OnInit, OnDestroy {

  rundgang: Rundgang;

  user: User[] = [];
  viewstate = {
    loading: false,
  };


  private _subscription = new Subscription();


  constructor(private apiService: ApiService,
              private cordova: CordovaService,
              private router: Router,
              private route: ActivatedRoute,
              private ngZone: NgZone,
              private auth: AuthenticationService) {
  }


  ngOnInit() {
    this.viewstate.loading = true;

    // lade rundgang from state

    if (history.state['rundgang']) {
      this.rundgang = history.state['rundgang'];
      console.log("Rundgang restored from state");
    } else
      // lade rundgang from uid
      this._subscription.add(
        this.route.queryParamMap.pipe(
          map(m => m.get('uid')),
          concatMap(uid => {

            // if uid is given get Rundgang from apiService
            if (uid) {
              return this.apiService.getRundgang(uid).pipe(tap(() => console.log("Rundgang loaded with uid", uid)));
            }
            // else create empty Rundgang
            else {
              return of(this.getNewrundgang()).pipe(tap(() => console.log("New Rundgang created")));
            }
          })
        ).subscribe(
          response => {
            if (response) {
              this.rundgang = response;
              console.log(this.rundgang);
            }
            this.viewstate.loading = false;
          }));


    // lade user liste
    this._subscription.add(this.apiService.getUserList(this.auth.currentLogin?.user.uid)
      .subscribe(
        response => this.user = response
      ));
  }

  /** To prevent memory leaks, unsubscribe from all subscriptions made while the activity is alive. */
  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }


  public getNewVerantw() {
    return {
      firstName: "",
      lastName: "",
    }
  }

  public getNewSchwerpunkt(): Schwerpunkt {
    return {
      name: "",
    }
  }

  public getNewrundgang(): Rundgang {
    return {
      data: {
        kurztext: "",
        ort: ""
      },
      maengel: [],
      teilnehmer: [],
      verantwortlicher: {firstName: "", lastName: ""},
      schwerpunkt: this.getNewSchwerpunkt(),
      kurztext: "",
      ort: ""
    };
  }



}
