import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';

import {BehaviorSubject, noop, Observable, of, Subscription, throwError} from 'rxjs';
import {catchError, filter, map, shareReplay, tap, timeout} from 'rxjs/operators';
import {environment} from '../environments/environment';

import {LocalStorageService} from 'ngx-store';
import {CordovaService} from './cordova.service';
import {ApiResponseModul} from './api-interfaces';
import {AbstractCacheService} from "./abstract-cache.service";
import Rundgang = ApiResponseModul.Rundgang;
import User = ApiResponseModul.User;
import Massnahme = ApiResponseModul.Massnahme;
import Schwerpunkt = ApiResponseModul.Schwerpunkt;
import Bereich = ApiResponseModul.Bereich;


// key-value pairs with scalar values and string-keys, to generate get-params
interface ScalarMap {
  [s: string]: string | number | null | boolean | string[];
}

type RequestParams = { path: string; method: string; params: ScalarMap; body: string, contentType: string };

@Injectable({
  providedIn: 'root'
})
export class ApiService implements OnInit, OnDestroy {

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService,
    private cordova: CordovaService) {
  }


  // API root uri
  private _apiRoot = environment.apiUrl;

  // default HTTP-Header
  private headersJsonPost = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });
  private headersJsonGet = new HttpHeaders({
    'Accept': 'application/json'
  });

  /**
   * utility method to convert maps to HttpParams
   * scalars are converted to string, array are converted to multiple parameters of type string
   */
  private toHttpParams(params: ScalarMap = {}): HttpParams {
    let p = new HttpParams();

    Object.getOwnPropertyNames(params || {}).forEach(key => {
      if (params[key] instanceof Array) {
        (params[key] as string[]).forEach((item, index) => {
          if (index === 0) {
            p = p.set(key, item);
          } else {
            p = p.append(key, item);
          }
        });
      } else {
        if (params[key] !== undefined) {
          p = p.set(key, params[key] as string);
        }
      }
    });

    return p;
  }

  /**
   * perform GET
   */
  get<T>(path: string, params: ScalarMap = {}): Observable<T> {

    const url = `${this._apiRoot}${path}`;
    const httpParams = this.toHttpParams(params);

    return this.http.request<T>('GET', url, {
        params: httpParams,
        headers: this.headersJsonGet
        // withCredentials: true
      },
    )
      .pipe(
        // http-level error handling
        catchError(this.httpErrorHandler),
        // api-level error checking -> throw error when something looks weird
        map(this.apiResponseChecker),

        // display any errors we can understand
        tap(noop, err => {
          console.error(err);
          if (err instanceof Error) {
            // TODO: display error to user
            // this.snackBar.open(err.message, null, { duration: 5000 });
          }
        }),
        // map response to T
        map((data: any) => data as T),
      );
  }

  /**
   * perform GET
   */
  getString(path: string, params: ScalarMap = {}) {

    const url = `${this._apiRoot}${path}`;
    const httpParams = this.toHttpParams(params);

    return this.http.request('GET', url, {
        params: httpParams,
        responseType: 'text'  // withCredentials: true
      },
    )
      .pipe(
        // http-level error handling
        catchError(this.httpErrorHandler),

        // display any errors we can understand
        tap(noop, err => {
          console.error(err);
          if (err instanceof Error) {
            // TODO: display error to user
            // this.snackBar.open(err.message, null, { duration: 5000 });
          }
        }),
      );
  }

  /**
   * perform DELETE
   */
  delete(path: string, params: ScalarMap = {}): Observable<object> {

    const url = `${this._apiRoot}${path}`;
    const httpParams = this.toHttpParams(params);

    return this.http.request<object>('DELETE', url, {
      params: httpParams,
      headers: this.headersJsonGet,
      // withCredentials: true
    })
      .pipe(
        // http-level error handling
        catchError(this.httpErrorHandler),
        // api-level error checking -> throw error when something looks weird
        map(this.apiResponseChecker),

        // display any errors we can understand
        tap(noop, err => {
          console.error(err);
          if (err instanceof Error) {
            // TODO: display error to user
            // this.snackBar.open(err.message, null, { duration: 5000 });
          }
        })
      );
  }

  /**
   * perform POST/PUT/PATCH
   */
  post<T, R>(path: string, params: ScalarMap = {}, payload: string | URLSearchParams = null, failOnError = false, skipRequest = false): Observable<R> {
    console.log("skipRequest post " + skipRequest);
    return this.send('POST', path, params, payload, failOnError, skipRequest);
  }

  put<T, R>(path: string, params: ScalarMap = {}, payload: string | URLSearchParams = null, failOnError = false, skipRequest = false): Observable<R> {
    return this.send('PUT', path, params, payload, failOnError, skipRequest);
  }

  patch<T, R>(path: string, params: ScalarMap = {}, payload: string | URLSearchParams = null, failOnError = false, skipRequest = false): Observable<R> {
    return this.send('PATCH', path, params, payload, failOnError, skipRequest);
  }

  // common method for all verbs that send data
  private send<T, R>(method: string, path: string, params: ScalarMap, payload: string | URLSearchParams, failOnError = false, skipRequest = false): Observable<R> {
    // body to send, is equal to payload, unless we have transformed it for some reason
    // if payload is url-params, set header to correct content-type and transform body to string
    const contentType = payload instanceof URLSearchParams ? 'application/x-www-form-urlencoded' : 'application/json';
    console.log("skipRequest send " + skipRequest);
    const body = payload instanceof URLSearchParams ? payload.toString() : payload;
    return this.sendString({contentType, path, method, body, params}, failOnError, skipRequest);
  }

  private sendString<R>({path, method, params, body, contentType}: RequestParams, failOnError = false, skipRequest = false): Observable<R> {
    const headers = this.headersJsonPost.set('Content-Type', contentType);
    const url = `${this._apiRoot}${path}`;

    console.log("skipRequest sendString " + skipRequest);

    let request: Observable<R>;
    if (skipRequest) {
      // if the request should be skipped, the request-object just simulates a failed HTTP-request
      request = throwError(new Error('request skipped as requested'));
    } else {
      // create a real HTTP-request
      request = this.http.request<R>(method, url, {
        body,
        params: this.toHttpParams(params),
        headers,
        // withCredentials: true
      });
    }

    return request.pipe(
      // 15s timeout for HTTP-requests
      timeout(15 * 1000),
      // http-level error handling
      catchError(this.httpErrorHandler),
      // api-level error checking -> throw error when something looks weird
      map(this.apiResponseChecker),

      // display any errors we can understand
      tap(noop,
        err => {
          this.log(`could not sent request ${path}`, err)
          // TODO: display error to user
          // this.snackBar.open(typeof err === 'string' ? err : (err.message), null, { duration: 5000 });
        }
      ),
      // on error, store params to this call in queue
      catchError(err => {
        // if failOnError is set dont queue this request and succeed, but fail right now
        if (failOnError) return throwError(err);
        this.addRequestToQueue({method, path, params, body, contentType});
        return of(null);
      })
    );
  }

