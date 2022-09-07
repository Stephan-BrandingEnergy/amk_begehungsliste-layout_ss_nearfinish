import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {ApiService} from '../api.service';
import {CordovaService} from '../cordova.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit, OnDestroy {

  private subscription = new Subscription();

  viewstate = {
    loading: false
  };

  content = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private cordova: CordovaService,
  ) {
  }

  ngOnInit() {

    this.subscription.add(this.route.paramMap.subscribe((params: ParamMap) => {

      if (!params.get('name')) {
        return;
      }

      this.viewstate.loading = true;
      this.apiService.getContent(params.get('name')).subscribe(
        content => {
          this.content = content;
        },
        error => {
          this.cordova.toast(`Fehler beim Laden der Texte: ${error}`);
        },
        () => {
          return this.viewstate.loading = false;
        });
    }));
  }

  /** To prevent memory leaks, unsubscribe from all subscriptions made while the activity is alive. */
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
