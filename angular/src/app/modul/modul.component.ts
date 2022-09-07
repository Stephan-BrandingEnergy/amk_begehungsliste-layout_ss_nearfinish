import {Component, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {ApiService} from '../api.service';
import {CordovaService} from '../cordova.service';
import {Subscription} from 'rxjs';
import {environment} from '../../environments/environment';
import {SignaturePad} from 'angular2-signaturepad';
import {ApiResponseModul} from '../api-interfaces';
import {AuthenticationService} from '../authentication.service';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {FilterStoerungenDef} from '../failures-filter.pipe';
import {Location} from '@angular/common';
import Mangel = ApiResponseModul.Mangel;


interface maint_form_type {

  'signature'?: string;

  'form': {
    [key: string]: {
      ampel: number,
      bauteile: Array<{ uid: number, kommentar: string }>
    }
  };
}

@Component({
  selector: 'app-rundgang',
  templateUrl: './modul.component.html',
  styleUrls: ['./modul.component.scss']
})
export class ModulComponent implements OnInit, OnDestroy {

  constructor(
    private route: ActivatedRoute,
    private auth: AuthenticationService,
    private apiService: ApiService,
    private cordova: CordovaService,
    private modalService: BsModalService,
    private ngZone: NgZone,
    private router: Router,
    private _location: Location
  ) {
  }


  private _subscription = new Subscription();
  loadingtext = 'Einen Moment bitte!';

  viewstate = {
    loading: false,
    nfcWait: false,
    activeTab: 'uebersicht',
    activeStoerung: null as ApiResponseModul.Mangel
  };

  filter: FilterStoerungenDef = {
    nurOffene: true,
  };

  // basis url für bilder
  baseHref: string = environment.apiUrl;

  // rundgang.data aus dem AJAX-Call
  rundgang: ApiResponseModul.Rundgang;

  /**
   * Formulardaten zur Eingabe Messung
   */
  eingabe_wert: number | string;

  /**
   * Config für Unterschriftenblock
   */
  @ViewChild(SignaturePad, {static: false}) signaturePad: SignaturePad;

  signaturePadOptions = {
    minWidth: 1,
    canvasWidth: 500,
    canvasHeight: 300
  };

  /**
   * Modal für neue Störung
   */
  stoerungModalRef: BsModalRef;

  ngOnInit() {
    this.loadingtext = 'Modul wird komplett geladen. Einen Moment bitte.';
    // Parameter uid überwachen
    this._subscription.add(this.route.paramMap.subscribe((params: ParamMap) => {
      const uid = params.get('uid');
      if (!uid) {
        return;
      }
      this.ladeModul(uid);
    }));

  }

  private ladeModul(uid) {
    this.viewstate.loading = true;
    this.apiService.getRundgang(uid).subscribe(
      modul => {
        this.rundgang = modul;
        this.viewstate.loading = false;
      },
      error => {
        //  this.cordova.toast('Fehler beim Laden der Modul');
        this.viewstate.loading = false;
      });
  }

  /** To prevent memory leaks, unsubscribe from all subscriptions made while the activity is alive. */
  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  setStoerungStatus(mangel: Mangel, newStatus: number) {
    const pevStatus = mangel.status;
    mangel.status = newStatus;

    this.apiService.changeStatus(this.auth.currentLogin.user.uid.toString(), mangel, newStatus).subscribe(res => {
      // Speichern erfolgreich
      this.cordova.toast('Status geändert');
      this.viewstate.loading = false;
    }, err => {
      // Fehler beim Speichern
      this.cordova.toast(`Fehler beim Ändern des Status: ${err}`);
      mangel.status = pevStatus;
    });
  }


  /**
   * Bauteil der Liste einer Formzeile ginzuffügen
   */
  addBauteil(maintFormElement: any) {
    maintFormElement.bauteile.push({
      uid: null,
      kommentar: ''
    });
  }

  /**
   * Sichere die aktuelle Unterschrift im JSON für die Maske (aktuelles Tab)
   */
  signatureComplete(pad: SignaturePad, maint_form: maint_form_type) {
    maint_form.signature = pad.toDataURL();
  }

  openStoerungModal(modul: ApiResponseModul.Rundgang, template: TemplateRef<any>) {
    this.stoerungModalRef = this.modalService.show(template);
    this.cordova.toast(`checking`);

  }
}