// transforms http/network-errors to readable errors
  private httpErrorHandler(err: HttpErrorResponse) {
    // 401 error should be intercepted by our auth-interceptor

    // other http-errors (network, etc)
    if (err.error instanceof ErrorEvent) {
      return throwError(`Network error: ${err.error.message}`);
    }

    // other http-errors with status-code, display error a complete without return-value
    if (err.status >= 400) {
      // server sent a body with an error object, display this
      if (err.error && err.error.message) {
        return throwError(`Server error: ${err.error.message}`);
      }
      // else the error is just the display details
      return throwError(`Server error: ${err.status} ${err.statusText} ${err.name}`);
    }

    return throwError(`Network error: ${err.message}`);
  }

  // checks an api-response can throw errors before passing result to subscribers
  private apiResponseChecker(data: any): any {
    // TODO: right now we just check ob we get any object
    if (typeof data !== 'object') {
      return throwError(`Parse error: invalid response from server`);
    }
    return data;
  }


  private readonly _request_queue_key = 'queued_api_requests';

  /**
   * Request queue for failed requests
   */
  getQueuedRequestParams(): Array<RequestParams> {
    return this.localStorageService.get(this._request_queue_key) || [];
  }

  /**
   * Clear queued requests
   */
  clearQueuedRequestParams() {
    this.localStorageService.remove(this._request_queue_key);
  }

  private setQueuedRequestParams(queued_posts: Array<RequestParams>) {
    this.localStorageService.set(this._request_queue_key, queued_posts);
  }

  addRequestToQueue(params: RequestParams) {
    this.log(`storing request ${params.path} in queue`);
    this.setQueuedRequestParams([...this.getQueuedRequestParams(), params]);
  }

  /**
   * remove first queued params from list and return it (if any)
   */
  shiftRequestFromQueue(): RequestParams {
    const queued_posts = this.getQueuedRequestParams();
    const popped_params = queued_posts.shift();
    this.setQueuedRequestParams(queued_posts);
    return popped_params;
  }

  sendingQueueInProgress = false;

  async trySendQueuedRequests() {
    // don't work on the queue if it is already being processed
    if (this.sendingQueueInProgress) {
      return;
    }
    this.sendingQueueInProgress = true;
    let num_items_in_queue = this.getQueuedRequestParams().length;
    while (num_items_in_queue--) {
      await this.sendString(this.shiftRequestFromQueue()).toPromise();
    }
    this.sendingQueueInProgress = false;
  }


  /**
   * Subject that always stores the last known rundgang
   */
  rundgangCache: BehaviorSubject<ApiResponseModul.Root> = new BehaviorSubject(null);
  /**
   * Subscription to the GET request to fetch the Rundgang. This is super slow, so we store it, so we can cancel it
   */
  rundgangRequestSub: Subscription;

  getRundgaenge(userId: number, refreshFromServer = true): Observable<ApiResponseModul.Root> {
    // cancel previous request, if it is still running
    if (this.rundgangRequestSub) {
      this.rundgangRequestSub.unsubscribe();
    }

console.log ("refreshServer"+refreshFromServer);
    if (refreshFromServer || !this.rundgangCache.getValue()) {
      // make fresh request of param says so, or the cache is empty
      this.rundgangRequestSub = this.get(`?no_cache=1&type=1452982642&userid=${userId}`).pipe(
        map((data: any) => data as ApiResponseModul.Root),
        tap(() => this.cordova.toast(`Fertig geladen`)),
        tap(() => this.log('fetched Rundgänge'))
      ).subscribe(response => {
          // update the subject, any subscribers will be notified
          this.rundgangCache.next(response);
        },
        ignored => {
          this.cordova.toast('Fehler beim Laden der Amkbegehungsliste');
        });
    }

    return this.rundgangCache;
  }


  getRundgang(uid: string): Observable<ApiResponseModul.Rundgang> {
    // return module from cached amkbegehungsliste id present
    return this.rundgangCache.pipe(
      filter(root => !!root),
      map(root => root.rundgaenge.find(m => `${m.uid}` == uid))
    )
  }

  private usersCacheService = new AbstractCacheService<User[]>()

  /**
   * get users from api call, and cache the result
   */
  getUserList(userId: number) {
    let users$ = this.usersCacheService.getValue(userId);

    if (!users$) {
      users$ = this.getRundgaenge(userId).pipe(
        filter(root => !!root), // proceed only if an api response is present
        map(root => root.user),
        shareReplay(1)
      );
      this.usersCacheService.setValue(users$, userId);
    }
    return users$;
  }

  /**
   * get Massnahmen from api call, and cache the result
   */
  getMassnahmenList(userId: number) {
    let massnahmen$ = this.massnahmenCacheService.getValue(userId);

    if (!massnahmen$) {
      massnahmen$ = this.getRundgaenge(userId).pipe(
        filter(root => !!root), // proceed only if an api response is present
        map(root => root.massnahmen),
        shareReplay(1)
      );
      this.massnahmenCacheService.setValue(massnahmen$, userId);
    }
    return massnahmen$;
  }

  private massnahmenCacheService = new AbstractCacheService<Massnahme[]>()

  /**
   * get Schwerpunkte from api call, and cache the result
   */
  getSchwerpunkteList(userId: number) {
    let schwerpunkte$ = this.schwerpunkteCacheService.getValue(userId);

    if (!schwerpunkte$) {
      schwerpunkte$ = this.getRundgaenge(userId).pipe(
        filter(root => !!root), // proceed only if an api response is present
        map(root => root.schwerpunkte),
        shareReplay(1)
      );
      this.schwerpunkteCacheService.setValue(schwerpunkte$, userId);
    }
    return schwerpunkte$;
  }

  private schwerpunkteCacheService = new AbstractCacheService<Schwerpunkt[]>()

  /**
   * get Bereiche from api call, and cache the result
   */
  getBereicheList(userId: number) {
    let bereiche$ = this.bereicheCacheService.getValue(userId);

    if (!bereiche$) {
      bereiche$ = this.getRundgaenge(userId).pipe(
        filter(root => !!root), // proceed only if an api response is present
        map(root => root.bereiche),
        shareReplay(1)
      );
      this.bereicheCacheService.setValue(bereiche$, userId);
    }
    return bereiche$;
  }
  private bereicheCacheService = new AbstractCacheService<Bereich[]>()

  /**
   * Rundgang an API senden
   */
  sendRundgang(rundgang: ApiResponseModul.Rundgang, userId: number): Observable<Rundgang> {
    const body = new URLSearchParams();
    body.set('rundgang_json', JSON.stringify(rundgang));
    body.set('userid', `${userId}`);

    return this.post<Rundgang, Rundgang>(`?tx_smbegehungsliste_begehungsliste[action]=update&type=1452982642&tx_smbegehungsliste_begehungsliste[controller]=Rundgang`, {   // TODO: dummy URL
      'no_cache': '1',
    }, body).pipe(
      tap(() => this.log(`sent Rundgang ${rundgang.uid ?? 'without uid'}`))
    );
  }

  /**
   * Mangel an API senden
   */
  sendMangel(modul: ApiResponseModul.Rundgang, mangel: ApiResponseModul.Mangel, foto: string, userId: number): Observable<any> {
    const body = new URLSearchParams();
    body.set('tx_smlaufliste_laufliste[formjson]', JSON.stringify(mangel));
    body.set('tx_smlaufliste_laufliste[foto]', foto);
    body.set('tx_smlaufliste_laufliste[modulid]', `${modul.data.uid}`);
    body.set('tx_smlaufliste_laufliste[userid]', `${userId}`);

    return this.post(`/index.php?id=55`, {
      'no_cache': '1',
      'type': '1452982642',
      'tx_smlaufliste_laufliste[action]': 'create',
      'tx_smlaufliste_laufliste[controller]': 'Problem',
    }, body).pipe(
      tap(() => this.log(`sent form for modul ${modul.data.uid}`))
    );
  }

  sendMangelLog(mangel: ApiResponseModul.Mangel, form: ApiResponseModul.LogEintrag, userId: number): Observable<any> {
    const body = new URLSearchParams();
    body.set('tx_smlaufliste_laufliste[formjson]', JSON.stringify(form));
    body.set('tx_smlaufliste_laufliste[stoerungid]', `${mangel.uid}`);
    body.set('tx_smlaufliste_laufliste[userid]', `${userId}`);

    return this.post(`/index.php?id=55`, {
      'no_cache': '1',
      'type': '1452982642',
      'tx_smlaufliste_laufliste[action]': 'create',
      'tx_smlaufliste_laufliste[controller]': 'Log',
    }, body).pipe(
      tap(() => this.log(`sent form for stoerung ${mangel.uid}`))
    );
  }


  /**
   * Dummy methode um Störungsstatus zu ändern
   */
  changeStatus(userId: string, mangel: ApiResponseModul.Mangel, newStatus: number) {
    const body = new URLSearchParams();
    body.set('tx_smlaufliste_laufliste[stoerungid]', `${mangel.uid}`);
    body.set('tx_smlaufliste_laufliste[userid]', `${userId}`);
    body.set('tx_smlaufliste_laufliste[status]', `${newStatus}`);

    return this.post(`/index.php?id=55`, {
      'no_cache': '1',
      'type': '1452982642',
      'tx_smlaufliste_laufliste[action]': 'update',
      'tx_smlaufliste_laufliste[controller]': 'Problem',
    }, body).pipe(
      tap(() => this.log(`sent form for stoerung ${mangel.uid}`))
    );
  }


  /**
   * Dummy methode um Content zu holen
   */
  getContent(name: string): Observable<string> {

    const path = `/${name}`;
    const params = {'type': '1452982642'};

    const url = `${this._apiRoot}${path}`;
    const httpParams = this.toHttpParams(params);
    console.log(url);
    return this.http.request('GET', url, {
      params: httpParams,
      responseType: 'text'
      // withCredentials: true
    })
      .pipe(
        // http-level error handling
        catchError(this.httpErrorHandler),

        // display any errors we can understand
        tap(noop, err => {
          console.error(err);
          if (err instanceof Error) {
            // TODO: display error to user
            // this.snackBar.open(err.message, null, { duration: 5000 });
          }
        }),
        // map response to string
        map((data) => data as string),
      );
  }


  /**
   * Siganture an API senden
   */
  sendSignature(dataUri: string, kommentar: string, userId: number, rundgang?: ApiResponseModul.Rundgang): Observable<any> {
    const body = new URLSearchParams();
    body.set('tx_smlaufliste_laufliste[signatureUrl]', dataUri);
    body.set('tx_smlaufliste_laufliste[userid]', `${userId}`);
    body.set('tx_smlaufliste_laufliste[kommentar]', `${kommentar}`);
    if (rundgang) {
      body.set('tx_smlaufliste_laufliste[rundgang][uid]', `${rundgang.uid}`);
    }

    return this.post(`/index.php?id=55`, {
      'no_cache': '1',
      'type': '1452982642',
      'tx_smlaufliste_laufliste[action]': 'sendSignature',
      'tx_smlaufliste_laufliste[controller]': 'Modul',
    }, body).pipe(
      tap(() => this.log(`sent signature`))
    );
  }


  /**
   * @param message Informative Message
   * @param args other data that should be logged
   */
  private log(message: string, ...args) {
    console.log(`API Service: ${message}`, ...args);
  }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
  }

}
