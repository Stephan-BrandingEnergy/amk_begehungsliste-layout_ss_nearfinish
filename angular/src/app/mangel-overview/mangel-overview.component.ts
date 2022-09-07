import {Component, OnInit} from '@angular/core';
import {of, Subscription} from "rxjs";
import {ApiService} from "../api.service";
import {CordovaService} from "../cordova.service";
import {ActivatedRoute, Router} from "@angular/router";
import {concatMap, map, tap} from "rxjs/operators";
import {ApiResponseModul} from "../api-interfaces";

import {AuthenticationService} from "../authentication.service";
import Rundgang = ApiResponseModul.Rundgang;
import Mangel = ApiResponseModul.Mangel;
import Schwerpunkt = ApiResponseModul.Schwerpunkt;
  @Component({
  selector: 'app-mangel-overview',
  templateUrl: './mangel-overview.component.html',
  styleUrls: ['./mangel-overview.component.scss']
})
export class MangelOverviewComponent implements OnInit {

  rundgang: Rundgang;
  mangel: Mangel;

  viewstate = {
    loading: false,
    disabled: "",
  };

  private _subscription = new Subscription();

  constructor(private apiService: ApiService,
              private cordova: CordovaService,
              private router: Router,
              private route: ActivatedRoute,
              private auth: AuthenticationService
  ) {
  }
    currentDate = new Date();
  ngOnInit() {
    this.ladeRundgang();
  }


  private ladeRundgang() {
    this.viewstate.loading = true;

    // lade rundgang
    this._subscription.add(
      this.route.queryParamMap.pipe(
        map(m => m.get('uid')),
        concatMap(uid => {

          // if uid is given get Rundgang from apiService
          if (uid) {
            return this.apiService.getRundgang(uid).pipe(tap(() => console.log("Rundgang loaded with uid", uid)));
          }
          // lade rundgang from state
          else if (history.state['rundgang']) {
            return of(history.state['rundgang']).pipe(tap(() => console.log("Rundgang restored from state")));
          }
          // else create empty Rundgang
          else {
            // TODO: this should probably be an error. If the rundgang can not be found, then Mängel should not be edited
            return of(this.getNewRundgang()).pipe(tap(() => console.log("New Rundgang created")));
          }
        })
      ).subscribe(
        rundgang => {
          if (rundgang) {
            this.rundgang = rundgang

            this.ladeMangel();
          }
        }));
  }

  private ladeMangel() {
    // lade mangel from uid
    this._subscription.add(
      this.route.queryParamMap.pipe(
        map(m => parseInt(m.get('mangel_uid'))),
        concatMap(uid => {

          // if uid is given get Mangel from Rundgang
          if (uid && this.rundgang.maengel.find(m => m.uid == uid)) {
            return of(this.rundgang.maengel.find(m => m.uid == uid)).pipe(tap(() => console.log("Mangel loaded with uid", uid)));
          }
          // lade Mangel from state
          else if (history.state['mangel']) {
            return of(history.state['mangel']).pipe(tap(() => console.log("Mangel restored from state")));
          }
          // else create empty Mangel
          else {
            return of(this.getNewMangel()).pipe(tap(() => console.log("New Mangel created")));
          }
        })
      ).subscribe(
        mangel => {
          if (mangel) {
            this.mangel = mangel;
            // add Magel to Rundgang if not already part of it
            if (!this.rundgang.maengel.find(m => (this.mangel.uid && (m.uid == this.mangel.uid)) || this.mangel == m)) {
              this.rundgang.maengel.push(this.mangel);
            }
          }
          this.viewstate.loading = false;
        }));
  }

  /** To prevent memory leaks, unsubscribe from all subscriptions made while the activity is alive. */
  ngOnDestroy(): void {
    console.log("ngOnDestroy")
    this._subscription.unsubscribe();
  }


  public getNewMangel(): Mangel {
    return {
      images: [],
      logs: [],
      status: 0,
      text: "",
    };
  }

  public getNewSchwerpunkt(): Schwerpunkt {
    return {
      name: "",
    }
  }

  public getNewRundgang(): Rundgang {
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


  saveRundgang(rundgang: ApiResponseModul.Rundgang) {

    // send rundgang to API
    this.viewstate.loading = true;
    this.viewstate.disabled = "disabled";
    this.apiService.sendRundgang(rundgang, this.auth.currentLogin?.user.uid)
      .subscribe(rundgang => {
          //navigate to next screen on success, and pass the new rundgang
          this.router.navigate(['/rundgang', 'detail'], {state: {rundgang: rundgang}});
        },
        err => this.cordova.toast(`Fehler beim Ändern des Status: ${err}`), // Fehler beim Speichern
        () => this.viewstate.loading = false // Am Ende Ladezustand beenden
      );
  }
}
