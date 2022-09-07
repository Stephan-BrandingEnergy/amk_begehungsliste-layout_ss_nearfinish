import {Component, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ApiService} from '../api.service';
import {CordovaService} from '../cordova.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {AuthenticationService} from "../authentication.service";
import {environment} from '../../environments/environment';
import {SignaturePad} from "angular2-signaturepad";
import {Subscription} from "rxjs";
import {FilterModulenDef} from "../rundgang-filter.pipe";
import {ApiResponseModul} from "../api-interfaces";
import Rundgang = ApiResponseModul.Rundgang;

@Component({
  selector: 'app-amk-begehungsliste',
  templateUrl: './amk-begehungsliste.component.html',
  styleUrls: ['./amk-begehungsliste.component.scss']
})
export class AmkBegehungslisteComponent implements OnInit, OnDestroy {

  rundgang: Rundgang;

  viewstate = {
    loading: false,
    nfcWait: false,
    activeTab: 'uebersicht',
    signatureVisible: false
  };


  filter: FilterModulenDef = {};

  /**
   * Config für Unterschriftenblock
   */
  @ViewChild(SignaturePad, {static: false}) signaturePad: SignaturePad;

  signaturePadOptions: Object = {
    'minWidth': 1,
    'canvasWidth': window.innerWidth,
    'canvasHeight': 300
  };

  DateNow: Date;

  private _subscription = new Subscription();

  static aktiverRundgang: Rundgang;

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
    //console.log("actual page:" + this.router.url);
    // Filter aus query-parameter laden und setzen
    this._subscription.add(this.route.params.subscribe((params: Params) => {
      if (params.filter) {
        const filter = JSON.parse(params.filter);
        if (typeof filter == 'object') {
          this.filter = filter;
        }
      } else {
        this.filter = {}
      }
    }));

    this.DateNow = new Date();

    // if there is stuff in the unsent request queue, do not fetch the Amkbegehungsliste from server, just use the locally stored
    let refreshFromServer = true;
    if (this.apiService.getQueuedRequestParams().length > 0)
      refreshFromServer = false;
    // TODO: we could also just try to send the queue here before request the Amkbegehungsliste

    this._subscription.add(this.apiService.getRundgaenge(this.auth.currentLogin.user.uid, refreshFromServer).subscribe(
      response => {
        if (!response) {
          // bisher nichts geladen, und cache ist auch leer, hier nicht weitermachen
          return;
        }

        // TODO: das muss deruser auswählen
        this.rundgang = response.rundgaenge[0];

        // aktiver Rundgang global speichern.
        AmkBegehungslisteComponent.aktiverRundgang = this.rundgang;
        this.viewstate.loading = false;
      }));
  }

  /** To prevent memory leaks, unsubscribe from all subscriptions made while the activity is alive. */
  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  /**
   * Sichere die aktuelle Unterschrift im JSON für die Maske (aktuelles Tab)
   * @param pad
   */
  signatureComplete(pad: SignaturePad) {
    this.signatureDataUrl = pad.toDataURL()
  }

  signatureDataUrl: string = '';
  kommentar: string = '';

  signatureSpeichern() {
    this.viewstate.loading = true;
    //    this.apiService.trySendQueuedRequests();

    // speichern
    this.apiService.sendSignature(
      this.signatureDataUrl,
      this.kommentar,
      this.auth.currentLogin.user.uid,
      this.rundgang,
    ).subscribe(result => {
      // erfolg
      this.auth.logout();
      window.setTimeout(_ => this.auth.logout(), 100); // nochmal ausloggen , wegen bug in ngx-store
      this.cordova.toast('Rundgang erfolgreich beendet und abgemeldet');
      if (this.router.url !== '/') {
        this.router.navigate(['/']);
      }
    }, error => {
      // Fehler anzeigen?
    }, () => {
      // erfolg oder fehler->aufräumen
      this.viewstate.loading = false;
    })
  }
}
